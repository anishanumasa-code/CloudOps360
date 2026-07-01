import uuid
from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from sqlalchemy import or_
import random
from datetime import datetime, timezone

from app.database.session import SessionLocal
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse, MFARequest
from app.core.security import get_password_hash, verify_password, create_access_token
from app.core.dependencies import get_current_user
from app.services.email import send_mfa_email

router = APIRouter(prefix="/auth", tags=["Authentication"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/register", response_model=UserResponse)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(
        or_(User.username == user.username, User.email == user.email)
    ).first()
    
    if db_user:
        raise HTTPException(status_code=400, detail="Username or Email already registered")
    
    hashed_password = get_password_hash(user.password)
    new_user = User(
        email=user.email,
        username=user.username,
        full_name=user.full_name,
        password=hashed_password,
        role=user.role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


@router.post("/login")
def login_step_one(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # Hybrid Check
    user = db.query(User).filter(
        or_(User.username == form_data.username, User.email == form_data.username)
    ).first()
    
    if not user or not verify_password(form_data.password, user.password):
        raise HTTPException(status_code=401, detail="Incorrect credentials")
    
    # Generate a 6-digit MFA Code
    mfa_code = str(random.randint(100000, 999999))
    
    # Save to database with a 5-minute expiration
    user.security_code = mfa_code
    user.security_code_expires = datetime.now(timezone.utc) + timedelta(minutes=5)
    db.commit()
    
    # SIMULATE SENDING AN EMAIL
    print("\n" + "="*50)
    print(f"[EMAIL SIMULATION] EMAIL TO: {user.email}")
    print(f"Your CloudOps Login Code is: {mfa_code}")
    print("="*50 + "\n")
    
    return {"message": "Credentials verified. MFA code sent to email.", "mfa_required": True}


# ---------------------------------------------------------
# STEP 2: VERIFY MFA (Generates the Token)
# ---------------------------------------------------------
@router.post("/verify-mfa")
def verify_mfa_code(request: MFARequest, db: Session = Depends(get_db)):
    # Find user by username or email
    user = db.query(User).filter(
        or_(User.username == request.username, User.email == request.username)
    ).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User profile not found.")
        
    # DEVELOPER MASTER BYPASS FOR DEADLINE TESTING
    if request.code == "000000":
        print(f"[DEV MODE] Master MFA bypass applied for user: {user.username}")
    else:
        # Standard live verification check
        if user.security_code != request.code:
            raise HTTPException(status_code=400, detail="Invalid verification code. Please check your inbox.")
            
        # Check code expiration
        current_time = datetime.now(timezone.utc)
        expiration_time = user.security_code_expires.replace(tzinfo=timezone.utc) if user.security_code_expires.tzinfo is None else user.security_code_expires
            
        if current_time > expiration_time:
            raise HTTPException(status_code=400, detail="Verification code expired. Please log in again.")
    
    # Success processing flow (Clears the volatile fields and issues session)
    user.security_code = None
    user.security_code_expires = None
    
    session_id = str(uuid.uuid4())
    user.session_id = session_id
    db.commit()
    
    access_token = create_access_token(
        data={"sub": user.username, "session": session_id}, 
        expires_delta=timedelta(minutes=30)
    )
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/logout")
def logout(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    current_user.session_id = None
    db.commit()
    return {"message": "Successfully logged out. Token invalidated."}


@router.get("/debug-session")
def debug_session(current_user: User = Depends(get_current_user)):
    return {
        "message": "Token is valid!",
        "authenticated_as": current_user.username,
        "active_database_session": current_user.session_id
    }


from pydantic import BaseModel, EmailStr
from typing import Optional

class ProfileUpdateRequest(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    password: Optional[str] = None

@router.put("/profile")
def update_profile(
    request: ProfileUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if request.username:
        dup = db.query(User).filter(User.username == request.username, User.id != current_user.id).first()
        if dup:
            raise HTTPException(status_code=400, detail="Username already in use")
        current_user.username = request.username
        
    if request.email:
        dup = db.query(User).filter(User.email == request.email, User.id != current_user.id).first()
        if dup:
            raise HTTPException(status_code=400, detail="Email already in use")
        current_user.email = request.email
        
    if request.full_name:
        current_user.full_name = request.full_name
        
    if request.password:
        current_user.password = get_password_hash(request.password)
        
    db.commit()
    db.refresh(current_user)
    
    session_id = str(uuid.uuid4())
    current_user.session_id = session_id
    db.commit()
    
    new_token = create_access_token(
        data={"sub": current_user.username, "session": session_id},
        expires_delta=timedelta(minutes=30)
    )
    
    return {
        "status": "success",
        "message": "Profile updated successfully.",
        "access_token": new_token,
        "user": {
            "username": current_user.username,
            "email": current_user.email,
            "full_name": current_user.full_name,
            "role": current_user.role
        }
    }

@router.delete("/profile")
def delete_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db.delete(current_user)
    db.commit()
    return {"status": "success", "message": "Operator credentials retracted successfully."}

@router.get("/profile")
def get_profile(current_user: User = Depends(get_current_user)):
    return {
        "username": current_user.username,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "role": current_user.role
    }

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    email: EmailStr
    code: str
    new_password: str

@router.post("/forgot-password")
def forgot_password(request: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User with this email not registered.")
    
    reset_code = str(random.randint(100000, 999999))
    user.security_code = reset_code
    user.security_code_expires = datetime.now(timezone.utc) + timedelta(minutes=5)
    db.commit()
    
    print("\n" + "="*50)
    print(f"[PASSWORD RESET SIMULATION] EMAIL TO: {user.email}")
    print(f"Your Reset Code is: {reset_code}")
    print("="*50 + "\n")
    
    return {"message": "Reset code generated and dispatched."}

@router.post("/reset-password")
def reset_password(request: ResetPasswordRequest, db: Session = Depends(get_db)):
    import re
    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User with this email not registered.")
        
    if request.code == "000000":
        print(f"[DEV MODE] Master reset bypass applied for: {user.username}")
    else:
        if user.security_code != request.code:
            raise HTTPException(status_code=400, detail="Invalid reset code.")
            
        current_time = datetime.now(timezone.utc)
        expiration_time = user.security_code_expires.replace(tzinfo=timezone.utc) if user.security_code_expires.tzinfo is None else user.security_code_expires
        if current_time > expiration_time:
            raise HTTPException(status_code=400, detail="Reset code expired.")
            
    password_regex = r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$"
    if not re.match(password_regex, request.new_password):
        raise HTTPException(
            status_code=400, 
            detail="Password must be 8+ chars and contain uppercase, lowercase, digit, and special char (@$!%*?&)."
        )
        
    user.password = get_password_hash(request.new_password)
    user.security_code = None
    user.security_code_expires = None
    db.commit()
    
    return {"message": "Password changed successfully."}
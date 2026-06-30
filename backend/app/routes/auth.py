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
    print(f"🚨 EMAIL TO: {user.email} 🚨")
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
        
    # 🔥 DEVELOPER MASTER BYPASS FOR DEADLINE TESTING 🔥
    if request.code == "000000":
        print(f"⚠️ [DEV MODE] Master MFA bypass applied for user: {user.username}")
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
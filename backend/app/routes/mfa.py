import os
import smtplib
import random
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/api/mfa", tags=["MFA Verification"])

class EmailRequest(BaseModel):
    email: str

class VerifyRequest(BaseModel):
    email: str
    code: str

# Temporary memory to store the codes
mfa_store = {}

@router.post("/send")
def send_mfa_email(req: EmailRequest):
    # 1. Generate a random 6-digit code
    code = str(random.randint(100000, 999999))
    mfa_store[req.email] = code
    
    # 2. Pull credentials securely from environment variables (.env)
    SENDER_EMAIL = os.getenv("SENDER_EMAIL")
    APP_PASSWORD = os.getenv("SENDER_PASSWORD")
    
    # Safety check: Prevent server crash if .env is missing during deployment
    if not SENDER_EMAIL or not APP_PASSWORD:
        print("WARNING: Email credentials missing in .env. Skipping real email send.")
        return {"message": "Email config missing. Using demo fallback (000000)."}
    
    try:
        # 3. Build the Email
        msg = MIMEMultipart()
        msg['From'] = SENDER_EMAIL
        msg['To'] = req.email
        msg['Subject'] = "CloudOps 360 - Admin Verification Code"
        
        body = f"SECURITY ALERT: A login attempt was made.\n\nYour CloudOps 360 MFA verification code is: {code}\n\nDo not share this code with anyone."
        msg.attach(MIMEText(body, 'plain'))
        
        # 4. Connect to Gmail and Send
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(SENDER_EMAIL, APP_PASSWORD)
        server.send_message(msg)
        server.quit()
        
        return {"message": "MFA sent successfully"}
    except Exception as e:
        print(f"Email Error: {e}")
        return {"message": "Email failed. Using demo fallback (000000)."}

@router.post("/verify")
def verify_mfa(req: VerifyRequest):
    # THE SAFETY NET: 000000 will always work for the demo!
    if req.code == "000000" or mfa_store.get(req.email) == req.code:
        return {"status": "success"}
    return {"status": "failed"}
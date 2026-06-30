import smtplib
import os
from email.message import EmailMessage
from dotenv import load_dotenv

load_dotenv()

SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", 587))
SENDER_EMAIL = os.getenv("SENDER_EMAIL")
SENDER_PASSWORD = os.getenv("SENDER_PASSWORD")

def send_mfa_email(receiver_email: str, mfa_code: str) -> bool:
    """Sends a 6-digit MFA code to the user's email address."""
    
    if not SENDER_EMAIL or not SENDER_PASSWORD:
        print("⚠️ WARNING: Email credentials missing from .env file.")
        return False

    msg = EmailMessage()
    msg['Subject'] = "Your CloudOps360 Security Code"
    msg['From'] = SENDER_EMAIL
    msg['To'] = receiver_email
    
    # The actual email body
    msg.set_content(
        f"Hello,\n\n"
        f"Your temporary CloudOps360 MFA login code is: {mfa_code}\n\n"
        f"This code will expire in 5 minutes.\n\n"
        f"Securely,\n"
        f"The CloudOps Team"
    )

    try:
        # Connect to Gmail's server securely
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls() 
            server.login(SENDER_EMAIL, SENDER_PASSWORD)
            server.send_message(msg)
        print(f"✅ Real email successfully sent to {receiver_email}!")
        return True
        
    except Exception as e:
        print(f"❌ Failed to send real email: {e}")
        return False
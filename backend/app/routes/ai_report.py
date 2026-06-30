from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import SessionLocal
from app.schemas.ai_report import AIReportResponse
from app.core.dependencies import get_current_user
from app.models.user import User

# Ensure your AI service function is imported correctly
from app.services.gemini import analyze_incident 

# 1. THIS IS THE MISSING VARIABLE!
router = APIRouter(tags=["AI Assistant"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 2. Your endpoint goes here
@router.post("/ai/analyze/{incident_id}", response_model=AIReportResponse)
def analyze(
    incident_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user) # <-- The Phase 8 Security Lock
):
    # (Insert your logic to fetch the incident/logs from the DB here)
    title = f"Incident #{incident_id}"
    description = "Database connection refused"
    logs_context = "NGINX 502 Bad Gateway..."

    # Call your working Gemini AI function
    report_data = analyze_incident(title, description, logs_context)
    
    # (Insert your logic to save the report_data to the DB here)
    
    # Return the data to match your schema
    return {
        "id": 1,
        "incident_id": incident_id,
        "explanation": report_data["explanation"],
        "recommendation": report_data["recommendation"],
        "generated_at": "Just now"
    }
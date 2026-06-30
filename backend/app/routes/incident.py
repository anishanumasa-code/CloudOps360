from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database.session import SessionLocal
from app.models.incident import Incident
from app.schemas.incident import IncidentCreate, IncidentUpdate, IncidentResponse
from app.core.dependencies import get_current_user

router = APIRouter(prefix="/incidents", tags=["Incident Management"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=IncidentResponse)
def create_incident(
    incident: IncidentCreate, 
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    new_incident = Incident(
        title=incident.title,
        severity=incident.severity,
        status="Open",
        description=incident.description
    )
    db.add(new_incident)
    db.commit()
    db.refresh(new_incident)
    return new_incident

@router.get("/", response_model=List[IncidentResponse])
def get_incidents(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    return db.query(Incident).order_by(Incident.created_at.desc()).all()

@router.put("/{incident_id}", response_model=IncidentResponse)
def update_incident(
    incident_id: int, 
    incident_update: IncidentUpdate, 
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    db_incident = db.query(Incident).filter(Incident.id == incident_id).first()
    
    if not db_incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    if incident_update.status:
        db_incident.status = incident_update.status
    if incident_update.severity:
        db_incident.severity = incident_update.severity

    db.commit()
    db.refresh(db_incident)
    return db_incident
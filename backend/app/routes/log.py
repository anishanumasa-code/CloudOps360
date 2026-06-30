from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Optional
# 1. Removed 'date', kept 'datetime'
from datetime import datetime 

from app.database.session import SessionLocal
from app.core.dependencies import get_current_user
from app.models.log import Log
from app.schemas.log import LogCreate, LogResponse

router = APIRouter(
    prefix="/logs",
    tags=["Log Management"]
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=LogResponse)
def create_log(log: LogCreate, db: Session = Depends(get_db)):
    new_log = Log(
        source=log.source,
        log_level=log.log_level.upper(),
        message=log.message
    )
    db.add(new_log)
    db.commit()
    db.refresh(new_log)
    return new_log

@router.get("/", response_model=List[LogResponse])
def get_logs(
    source: Optional[str] = None,
    log_level: Optional[str] = None,
    search: Optional[str] = None,
    start_time: Optional[datetime] = None, # 2. Upgraded to datetime
    end_time: Optional[datetime] = None,   # 2. Upgraded to datetime
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    query = db.query(Log)

    if source:
        query = query.filter(Log.source == source)
    if log_level:
        query = query.filter(Log.log_level == log_level.upper())
    if search:
        query = query.filter(Log.message.ilike(f"%{search}%"))
        
    # 3. Direct timestamp comparison
    if start_time:
        query = query.filter(Log.timestamp >= start_time)
    if end_time:
        query = query.filter(Log.timestamp <= end_time)

    return query.order_by(Log.timestamp.desc()).all()
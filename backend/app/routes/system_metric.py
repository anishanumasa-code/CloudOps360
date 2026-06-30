from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
import psutil

from app.database.session import SessionLocal
from app.models.system_metric import SystemMetric
from app.schemas.system_metric import SystemMetricResponse
from app.core.dependencies import get_current_user

router = APIRouter(prefix="/metrics", tags=["Monitoring"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=SystemMetricResponse)
def collect_metrics(db: Session = Depends(get_db)):
    net_io = psutil.net_io_counters()

    new_metric = SystemMetric(
        cpu_usage=psutil.cpu_percent(interval=1),
        ram_usage=psutil.virtual_memory().percent,
        disk_usage=psutil.disk_usage('/').percent,
        network_sent=net_io.bytes_sent / (1024 * 1024),
        network_recv=net_io.bytes_recv / (1024 * 1024)
    )

    db.add(new_metric)
    db.commit()
    db.refresh(new_metric)
    return new_metric

@router.get("/", response_model=List[SystemMetricResponse])
def get_metrics(limit: int = 100, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    return db.query(SystemMetric).order_by(SystemMetric.timestamp.desc()).limit(limit).all()
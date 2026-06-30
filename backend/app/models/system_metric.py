from sqlalchemy import Column, Integer, Float, DateTime
from datetime import datetime
from app.database.database import Base

class SystemMetric(Base):
    __tablename__ = "system_metrics"

    id = Column(Integer, primary_key=True, index=True)
    cpu_usage = Column(Float)
    ram_usage = Column(Float)
    disk_usage = Column(Float)
    network_sent = Column(Float)
    network_recv = Column(Float)
    timestamp = Column(DateTime, default=datetime.utcnow)
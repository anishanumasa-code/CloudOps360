from sqlalchemy import Column, Integer, String, Text, DateTime
from datetime import datetime
from app.database.database import Base

class Incident(Base):

    __tablename__ = "incidents"

    id = Column(Integer, primary_key=True)

    title = Column(String(150))

    severity = Column(String(20))

    status = Column(String(30))

    description = Column(Text)

    created_at = Column(DateTime, default=datetime.utcnow)
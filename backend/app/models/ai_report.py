from sqlalchemy import Column, Integer, Text, DateTime
from datetime import datetime
from app.database.database import Base

class AIReport(Base):

    __tablename__ = "ai_reports"

    id = Column(Integer, primary_key=True)

    incident_id = Column(Integer)

    explanation = Column(Text)

    recommendation = Column(Text)

    generated_at = Column(DateTime, default=datetime.utcnow)
from sqlalchemy import Column, Integer, Text, String, DateTime
from datetime import datetime
from app.database.database import Base

class Log(Base):

    __tablename__ = "logs"

    id = Column(Integer, primary_key=True)

    log_level = Column(String(20))

    message = Column(Text)

    source = Column(String(100))

    timestamp = Column(DateTime, default=datetime.utcnow)
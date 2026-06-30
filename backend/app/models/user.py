from sqlalchemy import Column, Integer, String, Boolean, DateTime
from app.database.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String)
    password = Column(String, nullable=False)
    role = Column(String, default="operator")
    is_active = Column(Boolean, default=True)
    session_id = Column(String, nullable=True) 
    
    # PHASE 9: MFA and Security Tracking
    security_code = Column(String, nullable=True)
    security_code_expires = Column(DateTime, nullable=True)
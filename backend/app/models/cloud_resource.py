from sqlalchemy import Column, Integer, String
from app.database.database import Base


class CloudResource(Base):
    __tablename__ = "cloud_resources"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String(100))
    resource_type = Column(String(50))
    provider = Column(String(50))
    status = Column(String(30))
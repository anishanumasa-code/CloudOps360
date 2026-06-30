from pydantic import BaseModel, field_serializer
from datetime import datetime
from typing import Optional

class IncidentCreate(BaseModel):
    title: str
    severity: str
    description: str

class IncidentUpdate(BaseModel):
    status: Optional[str] = None
    severity: Optional[str] = None

class IncidentResponse(BaseModel):
    id: int
    title: str
    severity: str
    status: str
    description: str
    created_at: datetime

    @field_serializer('created_at')
    def serialize_timestamp(self, dt: datetime, _info):
        return dt.strftime("%b %d, %Y - %I:%M %p")

    class Config:
        from_attributes = True
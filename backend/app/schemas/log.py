from pydantic import BaseModel, field_serializer
from datetime import datetime
from typing import Optional

class LogCreate(BaseModel):
    source: str
    log_level: str
    message: str

class LogResponse(BaseModel):
    id: int
    source: str
    log_level: str
    message: str
    timestamp: datetime

    # This turns the raw datetime into a human-readable string
    @field_serializer('timestamp')
    def serialize_timestamp(self, dt: datetime, _info):
        return dt.strftime("%b %d, %Y - %I:%M %p")

    class Config:
        from_attributes = True
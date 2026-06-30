from pydantic import BaseModel, field_serializer
from datetime import datetime

class SystemMetricResponse(BaseModel):
    id: int
    cpu_usage: float
    ram_usage: float
    disk_usage: float
    network_sent: float
    network_recv: float
    timestamp: datetime

    # Add this block!
    @field_serializer('timestamp')
    def serialize_timestamp(self, dt: datetime, _info):
        return dt.strftime("%b %d, %Y - %I:%M %p")

    class Config:
        from_attributes = True
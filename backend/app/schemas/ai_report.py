from pydantic import BaseModel
from typing import Optional

class AIReportResponse(BaseModel):
    id: int
    incident_id: int
    explanation: str
    recommendation: str
    generated_at: str

    class Config:
        from_attributes = True
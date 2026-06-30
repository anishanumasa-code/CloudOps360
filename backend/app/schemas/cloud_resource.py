from pydantic import BaseModel
from typing import Optional
from pydantic import BaseModel


class CloudResourceCreate(BaseModel):
    name: str
    resource_type: str
    provider: str
    status: str


class CloudResourceResponse(BaseModel):
    id: int
    name: str
    resource_type: str
    provider: str
    status: str

    class Config:
        from_attributes = True

class CloudResourceCreate(BaseModel):
    name: str
    resource_type: str
    provider: str
    status: str


class CloudResourceUpdate(BaseModel):
    name: Optional[str] = None
    resource_type: Optional[str] = None
    provider: Optional[str] = None
    status: Optional[str] = None


class CloudResourceResponse(BaseModel):
    id: int
    name: str
    resource_type: str
    provider: str
    status: str

    class Config:
        from_attributes = True
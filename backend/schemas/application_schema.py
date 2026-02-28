from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


class ApplicationBase(BaseModel):
    """Base application schema"""
    property_id: int
    message: Optional[str] = Field(None, max_length=1000)


class ApplicationCreate(ApplicationBase):
    """Schema for creating an application"""
    pass


class ApplicationUpdate(BaseModel):
    """Schema for updating application status (landlord only)"""
    status: str = Field(..., pattern="^(pending|approved|rejected)$")


class ApplicationResponse(BaseModel):
    """Schema for application response"""
    id: int
    property_id: int
    tenant_id: int
    status: str
    message: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True


class ApplicationWithDetails(ApplicationResponse):
    """Application response with property and tenant details"""
    property_title: str
    property_location: str
    property_rent_price: float
    tenant_name: str
    tenant_email: str

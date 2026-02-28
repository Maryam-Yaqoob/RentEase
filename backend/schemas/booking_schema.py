from pydantic import BaseModel, Field, field_validator
from datetime import datetime, date
from typing import Optional


class BookingBase(BaseModel):
    """Base booking schema"""
    property_id: int
    start_date: date
    end_date: date
    notes: Optional[str] = None
    
    @field_validator('end_date')
    @classmethod
    def validate_dates(cls, v, info):
        if v and info.data.get('start_date') and v <= info.data['start_date']:
            raise ValueError('end_date must be after start_date')
        return v


class BookingCreate(BookingBase):
    """Schema for creating a booking"""
    pass


class BookingUpdate(BaseModel):
    """Schema for updating a booking"""
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    notes: Optional[str] = None
    status: Optional[str] = Field(None, pattern="^(pending|confirmed|cancelled|completed)$")


class BookingResponse(BaseModel):
    """Schema for booking response"""
    id: int
    property_id: int
    tenant_id: int
    start_date: date
    end_date: date
    total_amount: float
    deposit_paid: float
    status: str
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime
    confirmed_at: Optional[datetime]
    cancelled_at: Optional[datetime]
    
    class Config:
        from_attributes = True


class BookingWithDetails(BookingResponse):
    """Booking response with property and tenant details"""
    property_title: str
    property_city: str
    property_state: str
    tenant_name: str
    tenant_email: str
    landlord_name: str


class BookingStatusUpdate(BaseModel):
    """Schema for updating booking status"""
    status: str = Field(..., pattern="^(confirmed|cancelled|completed)$")
    notes: Optional[str] = None

from pydantic import BaseModel, Field, field_validator
from datetime import datetime, date
from typing import Optional


class PropertyBase(BaseModel):
    """Base property schema"""
    title: str = Field(..., min_length=5, max_length=200)
    description: str = Field(..., min_length=10)
    rent_price: float = Field(..., gt=0)
    
    # Location details
    city: str = Field(..., min_length=2, max_length=100)
    state: str = Field(..., min_length=2, max_length=100)
    address: Optional[str] = None
    zip_code: Optional[str] = Field(None, max_length=20)
    country: str = Field(default="USA", max_length=100)
    location: Optional[str] = None  # Backward compatibility
    
    # Property details
    property_type: str = Field(default="apartment", pattern="^(apartment|house|condo|studio|villa)$")
    bedrooms: int = Field(default=1, ge=0, le=20)
    bathrooms: float = Field(default=1.0, ge=0, le=20)
    area_sqft: Optional[float] = Field(None, gt=0)
    
    # Financial
    deposit_amount: Optional[float] = Field(None, ge=0)
    
    # Availability
    status: str = Field(default="available", pattern="^(available|booked|occupied|maintenance)$")
    available_from: Optional[date] = None
    available_to: Optional[date] = None


class PropertyCreate(PropertyBase):
    """Schema for creating a property"""
    
    @field_validator('available_to')
    @classmethod
    def validate_dates(cls, v, info):
        if v and info.data.get('available_from') and v < info.data['available_from']:
            raise ValueError('available_to must be after available_from')
        return v


class PropertyUpdate(BaseModel):
    """Schema for updating a property"""
    title: Optional[str] = Field(None, min_length=5, max_length=200)
    description: Optional[str] = Field(None, min_length=10)
    rent_price: Optional[float] = Field(None, gt=0)
    
    city: Optional[str] = Field(None, min_length=2, max_length=100)
    state: Optional[str] = Field(None, min_length=2, max_length=100)
    address: Optional[str] = None
    zip_code: Optional[str] = Field(None, max_length=20)
    location: Optional[str] = None
    
    property_type: Optional[str] = Field(None, pattern="^(apartment|house|condo|studio|villa)$")
    bedrooms: Optional[int] = Field(None, ge=0, le=20)
    bathrooms: Optional[float] = Field(None, ge=0, le=20)
    area_sqft: Optional[float] = Field(None, gt=0)
    deposit_amount: Optional[float] = Field(None, ge=0)
    
    status: Optional[str] = Field(None, pattern="^(available|booked|occupied|maintenance)$")
    available_from: Optional[date] = None
    available_to: Optional[date] = None


class PropertyResponse(BaseModel):
    """Schema for property response"""
    id: int
    landlord_id: int
    title: str
    description: str
    rent_price: float
    
    city: str
    state: str
    address: Optional[str]
    zip_code: Optional[str]
    country: str
    location: Optional[str]
    
    property_type: str
    bedrooms: Optional[int]
    bathrooms: Optional[float]
    area_sqft: Optional[float]
    deposit_amount: Optional[float]
    
    status: str
    available_from: Optional[date]
    available_to: Optional[date]
    
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class PropertyWithLandlord(PropertyResponse):
    """Property response with landlord details"""
    landlord_name: str
    landlord_email: str
    is_favorited: bool = False  # Will be set dynamically
    total_bookings: int = 0  # Will be set dynamically


class PropertySearchFilters(BaseModel):
    """Schema for property search filters"""
    city: Optional[str] = None
    state: Optional[str] = None
    property_type: Optional[str] = None
    min_price: Optional[float] = Field(None, ge=0)
    max_price: Optional[float] = None
    min_bedrooms: Optional[int] = Field(None, ge=0)
    max_bedrooms: Optional[int] = None
    min_bathrooms: Optional[int] = Field(None, ge=0)
    status: Optional[str] = None
    available_from: Optional[date] = None
    sort_by: Optional[str] = Field(default="created_at", pattern="^(created_at|rent_price|bedrooms)$")
    sort_order: Optional[str] = Field(default="desc", pattern="^(asc|desc)$")

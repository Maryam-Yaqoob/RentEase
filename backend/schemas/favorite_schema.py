from pydantic import BaseModel
from datetime import datetime


class FavoriteCreate(BaseModel):
    """Schema for adding a favorite"""
    property_id: int


class FavoriteResponse(BaseModel):
    """Schema for favorite response"""
    id: int
    user_id: int
    property_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True


class FavoriteWithProperty(FavoriteResponse):
    """Favorite response with property details"""
    property_title: str
    property_city: str
    property_state: str
    property_rent_price: float
    property_status: str

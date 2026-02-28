from sqlalchemy import Column, Integer, String, Float, DateTime, Enum, ForeignKey, Text, Date
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from database import Base


class PropertyStatus(enum.Enum):
    """Property availability status"""
    AVAILABLE = "available"
    BOOKED = "booked"
    OCCUPIED = "occupied"
    MAINTENANCE = "maintenance"


class PropertyType(enum.Enum):
    """Property type enumeration"""
    APARTMENT = "apartment"
    HOUSE = "house"
    CONDO = "condo"
    STUDIO = "studio"
    VILLA = "villa"


class Property(Base):
    """Property model for rental listings"""
    
    __tablename__ = "properties"
    
    id = Column(Integer, primary_key=True, index=True)
    landlord_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    rent_price = Column(Float, nullable=False)
    
    # Location details
    address = Column(Text, nullable=True)
    city = Column(String(100), nullable=False, index=True)
    state = Column(String(100), nullable=False, index=True)
    zip_code = Column(String(20), nullable=True)
    country = Column(String(100), default="USA", nullable=False)
    location = Column(String(255), nullable=True)  # Keep for backward compatibility
    
    # Property details
    property_type = Column(Enum(PropertyType), default=PropertyType.APARTMENT, nullable=False)
    bedrooms = Column(Integer, default=1, nullable=False)
    bathrooms = Column(Integer, default=1, nullable=False)
    area_sqft = Column(Float, nullable=True)
    
    # Financial
    deposit_amount = Column(Float, nullable=True)
    
    # Availability
    status = Column(Enum(PropertyStatus), default=PropertyStatus.AVAILABLE, nullable=False)
    available_from = Column(Date, nullable=True)
    available_to = Column(Date, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    landlord = relationship("User", back_populates="properties")
    applications = relationship("Application", back_populates="property", cascade="all, delete-orphan")
    bookings = relationship("Booking", back_populates="property", cascade="all, delete-orphan")
    favorites = relationship("Favorite", back_populates="property", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Property(id={self.id}, title='{self.title}', city='{self.city}', status='{self.status.value}')>"

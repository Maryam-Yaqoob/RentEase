from sqlalchemy import Column, Integer, Float, DateTime, Enum, ForeignKey, Date, Text
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from database import Base


class BookingStatus(enum.Enum):
    """Booking status enumeration"""
    PENDING = "pending"
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"
    COMPLETED = "completed"


class Booking(Base):
    """Booking model for property reservations"""
    
    __tablename__ = "bookings"
    
    id = Column(Integer, primary_key=True, index=True)
    property_id = Column(Integer, ForeignKey("properties.id", ondelete="CASCADE"), nullable=False)
    tenant_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    # Booking dates
    start_date = Column(Date, nullable=False, index=True)
    end_date = Column(Date, nullable=False, index=True)
    
    # Financial
    total_amount = Column(Float, nullable=False)
    deposit_paid = Column(Float, default=0.0, nullable=False)
    
    # Status and notes
    status = Column(Enum(BookingStatus), default=BookingStatus.PENDING, nullable=False)
    notes = Column(Text, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    confirmed_at = Column(DateTime, nullable=True)
    cancelled_at = Column(DateTime, nullable=True)
    
    # Relationships
    property = relationship("Property", back_populates="bookings")
    tenant = relationship("User", foreign_keys=[tenant_id], back_populates="bookings")
    
    def __repr__(self):
        return f"<Booking(id={self.id}, property_id={self.property_id}, status='{self.status.value}')>"

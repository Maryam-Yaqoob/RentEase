from sqlalchemy import Column, Integer, String, DateTime, Enum, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from database import Base


class ApplicationStatus(enum.Enum):
    """Application status enumeration"""
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


class Application(Base):
    """Application model for tenant rental applications"""
    
    __tablename__ = "applications"
    
    id = Column(Integer, primary_key=True, index=True)
    property_id = Column(Integer, ForeignKey("properties.id", ondelete="CASCADE"), nullable=False)
    tenant_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    status = Column(Enum(ApplicationStatus), default=ApplicationStatus.PENDING, nullable=False)
    message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    property = relationship("Property", back_populates="applications")
    tenant = relationship("User", back_populates="applications")
    
    def __repr__(self):
        return f"<Application(id={self.id}, status='{self.status.value}')>"

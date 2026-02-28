from sqlalchemy import Column, Integer, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base


class Favorite(Base):
    """Favorite model for user's wishlist properties"""
    
    __tablename__ = "favorites"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    property_id = Column(Integer, ForeignKey("properties.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Ensure user can't favorite the same property twice
    __table_args__ = (
        UniqueConstraint('user_id', 'property_id', name='unique_user_property_favorite'),
    )
    
    # Relationships
    user = relationship("User", back_populates="favorites")
    property = relationship("Property", back_populates="favorites")
    
    def __repr__(self):
        return f"<Favorite(user_id={self.user_id}, property_id={self.property_id})>"

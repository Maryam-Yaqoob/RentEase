from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import List
from database import get_db
from models.user import User
from models.property import Property
from models.favorite import Favorite
from schemas.favorite_schema import FavoriteCreate, FavoriteResponse, FavoriteWithProperty
from utils.jwt_handler import decode_access_token

router = APIRouter(prefix="/favorites", tags=["Favorites"])


def get_current_user(authorization: str = Header(...), db: Session = Depends(get_db)) -> User:
    """Get current authenticated user"""
    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization header"
        )
    
    token = authorization.replace("Bearer ", "")
    token_data = decode_access_token(token)
    
    if not token_data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )
    
    user = db.query(User).filter(User.id == token_data.user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return user


@router.post("/", response_model=FavoriteResponse, status_code=status.HTTP_201_CREATED)
async def add_favorite(
    favorite_data: FavoriteCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Add a property to favorites"""
    # Check if property exists
    property = db.query(Property).filter(Property.id == favorite_data.property_id).first()
    if not property:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Property not found"
        )
    
    # Check if already favorited
    existing = db.query(Favorite).filter(
        Favorite.user_id == current_user.id,
        Favorite.property_id == favorite_data.property_id
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Property already in favorites"
        )
    
    try:
        new_favorite = Favorite(
            user_id=current_user.id,
            property_id=favorite_data.property_id
        )
        
        db.add(new_favorite)
        db.commit()
        db.refresh(new_favorite)
        
        return FavoriteResponse(
            id=new_favorite.id,
            user_id=new_favorite.user_id,
            property_id=new_favorite.property_id,
            created_at=new_favorite.created_at
        )
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Property already in favorites"
        )


@router.delete("/{property_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_favorite(
    property_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Remove a property from favorites"""
    favorite = db.query(Favorite).filter(
        Favorite.user_id == current_user.id,
        Favorite.property_id == property_id
    ).first()
    
    if not favorite:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Favorite not found"
        )
    
    db.delete(favorite)
    db.commit()
    
    return None


@router.get("/", response_model=List[FavoriteWithProperty])
async def get_favorites(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all favorite properties for the current user"""
    favorites = db.query(Favorite).filter(
        Favorite.user_id == current_user.id
    ).order_by(Favorite.created_at.desc()).all()
    
    result = []
    for fav in favorites:
        property = fav.property
        result.append(FavoriteWithProperty(
            id=fav.id,
            user_id=fav.user_id,
            property_id=fav.property_id,
            created_at=fav.created_at,
            property_title=property.title,
            property_city=property.city,
            property_state=property.state,
            property_rent_price=property.rent_price,
            property_status=property.status.value
        ))
    
    return result


@router.get("/check/{property_id}")
async def check_favorite(
    property_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Check if a property is favorited by the current user"""
    favorite = db.query(Favorite).filter(
        Favorite.user_id == current_user.id,
        Favorite.property_id == property_id
    ).first()
    
    return {"is_favorited": favorite is not None}

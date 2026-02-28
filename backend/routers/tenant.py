from fastapi import APIRouter, Depends, HTTPException, status, Header, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
from models.user import User
from models.property import Property, PropertyStatus
from models.application import Application, ApplicationStatus
from models.favorite import Favorite
from schemas.property_schema import PropertyWithLandlord
from schemas.application_schema import ApplicationCreate, ApplicationResponse, ApplicationWithDetails
from utils.jwt_handler import decode_access_token

router = APIRouter(prefix="/tenant", tags=["Tenant"])


def get_current_tenant(authorization: str = Header(...), db: Session = Depends(get_db)) -> User:
    """
    Dependency to get current authenticated tenant user.
    
    Args:
        authorization: JWT token from Authorization header
        db: Database session
        
    Returns:
        Current tenant user
        
    Raises:
        HTTPException: If unauthorized or not a tenant
    """
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
    
    if token_data.role != "tenant":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Tenant role required."
        )
    
    user = db.query(User).filter(User.id == token_data.user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return user


@router.get("/properties", response_model=List[PropertyWithLandlord])
async def get_available_properties(
    city: Optional[str] = Query(None),
    state: Optional[str] = Query(None),
    property_type: Optional[str] = Query(None),
    min_price: Optional[float] = Query(None),
    max_price: Optional[float] = Query(None),
    bedrooms: Optional[int] = Query(None),
    bathrooms: Optional[float] = Query(None),
    sort_by: Optional[str] = Query("created_at", regex="^(rent_price|created_at|bedrooms)$"),
    sort_order: Optional[str] = Query("desc", regex="^(asc|desc)$"),
    current_user: User = Depends(get_current_tenant),
    db: Session = Depends(get_db)
):
    """
    Get all available properties for rent with optional filters.
    
    Args:
        city: Filter by city
        state: Filter by state
        property_type: Filter by property type
        min_price: Minimum rent price
        max_price: Maximum rent price
        bedrooms: Number of bedrooms
        bathrooms: Number of bathrooms
        sort_by: Sort field (rent_price, created_at, bedrooms)
        sort_order: Sort order (asc, desc)
        current_user: Authenticated tenant user
        db: Database session
        
    Returns:
        List of available properties with landlord details
    """
    query = db.query(Property).filter(
        Property.status == PropertyStatus.AVAILABLE
    )
    
    # Apply filters
    if city:
        query = query.filter(Property.city.ilike(f"%{city}%"))
    if state:
        query = query.filter(Property.state.ilike(f"%{state}%"))
    if property_type:
        from models.property import PropertyType
        query = query.filter(Property.property_type == PropertyType[property_type.upper()])
    if min_price is not None:
        query = query.filter(Property.rent_price >= min_price)
    if max_price is not None:
        query = query.filter(Property.rent_price <= max_price)
    if bedrooms is not None:
        query = query.filter(Property.bedrooms >= bedrooms)
    if bathrooms is not None:
        query = query.filter(Property.bathrooms >= bathrooms)
    
    # Apply sorting
    if sort_order == "asc":
        query = query.order_by(getattr(Property, sort_by).asc())
    else:
        query = query.order_by(getattr(Property, sort_by).desc())
    
    properties = query.all()
    
    # Get user's favorites
    favorite_property_ids = set(
        fav.property_id for fav in db.query(Favorite).filter(
            Favorite.user_id == current_user.id
        ).all()
    )
    
    result = []
    for prop in properties:
        result.append(PropertyWithLandlord(
            id=prop.id,
            landlord_id=prop.landlord_id,
            title=prop.title,
            description=prop.description,
            rent_price=prop.rent_price,
            location=prop.location,
            city=prop.city,
            state=prop.state,
            address=prop.address,
            zip_code=prop.zip_code,
            country=prop.country,
            property_type=prop.property_type.value if prop.property_type else None,
            bedrooms=prop.bedrooms,
            bathrooms=prop.bathrooms,
            area_sqft=prop.area_sqft,
            deposit_amount=prop.deposit_amount,
            available_from=prop.available_from,
            available_to=prop.available_to,
            status=prop.status.value,
            created_at=prop.created_at,
            updated_at=prop.updated_at,
            landlord_name=prop.landlord.full_name,
            landlord_email=prop.landlord.email,
            is_favorited=prop.id in favorite_property_ids,
            total_bookings=len(prop.bookings) if prop.bookings else 0
        ))
    
    return result


@router.post("/apply", response_model=ApplicationResponse, status_code=status.HTTP_201_CREATED)
async def apply_for_property(
    application_data: ApplicationCreate,
    current_user: User = Depends(get_current_tenant),
    db: Session = Depends(get_db)
):
    """
    Submit a rental application for a property.
    
    Args:
        application_data: Application details
        current_user: Authenticated tenant user
        db: Database session
        
    Returns:
        Created application
        
    Raises:
        HTTPException: If property not found or already applied
    """
    # Check if property exists and is available
    property = db.query(Property).filter(
        Property.id == application_data.property_id,
        Property.status == PropertyStatus.AVAILABLE
    ).first()
    
    if not property:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Property not found or not available"
        )
    
    # Check if tenant already applied for this property
    existing_application = db.query(Application).filter(
        Application.property_id == application_data.property_id,
        Application.tenant_id == current_user.id
    ).first()
    
    if existing_application:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already applied for this property"
        )
    
    # Create application
    new_application = Application(
        property_id=application_data.property_id,
        tenant_id=current_user.id,
        message=application_data.message,
        status=ApplicationStatus.PENDING
    )
    
    db.add(new_application)
    db.commit()
    db.refresh(new_application)
    
    return ApplicationResponse(
        id=new_application.id,
        property_id=new_application.property_id,
        tenant_id=new_application.tenant_id,
        status=new_application.status.value,
        message=new_application.message,
        created_at=new_application.created_at
    )


@router.get("/applications", response_model=List[ApplicationWithDetails])
async def get_my_applications(
    current_user: User = Depends(get_current_tenant),
    db: Session = Depends(get_db)
):
    """
    Get all applications submitted by the current tenant.
    
    Args:
        current_user: Authenticated tenant user
        db: Database session
        
    Returns:
        List of tenant's applications with property details
    """
    applications = db.query(Application).filter(
        Application.tenant_id == current_user.id
    ).all()
    
    result = []
    for app in applications:
        result.append(ApplicationWithDetails(
            id=app.id,
            property_id=app.property_id,
            tenant_id=app.tenant_id,
            status=app.status.value,
            message=app.message,
            created_at=app.created_at,
            property_title=app.property.title,
            property_location=app.property.location,
            property_rent_price=app.property.rent_price,
            tenant_name=current_user.full_name,
            tenant_email=current_user.email
        ))
    
    return result

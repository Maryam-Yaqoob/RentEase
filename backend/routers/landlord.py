from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models.user import User
from models.property import Property, PropertyStatus, PropertyType
from models.application import Application, ApplicationStatus
from schemas.property_schema import PropertyCreate, PropertyUpdate, PropertyResponse
from schemas.application_schema import ApplicationUpdate, ApplicationWithDetails
from utils.jwt_handler import decode_access_token

router = APIRouter(prefix="/landlord", tags=["Landlord"])


def get_current_landlord(authorization: str = Header(...), db: Session = Depends(get_db)) -> User:
    """
    Dependency to get current authenticated landlord user.
    
    Args:
        authorization: JWT token from Authorization header
        db: Database session
        
    Returns:
        Current landlord user
        
    Raises:
        HTTPException: If unauthorized or not a landlord
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
    
    if token_data.role != "landlord":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Landlord role required."
        )
    
    user = db.query(User).filter(User.id == token_data.user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return user


@router.post("/property", response_model=PropertyResponse, status_code=status.HTTP_201_CREATED)
async def create_property(
    property_data: PropertyCreate,
    current_user: User = Depends(get_current_landlord),
    db: Session = Depends(get_db)
):
    """
    Create a new rental property listing.
    
    Args:
        property_data: Property details
        current_user: Authenticated landlord user
        db: Database session
        
    Returns:
        Created property
    """
    new_property = Property(
        landlord_id=current_user.id,
        title=property_data.title,
        description=property_data.description,
        rent_price=property_data.rent_price,
        location=property_data.location,
        city=property_data.city,
        state=property_data.state,
        address=property_data.address,
        zip_code=property_data.zip_code,
        country=property_data.country or "USA",
        property_type=PropertyType[property_data.property_type.upper()] if property_data.property_type else PropertyType.APARTMENT,
        bedrooms=property_data.bedrooms,
        bathrooms=property_data.bathrooms,
        area_sqft=property_data.area_sqft,
        deposit_amount=property_data.deposit_amount,
        available_from=property_data.available_from,
        available_to=property_data.available_to,
        status=PropertyStatus.AVAILABLE if property_data.status == "available" else PropertyStatus.OCCUPIED
    )
    
    db.add(new_property)
    db.commit()
    db.refresh(new_property)
    
    return PropertyResponse(
        id=new_property.id,
        landlord_id=new_property.landlord_id,
        title=new_property.title,
        description=new_property.description,
        rent_price=new_property.rent_price,
        location=new_property.location,
        city=new_property.city,
        state=new_property.state,
        address=new_property.address,
        zip_code=new_property.zip_code,
        country=new_property.country,
        property_type=new_property.property_type.value if new_property.property_type else None,
        bedrooms=new_property.bedrooms,
        bathrooms=new_property.bathrooms,
        area_sqft=new_property.area_sqft,
        deposit_amount=new_property.deposit_amount,
        available_from=new_property.available_from,
        available_to=new_property.available_to,
        status=new_property.status.value,
        created_at=new_property.created_at,
        updated_at=new_property.updated_at
    )


@router.get("/properties", response_model=List[PropertyResponse])
async def get_my_properties(
    current_user: User = Depends(get_current_landlord),
    db: Session = Depends(get_db)
):
    """
    Get all properties owned by the current landlord.
    
    Args:
        current_user: Authenticated landlord user
        db: Database session
        
    Returns:
        List of landlord's properties
    """
    properties = db.query(Property).filter(
        Property.landlord_id == current_user.id
    ).all()
    
    result = []
    for prop in properties:
        result.append(PropertyResponse(
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
            updated_at=prop.updated_at
        ))
    
    return result


@router.put("/property/{property_id}", response_model=PropertyResponse)
async def update_property(
    property_id: int,
    property_data: PropertyUpdate,
    current_user: User = Depends(get_current_landlord),
    db: Session = Depends(get_db)
):
    """
    Update a property listing.
    
    Args:
        property_id: ID of property to update
        property_data: Updated property details
        current_user: Authenticated landlord user
        db: Database session
        
    Returns:
        Updated property
        
    Raises:
        HTTPException: If property not found or unauthorized
    """
    property = db.query(Property).filter(
        Property.id == property_id,
        Property.landlord_id == current_user.id
    ).first()
    
    if not property:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Property not found or you don't have permission to update it"
        )
    
    # Update fields if provided
    update_data = property_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if field == "status":
            value = PropertyStatus.AVAILABLE if value == "available" else PropertyStatus.OCCUPIED
        elif field == "property_type" and value:
            value = PropertyType[value.upper()]
        setattr(property, field, value)
    
    from datetime import datetime
    property.updated_at = datetime.now()
    
    db.commit()
    db.refresh(property)
    
    return PropertyResponse(
        id=property.id,
        landlord_id=property.landlord_id,
        title=property.title,
        description=property.description,
        rent_price=property.rent_price,
        location=property.location,
        city=property.city,
        state=property.state,
        address=property.address,
        zip_code=property.zip_code,
        country=property.country,
        property_type=property.property_type.value if property.property_type else None,
        bedrooms=property.bedrooms,
        bathrooms=property.bathrooms,
        area_sqft=property.area_sqft,
        deposit_amount=property.deposit_amount,
        available_from=property.available_from,
        available_to=property.available_to,
        status=property.status.value,
        created_at=property.created_at,
        updated_at=property.updated_at
    )


@router.delete("/property/{property_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_property(
    property_id: int,
    current_user: User = Depends(get_current_landlord),
    db: Session = Depends(get_db)
):
    """
    Delete a property listing.
    
    Args:
        property_id: ID of property to delete
        current_user: Authenticated landlord user
        db: Database session
        
    Raises:
        HTTPException: If property not found or unauthorized
    """
    property = db.query(Property).filter(
        Property.id == property_id,
        Property.landlord_id == current_user.id
    ).first()
    
    if not property:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Property not found or you don't have permission to delete it"
        )
    
    db.delete(property)
    db.commit()
    
    return None


@router.get("/applications", response_model=List[ApplicationWithDetails])
async def get_property_applications(
    current_user: User = Depends(get_current_landlord),
    db: Session = Depends(get_db)
):
    """
    Get all applications for landlord's properties.
    
    Args:
        current_user: Authenticated landlord user
        db: Database session
        
    Returns:
        List of applications with property and tenant details
    """
    # Get all applications for landlord's properties
    applications = db.query(Application).join(Property).filter(
        Property.landlord_id == current_user.id
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
            tenant_name=app.tenant.full_name,
            tenant_email=app.tenant.email
        ))
    
    return result


@router.put("/application/{application_id}", response_model=ApplicationWithDetails)
async def update_application_status(
    application_id: int,
    status_update: ApplicationUpdate,
    current_user: User = Depends(get_current_landlord),
    db: Session = Depends(get_db)
):
    """
    Update application status (approve/reject).
    
    Args:
        application_id: ID of application to update
        status_update: New status
        current_user: Authenticated landlord user
        db: Database session
        
    Returns:
        Updated application
        
    Raises:
        HTTPException: If application not found or unauthorized
    """
    # Get application and verify ownership
    application = db.query(Application).join(Property).filter(
        Application.id == application_id,
        Property.landlord_id == current_user.id
    ).first()
    
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found or you don't have permission to update it"
        )
    
    # Update status
    if status_update.status == "approved":
        application.status = ApplicationStatus.APPROVED
    elif status_update.status == "rejected":
        application.status = ApplicationStatus.REJECTED
    else:
        application.status = ApplicationStatus.PENDING
    
    db.commit()
    db.refresh(application)
    
    return ApplicationWithDetails(
        id=application.id,
        property_id=application.property_id,
        tenant_id=application.tenant_id,
        status=application.status.value,
        message=application.message,
        created_at=application.created_at,
        property_title=application.property.title,
        property_location=application.property.location,
        property_rent_price=application.property.rent_price,
        tenant_name=application.tenant.full_name,
        tenant_email=application.tenant.email
    )

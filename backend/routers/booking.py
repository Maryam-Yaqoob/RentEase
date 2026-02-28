from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from typing import List
from datetime import datetime, date
from database import get_db
from models.user import User
from models.property import Property, PropertyStatus
from models.booking import Booking, BookingStatus
from schemas.booking_schema import BookingCreate, BookingUpdate, BookingResponse, BookingWithDetails, BookingStatusUpdate
from utils.jwt_handler import decode_access_token
from dateutil.relativedelta import relativedelta

router = APIRouter(prefix="/bookings", tags=["Bookings"])


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


def check_booking_overlap(db: Session, property_id: int, start_date: date, end_date: date, exclude_booking_id: int = None) -> bool:
    """Check if there's an overlapping booking for the property"""
    query = db.query(Booking).filter(
        Booking.property_id == property_id,
        Booking.status.in_([BookingStatus.CONFIRMED, BookingStatus.PENDING]),
        or_(
            and_(Booking.start_date <= start_date, Booking.end_date >= start_date),
            and_(Booking.start_date <= end_date, Booking.end_date >= end_date),
            and_(Booking.start_date >= start_date, Booking.end_date <= end_date)
        )
    )
    
    if exclude_booking_id:
        query = query.filter(Booking.id != exclude_booking_id)
    
    return query.first() is not None


@router.post("/", response_model=BookingResponse, status_code=status.HTTP_201_CREATED)
async def create_booking(
    booking_data: BookingCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new booking for a property.
    Prevents overlapping bookings.
    """
    # Validate dates
    if booking_data.start_date < date.today():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Start date cannot be in the past"
        )
    
    if booking_data.end_date <= booking_data.start_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="End date must be after start date"
        )
    
    # Check property exists and is available
    property = db.query(Property).filter(Property.id == booking_data.property_id).first()
    if not property:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Property not found"
        )
    
    # Prevent booking own property
    if property.landlord_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot book your own property"
        )
    
    # Check property availability dates
    if property.available_from and booking_data.start_date < property.available_from:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Property is only available from {property.available_from}"
        )
    
    if property.available_to and booking_data.end_date > property.available_to:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Property is only available until {property.available_to}"
        )
    
    # Check for overlapping bookings
    if check_booking_overlap(db, booking_data.property_id, booking_data.start_date, booking_data.end_date):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This property is already booked for the selected dates. Please choose different dates."
        )
    
    # Calculate total amount
    days = (booking_data.end_date - booking_data.start_date).days
    months = max(1, days / 30)  # Minimum 1 month
    total_amount = property.rent_price * months
    
    # Create booking
    new_booking = Booking(
        property_id=booking_data.property_id,
        tenant_id=current_user.id,
        start_date=booking_data.start_date,
        end_date=booking_data.end_date,
        total_amount=total_amount,
        deposit_paid=property.deposit_amount or 0.0,
        notes=booking_data.notes,
        status=BookingStatus.PENDING
    )
    
    db.add(new_booking)
    
    # Update property status to BOOKED
    property.status = PropertyStatus.BOOKED
    
    db.commit()
    db.refresh(new_booking)
    
    return BookingResponse(
        id=new_booking.id,
        property_id=new_booking.property_id,
        tenant_id=new_booking.tenant_id,
        start_date=new_booking.start_date,
        end_date=new_booking.end_date,
        total_amount=new_booking.total_amount,
        deposit_paid=new_booking.deposit_paid,
        status=new_booking.status.value,
        notes=new_booking.notes,
        created_at=new_booking.created_at,
        updated_at=new_booking.updated_at,
        confirmed_at=new_booking.confirmed_at,
        cancelled_at=new_booking.cancelled_at
    )


@router.get("/my-bookings", response_model=List[BookingWithDetails])
async def get_my_bookings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all bookings made by the current user"""
    bookings = db.query(Booking).filter(
        Booking.tenant_id == current_user.id
    ).order_by(Booking.created_at.desc()).all()
    
    result = []
    for booking in bookings:
        result.append(BookingWithDetails(
            id=booking.id,
            property_id=booking.property_id,
            tenant_id=booking.tenant_id,
            start_date=booking.start_date,
            end_date=booking.end_date,
            total_amount=booking.total_amount,
            deposit_paid=booking.deposit_paid,
            status=booking.status.value,
            notes=booking.notes,
            created_at=booking.created_at,
            updated_at=booking.updated_at,
            confirmed_at=booking.confirmed_at,
            cancelled_at=booking.cancelled_at,
            property_title=booking.property.title,
            property_city=booking.property.city,
            property_state=booking.property.state,
            tenant_name=booking.tenant.full_name,
            tenant_email=booking.tenant.email,
            landlord_name=booking.property.landlord.full_name
        ))
    
    return result


@router.get("/property/{property_id}/bookings", response_model=List[BookingWithDetails])
async def get_property_bookings(
    property_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all bookings for a specific property (landlord only)"""
    property = db.query(Property).filter(Property.id == property_id).first()
    if not property:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Property not found"
        )
    
    if property.landlord_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to view these bookings"
        )
    
    bookings = db.query(Booking).filter(
        Booking.property_id == property_id
    ).order_by(Booking.start_date.desc()).all()
    
    result = []
    for booking in bookings:
        result.append(BookingWithDetails(
            id=booking.id,
            property_id=booking.property_id,
            tenant_id=booking.tenant_id,
            start_date=booking.start_date,
            end_date=booking.end_date,
            total_amount=booking.total_amount,
            deposit_paid=booking.deposit_paid,
            status=booking.status.value,
            notes=booking.notes,
            created_at=booking.created_at,
            updated_at=booking.updated_at,
            confirmed_at=booking.confirmed_at,
            cancelled_at=booking.cancelled_at,
            property_title=booking.property.title,
            property_city=booking.property.city,
            property_state=booking.property.state,
            tenant_name=booking.tenant.full_name,
            tenant_email=booking.tenant.email,
            landlord_name=booking.property.landlord.full_name
        ))
    
    return result


@router.put("/{booking_id}/status", response_model=BookingResponse)
async def update_booking_status(
    booking_id: int,
    status_data: BookingStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update booking status (landlord can confirm/complete, tenant can cancel)"""
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )
    
    property = booking.property
    
    # Check permissions
    is_landlord = property.landlord_id == current_user.id
    is_tenant = booking.tenant_id == current_user.id
    
    if not (is_landlord or is_tenant):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to update this booking"
        )
    
    # Validate status transitions
    if status_data.status == "confirmed" and not is_landlord:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only landlord can confirm bookings"
        )
    
    if status_data.status == "completed" and not is_landlord:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only landlord can mark bookings as completed"
        )
    
    # Update booking
    if status_data.status == "confirmed":
        booking.status = BookingStatus.CONFIRMED
        booking.confirmed_at = datetime.utcnow()
        property.status = PropertyStatus.BOOKED
    elif status_data.status == "cancelled":
        booking.status = BookingStatus.CANCELLED
        booking.cancelled_at = datetime.utcnow()
        # Check if there are other confirmed bookings
        other_bookings = db.query(Booking).filter(
            Booking.property_id == property.id,
            Booking.id != booking_id,
            Booking.status == BookingStatus.CONFIRMED
        ).first()
        if not other_bookings:
            property.status = PropertyStatus.AVAILABLE
    elif status_data.status == "completed":
        booking.status = BookingStatus.COMPLETED
        property.status = PropertyStatus.AVAILABLE
    
    if status_data.notes:
        booking.notes = status_data.notes
    
    db.commit()
    db.refresh(booking)
    
    return BookingResponse(
        id=booking.id,
        property_id=booking.property_id,
        tenant_id=booking.tenant_id,
        start_date=booking.start_date,
        end_date=booking.end_date,
        total_amount=booking.total_amount,
        deposit_paid=booking.deposit_paid,
        status=booking.status.value,
        notes=booking.notes,
        created_at=booking.created_at,
        updated_at=booking.updated_at,
        confirmed_at=booking.confirmed_at,
        cancelled_at=booking.cancelled_at
    )


@router.delete("/{booking_id}", status_code=status.HTTP_204_NO_CONTENT)
async def cancel_booking(
    booking_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Cancel a pending booking (tenant only, before confirmation)"""
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )
    
    if booking.tenant_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only cancel your own bookings"
        )
    
    if booking.status != BookingStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Can only cancel pending bookings. Please contact the landlord to cancel confirmed bookings."
        )
    
    booking.status = BookingStatus.CANCELLED
    booking.cancelled_at = datetime.utcnow()
    
    # Update property status if no other bookings
    property = booking.property
    other_bookings = db.query(Booking).filter(
        Booking.property_id == property.id,
        Booking.id != booking_id,
        Booking.status.in_([BookingStatus.CONFIRMED, BookingStatus.PENDING])
    ).first()
    
    if not other_bookings:
        property.status = PropertyStatus.AVAILABLE
    
    db.commit()
    
    return None

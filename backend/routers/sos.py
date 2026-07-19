"""Emergency SOS router: capture location and alert emergency contacts."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models.models import SOSRequest, User
from schemas.schemas import SOSCreate, SOSResponse
from auth import get_current_user, require_admin

router = APIRouter(prefix="/api/sos", tags=["Emergency SOS"])


@router.post("/", response_model=SOSResponse, status_code=201)
def trigger_sos(
    payload: SOSCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Trigger emergency SOS alert.
    Records user location and medical info, marks emergency contacts as notified.
    In production: integrate with ambulance dispatch API and send SMS/push notifications.
    """
    # Get user's medical info if not provided in payload
    user = db.query(User).filter(User.id == current_user["id"]).first()

    sos = SOSRequest(
        user_id=current_user["id"],
        latitude=payload.latitude,
        longitude=payload.longitude,
        address=payload.address,
        blood_group=payload.blood_group or (user.blood_group if user else None),
        allergies=payload.allergies or (user.allergies if user else None),
        medical_conditions=payload.medical_conditions or (user.medical_conditions if user else None),
        emergency_contact_notified=True,  # Simulate notification
        status="active",
    )
    db.add(sos)
    db.commit()
    db.refresh(sos)

    # In production: send SMS/push notification to user.emergency_contact_phone
    print(f"🚨 SOS Alert! User: {current_user['email']}, Location: {payload.latitude}, {payload.longitude}")

    return sos


@router.get("/my-requests", response_model=List[SOSResponse])
def get_my_sos_requests(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get all SOS requests for the current user."""
    return (
        db.query(SOSRequest)
        .filter(SOSRequest.user_id == current_user["id"])
        .order_by(SOSRequest.created_at.desc())
        .all()
    )


@router.put("/{sos_id}/resolve")
def resolve_sos(
    sos_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Mark an SOS request as resolved."""
    sos = db.query(SOSRequest).filter(
        SOSRequest.id == sos_id,
        SOSRequest.user_id == current_user["id"]
    ).first()
    if not sos:
        raise HTTPException(status_code=404, detail="SOS request not found")
    sos.status = "resolved"
    db.commit()
    return {"message": "SOS resolved"}


# Admin endpoints
@router.get("/all", response_model=List[SOSResponse])
def get_all_sos(
    admin: dict = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Admin: View all SOS alerts."""
    return db.query(SOSRequest).order_by(SOSRequest.created_at.desc()).all()

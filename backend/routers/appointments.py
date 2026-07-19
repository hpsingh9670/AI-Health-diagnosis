"""Appointments router: AI-assisted appointment booking."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models.models import Appointment
from schemas.schemas import AppointmentCreate, AppointmentResponse
from auth import get_current_user, require_admin

router = APIRouter(prefix="/api/appointments", tags=["Appointments"])


@router.post("/", response_model=AppointmentResponse, status_code=201)
def create_appointment(
    payload: AppointmentCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Book a new appointment."""
    appt = Appointment(**payload.model_dump(), user_id=current_user["id"])
    db.add(appt)
    db.commit()
    db.refresh(appt)
    return appt


@router.get("/", response_model=List[AppointmentResponse])
def get_my_appointments(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get all appointments for the authenticated user."""
    return (
        db.query(Appointment)
        .filter(Appointment.user_id == current_user["id"])
        .order_by(Appointment.created_at.desc())
        .all()
    )


@router.put("/{appt_id}/cancel")
def cancel_appointment(
    appt_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Cancel an appointment."""
    appt = db.query(Appointment).filter(
        Appointment.id == appt_id,
        Appointment.user_id == current_user["id"]
    ).first()
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")
    appt.status = "cancelled"
    db.commit()
    return {"message": "Appointment cancelled"}


# Admin endpoints
@router.get("/all", response_model=List[AppointmentResponse])
def get_all_appointments(
    admin: dict = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Admin: View all appointment requests."""
    return db.query(Appointment).order_by(Appointment.created_at.desc()).all()


@router.put("/{appt_id}/confirm")
def confirm_appointment(
    appt_id: int,
    admin: dict = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Admin: Confirm an appointment."""
    appt = db.query(Appointment).filter(Appointment.id == appt_id).first()
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")
    appt.status = "confirmed"
    db.commit()
    return {"message": "Appointment confirmed"}

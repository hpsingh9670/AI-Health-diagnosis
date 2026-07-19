"""Medicine Reminders router: CRUD for medicine schedules."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models.models import MedicineReminder
from schemas.schemas import MedicineReminderCreate, MedicineReminderResponse
from auth import get_current_user

router = APIRouter(prefix="/api/medicines", tags=["Medicine Reminders"])


@router.post("/", response_model=MedicineReminderResponse, status_code=201)
def add_medicine(
    payload: MedicineReminderCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Add a new medicine reminder."""
    med = MedicineReminder(**payload.model_dump(), user_id=current_user["id"])
    db.add(med)
    db.commit()
    db.refresh(med)
    return med


@router.get("/", response_model=List[MedicineReminderResponse])
def get_medicines(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get all medicine reminders for the current user."""
    return (
        db.query(MedicineReminder)
        .filter(MedicineReminder.user_id == current_user["id"])
        .order_by(MedicineReminder.created_at.desc())
        .all()
    )


@router.put("/{med_id}", response_model=MedicineReminderResponse)
def update_medicine(
    med_id: int,
    payload: MedicineReminderCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update a medicine reminder."""
    med = db.query(MedicineReminder).filter(
        MedicineReminder.id == med_id,
        MedicineReminder.user_id == current_user["id"]
    ).first()
    if not med:
        raise HTTPException(status_code=404, detail="Medicine not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(med, field, value)
    db.commit()
    db.refresh(med)
    return med


@router.delete("/{med_id}")
def delete_medicine(
    med_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete a medicine reminder."""
    med = db.query(MedicineReminder).filter(
        MedicineReminder.id == med_id,
        MedicineReminder.user_id == current_user["id"]
    ).first()
    if not med:
        raise HTTPException(status_code=404, detail="Medicine not found")
    db.delete(med)
    db.commit()
    return {"message": f"Medicine '{med.medicine_name}' deleted"}


@router.put("/{med_id}/toggle")
def toggle_medicine_active(
    med_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Toggle a medicine reminder on/off."""
    med = db.query(MedicineReminder).filter(
        MedicineReminder.id == med_id,
        MedicineReminder.user_id == current_user["id"]
    ).first()
    if not med:
        raise HTTPException(status_code=404, detail="Medicine not found")
    med.is_active = not med.is_active
    db.commit()
    return {"id": med_id, "is_active": med.is_active}

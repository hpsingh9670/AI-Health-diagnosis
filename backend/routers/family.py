"""Family Records router: CRUD for family member health records."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models.models import FamilyMember
from schemas.schemas import FamilyMemberCreate, FamilyMemberUpdate, FamilyMemberResponse
from auth import get_current_user

router = APIRouter(prefix="/api/family", tags=["Family Records"])


@router.post("/", response_model=FamilyMemberResponse, status_code=201)
def add_family_member(
    payload: FamilyMemberCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Add a new family member health record."""
    member = FamilyMember(**payload.model_dump(), user_id=current_user["id"])
    db.add(member)
    db.commit()
    db.refresh(member)
    return member


@router.get("/", response_model=List[FamilyMemberResponse])
def get_family_members(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List all family members for the authenticated user."""
    return db.query(FamilyMember).filter(FamilyMember.user_id == current_user["id"]).all()


@router.get("/{member_id}", response_model=FamilyMemberResponse)
def get_family_member(
    member_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get a specific family member record."""
    member = db.query(FamilyMember).filter(
        FamilyMember.id == member_id,
        FamilyMember.user_id == current_user["id"]
    ).first()
    if not member:
        raise HTTPException(status_code=404, detail="Family member not found")
    return member


@router.put("/{member_id}", response_model=FamilyMemberResponse)
def update_family_member(
    member_id: int,
    payload: FamilyMemberUpdate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update a family member's health record."""
    member = db.query(FamilyMember).filter(
        FamilyMember.id == member_id,
        FamilyMember.user_id == current_user["id"]
    ).first()
    if not member:
        raise HTTPException(status_code=404, detail="Family member not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(member, field, value)
    db.commit()
    db.refresh(member)
    return member


@router.delete("/{member_id}")
def delete_family_member(
    member_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete a family member record."""
    member = db.query(FamilyMember).filter(
        FamilyMember.id == member_id,
        FamilyMember.user_id == current_user["id"]
    ).first()
    if not member:
        raise HTTPException(status_code=404, detail="Family member not found")
    db.delete(member)
    db.commit()
    return {"message": f"Family member '{member.name}' deleted"}

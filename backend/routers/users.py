"""Users router: profile management and admin user listing."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.models import User
from schemas.schemas import UserUpdate, UserResponse
from auth import get_current_user, require_admin
from typing import List

router = APIRouter(prefix="/api/users", tags=["Users"])


@router.get("/me", response_model=UserResponse)
def get_my_profile(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get the authenticated user's full profile."""
    user = db.query(User).filter(User.id == current_user["id"]).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.put("/me", response_model=UserResponse)
def update_my_profile(
    payload: UserUpdate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update the authenticated user's profile."""
    user = db.query(User).filter(User.id == current_user["id"]).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(user, field, value)

    db.commit()
    db.refresh(user)
    return user


# ─── Admin Endpoints ──────────────────────────────────────────────────────────

@router.get("/", response_model=List[UserResponse])
def list_all_users(admin: dict = Depends(require_admin), db: Session = Depends(get_db)):
    """Admin: List all registered users."""
    return db.query(User).all()


@router.put("/{user_id}/toggle-active")
def toggle_user_active(
    user_id: int,
    admin: dict = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Admin: Activate or deactivate a user account."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = not user.is_active
    db.commit()
    return {"id": user_id, "is_active": user.is_active}


@router.delete("/{user_id}")
def delete_user(
    user_id: int,
    admin: dict = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Admin: Delete a user account."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(user)
    db.commit()
    return {"message": f"User {user_id} deleted"}

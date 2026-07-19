"""Auth router: register, login, forgot/reset password."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models.models import User
from schemas.schemas import UserRegister, UserLogin, Token, ForgotPasswordRequest
from auth import get_password_hash, verify_password, create_access_token

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


def user_to_dict(user: User) -> dict:
    """Serialize a User ORM object to a plain dict for JWT payload."""
    return {
        "id": user.id,
        "email": user.email,
        "full_name": user.full_name,
        "role": user.role,
        "blood_group": user.blood_group,
        "phone": user.phone,
        "gender": user.gender,
        "allergies": user.allergies,
        "medical_conditions": user.medical_conditions,
        "emergency_contact_name": user.emergency_contact_name,
        "emergency_contact_phone": user.emergency_contact_phone,
        "preferred_language": user.preferred_language,
    }


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(payload: UserRegister, db: Session = Depends(get_db)):
    """Register a new user account."""
    # Check for existing email
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        full_name=payload.full_name,
        email=payload.email,
        hashed_password=get_password_hash(payload.password),
        phone=payload.phone,
        gender=payload.gender,
        date_of_birth=payload.date_of_birth,
        blood_group=payload.blood_group,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": str(user.id), "email": user.email, "role": user.role})
    return {"access_token": token, "token_type": "bearer", "user": user_to_dict(user)}


@router.post("/login", response_model=Token)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    """Authenticate user and return JWT token."""
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is deactivated")

    token = create_access_token({"sub": str(user.id), "email": user.email, "role": user.role})
    return {"access_token": token, "token_type": "bearer", "user": user_to_dict(user)}


@router.post("/forgot-password")
def forgot_password(payload: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """
    Initiate password reset flow.
    In production, send an email with a reset link containing a signed token.
    Here we return a mock token for demonstration.
    """
    user = db.query(User).filter(User.email == payload.email).first()
    if not user:
        # Return success regardless to prevent email enumeration
        return {"message": "If this email is registered, a reset link has been sent."}

    # Create a short-lived reset token
    reset_token = create_access_token({"sub": str(user.id), "purpose": "reset"})
    # In production: send email with reset_token
    return {
        "message": "Password reset instructions sent to your email.",
        "debug_token": reset_token   # Remove in production!
    }


@router.post("/reset-password")
def reset_password(token: str, new_password: str, db: Session = Depends(get_db)):
    """Reset user password using a valid reset token."""
    from auth import decode_token
    payload = decode_token(token)
    if payload.get("purpose") != "reset":
        raise HTTPException(status_code=400, detail="Invalid reset token")

    user = db.query(User).filter(User.id == int(payload["sub"])).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.hashed_password = get_password_hash(new_password)
    db.commit()
    return {"message": "Password reset successfully. Please log in."}

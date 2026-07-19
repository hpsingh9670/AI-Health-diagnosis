"""Symptoms router: AI disease prediction endpoint."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.models import SymptomCheck
from schemas.schemas import SymptomCheckRequest, SymptomCheckResponse
from services.ml_service import predict_disease
from auth import get_current_user
from typing import List, Optional
from fastapi.security import OAuth2PasswordBearer
from fastapi import HTTPException

router = APIRouter(prefix="/api/symptoms", tags=["Symptoms"])

# Optional auth: try to get user but don't require it
def get_optional_user(token: str = Depends(OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False))):
    if not token:
        return None
    try:
        from auth import decode_token
        payload = decode_token(token)
        return {"id": int(payload.get("sub")), "email": payload.get("email")}
    except Exception:
        return None


@router.post("/predict", response_model=SymptomCheckResponse)
def predict_symptoms(
    payload: SymptomCheckRequest,
    db: Session = Depends(get_db),
    current_user: Optional[dict] = Depends(get_optional_user),
):
    """
    Predict possible disease from a list of symptoms.
    Accepts symptoms in English or Hindi.
    Saves the prediction to history if user is authenticated.
    """
    if not payload.symptoms:
        raise HTTPException(status_code=400, detail="At least one symptom is required")

    result = predict_disease(payload.symptoms, payload.language or "en")

    # Persist to DB
    try:
        check = SymptomCheck(
            user_id=current_user["id"] if current_user else None,
            symptoms_input=", ".join(payload.symptoms),
            predicted_disease=result["predicted_disease"],
            confidence_score=result["confidence_score"],
            severity=result["severity"],
            specialist=result["specialist"],
            precautions=", ".join(result["precautions"]),
        )
        db.add(check)
        db.commit()
    except Exception:
        pass  # Don't fail the request if DB write fails

    return result


@router.get("/history")
def get_symptom_history(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get the authenticated user's symptom check history."""
    checks = (
        db.query(SymptomCheck)
        .filter(SymptomCheck.user_id == current_user["id"])
        .order_by(SymptomCheck.created_at.desc())
        .limit(20)
        .all()
    )
    return checks


@router.get("/all-symptoms")
def get_all_symptoms():
    """Return the list of all recognized symptoms (for autocomplete)."""
    from services.ml_service import ALL_SYMPTOMS
    # Return human-readable versions
    return [{"value": s, "label": s.replace("_", " ").title()} for s in ALL_SYMPTOMS]

"""Admin dashboard router: statistics and management endpoints."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models.models import User, Appointment, SOSRequest, SymptomCheck, MedicineReminder, FamilyMember
from auth import require_admin

router = APIRouter(prefix="/api/admin", tags=["Admin"])


@router.get("/stats")
def get_dashboard_stats(
    admin: dict = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Get overall platform statistics for admin dashboard."""
    total_users = db.query(User).count()
    active_users = db.query(User).filter(User.is_active == True).count()
    total_appointments = db.query(Appointment).count()
    pending_appointments = db.query(Appointment).filter(Appointment.status == "pending").count()
    confirmed_appointments = db.query(Appointment).filter(Appointment.status == "confirmed").count()
    total_sos = db.query(SOSRequest).count()
    active_sos = db.query(SOSRequest).filter(SOSRequest.status == "active").count()
    total_predictions = db.query(SymptomCheck).count()
    total_medicines = db.query(MedicineReminder).count()
    total_family = db.query(FamilyMember).count()

    # Top predicted diseases
    from sqlalchemy import func
    top_diseases = (
        db.query(SymptomCheck.predicted_disease, func.count(SymptomCheck.predicted_disease).label("count"))
        .filter(SymptomCheck.predicted_disease != None)
        .group_by(SymptomCheck.predicted_disease)
        .order_by(func.count(SymptomCheck.predicted_disease).desc())
        .limit(5)
        .all()
    )

    return {
        "users": {"total": total_users, "active": active_users, "inactive": total_users - active_users},
        "appointments": {"total": total_appointments, "pending": pending_appointments, "confirmed": confirmed_appointments},
        "sos": {"total": total_sos, "active": active_sos, "resolved": total_sos - active_sos},
        "symptom_checks": {"total": total_predictions},
        "medicines": {"total": total_medicines},
        "family_members": {"total": total_family},
        "top_diseases": [{"disease": d[0], "count": d[1]} for d in top_diseases],
    }


@router.get("/recent-activity")
def get_recent_activity(
    admin: dict = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Get recent platform activity."""
    recent_users = (
        db.query(User)
        .order_by(User.created_at.desc())
        .limit(5)
        .all()
    )
    recent_sos = (
        db.query(SOSRequest)
        .order_by(SOSRequest.created_at.desc())
        .limit(5)
        .all()
    )
    recent_appts = (
        db.query(Appointment)
        .order_by(Appointment.created_at.desc())
        .limit(5)
        .all()
    )

    return {
        "recent_users": [{"id": u.id, "name": u.full_name, "email": u.email, "joined": str(u.created_at)} for u in recent_users],
        "recent_sos": [{"id": s.id, "user_id": s.user_id, "status": s.status, "at": str(s.created_at)} for s in recent_sos],
        "recent_appointments": [{"id": a.id, "patient": a.patient_name, "status": a.status, "date": a.preferred_date} for a in recent_appts],
    }

"""SQLAlchemy ORM models for MediAI application."""
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, Float, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class User(Base):
    """User account model with profile information."""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    phone = Column(String(20), nullable=True)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(20), default="user")          # "user" or "admin"
    is_active = Column(Boolean, default=True)
    blood_group = Column(String(10), nullable=True)
    date_of_birth = Column(String(20), nullable=True)
    gender = Column(String(10), nullable=True)
    address = Column(Text, nullable=True)
    allergies = Column(Text, nullable=True)
    medical_conditions = Column(Text, nullable=True)
    emergency_contact_name = Column(String(100), nullable=True)
    emergency_contact_phone = Column(String(20), nullable=True)
    preferred_language = Column(String(10), default="en")
    avatar_url = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    family_members = relationship("FamilyMember", back_populates="user", cascade="all, delete-orphan")
    appointments = relationship("Appointment", back_populates="user", cascade="all, delete-orphan")
    medicine_reminders = relationship("MedicineReminder", back_populates="user", cascade="all, delete-orphan")
    sos_requests = relationship("SOSRequest", back_populates="user", cascade="all, delete-orphan")
    symptom_checks = relationship("SymptomCheck", back_populates="user", cascade="all, delete-orphan")


class FamilyMember(Base):
    """Family member health record."""
    __tablename__ = "family_members"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(100), nullable=False)
    age = Column(Integer, nullable=True)
    gender = Column(String(10), nullable=True)
    blood_group = Column(String(10), nullable=True)
    relation = Column(String(50), nullable=True)          # renamed from 'relationship'
    medical_history = Column(Text, nullable=True)
    allergies = Column(Text, nullable=True)
    current_medicines = Column(Text, nullable=True)
    emergency_contact = Column(String(100), nullable=True)
    emergency_phone = Column(String(20), nullable=True)
    insurance_provider = Column(String(100), nullable=True)
    insurance_number = Column(String(100), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", back_populates="family_members")


class Appointment(Base):
    """Doctor/hospital appointment booking."""
    __tablename__ = "appointments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    patient_name = Column(String(100), nullable=False)
    patient_age = Column(Integer, nullable=True)
    patient_gender = Column(String(10), nullable=True)
    symptoms = Column(Text, nullable=True)
    preferred_date = Column(String(20), nullable=True)
    preferred_time = Column(String(20), nullable=True)
    location = Column(String(255), nullable=True)
    hospital_name = Column(String(200), nullable=True)
    doctor_specialty = Column(String(100), nullable=True)
    status = Column(String(30), default="pending")   # pending, confirmed, cancelled
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="appointments")


class MedicineReminder(Base):
    """Medicine reminder with dosage and schedule."""
    __tablename__ = "medicine_reminders"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    medicine_name = Column(String(150), nullable=False)
    dosage = Column(String(100), nullable=True)
    frequency = Column(String(50), nullable=True)     # daily, twice daily, etc.
    reminder_times = Column(Text, nullable=True)       # JSON string of times
    start_date = Column(String(20), nullable=True)
    end_date = Column(String(20), nullable=True)
    instructions = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="medicine_reminders")


class SOSRequest(Base):
    """Emergency SOS alert record."""
    __tablename__ = "sos_requests"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    address = Column(Text, nullable=True)
    status = Column(String(30), default="active")    # active, resolved, cancelled
    blood_group = Column(String(10), nullable=True)
    allergies = Column(Text, nullable=True)
    medical_conditions = Column(Text, nullable=True)
    emergency_contact_notified = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    resolved_at = Column(DateTime(timezone=True), nullable=True)

    user = relationship("User", back_populates="sos_requests")


class SymptomCheck(Base):
    """Record of AI symptom check predictions."""
    __tablename__ = "symptom_checks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    symptoms_input = Column(Text, nullable=False)
    predicted_disease = Column(String(150), nullable=True)
    confidence_score = Column(Float, nullable=True)
    severity = Column(String(30), nullable=True)
    specialist = Column(String(100), nullable=True)
    precautions = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="symptom_checks")

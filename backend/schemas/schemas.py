"""Pydantic schemas for request validation and response serialization."""
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime


# ─── Auth Schemas ────────────────────────────────────────────────────────────

class UserRegister(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    phone: Optional[str] = None
    gender: Optional[str] = None
    date_of_birth: Optional[str] = None
    blood_group: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: dict

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str


# ─── User Schemas ─────────────────────────────────────────────────────────────

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    gender: Optional[str] = None
    date_of_birth: Optional[str] = None
    blood_group: Optional[str] = None
    address: Optional[str] = None
    allergies: Optional[str] = None
    medical_conditions: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    preferred_language: Optional[str] = None

class UserResponse(BaseModel):
    id: int
    full_name: str
    email: str
    phone: Optional[str]
    role: str
    is_active: bool
    blood_group: Optional[str]
    date_of_birth: Optional[str]
    gender: Optional[str]
    address: Optional[str]
    allergies: Optional[str]
    medical_conditions: Optional[str]
    emergency_contact_name: Optional[str]
    emergency_contact_phone: Optional[str]
    preferred_language: str
    created_at: Optional[datetime]

    class Config:
        from_attributes = True


# ─── Symptom Schemas ──────────────────────────────────────────────────────────

class SymptomCheckRequest(BaseModel):
    symptoms: List[str]
    language: Optional[str] = "en"

class SymptomCheckResponse(BaseModel):
    predicted_disease: str
    confidence_score: float
    severity: str
    specialist: str
    precautions: List[str]
    description: str
    disclaimer: str


# ─── Family Member Schemas ────────────────────────────────────────────────────

class FamilyMemberCreate(BaseModel):
    name: str
    age: Optional[int] = None
    gender: Optional[str] = None
    blood_group: Optional[str] = None
    relation: Optional[str] = None
    medical_history: Optional[str] = None
    allergies: Optional[str] = None
    current_medicines: Optional[str] = None
    emergency_contact: Optional[str] = None
    emergency_phone: Optional[str] = None
    insurance_provider: Optional[str] = None
    insurance_number: Optional[str] = None

class FamilyMemberUpdate(FamilyMemberCreate):
    pass

class FamilyMemberResponse(FamilyMemberCreate):
    id: int
    user_id: int
    created_at: Optional[datetime]

    class Config:
        from_attributes = True


# ─── Appointment Schemas ──────────────────────────────────────────────────────

class AppointmentCreate(BaseModel):
    patient_name: str
    patient_age: Optional[int] = None
    patient_gender: Optional[str] = None
    symptoms: Optional[str] = None
    preferred_date: Optional[str] = None
    preferred_time: Optional[str] = None
    location: Optional[str] = None
    hospital_name: Optional[str] = None
    doctor_specialty: Optional[str] = None
    notes: Optional[str] = None

class AppointmentResponse(AppointmentCreate):
    id: int
    user_id: int
    status: str
    created_at: Optional[datetime]

    class Config:
        from_attributes = True


# ─── Medicine Reminder Schemas ────────────────────────────────────────────────

class MedicineReminderCreate(BaseModel):
    medicine_name: str
    dosage: Optional[str] = None
    frequency: Optional[str] = None
    reminder_times: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    instructions: Optional[str] = None
    is_active: Optional[bool] = True

class MedicineReminderResponse(MedicineReminderCreate):
    id: int
    user_id: int
    created_at: Optional[datetime]

    class Config:
        from_attributes = True


# ─── SOS Schemas ──────────────────────────────────────────────────────────────

class SOSCreate(BaseModel):
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    address: Optional[str] = None
    blood_group: Optional[str] = None
    allergies: Optional[str] = None
    medical_conditions: Optional[str] = None

class SOSResponse(SOSCreate):
    id: int
    user_id: int
    status: str
    emergency_contact_notified: bool
    created_at: Optional[datetime]

    class Config:
        from_attributes = True


# ─── Hospital Schemas ─────────────────────────────────────────────────────────

class HospitalSearchRequest(BaseModel):
    latitude: float
    longitude: float
    radius: Optional[int] = 5000    # meters


# ─── Chatbot Schemas ──────────────────────────────────────────────────────────

class ChatMessage(BaseModel):
    message: str
    language: Optional[str] = "en"
    session_id: Optional[str] = None
    context: Optional[dict] = None

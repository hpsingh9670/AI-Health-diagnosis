"""
MediAI - AI Healthcare & Emergency Assistance Platform
FastAPI Backend Application

Run with: uvicorn main:app --reload --port 8000
API Docs: http://localhost:8000/docs
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers import auth, users, symptoms, hospitals, family, appointments, sos, medicines, chatbot, health_tips, admin
import os

# ─── Create all tables ────────────────────────────────────────────────────────
Base.metadata.create_all(bind=engine)

# ─── FastAPI App ──────────────────────────────────────────────────────────────
app = FastAPI(
    title="MediAI API",
    description="AI-powered healthcare and emergency assistance platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ─── CORS ─────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://127.0.0.1:5175",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Register Routers ─────────────────────────────────────────────────────────
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(symptoms.router)
app.include_router(hospitals.router)
app.include_router(family.router)
app.include_router(appointments.router)
app.include_router(sos.router)
app.include_router(medicines.router)
app.include_router(chatbot.router)
app.include_router(health_tips.router)
app.include_router(admin.router)


@app.get("/")
def root():
    """API health check endpoint."""
    return {
        "app": "MediAI",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
        "message": "AI-powered healthcare & emergency assistance platform",
    }


@app.get("/health")
def health_check():
    """Detailed health check."""
    from services.ml_service import _model
    return {
        "status": "healthy",
        "database": "connected",
        "ml_model": "loaded" if _model is not None else "rule-based fallback",
    }


# ─── Startup Event ────────────────────────────────────────────────────────────
@app.on_event("startup")
async def startup_event():
    """On startup: ensure DB tables exist and ML model is loaded."""
    print("[MediAI] Backend Starting...")
    print("[INFO] Database tables initialized")

    from services.ml_service import _model
    if _model is not None:
        print("[INFO] ML Model loaded successfully")
    else:
        print("[WARNING] ML Model not found -- using rule-based fallback")
        print("   Run: python ml/train_model.py to train and save the model")

    print("[READY] MediAI API is ready!")
    print("[INFO] API Docs: http://localhost:8000/docs")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

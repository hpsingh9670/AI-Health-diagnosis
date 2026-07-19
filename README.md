# Arin Verma 
# IBM Batch 5
# 🏥 MediAI – AI Healthcare & Emergency Assistance Platform

<div align="center">

![MediAI Banner](https://img.shields.io/badge/MediAI-Healthcare%20AI-1a6bdb?style=for-the-badge&logo=heart&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.14-3776AB?style=flat-square&logo=python)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=flat-square&logo=fastapi)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)
![scikit-learn](https://img.shields.io/badge/scikit--learn-1.5-F7931E?style=flat-square&logo=scikit-learn)
![SQLite](https://img.shields.io/badge/SQLite-3-003B57?style=flat-square&logo=sqlite)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

**A modern, production-ready AI-powered healthcare web application with bilingual support (English & हिन्दी)**

</div>

---

## ✨ Features

| Feature | Description |
|---|---|
| 🩺 **AI Symptom Checker** | Enter symptoms in English or Hindi — ML model predicts diseases with confidence score |
| 🏥 **Hospital Finder** | Real-time nearby hospital search via OpenStreetMap + Leaflet.js |
| 📅 **AI Appointment Booking** | 4-step AI-guided appointment wizard with specialist recommendations |
| 🚨 **Emergency SOS** | One-tap SOS with GPS location capture and emergency helpline shortcuts |
| 👨‍👩‍👧 **Family Health Records** | Manage health records for all family members |
| 🤖 **AI Chatbot** | Bilingual rule-based chatbot for healthcare guidance |
| 💊 **Medicine Reminders** | Browser notification-based medicine reminder system |
| 💡 **Health Tips** | Category-filtered personalized health recommendations |
| 👑 **Admin Dashboard** | Charts, user management, appointment & SOS monitoring |
| 🌗 **Dark/Light Mode** | Full dark mode support with persistent preference |
| 🇮🇳 **Bilingual (EN/HI)** | All pages support English and Hindi |

---

## 🧠 ML Model Performance

| Metric | Value |
|---|---|
| Algorithm | Random Forest Classifier (200 trees) |
| Diseases Covered | **41 conditions** |
| Test Accuracy | **91.8%** |
| Training Samples | 3,936 |


---

## 🛠 Tech Stack

### Backend
- **FastAPI** — High-performance Python web framework
- **SQLAlchemy** — ORM with SQLite (dev) / MySQL (prod)
- **scikit-learn** — Random Forest ML model for disease prediction
- **JWT (python-jose)** — Secure authentication
- **bcrypt** — Password hashing
- **Overpass API** — Real-time hospital data from OpenStreetMap

### Frontend
- **React 19 + Vite** — Fast modern frontend
- **React Router v7** — Client-side routing
- **Leaflet.js + React-Leaflet** — Interactive maps
- **Chart.js** — Admin dashboard charts
- **Lucide React** — Icon system
- **React Hot Toast** — Notifications
- **Axios** — HTTP client with JWT interceptors
- **Vanilla CSS** — Custom design system with CSS variables

---

## 🚀 Getting Started

### Prerequisites
- Python 3.10+ (tested on 3.14)
- Node.js 18+
- npm or yarn

### 1. Clone the Repository
```bash
git clone https://github.com/arinverma75/AI-Powered-Healthcare-Diagnosis-Assistant.git
cd AI-Powered-Healthcare-Diagnosis-Assistant
```

### 2. Backend Setup
```bash
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Train the ML model (required for symptom checker)
python ml/train_model.py

# Start the FastAPI server
python -m uvicorn main:app --reload --port 8000
```

Backend runs at: **http://localhost:8000**  
API Docs: **http://localhost:8000/docs**

### 3. Frontend Setup
```bash
cd frontend

# Install Node dependencies
npm install

# Start the React dev server
npm run dev
```

Frontend runs at: **http://localhost:5173**

---

## 📁 Project Structure

```
AI-Powered-Healthcare-Diagnosis-Assistant/
├── backend/
│   ├── main.py                  # FastAPI app entry point
│   ├── auth.py                  # JWT auth + bcrypt hashing
│   ├── database.py              # SQLite/SQLAlchemy config
│   ├── requirements.txt
│   ├── models/
│   │   └── models.py            # SQLAlchemy ORM models
│   ├── schemas/
│   │   └── schemas.py           # Pydantic schemas
│   ├── routers/
│   │   ├── auth.py              # Register / Login
│   │   ├── users.py             # Profile management
│   │   ├── symptoms.py          # AI prediction endpoint
│   │   ├── hospitals.py         # Hospital finder
│   │   ├── appointments.py      # Booking system
│   │   ├── sos.py               # Emergency SOS
│   │   ├── family.py            # Family records
│   │   ├── medicines.py         # Medicine reminders
│   │   ├── chatbot.py           # Rule-based chatbot
│   │   ├── health_tips.py       # Health tips
│   │   └── admin.py             # Admin endpoints
│   ├── services/
│   │   └── ml_service.py        # ML inference service
│   └── ml/
│       └── train_model.py       # Model training script
│
├── frontend/
│   ├── index.html
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx              # Router + Providers
│   │   ├── index.css            # Global design system
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   ├── ThemeContext.jsx
│   │   │   └── LanguageContext.jsx
│   │   ├── components/
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── AppLayout.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── pages/
│   │   │   ├── AuthPages.jsx         # Login / Register / ForgotPassword
│   │   │   ├── Dashboard.jsx
│   │   │   ├── SymptomChecker.jsx
│   │   │   ├── HospitalFinder.jsx
│   │   │   ├── AppointmentBooking.jsx
│   │   │   ├── EmergencySOS.jsx
│   │   │   ├── FamilyRecords.jsx
│   │   │   ├── Chatbot.jsx
│   │   │   ├── MedicineReminder.jsx
│   │   │   ├── HealthTips.jsx
│   │   │   ├── Profile.jsx
│   │   │   └── AdminDashboard.jsx
│   │   └── services/
│   │       └── api.js               # Axios API client
│   └── package.json
│
└── README.md
```

---

## 🔐 Environment Variables (Optional)

Create `backend/.env` to override defaults:

```env
SECRET_KEY=your-super-secret-jwt-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080
DATABASE_URL=sqlite:///./mediai.db
```

---

## 📱 Screenshots

<img width="1914" height="1029" alt="Image" src="https://github.com/user-attachments/assets/97ad8b79-0898-4c70-8105-cce4cbb87b3a" />
<img width="1920" height="1080" alt="Image" src="https://github.com/user-attachments/assets/76063223-dcb0-4a19-b4a4-28e98ffc3725" />
<img width="1920" height="1080" alt="Image" src="https://github.com/user-attachments/assets/9fb8a260-4ec9-4aac-b339-edc5242aa962" />
<img width="1920" height="1080" alt="Image" src="https://github.com/user-attachments/assets/04bd154c-8ce0-49ca-b023-099b22245b9f" />
<img width="1920" height="1080" alt="Image" src="https://github.com/user-attachments/assets/15f6725f-d59f-499d-b4b5-be70b73c24f4" />
<img width="1920" height="1080" alt="Image" src="https://github.com/user-attachments/assets/6bb54a2a-4477-4798-93a7-bac761edcb1f" />

---

## ⚠️ Disclaimer

> MediAI is an educational/demo project. The AI symptom checker is **NOT** a medical diagnostic tool. Always consult a qualified healthcare professional for medical advice.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Arin Verma** — [@arinverma75](https://github.com/arinverma75)

---

<div align="center">
</div>

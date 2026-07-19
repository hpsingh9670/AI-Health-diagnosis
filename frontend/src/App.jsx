import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { ProtectedRoute, AdminRoute, GuestRoute } from './components/ProtectedRoute';
import AppLayout from './components/AppLayout';

// Auth pages
import { Login, Register, ForgotPassword } from './pages/AuthPages';

// App pages
import Dashboard from './pages/Dashboard';
import SymptomChecker from './pages/SymptomChecker';
import HospitalFinder from './pages/HospitalFinder';
import AppointmentBooking from './pages/AppointmentBooking';
import EmergencySOS from './pages/EmergencySOS';
import FamilyRecords from './pages/FamilyRecords';
import Chatbot from './pages/Chatbot';
import MedicineReminder from './pages/MedicineReminder';
import HealthTips from './pages/HealthTips';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
              <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
              <Route path="/forgot-password" element={<GuestRoute><ForgotPassword /></GuestRoute>} />

              {/* Protected app routes */}
              <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/symptoms" element={<SymptomChecker />} />
                <Route path="/hospitals" element={<HospitalFinder />} />
                <Route path="/appointments" element={<AppointmentBooking />} />
                <Route path="/sos" element={<EmergencySOS />} />
                <Route path="/family" element={<FamilyRecords />} />
                <Route path="/chatbot" element={<Chatbot />} />
                <Route path="/medicines" element={<MedicineReminder />} />
                <Route path="/health-tips" element={<HealthTips />} />
                <Route path="/profile" element={<Profile />} />

                {/* Admin-only route */}
                <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
              </Route>

              {/* Default redirect */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>

            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  background: 'var(--bg-card)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border)',
                  borderRadius: '10px',
                  fontSize: '13px',
                },
                success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
                error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
              }}
            />
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

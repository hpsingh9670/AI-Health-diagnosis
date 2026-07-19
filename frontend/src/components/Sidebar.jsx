import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Activity, MapPin, Calendar, AlertTriangle,
  Users, Bot, Pill, Heart, UserCircle, LogOut, Shield, X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const NAV = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', hi: 'डैशबोर्ड' },
  { to: '/symptoms', icon: Activity, label: 'Symptom Checker', hi: 'लक्षण जांचक' },
  { to: '/hospitals', icon: MapPin, label: 'Hospital Finder', hi: 'अस्पताल खोजक' },
  { to: '/appointments', icon: Calendar, label: 'Appointments', hi: 'अपॉइंटमेंट' },
  { to: '/sos', icon: AlertTriangle, label: 'Emergency SOS', hi: 'आपातकाल SOS' },
  { to: '/family', icon: Users, label: 'Family Records', hi: 'पारिवारिक रिकॉर्ड' },
  { to: '/chatbot', icon: Bot, label: 'AI Chatbot', hi: 'AI चैटबोट' },
  { to: '/medicines', icon: Pill, label: 'Medicines', hi: 'दवाइयाँ' },
  { to: '/health-tips', icon: Heart, label: 'Health Tips', hi: 'स्वास्थ्य सुझाव' },
  { to: '/profile', icon: UserCircle, label: 'Profile', hi: 'प्रोफ़ाइल' },
];

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="modal-overlay"
          style={{ zIndex: 99 }}
          onClick={onClose}
        />
      )}

      <aside className={`sidebar ${open ? 'open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">🏥</div>
          <div className="sidebar-logo-text">Medi<span>AI</span></div>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-icon"
            style={{ marginLeft: 'auto', color: 'rgba(255,255,255,0.5)', display: 'none' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* User info */}
        {user && (
          <div style={{ padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="flex items-center gap-2">
              <div className="avatar" style={{ width: 32, height: 32, fontSize: 12 }}>
                {user.full_name?.charAt(0).toUpperCase()}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ color: '#fff', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user.full_name}
                </div>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>
                  {user.role === 'admin' ? '👑 Admin' : '👤 Patient'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main navigation */}
        <div className="sidebar-section-title">{t('MAIN MENU', 'मुख्य मेनू')}</div>
        <nav className="sidebar-nav">
          {NAV.map(({ to, icon: Icon, label, hi }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <Icon className="icon" />
              <span>{t(label, hi)}</span>
            </NavLink>
          ))}

          {/* Admin link */}
          {user?.role === 'admin' && (
            <>
              <div className="sidebar-section-title" style={{ marginTop: 8 }}>{t('ADMIN', 'एडमिन')}</div>
              <NavLink
                to="/admin"
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                onClick={onClose}
              >
                <Shield className="icon" />
                <span>{t('Admin Panel', 'एडमिन पैनल')}</span>
              </NavLink>
            </>
          )}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <button className="sidebar-link" style={{ width: '100%', background: 'none', border: 'none' }} onClick={handleLogout}>
            <LogOut size={16} />
            <span>{t('Logout', 'लॉगआउट')}</span>
          </button>
        </div>
      </aside>
    </>
  );
}

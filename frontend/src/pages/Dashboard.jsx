import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Activity, MapPin, Calendar, AlertTriangle, Users, Bot, Pill, Heart, UserCircle, TrendingUp } from 'lucide-react';

const FEATURES = [
  { to: '/symptoms', icon: '🩺', label: 'Symptom Checker', hi: 'लक्षण जांचक', desc: 'AI disease prediction', color: '#1a6bdb', bg: 'rgba(26,107,219,0.1)' },
  { to: '/hospitals', icon: '🏥', label: 'Hospital Finder', hi: 'अस्पताल खोजक', desc: 'Find nearby hospitals', color: '#06b6d4', bg: 'rgba(6,182,212,0.1)' },
  { to: '/appointments', icon: '📅', label: 'Appointments', hi: 'अपॉइंटमेंट', desc: 'AI booking assistant', color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
  { to: '/sos', icon: '🚨', label: 'Emergency SOS', hi: 'आपातकाल SOS', desc: 'Quick emergency alert', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
  { to: '/family', icon: '👨‍👩‍👧', label: 'Family Records', hi: 'पारिवारिक रिकॉर्ड', desc: 'Manage health records', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  { to: '/chatbot', icon: '🤖', label: 'AI Chatbot', hi: 'AI चैटबोट', desc: 'Healthcare assistant', color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
  { to: '/medicines', icon: '💊', label: 'Medicine Reminder', hi: 'दवाई रिमाइंडर', desc: 'Never miss a dose', color: '#f97316', bg: 'rgba(249,115,22,0.1)' },
  { to: '/health-tips', icon: '💡', label: 'Health Tips', hi: 'स्वास्थ्य सुझाव', desc: 'Personalized advice', color: '#06b6d4', bg: 'rgba(6,182,212,0.1)' },
  { to: '/profile', icon: '⚙️', label: 'Profile Settings', hi: 'प्रोफ़ाइल सेटिंग्स', desc: 'Manage your account', color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
];

const STATS = [
  { icon: '🩺', label: 'Symptoms Checked', value: '42', color: '#1a6bdb', bg: 'rgba(26,107,219,0.1)' },
  { icon: '📅', label: 'Appointments', value: '3', color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
  { icon: '💊', label: 'Active Medicines', value: '2', color: '#f97316', bg: 'rgba(249,115,22,0.1)' },
  { icon: '👨‍👩‍👧', label: 'Family Members', value: '4', color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return t('Good Morning', 'शुभ प्रभात');
    if (h < 17) return t('Good Afternoon', 'शुभ दोपहर');
    return t('Good Evening', 'शुभ संध्या');
  };

  return (
    <div className="fade-in">
      {/* Welcome banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0f2557 0%, #1a6bdb 60%, #06b6d4 100%)',
        borderRadius: 'var(--radius-xl)',
        padding: '28px 32px',
        marginBottom: 24,
        position: 'relative',
        overflow: 'hidden',
        color: '#fff',
      }}>
        <div style={{
          position: 'absolute', right: -40, top: -40,
          width: 200, height: 200, borderRadius: '50%',
          background: 'rgba(255,255,255,0.06)'
        }} />
        <div style={{
          position: 'absolute', right: 60, bottom: -60,
          width: 150, height: 150, borderRadius: '50%',
          background: 'rgba(255,255,255,0.04)'
        }} />
        <div style={{ position: 'relative' }}>
          <div style={{ fontSize: 13, opacity: 0.75, marginBottom: 6 }}>{greeting()},</div>
          <h1 style={{ color: '#fff', fontSize: '1.6rem', fontWeight: 800, marginBottom: 8 }}>
            {user?.full_name?.split(' ')[0] || 'Patient'} 👋
          </h1>
          <p style={{ opacity: 0.8, fontSize: 14, maxWidth: 400 }}>
            {t(
              'Welcome to your AI-powered healthcare dashboard. How are you feeling today?',
              'आपके AI-संचालित स्वास्थ्य डैशबोर्ड में आपका स्वागत है। आज आप कैसा महसूस कर रहे हैं?'
            )}
          </p>
          <div style={{ marginTop: 16, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button
              className="btn"
              style={{ background: '#fff', color: 'var(--primary)', fontSize: 13 }}
              onClick={() => navigate('/symptoms')}
            >
              🩺 {t('Check Symptoms', 'लक्षण जांचें')}
            </button>
            <button
              className="btn"
              style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', fontSize: 13 }}
              onClick={() => navigate('/sos')}
            >
              🚨 {t('Emergency SOS', 'आपातकाल SOS')}
            </button>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="stat-grid" style={{ marginBottom: 24 }}>
        {STATS.map((s, i) => (
          <div key={i} className="stat-card">
            <div className="stat-icon" style={{ background: s.bg, color: s.color }}>
              {s.icon}
            </div>
            <div>
              <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
              <div className="stat-label">{t(s.label)}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Feature cards */}
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16 }}>
          {t('Quick Access', 'त्वरित पहुँच')}
        </h2>
        <div className="feature-grid">
          {FEATURES.map((f) => (
            <div
              key={f.to}
              className="feature-card"
              onClick={() => navigate(f.to)}
              role="button"
              tabIndex={0}
            >
              <div className="feature-card-icon" style={{ background: f.bg, color: f.color }}>
                {f.icon}
              </div>
              <div className="feature-card-title">{t(f.label, f.hi)}</div>
              <div className="feature-card-desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Health tip of the day */}
      <div className="card" style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(6,182,212,0.08))', borderColor: 'rgba(16,185,129,0.2)' }}>
        <div className="flex items-center gap-3 mb-2">
          <span style={{ fontSize: 24 }}>💡</span>
          <h3 style={{ margin: 0 }}>{t('Health Tip of the Day', 'आज का स्वास्थ्य सुझाव')}</h3>
        </div>
        <p style={{ margin: 0 }}>
          {t(
            'Stay hydrated! Drinking 8-10 glasses of water daily helps boost energy, maintain kidney health, and improve digestion.',
            'हाइड्रेटेड रहें! रोज 8-10 गिलास पानी पीने से ऊर्जा बढ़ती है, गुर्दे स्वस्थ रहते हैं और पाचन बेहतर होता है।'
          )}
        </p>
      </div>
    </div>
  );
}

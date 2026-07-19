import { useState, useEffect } from 'react';
import { usersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';
import { UserCircle, Save, Moon, Sun, Globe } from 'lucide-react';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const { t, language, changeLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');

  useEffect(() => {
    if (user) setForm({
      full_name: user.full_name || '',
      phone: user.phone || '',
      gender: user.gender || '',
      date_of_birth: user.date_of_birth || '',
      blood_group: user.blood_group || '',
      address: user.address || '',
      allergies: user.allergies || '',
      medical_conditions: user.medical_conditions || '',
      emergency_contact_name: user.emergency_contact_name || '',
      emergency_contact_phone: user.emergency_contact_phone || '',
      preferred_language: user.preferred_language || 'en',
    });
  }, [user]);

  const set = k => e => setForm({ ...form, [k]: e.target.value });

  const handleSave = async () => {
    setLoading(true);
    try {
      const { data } = await usersAPI.updateMe(form);
      updateUser(data);
      toast.success(t('Profile updated successfully!', 'प्रोफ़ाइल सफलतापूर्वक अपडेट हुई!'));
    } catch {
      toast.error(t('Failed to update profile', 'प्रोफ़ाइल अपडेट विफल'));
    } finally { setLoading(false); }
  };

  const tabs = [
    { id: 'personal', label: t('Personal Info', 'व्यक्तिगत जानकारी'), icon: '👤' },
    { id: 'medical', label: t('Medical Info', 'चिकित्सा जानकारी'), icon: '🩺' },
    { id: 'emergency', label: t('Emergency', 'आपातकाल'), icon: '🚨' },
    { id: 'settings', label: t('Settings', 'सेटिंग्स'), icon: '⚙️' },
  ];

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-header-icon" style={{ background: 'rgba(99,102,241,0.1)', color: '#6366f1' }}>
          <UserCircle size={22} />
        </div>
        <div>
          <h1 className="page-title">{t('My Profile', 'मेरी प्रोफ़ाइल')}</h1>
          <p className="page-subtitle">{user?.email}</p>
        </div>
        <button className="btn btn-primary" style={{ marginLeft: 'auto' }} onClick={handleSave} disabled={loading}>
          {loading ? t('Saving...', 'सहेजा जा रहा है...') : <><Save size={16} /> {t('Save Changes', 'परिवर्तन सहेजें')}</>}
        </button>
      </div>

      {/* Profile header card */}
      <div className="card" style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 20, padding: '20px 24px' }}>
        <div className="avatar" style={{ width: 72, height: 72, fontSize: 28, background: 'linear-gradient(135deg, #1a6bdb, #06b6d4)' }}>
          {user?.full_name?.charAt(0).toUpperCase()}
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.2rem' }}>{user?.full_name}</h2>
          <div style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>{user?.email}</div>
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            {user?.blood_group && <span className="badge badge-danger">🩸 {user.blood_group}</span>}
            {user?.gender && <span className="badge badge-info">{user.gender}</span>}
            <span className={`badge ${user?.role === 'admin' ? 'badge-warning' : 'badge-success'}`}>
              {user?.role === 'admin' ? '👑 Admin' : '✓ Verified'}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: 'var(--bg-card)', padding: 4, borderRadius: 'var(--radius)', border: '1px solid var(--border)', width: 'fit-content' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="btn"
            style={{
              padding: '8px 16px', fontSize: 13,
              background: activeTab === tab.id ? 'var(--primary)' : 'transparent',
              color: activeTab === tab.id ? '#fff' : 'var(--text-secondary)',
              border: 'none',
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="card">
        {activeTab === 'personal' && (
          <div className="slide-up">
            <div className="form-row">
              <div className="form-group">
                <label>{t('Full Name', 'पूरा नाम')}</label>
                <input className="form-input" value={form.full_name || ''} onChange={set('full_name')} />
              </div>
              <div className="form-group">
                <label>{t('Phone', 'फ़ोन')}</label>
                <input className="form-input" value={form.phone || ''} onChange={set('phone')} placeholder="+91 99999 99999" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>{t('Gender', 'लिंग')}</label>
                <select className="form-select" value={form.gender || ''} onChange={set('gender')}>
                  <option value="">Select</option>
                  <option>Male</option><option>Female</option><option>Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>{t('Date of Birth', 'जन्म तिथि')}</label>
                <input className="form-input" type="date" value={form.date_of_birth || ''} onChange={set('date_of_birth')} />
              </div>
            </div>
            <div className="form-group">
              <label>{t('Address', 'पता')}</label>
              <textarea className="form-textarea" value={form.address || ''} onChange={set('address')} placeholder="Your full address..." />
            </div>
          </div>
        )}

        {activeTab === 'medical' && (
          <div className="slide-up">
            <div className="form-group">
              <label>{t('Blood Group', 'रक्त समूह')}</label>
              <select className="form-select" value={form.blood_group || ''} onChange={set('blood_group')}>
                <option value="">Select</option>
                {['A+','A-','B+','B-','O+','O-','AB+','AB-'].map(b => <option key={b}>{b}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>{t('Known Allergies', 'ज्ञात एलर्जी')}</label>
              <textarea className="form-textarea" value={form.allergies || ''} onChange={set('allergies')} placeholder="e.g., Penicillin, Peanuts, Dust..." />
            </div>
            <div className="form-group">
              <label>{t('Medical Conditions', 'चिकित्सा स्थितियाँ')}</label>
              <textarea className="form-textarea" value={form.medical_conditions || ''} onChange={set('medical_conditions')} placeholder="e.g., Diabetes, Hypertension, Asthma..." />
            </div>
          </div>
        )}

        {activeTab === 'emergency' && (
          <div className="slide-up">
            <div className="alert alert-warning" style={{ marginBottom: 20 }}>
              <span>🚨</span>
              <div>{t('This information will be shared in case of Emergency SOS alerts.', 'यह जानकारी आपातकालीन SOS अलर्ट में साझा की जाएगी।')}</div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>{t('Emergency Contact Name', 'आपातकालीन संपर्क नाम')}</label>
                <input className="form-input" value={form.emergency_contact_name || ''} onChange={set('emergency_contact_name')} placeholder="Contact person name" />
              </div>
              <div className="form-group">
                <label>{t('Emergency Contact Phone', 'आपातकालीन संपर्क फ़ोन')}</label>
                <input className="form-input" value={form.emergency_contact_phone || ''} onChange={set('emergency_contact_phone')} placeholder="+91 99999 99999" />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="slide-up">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Theme */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '16px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)'
              }}>
                <div style={{ display: 'flex', gap: 10 }}>
                  {theme === 'dark' ? <Moon size={18} color="var(--secondary)" /> : <Sun size={18} color="var(--accent-warn)" />}
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{theme === 'dark' ? t('Dark Mode', 'डार्क मोड') : t('Light Mode', 'लाइट मोड')}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t('Toggle interface theme', 'इंटरफ़ेस थीम बदलें')}</div>
                  </div>
                </div>
                <label className="toggle">
                  <input type="checkbox" checked={theme === 'dark'} onChange={toggleTheme} />
                  <span className="toggle-slider" />
                </label>
              </div>

              {/* Language */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '16px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)'
              }}>
                <div style={{ display: 'flex', gap: 10 }}>
                  <Globe size={18} color="var(--primary)" />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{t('Language', 'भाषा')}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {language === 'en' ? '🇺🇸 English' : '🇮🇳 हिन्दी'}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {['en', 'hi'].map(lang => (
                    <button
                      key={lang}
                      className={`btn ${language === lang ? 'btn-primary' : 'btn-ghost'}`}
                      style={{ fontSize: 12, padding: '5px 14px' }}
                      onClick={() => changeLanguage(lang)}
                    >
                      {lang === 'en' ? 'English' : 'हिन्दी'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

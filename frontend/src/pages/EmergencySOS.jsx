import { useState, useEffect } from 'react';
import { sosAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import toast from 'react-hot-toast';
import { AlertTriangle, CheckCircle, X, Phone, MapPin } from 'lucide-react';

export default function EmergencySOS() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [active, setActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sosData, setSosData] = useState(null);
  const [location, setLocation] = useState(null);
  const [step, setStep] = useState('idle'); // idle | locating | sending | active | resolved

  const triggerSOS = async () => {
    if (loading) return;
    setStep('locating');
    setLoading(true);

    try {
      // Get GPS location
      let lat = null, lon = null, address = 'Location not available';

      await new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
          (pos) => { lat = pos.coords.latitude; lon = pos.coords.longitude; resolve(); },
          () => { lat = 28.6139; lon = 77.209; resolve(); },
          { timeout: 8000 }
        );
      });

      setStep('sending');

      // Send SOS to backend
      const { data } = await sosAPI.trigger({
        latitude: lat,
        longitude: lon,
        address: `${lat?.toFixed(4)}, ${lon?.toFixed(4)}`,
        blood_group: user?.blood_group,
        allergies: user?.allergies,
        medical_conditions: user?.medical_conditions,
      });

      setSosData(data);
      setLocation({ lat, lon });
      setActive(true);
      setStep('active');

      // Browser notification
      if (Notification.permission === 'granted') {
        new Notification('🚨 SOS Alert Sent!', {
          body: 'Emergency services have been notified. Help is on the way.',
          icon: '/favicon.ico'
        });
      }

      toast.success('Emergency SOS sent! Help is on the way.');

      // Request notification permission
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    } catch (err) {
      toast.error('Failed to send SOS. Please call 112 directly!');
      setStep('idle');
    } finally {
      setLoading(false);
    }
  };

  const cancelSOS = async () => {
    if (sosData?.id) {
      try { await sosAPI.resolve(sosData.id); } catch {}
    }
    setActive(false);
    setSosData(null);
    setStep('idle');
    toast.success('SOS cancelled');
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-header-icon" style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--danger)' }}>
          <AlertTriangle size={22} />
        </div>
        <div>
          <h1 className="page-title">{t('Emergency SOS', 'आपातकालीन SOS')}</h1>
          <p className="page-subtitle">{t('Press the SOS button for immediate emergency assistance', 'तत्काल आपातकालीन सहायता के लिए SOS बटन दबाएं')}</p>
        </div>
      </div>

      {/* Main SOS section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* SOS Button */}
        <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          {step === 'active' ? (
            <div className="slide-up">
              <div style={{
                width: 120, height: 120, borderRadius: '50%',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 24px',
                boxShadow: '0 0 0 20px rgba(16,185,129,0.1), 0 10px 40px rgba(16,185,129,0.3)',
                animation: 'sos-pulse 2s infinite',
                fontSize: '3rem'
              }}>
                🚨
              </div>
              <h2 style={{ color: 'var(--accent)', marginBottom: 8 }}>
                {t('SOS Alert Active!', 'SOS अलर्ट सक्रिय!')}
              </h2>
              <p style={{ marginBottom: 24 }}>
                {t('Help has been requested. Emergency services have been notified.', 'मदद मांगी गई है। आपातकालीन सेवाओं को सूचित किया गया है।')}
              </p>
              {location && (
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  gap: 6, fontSize: 13, color: 'var(--text-muted)', marginBottom: 20
                }}>
                  <MapPin size={14} />
                  {location.lat.toFixed(4)}, {location.lon.toFixed(4)}
                </div>
              )}
              <button className="btn btn-secondary" onClick={cancelSOS}>
                <X size={16} /> {t('Cancel SOS', 'SOS रद्द करें')}
              </button>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>
                  {step === 'locating' && '📍 ' + t('Getting your location...', 'आपका स्थान प्राप्त हो रहा है...')}
                  {step === 'sending' && '📡 ' + t('Sending SOS alert...', 'SOS अलर्ट भेजा जा रहा है...')}
                  {step === 'idle' && t('Press for emergency help', 'आपातकालीन सहायता के लिए दबाएं')}
                </div>
              </div>

              <button
                className={`sos-btn ${loading ? 'active' : ''}`}
                onClick={triggerSOS}
                disabled={loading}
                id="sos-btn"
                style={{ margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 4 }}
              >
                <span>SOS</span>
                <span style={{ fontSize: '0.8rem', fontWeight: 400, opacity: 0.85 }}>HELP</span>
              </button>

              <p style={{ marginTop: 24, fontSize: 12, color: 'var(--text-muted)', maxWidth: 240, margin: '24px auto 0' }}>
                {t('Pressing SOS will share your location and medical info with emergency services', 'SOS दबाने पर आपका स्थान और चिकित्सा जानकारी आपातकालीन सेवाओं को साझा की जाएगी')}
              </p>
            </>
          )}
        </div>

        {/* Emergency info */}
        <div>
          {/* User emergency info */}
          <div className="card" style={{ marginBottom: 16 }}>
            <h3 style={{ marginBottom: 16, fontSize: '0.95rem' }}>
              {t('Your Emergency Info', 'आपकी आपातकालीन जानकारी')}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: t('Name', 'नाम'), value: user?.full_name },
                { label: t('Blood Group', 'रक्त समूह'), value: user?.blood_group || 'Not set' },
                { label: t('Allergies', 'एलर्जी'), value: user?.allergies || 'None' },
                { label: t('Conditions', 'स्थितियाँ'), value: user?.medical_conditions || 'None' },
                { label: t('Emergency Contact', 'आपातकालीन संपर्क'), value: user?.emergency_contact_name ? `${user.emergency_contact_name} · ${user.emergency_contact_phone}` : 'Not set' },
              ].map(({ label, value }) => (
                <div key={label} style={{
                  display: 'flex', justifyContent: 'space-between',
                  padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: 13
                }}>
                  <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>{label}</span>
                  <span style={{ fontWeight: 600 }}>{value}</span>
                </div>
              ))}
            </div>
            <a href="/profile" style={{ color: 'var(--primary)', fontSize: 12, display: 'block', marginTop: 12 }}>
              ✏️ {t('Update emergency info in Profile', 'प्रोफ़ाइल में आपातकालीन जानकारी अपडेट करें')}
            </a>
          </div>

          {/* Emergency numbers */}
          <div className="card">
            <h3 style={{ marginBottom: 16, fontSize: '0.95rem' }}>
              📞 {t('Emergency Helplines', 'आपातकालीन हेल्पलाइन')}
            </h3>
            {[
              { num: '112', label: 'National Emergency', color: '#ef4444' },
              { num: '108', label: 'Ambulance Service', color: '#10b981' },
              { num: '102', label: 'Women Helpline', color: '#8b5cf6' },
              { num: '1800-180-1104', label: 'Health Helpline', color: '#1a6bdb' },
            ].map(e => (
              <a key={e.num} href={`tel:${e.num}`} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 14px', background: `rgba(${e.color === '#ef4444' ? '239,68,68' : e.color === '#10b981' ? '16,185,129' : e.color === '#8b5cf6' ? '139,92,246' : '26,107,219'},0.06)`,
                borderRadius: 'var(--radius-sm)', marginBottom: 8,
                border: `1px solid ${e.color}22`, textDecoration: 'none'
              }}>
                <Phone size={16} style={{ color: e.color }} />
                <div>
                  <div style={{ fontWeight: 700, color: e.color }}>{e.num}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{e.label}</div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

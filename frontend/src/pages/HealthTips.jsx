import { useState, useEffect } from 'react';
import { healthTipsAPI } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import toast from 'react-hot-toast';
import { Heart, RefreshCw } from 'lucide-react';

export default function HealthTips() {
  const { t } = useLanguage();
  const [tips, setTips] = useState([]);
  const [seasonal, setSeasonal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(null);

  useEffect(() => { load(); }, []);

  const load = async (category = null) => {
    setLoading(true);
    try {
      const { data } = await healthTipsAPI.list(category);
      setTips(data.tips);
      setSeasonal(data.seasonal);
    } catch { toast.error('Failed to load health tips'); }
    finally { setLoading(false); }
  };

  const CATEGORIES = [
    { key: null, label: 'All', hi: 'सभी', icon: '🌟' },
    { key: 'general', label: 'General', hi: 'सामान्य', icon: '💊' },
    { key: 'nutrition', label: 'Nutrition', hi: 'पोषण', icon: '🥗' },
    { key: 'fitness', label: 'Fitness', hi: 'फिटनेस', icon: '🏃' },
    { key: 'mental-health', label: 'Mental Health', hi: 'मानसिक स्वास्थ्य', icon: '🧠' },
    { key: 'prevention', label: 'Prevention', hi: 'रोकथाम', icon: '🛡️' },
    { key: 'chronic', label: 'Chronic Disease', hi: 'पुरानी बीमारी', icon: '❤️' },
  ];

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-header-icon" style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--accent)' }}>
          <Heart size={22} />
        </div>
        <div>
          <h1 className="page-title">{t('Health Tips', 'स्वास्थ्य सुझाव')}</h1>
          <p className="page-subtitle">{t('Personalized health recommendations', 'व्यक्तिगत स्वास्थ्य अनुशंसाएं')}</p>
        </div>
        <button className="btn btn-ghost" style={{ marginLeft: 'auto' }} onClick={() => load(activeCategory)}>
          <RefreshCw size={16} /> {t('Refresh', 'ताज़ा करें')}
        </button>
      </div>

      {/* Seasonal tip banner */}
      {seasonal && (
        <div style={{
          background: 'linear-gradient(135deg, #1a6bdb, #06b6d4)',
          borderRadius: 'var(--radius-lg)', padding: '20px 24px',
          marginBottom: 24, color: '#fff', display: 'flex', gap: 16, alignItems: 'center'
        }}>
          <span style={{ fontSize: 2.5 + 'rem' }}>{seasonal.icon}</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{seasonal.title}</div>
            <div style={{ opacity: 0.85, fontSize: 13 }}>{seasonal.content}</div>
          </div>
        </div>
      )}

      {/* Category filter */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, overflowX: 'auto', paddingBottom: 4 }}>
        {CATEGORIES.map(c => (
          <button
            key={c.key}
            className="btn"
            style={{
              padding: '6px 14px', fontSize: 12, whiteSpace: 'nowrap',
              background: activeCategory === c.key ? 'var(--primary)' : 'var(--bg-card)',
              color: activeCategory === c.key ? '#fff' : 'var(--text-secondary)',
              border: `1px solid ${activeCategory === c.key ? 'var(--primary)' : 'var(--border)'}`,
            }}
            onClick={() => { setActiveCategory(c.key); load(c.key); }}
          >
            {c.icon} {t(c.label, c.hi)}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card" style={{ height: 160 }}>
              <div className="skeleton" style={{ height: 20, width: '60%', marginBottom: 10 }} />
              <div className="skeleton" style={{ height: 14, width: '100%', marginBottom: 6 }} />
              <div className="skeleton" style={{ height: 14, width: '80%' }} />
            </div>
          ))}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {tips.map((tip, i) => {
            const colors = ['#1a6bdb', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#f97316'];
            const color = colors[i % colors.length];
            return (
              <div key={tip.id} className="card" style={{
                borderTop: `3px solid ${color}`,
                transition: 'all 0.2s'
              }}>
                <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                  <span style={{
                    fontSize: 1.8 + 'rem',
                    width: 48, height: 48,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: `${color}15`, borderRadius: 'var(--radius-sm)',
                    flexShrink: 0
                  }}>
                    {tip.icon}
                  </span>
                  <div>
                    <div style={{ fontWeight: 700, marginBottom: 2 }}>{tip.title}</div>
                    <div style={{ fontSize: 11, color: color, fontWeight: 600 }}>{tip.category}</div>
                  </div>
                </div>
                <p style={{ fontSize: 13, margin: 0, lineHeight: 1.6 }}>{tip.content}</p>
                <div style={{ marginTop: 12, display: 'flex', gap: 6 }}>
                  {tip.tags.slice(0, 2).map(tag => (
                    <span key={tag} className="badge" style={{ background: `${color}10`, color, fontSize: 10 }}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

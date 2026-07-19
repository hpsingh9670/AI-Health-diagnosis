import { useState } from 'react';
import { Menu, Bell, Sun, Moon, Globe, Search } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ title, onMenuClick }) {
  const { theme, toggleTheme } = useTheme();
  const { language, changeLanguage } = useLanguage();
  const { user } = useAuth();
  const [showLang, setShowLang] = useState(false);
  const [showNotif, setShowNotif] = useState(false);

  const notifications = [
    { id: 1, text: 'Medicine reminder: Vitamin D', time: '5 min ago', icon: '💊' },
    { id: 2, text: 'Appointment confirmed for tomorrow', time: '1 hr ago', icon: '📅' },
  ];

  return (
    <header className="navbar">
      <div className="navbar-left">
        <button className="theme-btn" onClick={onMenuClick} title="Menu" style={{ display: 'none' }}>
          <Menu size={18} />
        </button>
        <button className="theme-btn" onClick={onMenuClick} title="Menu" id="mobile-menu-btn"
          style={{ display: window.innerWidth <= 768 ? 'flex' : 'none' }}>
          <Menu size={18} />
        </button>
        <span className="navbar-title">{title}</span>
      </div>

      <div className="navbar-right">
        {/* Language toggle */}
        <div style={{ position: 'relative' }}>
          <button
            className="theme-btn"
            onClick={() => setShowLang(!showLang)}
            title="Language"
          >
            <Globe size={17} />
          </button>
          {showLang && (
            <div style={{
              position: 'absolute', right: 0, top: '44px',
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius)', padding: '8px', minWidth: 130,
              boxShadow: 'var(--shadow-lg)', zIndex: 200
            }}>
              {['en', 'hi'].map(lang => (
                <button
                  key={lang}
                  onClick={() => { changeLanguage(lang); setShowLang(false); }}
                  style={{
                    display: 'block', width: '100%', textAlign: 'left',
                    padding: '8px 12px', borderRadius: 'var(--radius-sm)',
                    background: language === lang ? 'var(--primary-glow)' : 'transparent',
                    color: language === lang ? 'var(--primary)' : 'var(--text-primary)',
                    fontSize: 13, fontWeight: 500, border: 'none', cursor: 'pointer'
                  }}
                >
                  {lang === 'en' ? '🇺🇸 English' : '🇮🇳 हिन्दी'}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications */}
        <div style={{ position: 'relative' }}>
          <button className="theme-btn" onClick={() => setShowNotif(!showNotif)} title="Notifications">
            <Bell size={17} />
            <span style={{
              position: 'absolute', top: 4, right: 4,
              width: 8, height: 8, borderRadius: '50%',
              background: 'var(--danger)', border: '2px solid var(--bg-card)'
            }} />
          </button>
          {showNotif && (
            <div style={{
              position: 'absolute', right: 0, top: '44px',
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius)', padding: '8px', minWidth: 260,
              boxShadow: 'var(--shadow-lg)', zIndex: 200
            }}>
              <div style={{ padding: '8px 12px', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', borderBottom: '1px solid var(--border)', marginBottom: 8 }}>
                NOTIFICATIONS
              </div>
              {notifications.map(n => (
                <div key={n.id} style={{
                  display: 'flex', gap: 10, padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                  '&:hover': { background: 'var(--bg-secondary)' }
                }}>
                  <span>{n.icon}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{n.text}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{n.time}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Theme toggle */}
        <button className="theme-btn" onClick={toggleTheme} title={theme === 'dark' ? 'Light mode' : 'Dark mode'}>
          {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        {/* Avatar */}
        {user && (
          <div className="avatar" title={user.full_name}>
            {user.full_name?.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
    </header>
  );
}

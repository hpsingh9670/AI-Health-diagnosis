import { useState, useEffect } from 'react';
import { medicinesAPI } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import toast from 'react-hot-toast';
import { Pill, Plus, X, Edit2, Trash2, Bell, Check } from 'lucide-react';

const EMPTY = {
  medicine_name: '', dosage: '', frequency: 'Once daily',
  reminder_times: '08:00', start_date: '', end_date: '', instructions: '', is_active: true
};

const FREQUENCIES = ['Once daily', 'Twice daily', 'Three times daily', 'Every 4 hours', 'Every 6 hours', 'Weekly', 'As needed'];

function MedicineForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial || EMPTY);
  const [loading, setLoading] = useState(false);
  const set = k => e => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try { await onSave(form); } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay">
      <div className="modal slide-up">
        <div className="modal-header">
          <h3>{initial ? 'Edit Medicine' : 'Add Medicine Reminder'}</h3>
          <button className="btn btn-ghost btn-icon" onClick={onCancel}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label>Medicine Name *</label>
              <input className="form-input" value={form.medicine_name} onChange={set('medicine_name')} placeholder="e.g., Paracetamol 500mg" required />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Dosage</label>
                <input className="form-input" value={form.dosage} onChange={set('dosage')} placeholder="e.g., 1 tablet" />
              </div>
              <div className="form-group">
                <label>Frequency</label>
                <select className="form-select" value={form.frequency} onChange={set('frequency')}>
                  {FREQUENCIES.map(f => <option key={f}>{f}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Reminder Times (comma separated)</label>
              <input className="form-input" value={form.reminder_times} onChange={set('reminder_times')} placeholder="e.g., 08:00, 14:00, 20:00" />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Start Date</label>
                <input className="form-input" type="date" value={form.start_date} onChange={set('start_date')} />
              </div>
              <div className="form-group">
                <label>End Date</label>
                <input className="form-input" type="date" value={form.end_date} onChange={set('end_date')} />
              </div>
            </div>
            <div className="form-group">
              <label>Instructions</label>
              <textarea className="form-textarea" value={form.instructions} onChange={set('instructions')} placeholder="e.g., Take after meals. Avoid alcohol." />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save Reminder'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function MedicineCard({ med, onEdit, onDelete, onToggle }) {
  const times = med.reminder_times?.split(',').map(t => t.trim()) || [];
  const colorMap = {
    'Once daily': '#1a6bdb', 'Twice daily': '#8b5cf6',
    'Three times daily': '#f59e0b', 'Weekly': '#10b981'
  };
  const color = colorMap[med.frequency] || '#6366f1';

  const scheduleNotification = () => {
    if (Notification.permission === 'default') {
      Notification.requestPermission().then(p => {
        if (p === 'granted') toast.success('Notifications enabled!');
      });
      return;
    }
    if (Notification.permission === 'granted') {
      new Notification(`💊 Medicine Reminder`, {
        body: `Time to take ${med.medicine_name} - ${med.dosage}`,
        icon: '/favicon.ico'
      });
      toast.success('Test notification sent!');
    }
  };

  return (
    <div className="card" style={{
      padding: '18px 20px',
      borderLeft: `4px solid ${color}`,
      opacity: med.is_active ? 1 : 0.6
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{
            width: 40, height: 40, borderRadius: 'var(--radius-sm)',
            background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18
          }}>💊</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>{med.medicine_name}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{med.dosage}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          <button className="btn btn-ghost btn-icon" onClick={() => scheduleNotification()} title="Test notification">
            <Bell size={14} />
          </button>
          <label className="toggle" title={med.is_active ? 'Disable' : 'Enable'}>
            <input type="checkbox" checked={med.is_active} onChange={() => onToggle(med.id)} />
            <span className="toggle-slider" />
          </label>
          <button className="btn btn-ghost btn-icon" onClick={() => onEdit(med)}><Edit2 size={14} /></button>
          <button className="btn btn-ghost btn-icon" onClick={() => onDelete(med.id)} style={{ color: 'var(--danger)' }}>
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
        <span className="badge" style={{ background: `${color}15`, color }}>{med.frequency}</span>
        {times.map(t => (
          <span key={t} className="badge badge-info">⏰ {t}</span>
        ))}
        {med.is_active && <span className="badge badge-success">Active</span>}
      </div>

      {med.instructions && (
        <div style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>
          📝 {med.instructions}
        </div>
      )}

      {(med.start_date || med.end_date) && (
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
          📅 {med.start_date || '?'} → {med.end_date || 'Ongoing'}
        </div>
      )}
    </div>
  );
}

export default function MedicineReminder() {
  const { t } = useLanguage();
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    load();
    requestNotificationPermission();
  }, []);

  const requestNotificationPermission = () => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  const load = async () => {
    try {
      const { data } = await medicinesAPI.list();
      setMedicines(data);
    } catch { toast.error('Failed to load medicines'); }
    finally { setLoading(false); }
  };

  const handleSave = async (form) => {
    try {
      if (editing) {
        await medicinesAPI.update(editing.id, form);
        toast.success('Medicine updated!');
      } else {
        await medicinesAPI.add(form);
        toast.success('Medicine reminder added!');
      }
      setShowForm(false);
      setEditing(null);
      load();
    } catch { toast.error('Failed to save'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this reminder?')) return;
    await medicinesAPI.delete(id);
    setMedicines(medicines.filter(m => m.id !== id));
    toast.success('Reminder deleted');
  };

  const handleToggle = async (id) => {
    try {
      await medicinesAPI.toggle(id);
      setMedicines(medicines.map(m => m.id === id ? { ...m, is_active: !m.is_active } : m));
    } catch { toast.error('Failed to toggle'); }
  };

  const active = medicines.filter(m => m.is_active);

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-header-icon" style={{ background: 'rgba(249,115,22,0.1)', color: '#f97316' }}>
          <Pill size={22} />
        </div>
        <div>
          <h1 className="page-title">{t('Medicine Reminders', 'दवाई रिमाइंडर')}</h1>
          <p className="page-subtitle">{t(`${active.length} active · ${medicines.length} total`, `${active.length} सक्रिय · ${medicines.length} कुल`)}</p>
        </div>
        <button className="btn btn-primary" style={{ marginLeft: 'auto' }} onClick={() => { setEditing(null); setShowForm(true); }}>
          <Plus size={16} /> {t('Add Medicine', 'दवाई जोड़ें')}
        </button>
      </div>

      {/* Notification tip */}
      <div className="alert alert-info" style={{ marginBottom: 20 }}>
        <Bell size={16} />
        <div>
          {t('Enable browser notifications to receive medicine reminders. Click the 🔔 bell on any medicine card to test.',
            'दवाई रिमाइंडर प्राप्त करने के लिए ब्राउज़र नोटिफिकेशन सक्षम करें।')}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
      ) : medicines.length === 0 ? (
        <div className="empty-state card">
          <div className="empty-state-icon">💊</div>
          <h3>{t('No Medicine Reminders', 'कोई दवाई रिमाइंडर नहीं')}</h3>
          <p>{t('Add medicines to get timely reminders', 'समय पर रिमाइंडर पाने के लिए दवाइयाँ जोड़ें')}</p>
          <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setShowForm(true)}>
            <Plus size={16} /> {t('Add First Medicine', 'पहली दवाई जोड़ें')}
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {medicines.map(m => (
            <MedicineCard
              key={m.id} med={m}
              onEdit={(med) => { setEditing(med); setShowForm(true); }}
              onDelete={handleDelete}
              onToggle={handleToggle}
            />
          ))}
        </div>
      )}

      {showForm && (
        <MedicineForm
          initial={editing}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditing(null); }}
        />
      )}
    </div>
  );
}

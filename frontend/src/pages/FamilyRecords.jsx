import { useState, useEffect } from 'react';
import { familyAPI } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import toast from 'react-hot-toast';
import { Users, Plus, Edit2, Trash2, X, Heart } from 'lucide-react';

const EMPTY = {
  name: '', age: '', gender: '', blood_group: '', relation: '',
  medical_history: '', allergies: '', current_medicines: '',
  emergency_contact: '', emergency_phone: '', insurance_provider: '', insurance_number: '',
};

function FamilyForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial || EMPTY);
  const [loading, setLoading] = useState(false);
  const set = k => e => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(form);
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay">
      <div className="modal slide-up" style={{ maxWidth: 640 }}>
        <div className="modal-header">
          <h3>{initial ? 'Edit Family Member' : 'Add Family Member'}</h3>
          <button className="btn btn-ghost btn-icon" onClick={onCancel}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-row">
              <div className="form-group">
                <label>Full Name *</label>
                <input className="form-input" value={form.name} onChange={set('name')} required placeholder="Full name" />
              </div>
              <div className="form-group">
                <label>Relationship</label>
                <select className="form-select" value={form.relation} onChange={set('relation')}>
                  <option value="">Select</option>
                  {['Spouse','Parent','Child','Sibling','Grandparent','Other'].map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Age</label>
                <input className="form-input" type="number" value={form.age} onChange={set('age')} placeholder="Age" />
              </div>
              <div className="form-group">
                <label>Gender</label>
                <select className="form-select" value={form.gender} onChange={set('gender')}>
                  <option value="">Select</option>
                  <option>Male</option><option>Female</option><option>Other</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Blood Group</label>
                <select className="form-select" value={form.blood_group} onChange={set('blood_group')}>
                  <option value="">Select</option>
                  {['A+','A-','B+','B-','O+','O-','AB+','AB-'].map(b => <option key={b}>{b}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Emergency Contact</label>
                <input className="form-input" value={form.emergency_contact} onChange={set('emergency_contact')} placeholder="Contact name" />
              </div>
            </div>
            <div className="form-group">
              <label>Emergency Phone</label>
              <input className="form-input" value={form.emergency_phone} onChange={set('emergency_phone')} placeholder="+91 99999 99999" />
            </div>
            <div className="form-group">
              <label>Medical History</label>
              <textarea className="form-textarea" value={form.medical_history} onChange={set('medical_history')} placeholder="Past surgeries, chronic conditions..." />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Allergies</label>
                <input className="form-input" value={form.allergies} onChange={set('allergies')} placeholder="e.g., Penicillin, Peanuts" />
              </div>
              <div className="form-group">
                <label>Current Medicines</label>
                <input className="form-input" value={form.current_medicines} onChange={set('current_medicines')} placeholder="e.g., Metformin 500mg" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Insurance Provider</label>
                <input className="form-input" value={form.insurance_provider} onChange={set('insurance_provider')} placeholder="Insurance company name" />
              </div>
              <div className="form-group">
                <label>Policy Number</label>
                <input className="form-input" value={form.insurance_number} onChange={set('insurance_number')} placeholder="Policy number" />
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function MemberCard({ member, onEdit, onDelete }) {
  const initials = member.name?.split(' ').map(n => n[0]).join('').toUpperCase();
  const colors = ['#1a6bdb', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'];
  const color = colors[member.id % colors.length];

  return (
    <div className="card" style={{ padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 16 }}>
        <div className="avatar" style={{ width: 48, height: 48, fontSize: 18, background: `linear-gradient(135deg, ${color}, ${color}aa)` }}>
          {initials}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '1rem', margin: 0 }}>{member.name}</h3>
            <div style={{ display: 'flex', gap: 6 }}>
              <button className="btn btn-ghost btn-icon" onClick={() => onEdit(member)} title="Edit">
                <Edit2 size={14} />
              </button>
              <button className="btn btn-ghost btn-icon" onClick={() => onDelete(member.id)} title="Delete"
                style={{ color: 'var(--danger)' }}>
                <Trash2 size={14} />
              </button>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
            {member.relation && <span className="badge badge-primary">{member.relation}</span>}
            {member.blood_group && <span className="badge badge-danger">🩸 {member.blood_group}</span>}
            {member.age && <span className="badge badge-info">{member.age}y</span>}
            {member.gender && <span className="badge">{member.gender}</span>}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12 }}>
        {member.allergies && (
          <div style={{ display: 'flex', gap: 6 }}>
            <span style={{ color: 'var(--danger)', fontWeight: 600 }}>⚠ Allergies:</span>
            <span>{member.allergies}</span>
          </div>
        )}
        {member.current_medicines && (
          <div style={{ display: 'flex', gap: 6 }}>
            <span style={{ color: 'var(--secondary)', fontWeight: 600 }}>💊 Medicines:</span>
            <span>{member.current_medicines}</span>
          </div>
        )}
        {member.emergency_contact && (
          <div style={{ display: 'flex', gap: 6 }}>
            <span style={{ color: 'var(--accent)', fontWeight: 600 }}>📞 Emergency:</span>
            <span>{member.emergency_contact} {member.emergency_phone && `· ${member.emergency_phone}`}</span>
          </div>
        )}
        {member.insurance_provider && (
          <div style={{ display: 'flex', gap: 6 }}>
            <span style={{ color: 'var(--primary)', fontWeight: 600 }}>🛡 Insurance:</span>
            <span>{member.insurance_provider} {member.insurance_number && `#${member.insurance_number}`}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function FamilyRecords() {
  const { t } = useLanguage();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const { data } = await familyAPI.list();
      setMembers(data);
    } catch { toast.error('Failed to load family records'); }
    finally { setLoading(false); }
  };

  const handleSave = async (form) => {
    try {
      if (editing) {
        await familyAPI.update(editing.id, form);
        toast.success('Member updated!');
      } else {
        await familyAPI.add(form);
        toast.success('Family member added!');
      }
      setShowForm(false);
      setEditing(null);
      load();
    } catch { toast.error('Failed to save'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this family member?')) return;
    try {
      await familyAPI.delete(id);
      toast.success('Member deleted');
      setMembers(members.filter(m => m.id !== id));
    } catch { toast.error('Failed to delete'); }
  };

  const handleEdit = (member) => { setEditing(member); setShowForm(true); };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-header-icon" style={{ background: 'rgba(245,158,11,0.1)', color: 'var(--accent-warn)' }}>
          <Users size={22} />
        </div>
        <div>
          <h1 className="page-title">{t('Family Health Records', 'पारिवारिक स्वास्थ्य रिकॉर्ड')}</h1>
          <p className="page-subtitle">{t('Manage health information for your family', 'परिवार की स्वास्थ्य जानकारी प्रबंधित करें')}</p>
        </div>
        <button
          className="btn btn-primary"
          style={{ marginLeft: 'auto' }}
          onClick={() => { setEditing(null); setShowForm(true); }}
        >
          <Plus size={16} /> {t('Add Member', 'सदस्य जोड़ें')}
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <div className="spinner" style={{ margin: '0 auto' }} />
        </div>
      ) : members.length === 0 ? (
        <div className="empty-state card">
          <div className="empty-state-icon">👨‍👩‍👧</div>
          <h3>{t('No Family Members Yet', 'अभी कोई परिवार सदस्य नहीं')}</h3>
          <p>{t('Add your family members to keep their health records organized', 'अपने परिवार के सदस्यों की स्वास्थ्य जानकारी जोड़ें')}</p>
          <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setShowForm(true)}>
            <Plus size={16} /> {t('Add First Member', 'पहला सदस्य जोड़ें')}
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {members.map(m => (
            <MemberCard key={m.id} member={m} onEdit={handleEdit} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {showForm && (
        <FamilyForm
          initial={editing}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditing(null); }}
        />
      )}
    </div>
  );
}

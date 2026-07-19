import { useState, useEffect } from 'react';
import { appointmentsAPI } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import toast from 'react-hot-toast';
import { Calendar, Plus, X, CheckCircle, XCircle, Clock } from 'lucide-react';

const STEPS = ['Patient Info', 'Symptoms', 'Schedule', 'Review'];

const EMPTY = {
  patient_name: '', patient_age: '', patient_gender: '', symptoms: '',
  preferred_date: '', preferred_time: '', location: '', hospital_name: '', doctor_specialty: '', notes: ''
};

const SPECIALTIES = [
  'General Physician', 'Cardiologist', 'Neurologist', 'Orthopedist',
  'Dermatologist', 'Gastroenterologist', 'Pulmonologist', 'Endocrinologist',
  'Gynecologist', 'Pediatrician', 'Psychiatrist', 'Urologist',
];

function StatusBadge({ status }) {
  const map = {
    pending: { cls: 'badge-warning', icon: '⏳', label: 'Pending' },
    confirmed: { cls: 'badge-success', icon: '✅', label: 'Confirmed' },
    cancelled: { cls: 'badge-danger', icon: '❌', label: 'Cancelled' },
  };
  const { cls, icon, label } = map[status] || map.pending;
  return <span className={`badge ${cls}`}>{icon} {label}</span>;
}

export default function AppointmentBooking() {
  const { t } = useLanguage();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const { data } = await appointmentsAPI.list();
      setAppointments(data);
    } catch { toast.error('Failed to load appointments'); }
    finally { setLoading(false); }
  };

  const set = k => e => setForm({ ...form, [k]: e.target.value });

  const nextStep = () => {
    if (step === 0 && !form.patient_name) return toast.error('Enter patient name');
    if (step === 1 && !form.symptoms) return toast.error('Describe symptoms');
    if (step === 2 && !form.preferred_date) return toast.error('Select preferred date');
    setStep(s => Math.min(s + 1, 3));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await appointmentsAPI.create(form);
      toast.success('Appointment request submitted!');
      setShowForm(false);
      setStep(0);
      setForm(EMPTY);
      load();
    } catch { toast.error('Failed to book appointment'); }
    finally { setSubmitting(false); }
  };

  const handleCancel = async (id) => {
    if (!confirm('Cancel this appointment?')) return;
    await appointmentsAPI.cancel(id);
    toast.success('Appointment cancelled');
    load();
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-header-icon" style={{ background: 'rgba(139,92,246,0.1)', color: '#8b5cf6' }}>
          <Calendar size={22} />
        </div>
        <div>
          <h1 className="page-title">{t('AI Appointment Booking', 'AI अपॉइंटमेंट बुकिंग')}</h1>
          <p className="page-subtitle">{t('Book doctor appointments with AI assistance', 'AI सहायता से डॉक्टर अपॉइंटमेंट बुक करें')}</p>
        </div>
        <button className="btn btn-primary" style={{ marginLeft: 'auto' }} onClick={() => { setShowForm(true); setStep(0); }}>
          <Plus size={16} /> {t('Book Appointment', 'अपॉइंटमेंट बुक करें')}
        </button>
      </div>

      {/* Appointments list */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
      ) : appointments.length === 0 ? (
        <div className="empty-state card">
          <div className="empty-state-icon">📅</div>
          <h3>{t('No Appointments Yet', 'अभी कोई अपॉइंटमेंट नहीं')}</h3>
          <p>{t('Book your first appointment using our AI assistant', 'AI असिस्टेंट से अपना पहला अपॉइंटमेंट बुक करें')}</p>
          <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setShowForm(true)}>
            <Plus size={16} /> {t('Book Now', 'अभी बुक करें')}
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {appointments.map(a => (
            <div key={a.id} className="card" style={{ padding: '16px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <h3 style={{ fontSize: '1rem', marginBottom: 4 }}>{a.patient_name}</h3>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {a.doctor_specialty && `👨‍⚕️ ${a.doctor_specialty}`}
                    {a.hospital_name && ` · 🏥 ${a.hospital_name}`}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <StatusBadge status={a.status} />
                  {a.status === 'pending' && (
                    <button className="btn btn-danger" style={{ padding: '4px 10px', fontSize: 11 }} onClick={() => handleCancel(a.id)}>
                      Cancel
                    </button>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text-muted)' }}>
                {a.preferred_date && <span>📅 {a.preferred_date} {a.preferred_time && `at ${a.preferred_time}`}</span>}
                {a.location && <span>📍 {a.location}</span>}
                {a.symptoms && <span>🩺 {a.symptoms.slice(0, 40)}...</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Booking Modal */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal slide-up" style={{ maxWidth: 580 }}>
            <div className="modal-header">
              <div>
                <h3>{t('Book Appointment', 'अपॉइंटमेंट बुक करें')}</h3>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                  {t(`Step ${step + 1} of ${STEPS.length}: ${STEPS[step]}`, `चरण ${step + 1}/${STEPS.length}`)}
                </div>
              </div>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowForm(false)}><X size={18} /></button>
            </div>

            {/* Progress bar */}
            <div style={{ height: 3, background: 'var(--border)', margin: '0 24px' }}>
              <div style={{
                height: '100%', background: 'var(--primary)',
                width: `${((step + 1) / STEPS.length) * 100}%`,
                transition: 'width 0.3s ease', borderRadius: 2
              }} />
            </div>

            <div className="modal-body">
              {step === 0 && (
                <div className="slide-up">
                  <div className="form-row">
                    <div className="form-group">
                      <label>{t('Patient Name *', 'रोगी का नाम *')}</label>
                      <input className="form-input" value={form.patient_name} onChange={set('patient_name')} placeholder="Full name" />
                    </div>
                    <div className="form-group">
                      <label>{t('Age', 'उम्र')}</label>
                      <input className="form-input" type="number" value={form.patient_age} onChange={set('patient_age')} placeholder="Age" />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>{t('Gender', 'लिंग')}</label>
                    <select className="form-select" value={form.patient_gender} onChange={set('patient_gender')}>
                      <option value="">Select gender</option>
                      <option>Male</option><option>Female</option><option>Other</option>
                    </select>
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="slide-up">
                  <div className="form-group">
                    <label>{t('Main Symptoms *', 'मुख्य लक्षण *')}</label>
                    <textarea className="form-textarea" style={{ minHeight: 100 }}
                      value={form.symptoms} onChange={set('symptoms')}
                      placeholder="Describe your symptoms in detail..." />
                  </div>
                  <div className="form-group">
                    <label>{t('Preferred Specialist', 'पसंदीदा विशेषज्ञ')}</label>
                    <select className="form-select" value={form.doctor_specialty} onChange={set('doctor_specialty')}>
                      <option value="">Any Specialist</option>
                      {SPECIALTIES.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="slide-up">
                  <div className="form-row">
                    <div className="form-group">
                      <label>{t('Preferred Date *', 'पसंदीदा तारीख *')}</label>
                      <input className="form-input" type="date" value={form.preferred_date} onChange={set('preferred_date')}
                        min={new Date().toISOString().split('T')[0]} />
                    </div>
                    <div className="form-group">
                      <label>{t('Preferred Time', 'पसंदीदा समय')}</label>
                      <select className="form-select" value={form.preferred_time} onChange={set('preferred_time')}>
                        <option value="">Any time</option>
                        {['09:00 AM','10:00 AM','11:00 AM','12:00 PM','02:00 PM','03:00 PM','04:00 PM','05:00 PM'].map(t => (
                          <option key={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>{t('Location', 'स्थान')}</label>
                      <input className="form-input" value={form.location} onChange={set('location')} placeholder="City or area" />
                    </div>
                    <div className="form-group">
                      <label>{t('Preferred Hospital', 'पसंदीदा अस्पताल')}</label>
                      <input className="form-input" value={form.hospital_name} onChange={set('hospital_name')} placeholder="Hospital name (optional)" />
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="slide-up">
                  <div className="alert alert-info" style={{ marginBottom: 16 }}>
                    <span>🤖</span>
                    <div>{t('AI has processed your request. Review the details below.', 'AI ने आपके अनुरोध को संसाधित किया है। नीचे विवरण की समीक्षा करें।')}</div>
                  </div>
                  {Object.entries({
                    'Patient': form.patient_name,
                    'Age / Gender': `${form.patient_age || '-'} / ${form.patient_gender || '-'}`,
                    'Symptoms': form.symptoms,
                    'Specialist': form.doctor_specialty || 'Any',
                    'Date': form.preferred_date,
                    'Time': form.preferred_time || 'Any',
                    'Location': form.location || '-',
                    'Hospital': form.hospital_name || 'Auto-assign',
                  }).map(([k, v]) => (
                    <div key={k} style={{
                      display: 'flex', gap: 12, padding: '8px 0',
                      borderBottom: '1px solid var(--border)', fontSize: 13
                    }}>
                      <span style={{ color: 'var(--text-muted)', minWidth: 100, fontWeight: 600 }}>{k}</span>
                      <span style={{ fontWeight: 500 }}>{v}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="modal-footer">
              {step > 0 && (
                <button className="btn btn-ghost" onClick={() => setStep(s => s - 1)}>← Back</button>
              )}
              <button className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
              {step < 3 ? (
                <button className="btn btn-primary" onClick={nextStep}>Next →</button>
              ) : (
                <button className="btn btn-success" onClick={handleSubmit} disabled={submitting}>
                  {submitting ? 'Booking...' : '✓ Confirm Booking'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

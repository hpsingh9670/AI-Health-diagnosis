import { useState, useEffect } from 'react';
import { symptomsAPI } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import toast from 'react-hot-toast';
import { Search, X, Plus, Activity } from 'lucide-react';

// Common symptoms for autocomplete
const COMMON_SYMPTOMS = [
  'Fever', 'Headache', 'Cough', 'Fatigue', 'Nausea', 'Vomiting', 'Body ache',
  'Chest pain', 'Breathlessness', 'Dizziness', 'Rash', 'Itching', 'Joint pain',
  'Abdominal pain', 'Diarrhea', 'Constipation', 'Loss of appetite', 'Weight loss',
  'Sweating', 'Chills', 'Sore throat', 'Runny nose', 'Back pain', 'Neck pain',
];

const HINDI_SYMPTOMS = [
  'बुखार', 'सिरदर्द', 'खांसी', 'थकान', 'मतली', 'उल्टी', 'शरीर दर्द',
  'छाती में दर्द', 'सांस लेने में दिक्कत', 'चक्कर', 'दाने', 'खुजली',
  'जोड़ों का दर्द', 'पेट दर्द', 'दस्त', 'कब्ज', 'भूख न लगना',
];

function SeverityBadge({ severity }) {
  const cls = severity?.toLowerCase().includes('critical') ? 'severity-critical'
    : severity?.toLowerCase().includes('severe') ? 'severity-severe'
    : severity?.toLowerCase().includes('moderate') ? 'severity-moderate'
    : 'severity-mild';

  return (
    <span className={`badge ${cls}`}>{severity}</span>
  );
}

export default function SymptomChecker() {
  const { t, language } = useLanguage();
  const [input, setInput] = useState('');
  const [symptoms, setSymptoms] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const { data } = await symptomsAPI.history();
      setHistory(data.slice(0, 5));
    } catch {}
  };

  const getSuggestions = (val) => {
    const list = language === 'hi' ? HINDI_SYMPTOMS : COMMON_SYMPTOMS;
    if (!val) return setSuggestions([]);
    setSuggestions(list.filter(s => s.toLowerCase().includes(val.toLowerCase())).slice(0, 6));
  };

  const addSymptom = (sym) => {
    const clean = sym.trim();
    if (clean && !symptoms.includes(clean)) {
      setSymptoms([...symptoms, clean]);
    }
    setInput('');
    setSuggestions([]);
  };

  const removeSymptom = (sym) => {
    setSymptoms(symptoms.filter(s => s !== sym));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (input.trim()) addSymptom(input);
    }
  };

  const predict = async () => {
    if (!symptoms.length) return toast.error(t('Please add at least one symptom', 'कम से कम एक लक्षण जोड़ें'));
    setLoading(true);
    setResult(null);
    try {
      const { data } = await symptomsAPI.predict(symptoms, language);
      setResult(data);
      loadHistory();
    } catch (err) {
      toast.error(err.response?.data?.detail || t('Prediction failed', 'भविष्यवाणी विफल'));
    } finally { setLoading(false); }
  };

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-icon" style={{ background: 'rgba(26,107,219,0.1)', color: 'var(--primary)' }}>
          <Activity size={22} />
        </div>
        <div>
          <h1 className="page-title">{t('AI Symptom Checker', 'AI लक्षण जांचक')}</h1>
          <p className="page-subtitle">{t('Describe your symptoms in English or Hindi', 'अपने लक्षण अंग्रेजी या हिंदी में बताएं')}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Input panel */}
        <div className="card">
          <h3 className="mb-4">{t('Enter Symptoms', 'लक्षण दर्ज करें')}</h3>

          {/* Symptom tags */}
          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: 8,
            minHeight: 50, padding: '10px 12px',
            border: '1.5px solid var(--border)', borderRadius: 'var(--radius-sm)',
            background: 'var(--bg-secondary)', marginBottom: 12, cursor: 'text'
          }}>
            {symptoms.map(s => (
              <span key={s} style={{
                display: 'flex', alignItems: 'center', gap: 4,
                padding: '3px 10px', background: 'var(--primary)',
                color: '#fff', borderRadius: '99px', fontSize: 12, fontWeight: 500
              }}>
                {s}
                <X size={12} style={{ cursor: 'pointer' }} onClick={() => removeSymptom(s)} />
              </span>
            ))}
          </div>

          {/* Input with autocomplete */}
          <div style={{ position: 'relative', marginBottom: 12 }}>
            <div className="input-icon-wrap">
              <Search className="input-icon" />
              <input
                className="form-input"
                placeholder={t('Type a symptom and press Enter...', 'लक्षण टाइप करें और Enter दबाएं...')}
                value={input}
                onChange={e => { setInput(e.target.value); getSuggestions(e.target.value); }}
                onKeyDown={handleKeyDown}
              />
            </div>
            {suggestions.length > 0 && (
              <div style={{
                position: 'absolute', top: '100%', left: 0, right: 0,
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)', zIndex: 10, overflow: 'hidden',
                boxShadow: 'var(--shadow-lg)'
              }}>
                {suggestions.map(s => (
                  <div key={s}
                    onClick={() => addSymptom(s)}
                    style={{
                      padding: '10px 14px', cursor: 'pointer', fontSize: 13,
                      borderBottom: '1px solid var(--border)',
                      transition: 'background 0.15s'
                    }}
                    onMouseOver={e => e.target.style.background = 'var(--bg-secondary)'}
                    onMouseOut={e => e.target.style.background = 'transparent'}
                  >
                    {s}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick add common symptoms */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8, fontWeight: 600 }}>
              {t('QUICK ADD', 'त्वरित जोड़ें')}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {(language === 'hi' ? HINDI_SYMPTOMS : COMMON_SYMPTOMS).slice(0, 8).map(s => (
                <button
                  key={s}
                  onClick={() => addSymptom(s)}
                  className="btn btn-ghost"
                  style={{ padding: '4px 10px', fontSize: 11, borderRadius: '99px' }}
                  disabled={symptoms.includes(s)}
                >
                  + {s}
                </button>
              ))}
            </div>
          </div>

          <button
            className="btn btn-primary btn-full"
            onClick={predict}
            disabled={loading || !symptoms.length}
          >
            {loading
              ? <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> {t('Analyzing...', 'विश्लेषण हो रहा है...')}</>
              : <>{t('Predict Disease', 'बीमारी का अनुमान लगाएं')} →</>
            }
          </button>
        </div>

        {/* Result panel */}
        <div>
          {result ? (
            <div className="card slide-up">
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20
              }}>
                <h3>{t('AI Prediction Result', 'AI भविष्यवाणी परिणाम')}</h3>
                <SeverityBadge severity={result.severity} />
              </div>

              {/* Disease name */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(26,107,219,0.08), rgba(6,182,212,0.08))',
                borderRadius: 'var(--radius)', padding: '20px',
                border: '1px solid rgba(26,107,219,0.2)', marginBottom: 20
              }}>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 6 }}>
                  {t('POSSIBLE CONDITION', 'संभावित बीमारी')}
                </div>
                <div style={{ fontSize: 1.4 + 'rem', fontWeight: 800, color: 'var(--primary)', marginBottom: 12 }}>
                  {result.predicted_disease}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
                  {t('Confidence Score', 'विश्वास स्कोर')}: <strong>{result.confidence_score}%</strong>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${result.confidence_score}%` }} />
                </div>
              </div>

              {/* Description */}
              <div style={{ marginBottom: 16 }}>
                <p style={{ fontSize: 13 }}>{result.description}</p>
              </div>

              {/* Specialist */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 16px', background: 'rgba(139,92,246,0.08)',
                borderRadius: 'var(--radius-sm)', marginBottom: 16,
                border: '1px solid rgba(139,92,246,0.2)'
              }}>
                <span style={{ fontSize: 20 }}>👨‍⚕️</span>
                <div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t('Recommended Specialist', 'अनुशंसित विशेषज्ञ')}</div>
                  <div style={{ fontWeight: 700, color: '#7c3aed' }}>{result.specialist}</div>
                </div>
              </div>

              {/* Precautions */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8 }}>
                  {t('PRECAUTIONS', 'सावधानियाँ')}
                </div>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {result.precautions.map((p, i) => (
                    <li key={i} style={{ display: 'flex', gap: 8, fontSize: 13 }}>
                      <span style={{ color: 'var(--accent)', flexShrink: 0 }}>✓</span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Disclaimer */}
              <div className="alert alert-warning">
                <span>⚕️</span>
                <div style={{ fontSize: 12 }}>{result.disclaimer}</div>
              </div>
            </div>
          ) : (
            <div className="card" style={{ height: '100%', minHeight: 300 }}>
              <div className="empty-state">
                <div className="empty-state-icon">🔬</div>
                <h3>{t('No Result Yet', 'अभी कोई परिणाम नहीं')}</h3>
                <p>{t('Add your symptoms and click Predict Disease', 'लक्षण जोड़ें और "बीमारी का अनुमान लगाएं" पर क्लिक करें')}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent history */}
      {history.length > 0 && (
        <div className="card" style={{ marginTop: 24 }}>
          <h3 className="mb-4">{t('Recent Checks', 'हाल की जांच')}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {history.map(h => (
              <div key={h.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 16px', background: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-sm)'
              }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{h.predicted_disease}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{h.symptoms_input?.slice(0, 50)}...</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <SeverityBadge severity={h.severity} />
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                    {new Date(h.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

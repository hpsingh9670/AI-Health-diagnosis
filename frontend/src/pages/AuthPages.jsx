import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, User, Phone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.full_name}!`);
      navigate(user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-card slide-up">
        <div className="auth-logo">
          <div className="auth-logo-icon">🏥</div>
          <div className="auth-logo-text">Medi<span>AI</span></div>
        </div>
        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-subtitle">Sign in to your healthcare account</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <div className="input-icon-wrap">
              <Mail className="input-icon" />
              <input
                className="form-input"
                type="email"
                placeholder="you@email.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="input-icon-wrap" style={{ position: 'relative' }}>
              <Lock className="input-icon" />
              <input
                className="form-input"
                type={show ? 'text' : 'password'}
                placeholder="Enter your password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
                style={{ paddingRight: 44 }}
              />
              <button
                type="button"
                onClick={() => setShow(!show)}
                style={{
                  position: 'absolute', right: 12, top: '50%',
                  transform: 'translateY(-50%)', background: 'none',
                  border: 'none', color: 'var(--text-muted)', cursor: 'pointer'
                }}
              >
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div style={{ textAlign: 'right', marginBottom: 20 }}>
            <Link to="/forgot-password" style={{ color: 'var(--primary)', fontSize: 13 }}>
              Forgot password?
            </Link>
          </div>

          <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
            {loading ? <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> : 'Sign In'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text-muted)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>Create account</Link>
        </p>

        {/* Demo credentials hint */}
        <div className="alert alert-info" style={{ marginTop: 20, fontSize: 12 }}>
          <span>💡</span>
          <div>
            <strong>Demo:</strong> Register an account or use admin@mediai.com / admin123 after creating via registration
          </div>
        </div>
      </div>
    </div>
  );
}

export function Register() {
  const [form, setForm] = useState({
    full_name: '', email: '', password: '', phone: '',
    gender: '', date_of_birth: '', blood_group: ''
  });
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Registration failed');
    } finally { setLoading(false); }
  };

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <div className="auth-page">
      <div className="auth-card slide-up" style={{ maxWidth: 520, padding: '36px 40px' }}>
        <div className="auth-logo">
          <div className="auth-logo-icon">🏥</div>
          <div className="auth-logo-text">Medi<span>AI</span></div>
        </div>
        <h1 className="auth-title">Create account</h1>
        <p className="auth-subtitle">Join MediAI for AI-powered healthcare</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name *</label>
            <div className="input-icon-wrap">
              <User className="input-icon" />
              <input className="form-input" placeholder="Your full name" value={form.full_name} onChange={set('full_name')} required />
            </div>
          </div>

          <div className="form-group">
            <label>Email Address *</label>
            <div className="input-icon-wrap">
              <Mail className="input-icon" />
              <input className="form-input" type="email" placeholder="you@email.com" value={form.email} onChange={set('email')} required />
            </div>
          </div>

          <div className="form-group">
            <label>Password *</label>
            <div className="input-icon-wrap" style={{ position: 'relative' }}>
              <Lock className="input-icon" />
              <input
                className="form-input"
                type={show ? 'text' : 'password'}
                placeholder="Min 8 characters"
                value={form.password}
                onChange={set('password')}
                required
                style={{ paddingRight: 44 }}
              />
              <button type="button" onClick={() => setShow(!show)} style={{
                position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer'
              }}>
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Phone</label>
              <div className="input-icon-wrap">
                <Phone className="input-icon" />
                <input className="form-input" placeholder="+91 99999 99999" value={form.phone} onChange={set('phone')} />
              </div>
            </div>
            <div className="form-group">
              <label>Blood Group</label>
              <select className="form-select" value={form.blood_group} onChange={set('blood_group')}>
                <option value="">Select</option>
                {['A+','A-','B+','B-','O+','O-','AB+','AB-'].map(b => <option key={b}>{b}</option>)}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Gender</label>
              <select className="form-select" value={form.gender} onChange={set('gender')}>
                <option value="">Select</option>
                <option>Male</option><option>Female</option><option>Other</option>
              </select>
            </div>
            <div className="form-group">
              <label>Date of Birth</label>
              <input className="form-input" type="date" value={form.date_of_birth} onChange={set('date_of_birth')} />
            </div>
          </div>

          <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
            {loading ? <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> : 'Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { authAPI } = await import('../services/api');
      await authAPI.forgotPassword(email);
      setSent(true);
      toast.success('Reset instructions sent!');
    } catch {
      toast.error('Failed to send reset email');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-card slide-up">
        <div className="auth-logo">
          <div className="auth-logo-icon">🏥</div>
          <div className="auth-logo-text">Medi<span>AI</span></div>
        </div>
        <h1 className="auth-title">Reset Password</h1>
        <p className="auth-subtitle">Enter your email to receive reset instructions</p>

        {sent ? (
          <div className="alert alert-success" style={{ marginBottom: 20 }}>
            <span>✅</span>
            <div>Reset instructions have been sent to <strong>{email}</strong>. Check your inbox.</div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email Address</label>
              <div className="input-icon-wrap">
                <Mail className="input-icon" />
                <input className="form-input" type="email" placeholder="you@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
            </div>
            <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        )}

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text-muted)' }}>
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>← Back to Login</Link>
        </p>
      </div>
    </div>
  );
}

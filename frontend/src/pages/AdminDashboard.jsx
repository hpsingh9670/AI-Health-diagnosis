import { useState, useEffect } from 'react';
import { adminAPI, usersAPI, appointmentsAPI, sosAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Shield, Users, Calendar, AlertTriangle, Activity, TrendingUp, BarChart2 } from 'lucide-react';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState(null);
  const [users, setUsers] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [sosAlerts, setSosAlerts] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    try {
      const [s, a, u, appts, sos] = await Promise.all([
        adminAPI.stats(),
        adminAPI.recentActivity(),
        usersAPI.listAll(),
        appointmentsAPI.listAll(),
        sosAPI.listAll(),
      ]);
      setStats(s.data);
      setActivity(a.data);
      setUsers(u.data);
      setAppointments(appts.data);
      setSosAlerts(sos.data);
    } catch (err) {
      toast.error('Failed to load admin data');
    } finally { setLoading(false); }
  };

  const toggleUser = async (id) => {
    await usersAPI.toggleActive(id);
    toast.success('User status updated');
    loadAll();
  };

  const confirmAppt = async (id) => {
    await appointmentsAPI.confirm(id);
    toast.success('Appointment confirmed');
    loadAll();
  };

  const diseaseChartData = stats ? {
    labels: stats.top_diseases.map(d => d.disease.slice(0, 15)),
    datasets: [{
      label: 'Predictions',
      data: stats.top_diseases.map(d => d.count),
      backgroundColor: ['#1a6bdb', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'],
      borderRadius: 6,
    }]
  } : null;

  const userChartData = stats ? {
    labels: ['Active', 'Inactive'],
    datasets: [{
      data: [stats.users.active, stats.users.inactive],
      backgroundColor: ['#10b981', '#ef4444'],
      borderWidth: 0,
    }]
  } : null;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'users', label: 'Users', icon: '👥' },
    { id: 'appointments', label: 'Appointments', icon: '📅' },
    { id: 'sos', label: 'SOS Alerts', icon: '🚨' },
  ];

  if (loading) return (
    <div style={{ textAlign: 'center', padding: 60 }}>
      <div className="spinner" style={{ margin: '0 auto' }} />
      <p style={{ marginTop: 16, color: 'var(--text-muted)' }}>Loading admin dashboard...</p>
    </div>
  );

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-header-icon" style={{ background: 'rgba(245,158,11,0.1)', color: 'var(--accent-warn)' }}>
          <Shield size={22} />
        </div>
        <div>
          <h1 className="page-title">Admin Dashboard</h1>
          <p className="page-subtitle">MediAI Platform Management</p>
        </div>
        <button className="btn btn-ghost" style={{ marginLeft: 'auto' }} onClick={loadAll}>
          🔄 Refresh
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: 'var(--bg-card)', padding: 4, borderRadius: 'var(--radius)', border: '1px solid var(--border)', width: 'fit-content' }}>
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

      {activeTab === 'overview' && stats && (
        <div>
          {/* Stats grid */}
          <div className="stat-grid" style={{ marginBottom: 24 }}>
            {[
              { icon: '👥', label: 'Total Users', value: stats.users.total, color: '#1a6bdb', bg: 'rgba(26,107,219,0.1)' },
              { icon: '📅', label: 'Appointments', value: stats.appointments.total, color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
              { icon: '🚨', label: 'SOS Alerts', value: stats.sos.total, color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
              { icon: '🔬', label: 'AI Predictions', value: stats.symptom_checks.total, color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
            ].map((s, i) => (
              <div key={i} className="stat-card">
                <div className="stat-icon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
                <div>
                  <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
            {diseaseChartData && (
              <div className="card">
                <h3 className="mb-4">Top Predicted Diseases</h3>
                <Bar data={diseaseChartData} options={{
                  responsive: true, plugins: { legend: { display: false } },
                  scales: {
                    y: { grid: { color: 'rgba(0,0,0,0.05)' } },
                    x: { grid: { display: false } }
                  }
                }} />
              </div>
            )}
            {userChartData && (
              <div className="card">
                <h3 className="mb-4">User Status</h3>
                <div style={{ maxWidth: 200, margin: '0 auto' }}>
                  <Doughnut data={userChartData} options={{
                    plugins: {
                      legend: { position: 'bottom' }
                    },
                    cutout: '65%'
                  }} />
                </div>
              </div>
            )}
          </div>

          {/* Appointment breakdown */}
          <div className="card" style={{ marginTop: 20 }}>
            <h3 className="mb-4">Appointment Status Breakdown</h3>
            <div style={{ display: 'flex', gap: 20 }}>
              {[
                { label: 'Pending', value: stats.appointments.pending, color: '#f59e0b' },
                { label: 'Confirmed', value: stats.appointments.confirmed, color: '#10b981' },
                { label: 'Cancelled', value: stats.appointments.total - stats.appointments.pending - stats.appointments.confirmed, color: '#ef4444' },
              ].map(s => (
                <div key={s.label} style={{ flex: 1, textAlign: 'center', padding: 16, background: `${s.color}10`, borderRadius: 'var(--radius)' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="card">
          <h3 className="mb-4">All Users ({users.length})</h3>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td><div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div className="avatar" style={{ width: 28, height: 28, fontSize: 11 }}>
                        {u.full_name?.charAt(0)}
                      </div>
                      {u.full_name}
                    </div></td>
                    <td style={{ color: 'var(--text-muted)' }}>{u.email}</td>
                    <td>{u.phone || '-'}</td>
                    <td><span className={`badge ${u.role === 'admin' ? 'badge-warning' : 'badge-primary'}`}>{u.role}</span></td>
                    <td><span className={`badge ${u.is_active ? 'badge-success' : 'badge-danger'}`}>{u.is_active ? 'Active' : 'Inactive'}</span></td>
                    <td>
                      <button
                        className={`btn btn-ghost`}
                        style={{ fontSize: 11, padding: '3px 8px' }}
                        onClick={() => toggleUser(u.id)}
                      >
                        {u.is_active ? '🚫 Deactivate' : '✅ Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'appointments' && (
        <div className="card">
          <h3 className="mb-4">All Appointments ({appointments.length})</h3>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr><th>Patient</th><th>Symptoms</th><th>Date</th><th>Specialty</th><th>Status</th><th>Action</th></tr>
              </thead>
              <tbody>
                {appointments.map(a => (
                  <tr key={a.id}>
                    <td>{a.patient_name}</td>
                    <td style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.symptoms?.slice(0, 40)}...</td>
                    <td>{a.preferred_date} {a.preferred_time && `· ${a.preferred_time}`}</td>
                    <td>{a.doctor_specialty || '-'}</td>
                    <td><span className={`badge ${a.status === 'confirmed' ? 'badge-success' : a.status === 'cancelled' ? 'badge-danger' : 'badge-warning'}`}>{a.status}</span></td>
                    <td>
                      {a.status === 'pending' && (
                        <button className="btn btn-success" style={{ fontSize: 11, padding: '3px 8px' }} onClick={() => confirmAppt(a.id)}>
                          ✅ Confirm
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'sos' && (
        <div className="card">
          <h3 className="mb-4">SOS Alerts ({sosAlerts.length})</h3>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr><th>ID</th><th>Location</th><th>Blood Group</th><th>Status</th><th>Time</th></tr>
              </thead>
              <tbody>
                {sosAlerts.map(s => (
                  <tr key={s.id}>
                    <td>#{s.id}</td>
                    <td>{s.latitude && s.longitude ? `${s.latitude?.toFixed(3)}, ${s.longitude?.toFixed(3)}` : 'Unknown'}</td>
                    <td>{s.blood_group || '-'}</td>
                    <td><span className={`badge ${s.status === 'active' ? 'badge-danger' : 'badge-success'}`}>{s.status}</span></td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {s.created_at ? new Date(s.created_at).toLocaleString() : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

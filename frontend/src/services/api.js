import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('mediai_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 responses globally
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('mediai_token');
      localStorage.removeItem('mediai_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => API.post('/api/auth/register', data),
  login: (data) => API.post('/api/auth/login', data),
  forgotPassword: (email) => API.post('/api/auth/forgot-password', { email }),
};

// ─── Users ────────────────────────────────────────────────────────────────────
export const usersAPI = {
  getMe: () => API.get('/api/users/me'),
  updateMe: (data) => API.put('/api/users/me', data),
  listAll: () => API.get('/api/users/'),
  toggleActive: (id) => API.put(`/api/users/${id}/toggle-active`),
  delete: (id) => API.delete(`/api/users/${id}`),
};

// ─── Symptoms ─────────────────────────────────────────────────────────────────
export const symptomsAPI = {
  predict: (symptoms, language = 'en') => API.post('/api/symptoms/predict', { symptoms, language }),
  history: () => API.get('/api/symptoms/history'),
  allSymptoms: () => API.get('/api/symptoms/all-symptoms'),
};

// ─── Hospitals ────────────────────────────────────────────────────────────────
export const hospitalsAPI = {
  nearby: (lat, lon, radius = 5000) =>
    API.get('/api/hospitals/nearby', { params: { lat, lon, radius } }),
};

// ─── Family ───────────────────────────────────────────────────────────────────
export const familyAPI = {
  list: () => API.get('/api/family/'),
  add: (data) => API.post('/api/family/', data),
  update: (id, data) => API.put(`/api/family/${id}`, data),
  delete: (id) => API.delete(`/api/family/${id}`),
};

// ─── Appointments ─────────────────────────────────────────────────────────────
export const appointmentsAPI = {
  list: () => API.get('/api/appointments/'),
  create: (data) => API.post('/api/appointments/', data),
  cancel: (id) => API.put(`/api/appointments/${id}/cancel`),
  listAll: () => API.get('/api/appointments/all'),
  confirm: (id) => API.put(`/api/appointments/${id}/confirm`),
};

// ─── SOS ──────────────────────────────────────────────────────────────────────
export const sosAPI = {
  trigger: (data) => API.post('/api/sos/', data),
  myRequests: () => API.get('/api/sos/my-requests'),
  resolve: (id) => API.put(`/api/sos/${id}/resolve`),
  listAll: () => API.get('/api/sos/all'),
};

// ─── Medicines ────────────────────────────────────────────────────────────────
export const medicinesAPI = {
  list: () => API.get('/api/medicines/'),
  add: (data) => API.post('/api/medicines/', data),
  update: (id, data) => API.put(`/api/medicines/${id}`, data),
  delete: (id) => API.delete(`/api/medicines/${id}`),
  toggle: (id) => API.put(`/api/medicines/${id}/toggle`),
};

// ─── Chatbot ──────────────────────────────────────────────────────────────────
export const chatbotAPI = {
  sendMessage: (message, language = 'en', context = {}) =>
    API.post('/api/chatbot/message', { message, language, context }),
};

// ─── Health Tips ──────────────────────────────────────────────────────────────
export const healthTipsAPI = {
  list: (category) => API.get('/api/health-tips/', { params: category ? { category } : {} }),
  categories: () => API.get('/api/health-tips/categories'),
};

// ─── Admin ────────────────────────────────────────────────────────────────────
export const adminAPI = {
  stats: () => API.get('/api/admin/stats'),
  recentActivity: () => API.get('/api/admin/recent-activity'),
};

export default API;

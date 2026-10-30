import axios from 'axios';

// API base URL.
// - Local dev: leave VITE_API_URL unset → uses the relative '/api', which the
//   Vite dev server proxies to http://localhost:5000 (see vite.config.js).
// - Production (split hosting): set VITE_API_URL to the deployed backend's base,
//   e.g. 'https://your-api.onrender.com/api'.
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Token if available
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('cozy_journal_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle unauthorized responses
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if expired or invalid, unless on login/register route
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        localStorage.removeItem('cozy_journal_token');
        localStorage.removeItem('cozy_journal_user');
      }
    }
    return Promise.reject(error);
  }
);

// Auth Endpoints
export const authAPI = {
  register: (userData) => API.post('/auth/register', userData),
  login: (credentials) => API.post('/auth/login', credentials),
  getMe: () => API.get('/auth/me'),
  updateProfile: (userData) => API.put('/auth/me', userData),
};

// Journal Endpoints
export const journalAPI = {
  getEntries: (params) => API.get('/entries', { params }),
  getEntryById: (id) => API.get(`/entries/${id}`),
  createEntry: (entryData) => API.post('/entries', entryData),
  updateEntry: (id, entryData) => API.put(`/entries/${id}`, entryData),
  deleteEntry: (id) => API.delete(`/entries/${id}`),
  getTags: () => API.get('/entries/tags'),
  getStats: () => API.get('/entries/stats'),
};

// Planner Endpoints
export const plannerAPI = {
  getWeeklyPlanner: (date) => API.get(`/planner/week/${date || ''}`),
  getDailyPlanner: (date) => API.get(`/planner/day/${date}`),
  updateDailyPlanner: (date, data) => API.put(`/planner/day/${date}`, data),
  addTask: (date, data) => API.post(`/planner/day/${date}/task`, data),
  toggleTask: (date, taskId) => API.patch(`/planner/day/${date}/task/${taskId}/toggle`),
  deleteTask: (date, taskId) => API.delete(`/planner/day/${date}/task/${taskId}`),
  updateSelfCare: (date, data) => API.put(`/planner/week/${date}/self-care`, data),
};

export default API;

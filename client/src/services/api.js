import axios from 'axios';

// Ensure baseURL always resolves with a valid absolute HTTP/HTTPS protocol
const resolveBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) {
    if (envUrl.startsWith('http://') || envUrl.startsWith('https://')) {
      return envUrl;
    }
    return `https://${envUrl}`;
  }
  // Fallback depending on host environment
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    return 'https://nexus-api-ullk.onrender.com/api/v1';
  }
  return 'http://localhost:5000/api/v1';
};

const api = axios.create({
  baseURL: resolveBaseUrl(),
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor - attach Bearer token if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - handle 401 unauthorized gracefully
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect to login if the 401 happened on a protected route (not on public/optional routes)
    const isPublicUrl =
      error.config?.url?.includes('/auth/') ||
      (error.config?.url?.startsWith('/jobs') && error.config?.method === 'get');

    if (error.response?.status === 401 && !isPublicUrl) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

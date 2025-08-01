import axios from 'axios';

const API_BASE_URL = 'http://localhost:2025/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Attach token to every request if present
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Add a response interceptor to log all failed requests and handle token expiration
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      // Log failing request details
      console.error('[API ERROR]', {
        url: error.config && error.config.url,
        method: error.config && error.config.method,
        status: error.response.status,
        response: error.response.data
      });
      
      // Handle token expiration
      if (error.response.status === 401) {
        console.log('🔐 401 Unauthorized - token may be expired');
        const token = localStorage.getItem('token');
        if (token) {
          console.log('🗑️ Clearing expired token from localStorage');
          localStorage.removeItem('token');
          // Optionally redirect to login page
          if (window.location.pathname !== '/login') {
            console.log('🔄 Redirecting to login page due to expired token');
            window.location.href = '/login';
          }
        }
      }
    } else {
      console.error('[API ERROR - No Response]', error);
    }
    // Always reject to propagate error
    return Promise.reject(error);
  }
);

export default api;

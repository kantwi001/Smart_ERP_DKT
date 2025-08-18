import axios from 'axios';
import { Capacitor } from '@capacitor/core';

// Mobile-aware API base URL configuration
const getApiBaseUrl = () => {
  // Use production server for all platforms
  return 'https://erp.tarinnovation.com/api';
};

const API_BASE_URL = 'http://localhost:2025/api';

console.log('[API] Using production base URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Attach token to every request if present
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    } else {
      // Temporary debug: log requests without token
      console.warn('⚠️ API Request without token:', config.url);
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
        console.log(' 401 Unauthorized - token may be expired');
        
        // Clear expired token immediately
        localStorage.removeItem('token');
        
        // Dispatch custom event to notify AuthContext
        window.dispatchEvent(new CustomEvent('authTokenExpired', {
          detail: { message: 'Token expired, please login again' }
        }));
        
        // Redirect to login if not already there
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    } else if (error.request) {
      console.error('[API NETWORK ERROR]', {
        message: 'No response received from server',
        url: error.config && error.config.url,
        method: error.config && error.config.method
      });
    }
    
    return Promise.reject(error);
  }
);

export default api;

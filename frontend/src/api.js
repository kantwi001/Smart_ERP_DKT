import axios from 'axios';
import { Capacitor } from '@capacitor/core';

// Determine if we're running on mobile or web
const isMobile = typeof window !== 'undefined' && window.Capacitor;

// API Base URL - prioritize the new backend IP
const API_BASE_URL = isMobile 
  ? 'http://192.168.2.185:2025/api'  // Mobile apps connect to backend IP
  : 'http://192.168.2.185:2025/api'; // Web app also connects to backend IP

console.log('[API] Using backend URL:', API_BASE_URL);

// Enable API calls for mobile sync
const DISABLE_API_CALLS = false;

const createMockResponse = (data = []) => {
  return Promise.resolve({
    data: data,
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {}
  });
};

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Override axios methods to return mock data when API is disabled
if (DISABLE_API_CALLS) {
  console.log('[API] API calls disabled - using mock responses to prevent 404 errors');
  
  // List of authentication endpoints that should work normally
  const authEndpoints = ['/token/', '/users/me/', '/users/create/', '/users/system/settings/', '/users/system/smtp/', '/users/system/'];
  
  const isAuthEndpoint = (url) => {
    return authEndpoints.some(endpoint => url.includes(endpoint));
  };
  
  const originalGet = api.get.bind(api);
  const originalPost = api.post.bind(api);
  const originalPut = api.put.bind(api);
  const originalDelete = api.delete.bind(api);
  
  api.get = (url, config) => {
    if (isAuthEndpoint(url)) {
      console.log(`[API AUTH] GET ${url} - allowing real request`);
      return originalGet(url, config);
    }
    console.log(`[API MOCK] GET ${url} - returning empty array`);
    return createMockResponse([]);
  };
  
  api.post = (url, data, config) => {
    if (isAuthEndpoint(url)) {
      console.log(`[API AUTH] POST ${url} - allowing real request`);
      return originalPost(url, data, config);
    }
    console.log(`[API MOCK] POST ${url} - returning success response`);
    return createMockResponse({ success: true, message: 'Mock response' });
  };
  
  api.put = (url, data, config) => {
    if (isAuthEndpoint(url)) {
      console.log(`[API AUTH] PUT ${url} - allowing real request`);
      return originalPut(url, data, config);
    }
    console.log(`[API MOCK] PUT ${url} - returning success response`);
    return createMockResponse({ success: true, message: 'Mock response' });
  };
  
  api.delete = (url, config) => {
    if (isAuthEndpoint(url)) {
      console.log(`[API AUTH] DELETE ${url} - allowing real request`);
      return originalDelete(url, config);
    }
    console.log(`[API MOCK] DELETE ${url} - returning success response`);
    return createMockResponse({ success: true, message: 'Mock response' });
  };
  
  // Add interceptors for auth endpoints only
  api.interceptors.request.use(
    config => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      } else if (isAuthEndpoint(config.url)) {
        console.warn('⚠️ Auth API Request without token:', config.url);
      }
      return config;
    },
    error => Promise.reject(error)
  );

  api.interceptors.response.use(
    response => response,
    error => {
      if (error.response && isAuthEndpoint(error.config?.url)) {
        console.error('[API AUTH ERROR]', {
          url: error.config && error.config.url,
          method: error.config && error.config.method,
          status: error.response.status,
          response: error.response.data
        });
        
        if (error.response.status === 401) {
          console.log('🔒 401 Unauthorized - token may be expired');
          localStorage.removeItem('token');
          window.dispatchEvent(new CustomEvent('authTokenExpired', {
            detail: { message: 'Token expired, please login again' }
          }));
          
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }
      }
      
      return Promise.reject(error);
    }
  );
} else {
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
}

export default api;

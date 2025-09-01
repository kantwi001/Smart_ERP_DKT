import { Capacitor } from '@capacitor/core';
import { CapacitorHttp } from '@capacitor/core';

// Enhanced platform detection for proper backend routing
export const getApiBaseUrl = () => {
  // More precise mobile detection - only use Fly.dev for actual native apps
  const isNativePlatform = Capacitor.isNativePlatform && Capacitor.isNativePlatform();
  const platform = Capacitor.getPlatform();
  const isActualMobile = platform === 'ios' || platform === 'android';
  
  // Force Fly.dev ONLY for actual native mobile platforms
  if (isNativePlatform && isActualMobile) {
    console.log('🚀 NATIVE MOBILE DETECTED - Using Fly.dev backend');
    console.log('- Platform:', platform);
    return 'https://backend-shy-sun-4450.fly.dev';
  }
  
  // Web app (including web with Capacitor) uses localhost for development
  console.log('🌐 WEB DETECTED - Using localhost backend');
  console.log('- Platform:', platform);
  return 'http://localhost:2025';
};

const API_BASE_URL = getApiBaseUrl();

console.log('🔧 API Configuration:');
console.log('- Platform:', Capacitor.getPlatform());
console.log('- Native Platform:', Capacitor.isNativePlatform());
console.log('- Window Capacitor:', window.Capacitor !== undefined);
console.log('- FINAL API BASE URL:', API_BASE_URL);

// Enhanced HTTP client with better error handling for mobile
const httpClient = {
  defaults: {
    baseURL: API_BASE_URL
  },

  // Get token from storage for authentication
  getAuthToken() {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  },

  async request(config) {
    try {
      // Construct full URL by combining base URL with relative path
      const fullUrl = config.url.startsWith('http') ? config.url : `${API_BASE_URL}${config.url}`;
      
      // Add authentication header if token exists
      const token = this.getAuthToken();
      const headers = {
        ...config.headers
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      console.log('🌐 Making HTTP request:', {
        url: fullUrl,
        method: config.method,
        headers: headers,
        hasToken: !!token
      });

      let response;
      
      // Use CapacitorHttp for mobile platforms
      if (Capacitor.isNativePlatform && Capacitor.isNativePlatform()) {
        response = await CapacitorHttp.request({
          url: fullUrl,
          method: config.method,
          headers: headers,
          data: config.data,
          connectTimeout: 30000,
          readTimeout: 30000
        });
        
        console.log('✅ CapacitorHttp response:', {
          status: response.status,
          headers: response.headers,
          url: response.url
        });
        
        return {
          data: response.data,
          status: response.status,
          statusText: response.status >= 200 && response.status < 300 ? 'OK' : 'Error',
          headers: response.headers,
          config: { ...config, url: fullUrl }
        };
      } else {
        // Use fetch for web platforms
        const fetchConfig = {
          method: config.method,
          headers: headers
        };

        if (config.data) {
          console.log('🔍 Checking URL for Content-Type:', config.url);
          console.log('🔍 URL includes /token:', config.url.includes('/token'));
          
          if (config.url.includes('/token')) {
            console.log('📝 Using form data for token endpoint');
            fetchConfig.headers['Content-Type'] = 'application/x-www-form-urlencoded';
            fetchConfig.body = new URLSearchParams(config.data).toString();
            console.log('📝 Form body:', fetchConfig.body);
          } else {
            console.log('📝 Using JSON for regular endpoint');
            fetchConfig.headers['Content-Type'] = 'application/json';
            fetchConfig.body = JSON.stringify(config.data);
          }
        }

        response = await fetch(fullUrl, fetchConfig);
        
        console.log('✅ Fetch response:', {
          status: response.status,
          statusText: response.statusText,
          url: response.url
        });

        let data;
        try {
          const responseClone = response.clone();
          data = await responseClone.json();
        } catch (e) {
          data = await response.text();
        }

        if (!response.ok) {
          const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
          error.response = {
            data,
            status: response.status,
            statusText: response.statusText,
            headers: response.headers
          };
          throw error;
        }

        return {
          data,
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
          config: { ...config, url: fullUrl }
        };
      }
    } catch (error) {
      console.error('❌ HTTP request failed:', error);
      throw error;
    }
  },

  get(url, config = {}) {
    return this.request({ ...config, method: 'GET', url });
  },

  post(url, data, config = {}) {
    return this.request({ ...config, method: 'POST', url, data });
  },

  put(url, data, config = {}) {
    return this.request({ ...config, method: 'PUT', url, data });
  },

  delete(url, config = {}) {
    return this.request({ ...config, method: 'DELETE', url });
  }
};

export { API_BASE_URL, httpClient as default };

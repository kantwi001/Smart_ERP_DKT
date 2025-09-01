import React, { createContext, useState, useEffect } from 'react';
import api from './api';
import secureStorage from './utils/secureStorage';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Global system settings state
  const [systemSettings, setSystemSettings] = useState({
    smtp: {
      enabled: false,
      host: '',
      port: 587,
      username: '',
      password: '',
      useTLS: true,
      useSSL: false,
      fromEmail: '',
      fromName: 'ERP System',
    },
    general: {
      siteName: 'ERP System',
      maintenanceMode: false,
      registrationEnabled: true,
    },
    notifications: {
      emailNotifications: true,
      systemAlerts: true,
    }
  });

  // Fetch system settings (for superusers)
  const fetchSystemSettings = async () => {
    if (!token || !user?.is_superuser) return;
    
    try {
      const settingsRes = await api.get('/users/system/settings/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = settingsRes.data;
      
      setSystemSettings(prev => ({
        ...prev,
        smtp: {
          enabled: data.smtp_enabled === true,
          host: data.smtp_host || '',
          port: data.smtp_port || 587,
          username: data.smtp_username || '',
          password: data.smtp_password || '',
          useTLS: data.smtp_use_tls === true,
          useSSL: data.smtp_use_ssl === true,
          fromEmail: data.smtp_from_email || '',
          fromName: data.smtp_from_name || 'ERP System',
        },
        general: {
          siteName: data.site_name || 'ERP System',
          maintenanceMode: data.maintenance_mode || false,
          registrationEnabled: data.registration_enabled || true,
        },
        notifications: {
          emailNotifications: data.email_notifications || true,
          systemAlerts: data.system_alerts || true,
        }
      }));
      
      console.log(' Global system settings loaded:', {
        smtp_enabled: data.smtp_enabled === true,
        smtp_host: data.smtp_host
      });
      
    } catch (err) {
      console.warn('Failed to load system settings:', err);
    }
  };

  // Update system settings
  const updateSystemSettings = async (settingsType, settingsData) => {
    if (!token || !user?.is_superuser) return false;
    
    try {
      await api.put('/users/system/settings/', settingsData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Refresh settings after update
      await fetchSystemSettings();
      
      console.log(`✅ ${settingsType} settings updated successfully`);
      return true;
    } catch (err) {
      console.error(`Failed to update ${settingsType} settings:`, err);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
      return false;
    }
  };

  // Initialize authentication state from secure storage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = await secureStorage.getAuthToken();
        const storedUser = await secureStorage.getUserData();
        const rememberLogin = await secureStorage.getRememberLogin();

        if (storedToken && rememberLogin) {
          setToken(storedToken);
          
          // Validate token with server
          try {
            const userRes = await api.get('/api/users/me/', {   
              headers: { Authorization: `Bearer ${storedToken}` } 
            });
            setUser(userRes.data);
            
            // Update stored user data if it changed
            if (JSON.stringify(storedUser) !== JSON.stringify(userRes.data)) {
              await secureStorage.setUserData(userRes.data);
            }
          } catch (err) {
            console.log('Stored token validation failed:', err.response?.status);
            if (err.response?.status === 401) {
              console.log('Stored token expired, clearing authentication');
              await secureStorage.clearAuthData();
              setToken(null);
              setUser(null);
            } else {
              console.log('Token validation error (non-401):', err.message);
              setError('Failed to validate user session');
            }
          }
        }
      } catch (err) {
        console.error('Error initializing auth:', err);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  useEffect(() => {
    if (token && !user) {
      api.get('/api/users/me/', { headers: { Authorization: `Bearer ${token}` } })
        .then(res => {
          console.log('[AuthContext] Fetching user profile with token');
          console.log('[AuthContext] User profile request headers:', res.config.headers);
          console.log('[AuthContext] User profile request URL:', res.config.url);
          console.log('[AuthContext] User profile response status:', res.status);
          console.log('[AuthContext] User profile response:', res.data);
          setUser(res.data);
          // Load system settings if user is superuser
          if (res.data?.is_superuser) {
            fetchSystemSettings();
          }
        })
        .catch(err => {
          console.log('Token validation failed:', err.response?.status);
          if (err.response?.status === 401) {
            console.log('Token expired, clearing authentication');
            // Clear expired token
            setToken(null);
            setUser(null);
            secureStorage.clearAuthData();
          } else {
            // For other errors, don't clear the token - just log the error
            console.log('Token validation error (non-401):', err.message);
            setError('Failed to validate user session');
          }
        });
    }
  }, [token]);

  // Listen for token expiration events from API interceptor
  useEffect(() => {
    const handleTokenExpired = async (event) => {
      console.log(' AuthContext: Token expired event received');
      setToken(null);
      setUser(null);
      setError('Your session has expired. Please login again.');
      await secureStorage.clearAuthData();
    };

    window.addEventListener('authTokenExpired', handleTokenExpired);

    return () => {
      window.removeEventListener('authTokenExpired', handleTokenExpired);
    };
  }, []);

  // Listen for user profile updates (e.g., department changes)
  useEffect(() => {
    const handleUserProfileUpdate = async (event) => {
      console.log(' AuthContext: User profile updated event received', event.detail);
      const updatedUser = event.detail;
      
      // Update the user state with new profile information
      setUser(updatedUser);
      
      // Update stored user data
      await secureStorage.setUserData(updatedUser);
      
      console.log(` AuthContext: User profile updated - Department: ${updatedUser.department_name}`);
    };

    // Add event listener for user profile updates
    window.addEventListener('userProfileUpdated', handleUserProfileUpdate);

    // Cleanup event listener on unmount
    return () => {
      window.removeEventListener('userProfileUpdated', handleUserProfileUpdate);
    };
  }, []);

  useEffect(() => {
    console.log('AuthContext user:', user, 'token:', token, 'error:', error);
  }, [user, token, error]);

  const login = async (username, password, rememberMe = true) => {
    setLoading(true);
    setError(null);
    console.log('[AuthContext] Starting login for username:', username);
    console.log('[AuthContext] API Base URL:', api.defaults.baseURL);
    
    try {
      console.log('[AuthContext] Sending login request to /api/token/');
      const response = await api.post('/api/token/', { username, password });
      console.log('[AuthContext] Login response:', response.data);
      
      const token = response.data.access;
      setToken(token);
      
      // Store token immediately so API client can access it
      localStorage.setItem('token', token);
      
      // Wait for token to be set, then fetch user profile
      console.log('[AuthContext] Fetching user profile with token');
      try {
        const userRes = await api.get('/api/users/me/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('[AuthContext] User profile response:', userRes.data);
        
        setUser(userRes.data);
        
        // Load system settings if user is superuser
        if (userRes.data?.is_superuser) {
          await fetchSystemSettings();
        }
        
        // Store authentication data securely
        await secureStorage.setAuthToken(token);
        await secureStorage.setUserData(userRes.data);
        await secureStorage.setRememberLogin(rememberMe);
        
        console.log('[AuthContext] Login successful');
      } catch (userErr) {
        console.error('[AuthContext] User profile fetch failed:', userErr);
        console.error('[AuthContext] User error response:', userErr.response?.data);
        console.error('[AuthContext] User error status:', userErr.response?.status);
        
        // Still set the token but show error
        setError('Failed to load user profile');
      }
    } catch (err) {
      console.error('[AuthContext] Login error:', err);
      console.error('[AuthContext] Error response:', err.response?.data);
      console.error('[AuthContext] Error status:', err.response?.status);
      setError('Invalid credentials');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const register = async (data) => {
    setLoading(true);
    setError(null);
    try {
      await api.post('/users/register/', data);
      await login(data.username, data.password);
    } catch (err) {
      setError('Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setToken(null);
    setUser(null);
    
    // Reset system settings to defaults
    setSystemSettings({
      smtp: {
        enabled: false,
        host: '',
        port: 587,
        username: '',
        password: '',
        useTLS: true,
        useSSL: false,
        fromEmail: '',
        fromName: 'ERP System',
      },
      general: {
        siteName: 'ERP System',
        maintenanceMode: false,
        registrationEnabled: true,
      },
      notifications: {
        emailNotifications: true,
        systemAlerts: true,
      }
    });
    
    // Clear all stored authentication data
    await secureStorage.clearAuthData();
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      loading, 
      error, 
      login, 
      register, 
      logout,
      systemSettings,
      fetchSystemSettings,
      updateSystemSettings
    }}>
      {children}
    </AuthContext.Provider>
  );
};

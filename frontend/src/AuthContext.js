import React, { createContext, useState, useEffect } from 'react';
import api from './api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (token && !user) {
      api.get('/users/me/', { headers: { Authorization: `Bearer ${token}` } })
        .then(res => setUser(res.data))
        .catch(err => {
          console.log('Token validation failed:', err.response?.status);
          if (err.response?.status === 401) {
            console.log('Token expired, clearing authentication');
            // Clear expired token
            setToken(null);
            setUser(null);
            localStorage.removeItem('token');
          }
        });
    }
  }, [token]);

  // Listen for token expiration events from API interceptor
  useEffect(() => {
    const handleTokenExpired = (event) => {
      console.log(' AuthContext: Token expired event received');
      setToken(null);
      setUser(null);
      setError('Your session has expired. Please login again.');
    };

    window.addEventListener('authTokenExpired', handleTokenExpired);

    return () => {
      window.removeEventListener('authTokenExpired', handleTokenExpired);
    };
  }, []);

  // Listen for user profile updates (e.g., department changes)
  useEffect(() => {
    const handleUserProfileUpdate = (event) => {
      console.log(' AuthContext: User profile updated event received', event.detail);
      const updatedUser = event.detail;
      
      // Update the user state with new profile information
      setUser(updatedUser);
      
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

  const login = async (username, password) => {
    setLoading(true);
    setError(null);
    console.log('[AuthContext] Starting login for username:', username);
    console.log('[AuthContext] API Base URL:', api.defaults.baseURL);
    
    try {
      console.log('[AuthContext] Sending login request to /token/');
      const res = await api.post('/token/', { username, password });
      console.log('[AuthContext] Login response:', res.data);
      
      setToken(res.data.access);
      localStorage.setItem('token', res.data.access);
      
      console.log('[AuthContext] Fetching user profile with token');
      const userRes = await api.get('/users/me/', { headers: { Authorization: `Bearer ${res.data.access}` } });
      console.log('[AuthContext] User profile response:', userRes.data);
      
      setUser(userRes.data);
      console.log('[AuthContext] Login successful');
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

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, error, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

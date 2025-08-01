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

  useEffect(() => {
    console.log('AuthContext user:', user, 'token:', token, 'error:', error);
  }, [user, token, error]);

  const login = async (username, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/token/', { username, password });
      setToken(res.data.access);
      localStorage.setItem('token', res.data.access);
      const userRes = await api.get('/users/me/', { headers: { Authorization: `Bearer ${res.data.access}` } });
      setUser(userRes.data);
    } catch (err) {
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

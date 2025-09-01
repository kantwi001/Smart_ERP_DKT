#!/bin/bash

echo "🔧 Fixing Mobile App Authentication Issues"
echo "========================================="

# Navigate to project root
cd /Users/kwadwoantwi/CascadeProjects/erp-system

echo "1️⃣ Updating mobile authentication storage..."

# Update AuthContext to use Capacitor Storage for mobile
cat > frontend/src/contexts/AuthContext.js << 'EOF'
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';
import api from '../api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Storage functions for mobile/web compatibility
  const getStorageItem = async (key) => {
    if (Capacitor.isNativePlatform()) {
      const { value } = await Preferences.get({ key });
      return value;
    } else {
      return localStorage.getItem(key);
    }
  };

  const setStorageItem = async (key, value) => {
    if (Capacitor.isNativePlatform()) {
      await Preferences.set({ key, value });
    } else {
      localStorage.setItem(key, value);
    }
  };

  const removeStorageItem = async (key) => {
    if (Capacitor.isNativePlatform()) {
      await Preferences.remove({ key });
    } else {
      localStorage.removeItem(key);
    }
  };

  // Load stored authentication data on app start
  useEffect(() => {
    const loadStoredAuth = async () => {
      try {
        console.log('🔄 Loading stored authentication...');
        const storedToken = await getStorageItem('token');
        const storedUser = await getStorageItem('user');
        
        console.log('📱 Stored token:', storedToken ? 'Found' : 'Not found');
        console.log('📱 Stored user:', storedUser ? 'Found' : 'Not found');

        if (storedToken && storedUser) {
          const userData = JSON.parse(storedUser);
          setToken(storedToken);
          setUser(userData);
          console.log('✅ Authentication restored:', userData.username);
        } else {
          console.log('❌ No stored authentication found');
        }
      } catch (error) {
        console.error('❌ Error loading stored auth:', error);
        setError('Failed to load authentication');
      } finally {
        setLoading(false);
      }
    };

    loadStoredAuth();
  }, []);

  const login = async (username, password, rememberMe = false) => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔐 Starting login for:', username);

      const response = await api.post('/token/', {
        username,
        password,
      });

      const { access, refresh, user: userData } = response.data;
      
      console.log('✅ Login successful:', userData.username);
      console.log('👤 User role:', userData.role || 'No role');
      console.log('🏢 Department:', userData.department_name || 'No department');

      // Store authentication data
      await setStorageItem('token', access);
      await setStorageItem('refresh_token', refresh);
      await setStorageItem('user', JSON.stringify(userData));

      setToken(access);
      setUser(userData);

      return { success: true, user: userData };
    } catch (error) {
      console.error('❌ Login failed:', error);
      const errorMessage = error.response?.data?.detail || 'Login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      console.log('🚪 Logging out...');
      
      // Clear storage
      await removeStorageItem('token');
      await removeStorageItem('refresh_token');
      await removeStorageItem('user');

      // Clear state
      setToken(null);
      setUser(null);
      setError(null);

      console.log('✅ Logout completed');
    } catch (error) {
      console.error('❌ Logout error:', error);
    }
  };

  const value = {
    user,
    token,
    loading,
    error,
    login,
    logout,
    isAuthenticated: !!token && !!user,
    isSalesUser: user?.role === 'sales' || user?.department_name?.toLowerCase().includes('sales'),
  };

  console.log('🔍 AuthContext state:', {
    user: user?.username || 'null',
    token: token ? 'present' : 'null',
    isAuthenticated: value.isAuthenticated,
    isSalesUser: value.isSalesUser,
    loading
  });

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
EOF

echo "2️⃣ Updating mobile app component for better user detection..."

# Update MobileApp.js to handle authentication properly
cat > frontend/src/components/MobileApp.js << 'EOF'
import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Login from './Login';
import SalesDashboard from './SalesDashboard';
import InventoryDashboard from './InventoryDashboard';
import WarehouseDashboard from './WarehouseDashboard';
import './MobileApp.css';

const MobileApp = () => {
  const { user, isAuthenticated, isSalesUser, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('sales');

  useEffect(() => {
    console.log('📱 MobileApp - Auth state changed:', {
      isAuthenticated,
      user: user?.username,
      isSalesUser,
      loading
    });

    if (!loading) {
      if (!isAuthenticated) {
        console.log('🔐 Not authenticated - redirecting to login');
        navigate('/login');
      } else if (location.pathname === '/login') {
        console.log('✅ Authenticated - redirecting to dashboard');
        navigate('/');
      }
    }
  }, [isAuthenticated, loading, navigate, location.pathname]);

  if (loading) {
    return (
      <div className="mobile-loading">
        <div className="loading-spinner"></div>
        <p>Loading Smart ERP...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="*" element={<Login />} />
      </Routes>
    );
  }

  console.log('👤 User role check:', {
    user: user?.username,
    role: user?.role,
    department: user?.department_name,
    isSalesUser
  });

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    console.log('📱 Tab changed to:', tab);
  };

  return (
    <div className="mobile-app">
      <div className="mobile-header">
        <h1>Smart ERP</h1>
        <div className="user-info">
          <span>{user?.first_name || user?.username}</span>
          <span className="user-role">
            {isSalesUser ? 'Sales' : user?.department_name || 'Employee'}
          </span>
        </div>
      </div>

      <div className="mobile-content">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={
            <div className="dashboard-container">
              {isSalesUser ? (
                <div className="sales-modules">
                  <div className="tab-navigation">
                    <button 
                      className={activeTab === 'sales' ? 'active' : ''}
                      onClick={() => handleTabChange('sales')}
                    >
                      Sales
                    </button>
                    <button 
                      className={activeTab === 'inventory' ? 'active' : ''}
                      onClick={() => handleTabChange('inventory')}
                    >
                      Inventory
                    </button>
                    <button 
                      className={activeTab === 'warehouse' ? 'active' : ''}
                      onClick={() => handleTabChange('warehouse')}
                    >
                      Warehouse
                    </button>
                  </div>
                  
                  <div className="tab-content">
                    {activeTab === 'sales' && <SalesDashboard />}
                    {activeTab === 'inventory' && <InventoryDashboard />}
                    {activeTab === 'warehouse' && <WarehouseDashboard />}
                  </div>
                </div>
              ) : (
                <div className="employee-modules">
                  <h2>Employee Dashboard</h2>
                  <div className="module-grid">
                    <div className="module-card" onClick={() => handleTabChange('inventory')}>
                      <h3>Inventory</h3>
                      <p>View inventory levels</p>
                    </div>
                    <div className="module-card" onClick={() => handleTabChange('warehouse')}>
                      <h3>Warehouse</h3>
                      <p>Warehouse operations</p>
                    </div>
                  </div>
                  
                  {activeTab === 'inventory' && <InventoryDashboard />}
                  {activeTab === 'warehouse' && <WarehouseDashboard />}
                </div>
              )}
            </div>
          } />
        </Routes>
      </div>
    </div>
  );
};

export default MobileApp;
EOF

echo "3️⃣ Rebuilding mobile app with authentication fixes..."

cd frontend

# Build React app
echo "   ⚛️  Building React app..."
npm run build

# Sync with Capacitor
echo "   🔄 Syncing with Capacitor..."
npx cap sync

# Copy assets
echo "   📁 Copying assets..."
npx cap copy

echo ""
echo "4️⃣ Building updated APK..."
cd android
./gradlew assembleDebug

if [ $? -eq 0 ]; then
    TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
    APK_NAME="SmartERP-AuthFixed-${TIMESTAMP}.apk"
    cp app/build/outputs/apk/debug/app-debug.apk "../${APK_NAME}"
    echo "✅ APK built with auth fixes: ${APK_NAME}"
else
    echo "❌ APK build failed"
fi

cd ../..

echo ""
echo "🎉 Mobile app authentication issues fixed!"
echo "🔧 Changes made:"
echo "   • Fixed Capacitor Preferences storage for mobile"
echo "   • Enhanced user role detection"
echo "   • Improved authentication state management"
echo "   • Better error handling and logging"
echo ""
echo "📱 Test the new APK with login credentials:"
echo "   Username: arkucollins@gmail.com"
echo "   Password: admin123"

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

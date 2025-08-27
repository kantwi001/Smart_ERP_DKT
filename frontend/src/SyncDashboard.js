import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Alert,
  Grid,
  IconButton,
  Divider
} from '@mui/material';
import SyncIcon from '@mui/icons-material/Sync';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import WifiIcon from '@mui/icons-material/Wifi';
import WifiOffIcon from '@mui/icons-material/WifiOff';
import StorageIcon from '@mui/icons-material/Storage';
import api from './api';

const SyncDashboard = () => {
  const [syncStatus, setSyncStatus] = useState({
    isOnline: navigator.onLine,
    lastSync: null,
    syncing: false,
    progress: 0
  });
  
  const [syncHistory, setSyncHistory] = useState([]);
  const [pendingChanges, setPendingChanges] = useState({
    salesOrders: 0,
    customers: 0,
    payments: 0
  });

  useEffect(() => {
    checkNetworkStatus();
    loadSyncHistory();
    loadPendingChanges();

    // Listen for network changes
    const updateOnlineStatus = () => {
      setSyncStatus(prev => ({ ...prev, isOnline: navigator.onLine }));
    };

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    // Listen for mobile sync events
    const handleMobileSync = (event) => {
      handleAutoSync();
    };

    window.addEventListener('mobileSync', handleMobileSync);
    
    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
      window.removeEventListener('mobileSync', handleMobileSync);
    };
  }, []);

  const checkNetworkStatus = () => {
    setSyncStatus(prev => ({ ...prev, isOnline: navigator.onLine }));
  };

  const loadSyncHistory = () => {
    const history = JSON.parse(localStorage.getItem('syncHistory') || '[]');
    setSyncHistory(history.slice(0, 10)); // Show last 10 syncs
  };

  const loadPendingChanges = () => {
    const pending = {
      salesOrders: JSON.parse(localStorage.getItem('pendingSalesOrders') || '[]').length,
      customers: JSON.parse(localStorage.getItem('pendingCustomers') || '[]').length,
      payments: JSON.parse(localStorage.getItem('pendingPayments') || '[]').length
    };
    setPendingChanges(pending);
  };

  const addSyncRecord = (type, status, details = '') => {
    const record = {
      id: Date.now(),
      type,
      status,
      details,
      timestamp: new Date().toISOString()
    };

    const history = JSON.parse(localStorage.getItem('syncHistory') || '[]');
    history.unshift(record);
    localStorage.setItem('syncHistory', JSON.stringify(history.slice(0, 50)));
    loadSyncHistory();
  };

  const handleManualSync = async () => {
    if (!syncStatus.isOnline) {
      addSyncRecord('manual', 'failed', 'No internet connection');
      return;
    }

    setSyncStatus(prev => ({ ...prev, syncing: true, progress: 0 }));

    try {
      // Sync sales orders
      setSyncStatus(prev => ({ ...prev, progress: 25 }));
      await syncSalesOrders();

      // Sync customers
      setSyncStatus(prev => ({ ...prev, progress: 50 }));
      await syncCustomers();

      // Sync payments
      setSyncStatus(prev => ({ ...prev, progress: 75 }));
      await syncPayments();

      // Complete sync
      setSyncStatus(prev => ({ 
        ...prev, 
        progress: 100,
        lastSync: new Date().toISOString(),
        syncing: false 
      }));

      addSyncRecord('manual', 'success', 'All data synchronized successfully');
      loadPendingChanges();

      // Emit sync completion event
      window.dispatchEvent(new CustomEvent('syncCompleted', {
        detail: { timestamp: new Date().toISOString() }
      }));

    } catch (error) {
      console.error('Sync failed:', error);
      setSyncStatus(prev => ({ ...prev, syncing: false, progress: 0 }));
      addSyncRecord('manual', 'failed', error.message);
    }
  };

  const handleAutoSync = async () => {
    if (!syncStatus.isOnline || syncStatus.syncing) return;

    setSyncStatus(prev => ({ ...prev, syncing: true }));

    try {
      await syncSalesOrders();
      await syncCustomers();
      await syncPayments();

      setSyncStatus(prev => ({ 
        ...prev, 
        lastSync: new Date().toISOString(),
        syncing: false 
      }));

      addSyncRecord('auto', 'success', 'Background sync completed');
      loadPendingChanges();

    } catch (error) {
      console.error('Auto-sync failed:', error);
      setSyncStatus(prev => ({ ...prev, syncing: false }));
      addSyncRecord('auto', 'failed', error.message);
    }
  };

  const syncSalesOrders = async () => {
    const pendingOrders = JSON.parse(localStorage.getItem('pendingSalesOrders') || '[]');
    
    for (const order of pendingOrders) {
      try {
        await api.post('/sales/sales-orders/', order);
      } catch (error) {
        console.error('Failed to sync sales order:', error);
        throw error;
      }
    }

    // Clear pending orders after successful sync
    localStorage.setItem('pendingSalesOrders', '[]');
  };

  const syncCustomers = async () => {
    const pendingCustomers = JSON.parse(localStorage.getItem('pendingCustomers') || '[]');
    
    for (const customer of pendingCustomers) {
      try {
        await api.post('/sales/customers/', customer);
      } catch (error) {
        console.error('Failed to sync customer:', error);
        throw error;
      }
    }

    localStorage.setItem('pendingCustomers', '[]');
  };

  const syncPayments = async () => {
    const pendingPayments = JSON.parse(localStorage.getItem('pendingPayments') || '[]');
    
    for (const payment of pendingPayments) {
      try {
        await api.post('/sales/payments/', payment);
      } catch (error) {
        console.error('Failed to sync payment:', error);
        throw error;
      }
    }

    localStorage.setItem('pendingPayments', '[]');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'success';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return <CheckCircleIcon />;
      case 'failed': return <ErrorIcon />;
      default: return <SyncIcon />;
    }
  };

  const totalPendingChanges = pendingChanges.salesOrders + pendingChanges.customers + pendingChanges.payments;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#FF9800' }}>
        Data Synchronization
      </Typography>

      {/* Connection Status */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            {syncStatus.isOnline ? (
              <WifiIcon sx={{ color: 'green', mr: 1 }} />
            ) : (
              <WifiOffIcon sx={{ color: 'red', mr: 1 }} />
            )}
            <Typography variant="h6">
              {syncStatus.isOnline ? 'Online' : 'Offline'}
            </Typography>
          </Box>

          {syncStatus.lastSync && (
            <Typography variant="body2" color="textSecondary">
              Last sync: {new Date(syncStatus.lastSync).toLocaleString()}
            </Typography>
          )}

          {syncStatus.syncing && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" gutterBottom>
                Synchronizing data...
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={syncStatus.progress} 
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Sync Actions */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <CloudUploadIcon sx={{ fontSize: 48, color: '#FF9800', mb: 1 }} />
              <Typography variant="h6" gutterBottom>
                Manual Sync
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                Sync all pending changes to server
              </Typography>
              <Button
                variant="contained"
                startIcon={<SyncIcon />}
                onClick={handleManualSync}
                disabled={!syncStatus.isOnline || syncStatus.syncing}
                sx={{ bgcolor: '#FF9800', '&:hover': { bgcolor: '#F57C00' } }}
              >
                Sync Now
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <StorageIcon sx={{ fontSize: 48, color: '#2196F3', mb: 1 }} />
              <Typography variant="h6" gutterBottom>
                Pending Changes
              </Typography>
              <Typography variant="h4" color="primary" sx={{ mb: 1 }}>
                {totalPendingChanges}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Items waiting to sync
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Pending Changes Details */}
      {totalPendingChanges > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Pending Changes
            </Typography>
            <List>
              {pendingChanges.salesOrders > 0 && (
                <ListItem>
                  <ListItemIcon>
                    <CloudUploadIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Sales Orders"
                    secondary={`${pendingChanges.salesOrders} orders waiting to sync`}
                  />
                  <Chip label={pendingChanges.salesOrders} color="warning" />
                </ListItem>
              )}
              {pendingChanges.customers > 0 && (
                <ListItem>
                  <ListItemIcon>
                    <CloudUploadIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Customers"
                    secondary={`${pendingChanges.customers} customers waiting to sync`}
                  />
                  <Chip label={pendingChanges.customers} color="warning" />
                </ListItem>
              )}
              {pendingChanges.payments > 0 && (
                <ListItem>
                  <ListItemIcon>
                    <CloudUploadIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Payments"
                    secondary={`${pendingChanges.payments} payments waiting to sync`}
                  />
                  <Chip label={pendingChanges.payments} color="warning" />
                </ListItem>
              )}
            </List>
          </CardContent>
        </Card>
      )}

      {/* Sync History */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Sync History
          </Typography>
          {syncHistory.length === 0 ? (
            <Alert severity="info">No sync history available</Alert>
          ) : (
            <List>
              {syncHistory.map((record, index) => (
                <React.Fragment key={record.id}>
                  <ListItem>
                    <ListItemIcon>
                      {getStatusIcon(record.status)}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body1">
                            {record.type === 'manual' ? 'Manual Sync' : 'Auto Sync'}
                          </Typography>
                          <Chip 
                            label={record.status} 
                            size="small" 
                            color={getStatusColor(record.status)}
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="textSecondary">
                            {new Date(record.timestamp).toLocaleString()}
                          </Typography>
                          {record.details && (
                            <Typography variant="body2" color="textSecondary">
                              {record.details}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < syncHistory.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default SyncDashboard;

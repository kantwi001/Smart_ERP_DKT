import React, { useState, useEffect, useCallback } from 'react';
import { Box, Chip, Typography } from '@mui/material';
import { Capacitor } from '@capacitor/core';
import { Network } from '@capacitor/network';
import WifiIcon from '@mui/icons-material/Wifi';
import WifiOffIcon from '@mui/icons-material/WifiOff';
import SyncIcon from '@mui/icons-material/Sync';
import api from '../api';

const NetworkSync = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [lastSync, setLastSync] = useState(null);
  const [syncStatus, setSyncStatus] = useState('idle'); // idle, syncing, success, error
  const [pendingTransactions, setPendingTransactions] = useState(0);

  // Check network status
  const checkNetworkStatus = useCallback(async () => {
    if (Capacitor.isNativePlatform()) {
      try {
        const status = await Network.getStatus();
        setIsOnline(status.connected);
        return status.connected;
      } catch (error) {
        console.error('Error checking network status:', error);
        return navigator.onLine;
      }
    } else {
      return navigator.onLine;
    }
  }, []);

  // Sync pending transactions to backend
  const syncPendingData = useCallback(async () => {
    if (!isOnline) return;

    setSyncStatus('syncing');
    
    try {
      // Get pending transactions from localStorage
      const pendingTransactions = JSON.parse(localStorage.getItem('pendingTransactions') || '[]');
      const pendingCustomers = JSON.parse(localStorage.getItem('pendingCustomers') || '[]');
      const pendingProducts = JSON.parse(localStorage.getItem('pendingProducts') || '[]');
      
      let syncCount = 0;

      // Sync transactions
      for (const transaction of pendingTransactions) {
        try {
          await api.post('/api/transactions/', transaction);
          syncCount++;
        } catch (error) {
          console.error('Failed to sync transaction:', error);
        }
      }

      // Sync customers
      for (const customer of pendingCustomers) {
        try {
          await api.post('/api/customers/', customer);
          syncCount++;
        } catch (error) {
          console.error('Failed to sync customer:', error);
        }
      }

      // Sync products
      for (const product of pendingProducts) {
        try {
          await api.post('/api/products/', product);
          syncCount++;
        } catch (error) {
          console.error('Failed to sync product:', error);
        }
      }

      // Clear synced data
      if (syncCount > 0) {
        localStorage.removeItem('pendingTransactions');
        localStorage.removeItem('pendingCustomers');
        localStorage.removeItem('pendingProducts');
        setPendingTransactions(0);
      }

      setLastSync(new Date());
      setSyncStatus('success');
      
      // Dispatch sync event
      window.dispatchEvent(new CustomEvent('dataSynced', {
        detail: { syncCount, timestamp: new Date() }
      }));

    } catch (error) {
      console.error('Sync failed:', error);
      setSyncStatus('error');
    }

    // Reset status after 3 seconds
    setTimeout(() => setSyncStatus('idle'), 3000);
  }, [isOnline]);

  // Update pending transactions count
  const updatePendingCount = useCallback(() => {
    const pending = [
      ...(JSON.parse(localStorage.getItem('pendingTransactions') || '[]')),
      ...(JSON.parse(localStorage.getItem('pendingCustomers') || '[]')),
      ...(JSON.parse(localStorage.getItem('pendingProducts') || '[]'))
    ];
    setPendingTransactions(pending.length);
  }, []);

  // Initialize network monitoring
  useEffect(() => {
    const initializeNetwork = async () => {
      const status = await checkNetworkStatus();
      setIsOnline(status);

      if (Capacitor.isNativePlatform()) {
        // Listen for network changes on mobile
        Network.addListener('networkStatusChange', (status) => {
          setIsOnline(status.connected);
          if (status.connected) {
            // Auto-sync when network comes back
            setTimeout(syncPendingData, 1000);
          }
        });
      } else {
        // Listen for network changes on web
        const handleOnline = () => {
          setIsOnline(true);
          setTimeout(syncPendingData, 1000);
        };
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
          window.removeEventListener('online', handleOnline);
          window.removeEventListener('offline', handleOffline);
        };
      }
    };

    initializeNetwork();
    updatePendingCount();
  }, [checkNetworkStatus, syncPendingData, updatePendingCount]);

  // Auto-sync every 10 seconds when online
  useEffect(() => {
    if (!isOnline) return;

    const syncInterval = setInterval(() => {
      syncPendingData();
    }, 10000); // 10 seconds

    return () => clearInterval(syncInterval);
  }, [isOnline, syncPendingData]);

  // Listen for new offline data
  useEffect(() => {
    const handleOfflineData = () => updatePendingCount();
    
    window.addEventListener('offlineDataAdded', handleOfflineData);
    return () => window.removeEventListener('offlineDataAdded', handleOfflineData);
  }, [updatePendingCount]);

  const getStatusColor = () => {
    if (!isOnline) return 'error';
    if (syncStatus === 'syncing') return 'warning';
    if (syncStatus === 'success') return 'success';
    if (syncStatus === 'error') return 'error';
    return 'success';
  };

  const getStatusText = () => {
    if (!isOnline) return 'Offline';
    if (syncStatus === 'syncing') return 'Syncing...';
    if (syncStatus === 'success') return 'Synced';
    if (syncStatus === 'error') return 'Sync Error';
    return 'Online';
  };

  const getStatusIcon = () => {
    if (!isOnline) return <WifiOffIcon />;
    if (syncStatus === 'syncing') return <SyncIcon className="rotating" />;
    return <WifiIcon />;
  };

  return (
    <Box display="flex" alignItems="center" gap={1}>
      <Chip
        icon={getStatusIcon()}
        label={getStatusText()}
        color={getStatusColor()}
        size="small"
        sx={{
          '& .rotating': {
            animation: 'spin 1s linear infinite',
          },
          '@keyframes spin': {
            '0%': { transform: 'rotate(0deg)' },
            '100%': { transform: 'rotate(360deg)' },
          },
        }}
      />
      
      {pendingTransactions > 0 && (
        <Chip
          label={`${pendingTransactions} pending`}
          color="warning"
          size="small"
        />
      )}
      
      {lastSync && (
        <Typography variant="caption" color="text.secondary">
          Last sync: {lastSync.toLocaleTimeString()}
        </Typography>
      )}
    </Box>
  );
};

export default NetworkSync;

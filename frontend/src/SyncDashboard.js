import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  LinearProgress,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Alert,
  Divider,
  CircularProgress
} from '@mui/material';
import {
  Sync as SyncIcon,
  CloudSync as CloudSyncIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Refresh as RefreshIcon,
  Storage as StorageIcon,
  NetworkCheck as NetworkCheckIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { AuthContext } from './AuthContext';
import { MOBILE_CONFIG } from './mobile_app_config';

const SyncDashboard = () => {
  const { token } = useContext(AuthContext);
  const [syncStatus, setSyncStatus] = useState({
    isOnline: navigator.onLine,
    lastSync: localStorage.getItem('lastSync'),
    syncing: false,
    autoSync: true,
    syncQueue: [],
    errors: []
  });
  
  const [syncStats, setSyncStats] = useState({
    totalSyncs: 0,
    successfulSyncs: 0,
    failedSyncs: 0,
    dataSize: 0
  });

  const [modules, setModules] = useState([
    { name: 'Users', endpoint: '/users/', lastSync: null, status: 'pending', records: 0 },
    { name: 'Sales Orders', endpoint: '/sales/sales-orders/', lastSync: null, status: 'pending', records: 0 },
    { name: 'Customers', endpoint: '/sales/customers/', lastSync: null, status: 'pending', records: 0 },
    { name: 'Products', endpoint: '/inventory/products/', lastSync: null, status: 'pending', records: 0 },
    { name: 'Warehouses', endpoint: '/warehouse/', lastSync: null, status: 'pending', records: 0 }
  ]);

  useEffect(() => {
    // Network status monitoring
    const handleOnline = () => setSyncStatus(prev => ({ ...prev, isOnline: true }));
    const handleOffline = () => setSyncStatus(prev => ({ ...prev, isOnline: false }));
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Listen for sync events
    const handleSyncEvent = (event) => {
      console.log('Sync event received:', event.detail);
      if (event.detail.status === 'success') {
        setSyncStatus(prev => ({
          ...prev,
          lastSync: event.detail.timestamp,
          syncing: false
        }));
      }
    };

    const handleSyncError = (event) => {
      console.log('Sync error:', event.detail);
      setSyncStatus(prev => ({
        ...prev,
        syncing: false,
        errors: [...prev.errors, event.detail]
      }));
    };

    window.addEventListener('mobileSync', handleSyncEvent);
    window.addEventListener('mobileSyncError', handleSyncError);

    // Load sync stats from localStorage
    loadSyncStats();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('mobileSync', handleSyncEvent);
      window.removeEventListener('mobileSyncError', handleSyncError);
    };
  }, []);

  const loadSyncStats = () => {
    const stats = localStorage.getItem('syncStats');
    if (stats) {
      setSyncStats(JSON.parse(stats));
    }
  };

  const saveSyncStats = (newStats) => {
    localStorage.setItem('syncStats', JSON.stringify(newStats));
    setSyncStats(newStats);
  };

  const syncModule = async (module) => {
    try {
      const response = await fetch(`${MOBILE_CONFIG.API_BASE_URL}${module.endpoint}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });

      if (response.ok) {
        const data = await response.json();
        const records = Array.isArray(data) ? data.length : (data.results ? data.results.length : 0);
        
        // Store data locally
        localStorage.setItem(`offline_${module.name.toLowerCase()}`, JSON.stringify(data));
        
        // Update module status
        setModules(prev => prev.map(m => 
          m.name === module.name 
            ? { ...m, status: 'success', lastSync: new Date().toISOString(), records }
            : m
        ));

        return { success: true, records };
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      setModules(prev => prev.map(m => 
        m.name === module.name 
          ? { ...m, status: 'error', lastSync: new Date().toISOString() }
          : m
      ));
      
      return { success: false, error: error.message };
    }
  };

  const syncAllModules = async () => {
    if (!syncStatus.isOnline) {
      alert('Cannot sync while offline');
      return;
    }

    setSyncStatus(prev => ({ ...prev, syncing: true }));
    
    let successCount = 0;
    let totalRecords = 0;

    for (const module of modules) {
      const result = await syncModule(module);
      if (result.success) {
        successCount++;
        totalRecords += result.records || 0;
      }
    }

    // Update sync stats
    const newStats = {
      ...syncStats,
      totalSyncs: syncStats.totalSyncs + 1,
      successfulSyncs: syncStats.successfulSyncs + (successCount === modules.length ? 1 : 0),
      failedSyncs: syncStats.failedSyncs + (successCount < modules.length ? 1 : 0),
      dataSize: totalRecords
    };
    
    saveSyncStats(newStats);
    
    setSyncStatus(prev => ({
      ...prev,
      syncing: false,
      lastSync: new Date().toISOString()
    }));

    localStorage.setItem('lastSync', new Date().toISOString());
  };

  const clearOfflineData = () => {
    modules.forEach(module => {
      localStorage.removeItem(`offline_${module.name.toLowerCase()}`);
    });
    
    setModules(prev => prev.map(m => ({ ...m, status: 'pending', records: 0 })));
    
    // Reset sync stats
    saveSyncStats({
      totalSyncs: 0,
      successfulSyncs: 0,
      failedSyncs: 0,
      dataSize: 0
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'success';
      case 'error': return 'error';
      case 'syncing': return 'warning';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return <CheckCircleIcon />;
      case 'error': return <ErrorIcon />;
      case 'syncing': return <CircularProgress size={20} />;
      default: return <ScheduleIcon />;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
        Data Synchronization
      </Typography>

      {/* Connection Status */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center">
              <NetworkCheckIcon 
                sx={{ 
                  mr: 2, 
                  color: syncStatus.isOnline ? '#4CAF50' : '#f44336',
                  fontSize: 32
                }} 
              />
              <Box>
                <Typography variant="h6">
                  {syncStatus.isOnline ? 'Online' : 'Offline'}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {syncStatus.lastSync 
                    ? `Last sync: ${new Date(syncStatus.lastSync).toLocaleString()}`
                    : 'Never synced'
                  }
                </Typography>
              </Box>
            </Box>
            
            <Button
              variant="contained"
              startIcon={syncStatus.syncing ? <CircularProgress size={20} /> : <SyncIcon />}
              onClick={syncAllModules}
              disabled={syncStatus.syncing || !syncStatus.isOnline}
              sx={{ minWidth: 140 }}
            >
              {syncStatus.syncing ? 'Syncing...' : 'Sync All'}
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* Sync Statistics */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Sync Statistics</Typography>
              <Box display="flex" flexDirection="column" gap={2}>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2">Total Syncs</Typography>
                  <Typography variant="h6" color="primary">
                    {syncStats.totalSyncs}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2">Successful</Typography>
                  <Typography variant="h6" sx={{ color: '#4CAF50' }}>
                    {syncStats.successfulSyncs}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2">Failed</Typography>
                  <Typography variant="h6" sx={{ color: '#f44336' }}>
                    {syncStats.failedSyncs}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2">Records Synced</Typography>
                  <Typography variant="h6" color="primary">
                    {syncStats.dataSize}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Module Sync Status */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Module Status</Typography>
                <IconButton onClick={() => window.location.reload()}>
                  <RefreshIcon />
                </IconButton>
              </Box>
              
              <List>
                {modules.map((module, index) => (
                  <React.Fragment key={module.name}>
                    <ListItem>
                      <ListItemIcon>
                        {getStatusIcon(module.status)}
                      </ListItemIcon>
                      <ListItemText
                        primary={module.name}
                        secondary={
                          <Box>
                            <Typography variant="caption" display="block">
                              {module.records > 0 ? `${module.records} records` : 'No data'}
                            </Typography>
                            {module.lastSync && (
                              <Typography variant="caption" color="textSecondary">
                                Last: {new Date(module.lastSync).toLocaleTimeString()}
                              </Typography>
                            )}
                          </Box>
                        }
                      />
                      <Chip 
                        label={module.status} 
                        color={getStatusColor(module.status)}
                        size="small"
                      />
                    </ListItem>
                    {index < modules.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Offline Storage */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Box display="flex" alignItems="center">
                  <StorageIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">Offline Storage</Typography>
                </Box>
                <Button 
                  variant="outlined" 
                  color="error"
                  onClick={clearOfflineData}
                  size="small"
                >
                  Clear Data
                </Button>
              </Box>
              
              <Alert severity="info" sx={{ mb: 2 }}>
                Data is stored locally for offline access. Clear storage to free up space.
              </Alert>
              
              <Typography variant="body2" color="textSecondary">
                Storage used: ~{Math.round(JSON.stringify(localStorage).length / 1024)} KB
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Sync Progress */}
      {syncStatus.syncing && (
        <Box sx={{ position: 'fixed', bottom: 20, left: 20, right: 20, zIndex: 1000 }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <CircularProgress size={24} />
                <Box flexGrow={1}>
                  <Typography variant="body2">Synchronizing data...</Typography>
                  <LinearProgress sx={{ mt: 1 }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
      )}
    </Box>
  );
};

export default SyncDashboard;

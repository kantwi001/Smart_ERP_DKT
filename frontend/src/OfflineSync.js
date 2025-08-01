import React, { useState, useEffect } from 'react';
import { Paper, Typography, Button, CircularProgress, Box, Alert, List, ListItem, ListItemText, Chip, Grid, Card, CardContent } from '@mui/material';
import { WifiOff, Wifi, Sync, CloudUpload, CloudDownload } from '@mui/icons-material';
import api from './api';
import {
  getQueuedResponses, clearQueuedResponses,
  getQueuedRouteCompletions, clearQueuedRouteCompletions,
  saveSurveys, saveRoutes,
  getQueuedInventoryTransfers, clearQueuedInventoryTransfers,
  getQueuedCustomers, clearQueuedCustomers,
  getQueuedSalesOrders, clearQueuedSalesOrders,
  getSyncStatus, setupAutoSync, isOnline,
  saveProducts, saveWarehouses
} from './offline';

export default function OfflineSync() {
  const [syncing, setSyncing] = useState(false);
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);
  const [syncStatus, setSyncStatus] = useState(null);
  const [networkStatus, setNetworkStatus] = useState(isOnline());
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(true);

  const handleSync = async () => {
    setSyncing(true);
    setStatus(null);
    setError(null);
    let statusMsg = [];
    let errorDetails = [];
    
    try {
      // Check network connectivity first
      try {
        await api.get('/users/me/');
      } catch (authError) {
        if (authError.response?.status === 401) {
          throw new Error('Authentication failed. Please log in again.');
        }
        throw new Error('Network connection failed. Please check your internet connection.');
      }

      // Upload queued survey responses
      try {
        const responses = await getQueuedResponses();
        if (responses.length > 0) {
          let successCount = 0;
          for (const resp of responses) {
            try {
              // POST survey-responses, then answers
              const surveyResp = await api.post('/surveys/survey-responses/', { survey: resp.survey.id });
              for (const q of resp.survey.questions) {
                const formData = new FormData();
                formData.append('response', surveyResp.data.id);
                formData.append('question', q.id);
                const a = resp.answers[q.id];
                if (q.type === 'text' || q.type === 'select') {
                  formData.append('answer_text', a || '');
                } else if (q.type === 'number') {
                  formData.append('answer_number', a || '');
                } else if (q.type === 'gps') {
                  formData.append('answer_gps', a || '');
                } else if (q.type === 'photo' && a) {
                  formData.append('answer_photo', a);
                }
                await api.post('/surveys/survey-answers/', formData, {
                  headers: { 'Content-Type': 'multipart/form-data' }
                });
              }
              successCount++;
            } catch (respError) {
              console.error('Failed to sync survey response:', respError);
              errorDetails.push(`Survey response ${resp.id || 'unknown'}: ${respError.message}`);
            }
          }
          if (successCount > 0) {
            await clearQueuedResponses();
            statusMsg.push(`Uploaded ${successCount}/${responses.length} survey responses.`);
          }
        }
      } catch (surveyError) {
        errorDetails.push(`Survey sync error: ${surveyError.message}`);
      }

      // Upload queued route completions
      try {
        const completions = await getQueuedRouteCompletions();
        if (completions.length > 0) {
          let successCount = 0;
          for (const completion of completions) {
            try {
              await api.post('/route-planning/route-completions/', completion);
              successCount++;
            } catch (compError) {
              console.error('Failed to sync route completion:', compError);
              errorDetails.push(`Route completion ${completion.id || 'unknown'}: ${compError.message}`);
            }
          }
          if (successCount > 0) {
            await clearQueuedRouteCompletions();
            statusMsg.push(`Uploaded ${successCount}/${completions.length} route completions.`);
          }
        }
      } catch (routeError) {
        errorDetails.push(`Route sync error: ${routeError.message}`);
      }

      // Upload queued inventory transfers
      try {
        const transfers = await getQueuedInventoryTransfers();
        if (transfers.length > 0) {
          let successCount = 0;
          for (const transfer of transfers) {
            try {
              await api.post('/inventory/transfers/', transfer);
              successCount++;
            } catch (transferError) {
              console.error('Failed to sync inventory transfer:', transferError);
              errorDetails.push(`Inventory transfer ${transfer.id || 'unknown'}: ${transferError.message}`);
            }
          }
          if (successCount > 0) {
            await clearQueuedInventoryTransfers();
            statusMsg.push(`Uploaded ${successCount}/${transfers.length} inventory transfers.`);
          }
        }
      } catch (inventoryError) {
        errorDetails.push(`Inventory sync error: ${inventoryError.message}`);
      }

      // Upload queued customers
      try {
        const customers = await getQueuedCustomers();
        if (customers.length > 0) {
          let successCount = 0;
          for (const customer of customers) {
            try {
              await api.post('/sales/customers/', customer);
              successCount++;
            } catch (customerError) {
              console.error('Failed to sync customer:', customerError);
              errorDetails.push(`Customer ${customer.name || 'unknown'}: ${customerError.message}`);
            }
          }
          if (successCount > 0) {
            await clearQueuedCustomers();
            statusMsg.push(`Uploaded ${successCount}/${customers.length} customers.`);
          }
        }
      } catch (customerError) {
        errorDetails.push(`Customer sync error: ${customerError.message}`);
      }

      // Upload queued sales orders
      try {
        const salesOrders = await getQueuedSalesOrders();
        if (salesOrders.length > 0) {
          let successCount = 0;
          for (const order of salesOrders) {
            try {
              await api.post('/sales/orders/', order);
              successCount++;
            } catch (orderError) {
              console.error('Failed to sync sales order:', orderError);
              errorDetails.push(`Sales order ${order.id || 'unknown'}: ${orderError.message}`);
            }
          }
          if (successCount > 0) {
            await clearQueuedSalesOrders();
            statusMsg.push(`Uploaded ${successCount}/${salesOrders.length} sales orders.`);
          }
        }
      } catch (salesError) {
        errorDetails.push(`Sales sync error: ${salesError.message}`);
      }

      // Download and cache latest data
      try {
        const [sRes, rRes, pRes, wRes] = await Promise.all([
          api.get('/surveys/surveys/').catch(e => ({ data: [] })),
          api.get('/route-planning/routes/').catch(e => ({ data: [] })),
          api.get('/inventory/products/').catch(e => ({ data: [] })),
          api.get('/warehouse/').catch(e => ({ data: [] }))
        ]);
        await saveSurveys(sRes.data);
        await saveRoutes(rRes.data);
        await saveProducts(pRes.data);
        await saveWarehouses(wRes.data);
        statusMsg.push('Downloaded latest surveys, routes, products, and warehouses.');
      } catch (downloadError) {
        errorDetails.push(`Download error: ${downloadError.message}`);
      }

      if (statusMsg.length > 0) {
        setStatus(statusMsg.join(' '));
      }
      if (errorDetails.length > 0) {
        setError(`Partial sync completed with errors: ${errorDetails.join(', ')}`);
      }
      if (statusMsg.length === 0 && errorDetails.length === 0) {
        setStatus('No data to sync.');
      }
    } catch (e) {
      console.error('Sync failed:', e);
      setError(`Sync failed: ${e.message || 'Unknown error. Please try again.'}`);
    }
    setSyncing(false);
    // Refresh sync status after sync attempt
    loadSyncStatus();
  };

  const loadSyncStatus = async () => {
    try {
      const status = await getSyncStatus();
      setSyncStatus(status);
    } catch (error) {
      console.error('Failed to load sync status:', error);
    }
  };

  useEffect(() => {
    loadSyncStatus();
    
    // Set up auto-sync when network becomes available
    if (autoSyncEnabled) {
      setupAutoSync(handleSync);
    }
    
    // Monitor network status
    const handleOnline = () => {
      setNetworkStatus(true);
      if (autoSyncEnabled) {
        setTimeout(handleSync, 1000); // Delay to ensure connection is stable
      }
    };
    const handleOffline = () => setNetworkStatus(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Refresh sync status every 30 seconds
    const interval = setInterval(loadSyncStatus, 30000);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, [autoSyncEnabled]);

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" sx={{ flexGrow: 1 }}>Offline Sync</Typography>
        <Chip 
          icon={networkStatus ? <Wifi /> : <WifiOff />}
          label={networkStatus ? 'Online' : 'Offline'}
          color={networkStatus ? 'success' : 'error'}
          variant="outlined"
        />
      </Box>
      
      <Typography variant="body2" sx={{ mb: 3 }}>
        Sync your offline data with the server. Data is automatically synced when you come back online.
      </Typography>

      {/* Sync Status Cards */}
      {syncStatus && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined">
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h6" color="primary">{syncStatus.totalPending}</Typography>
                <Typography variant="body2" color="text.secondary">Total Pending</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined">
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h6" color="info.main">{syncStatus.surveyResponses}</Typography>
                <Typography variant="body2" color="text.secondary">Survey Responses</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined">
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h6" color="warning.main">{syncStatus.inventoryTransfers}</Typography>
                <Typography variant="body2" color="text.secondary">Inventory Transfers</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined">
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h6" color="success.main">{syncStatus.customers + syncStatus.salesOrders}</Typography>
                <Typography variant="body2" color="text.secondary">Sales Data</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Button 
          variant="contained" 
          onClick={handleSync} 
          disabled={syncing || !networkStatus}
          startIcon={syncing ? <CircularProgress size={16} /> : <Sync />}
        >
          {syncing ? 'Syncing...' : 'Sync Now'}
        </Button>
        
        <Button 
          variant="outlined" 
          onClick={loadSyncStatus}
          startIcon={<CloudDownload />}
        >
          Refresh Status
        </Button>
      </Box>

      {!networkStatus && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          You are currently offline. Data will be saved locally and synced automatically when you reconnect.
        </Alert>
      )}
      
      {status && <Alert severity="success" sx={{ mb: 2 }}>{status}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      {syncStatus && syncStatus.totalPending > 0 && (
        <Alert severity="info">
          You have {syncStatus.totalPending} items waiting to sync. 
          {networkStatus ? 'Click "Sync Now" to upload them.' : 'They will sync automatically when you come back online.'}
        </Alert>
      )}
    </Paper>
  );
}

import React, { useState, useEffect, useContext } from 'react';
import { 
  Box, Typography, Grid, Card, CardContent, CircularProgress, Alert,
  Drawer, List, ListItem, ListItemIcon, ListItemText, IconButton, AppBar, Toolbar, Button,
  useMediaQuery, useTheme
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import NetworkSync from './components/NetworkSync';
import { 
  loadTransactionsFromBackend, 
  loadProductsWithFallback, 
  loadCustomersWithFallback 
} from './sharedData';

const MainDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load all data from backend APIs
      await Promise.all([
        loadTransactionsFromBackend(),
        loadProductsWithFallback(),
        loadCustomersWithFallback()
      ]);
      
      console.log('Dashboard data loaded successfully');
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Failed to load dashboard data. Using cached data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    
    // Set up periodic sync every 30 seconds
    const syncInterval = setInterval(() => {
      fetchDashboardData();
    }, 30000);
    
    return () => clearInterval(syncInterval);
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Loading dashboard data...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {error && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <NetworkSync />
      {/* Rest of dashboard content */}
    </Box>
  );
};

export default MainDashboard;

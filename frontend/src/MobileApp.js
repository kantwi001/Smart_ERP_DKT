import React, { useState, useContext, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  CssBaseline, 
  Box, 
  IconButton,
  Badge,
  Avatar,
  Menu,
  MenuItem,
  ThemeProvider,
  Card,
  CardContent,
  Grid,
  Chip,
  Fab,
  useMediaQuery,
  useTheme
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PersonIcon from '@mui/icons-material/Person';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import SyncIcon from '@mui/icons-material/Sync';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import WifiIcon from '@mui/icons-material/Wifi';
import WifiOffIcon from '@mui/icons-material/WifiOff';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

import { AuthContext } from './AuthContext';
import { MOBILE_CONFIG } from './mobile_app_config';
import Dashboard from './Dashboard';
import EmployeeDashboard from './EmployeeDashboard';
import SalesDashboard from './SalesDashboard';
import SyncDashboard from './SyncDashboard';
import WarehouseTransferModule from './WarehouseTransferModule';
import Login from './Login';
import theme from './theme';

// Mobile Dashboard Component
const MobileDashboard = () => {
  const navigate = useNavigate();
  
  const modules = [
    {
      id: 'employee',
      title: 'Employee',
      subtitle: 'Employee Management',
      status: 'Available',
      color: '#4CAF50',
      icon: <PersonIcon sx={{ fontSize: 40, color: 'white' }} />,
      path: '/employee-dashboard'
    },
    {
      id: 'sales',
      title: 'Sales',
      subtitle: 'Sales & Orders',
      status: 'Available',
      color: '#FF9800',
      icon: <PointOfSaleIcon sx={{ fontSize: 40, color: 'white' }} />,
      path: '/sales'
    },
    {
      id: 'warehouse',
      title: 'Warehouse',
      subtitle: 'Inventory & Transfers',
      status: 'Available',
      color: '#9C27B0',
      icon: <LocalShippingIcon sx={{ fontSize: 40, color: 'white' }} />,
      path: '/warehouse-transfer'
    },
    {
      id: 'sync',
      title: 'Sync',
      subtitle: 'Data Synchronization',
      status: 'Available',
      color: '#607D8B',
      icon: <SyncIcon sx={{ fontSize: 40, color: 'white' }} />,
      path: '/sync'
    }
  ];

  return (
    <Box sx={{ p: 2, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', color: '#333' }}>
        Welcome to Smart ERP
      </Typography>
      
      <Grid container spacing={2}>
        {modules.map((module) => (
          <Grid item xs={12} sm={6} key={module.id}>
            <Card 
              sx={{ 
                cursor: 'pointer',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 3
                },
                bgcolor: 'white',
                borderRadius: 2
              }}
              onClick={() => navigate(module.path)}
            >
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box 
                      sx={{ 
                        bgcolor: module.color, 
                        borderRadius: 1, 
                        p: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {module.icon}
                    </Box>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#333' }}>
                        {module.title}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#666' }}>
                        {module.subtitle}
                      </Typography>
                      <Chip 
                        label={module.status} 
                        size="small" 
                        sx={{ 
                          mt: 0.5,
                          bgcolor: module.color,
                          color: 'white',
                          fontSize: '0.75rem'
                        }} 
                      />
                    </Box>
                  </Box>
                  <ArrowForwardIcon sx={{ color: '#ccc' }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

const MobileApp = () => {
  // Safe destructuring with fallback values
  const authContext = useContext(AuthContext);
  const user = authContext?.user || null;
  const logout = authContext?.logout || (() => {});
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [syncStatus, setSyncStatus] = useState({
    syncing: false,
    lastSync: null,
    modules: {}
  });
  const [networkStatus, setNetworkStatus] = useState({
    connected: navigator.onLine
  });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => setNetworkStatus({ connected: true });
    const handleOffline = () => setNetworkStatus({ connected: false });

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    setAnchorEl(null);
  };

  const handleAutoSync = () => {
    // Trigger sync functionality
    setSyncStatus(prev => ({ ...prev, syncing: true }));
    setTimeout(() => {
      setSyncStatus(prev => ({ ...prev, syncing: false, lastSync: new Date() }));
    }, 2000);
  };

  if (!user) {
    return <Login />;
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <AppBar position="fixed" sx={{ bgcolor: '#FF9800' }}>
          <Toolbar>
            <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
              Smart ERP Mobile
            </Typography>

            <IconButton color="inherit">
              <Badge 
                badgeContent={syncStatus.syncing ? '●' : (networkStatus.connected ? 0 : '!')} 
                color={networkStatus.connected ? "success" : "error"}
              >
                <NotificationsIcon />
              </Badge>
            </IconButton>

            <IconButton
              size="large"
              edge="end"
              aria-label="account of current user"
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              color="inherit"
            >
              <Avatar sx={{ width: 32, height: 32, bgcolor: '#FF6F00' }}>
                {user?.first_name?.charAt(0) || user?.username?.charAt(0) || 'U'}
              </Avatar>
            </IconButton>
          </Toolbar>
        </AppBar>

        <Box component="main" sx={{ flexGrow: 1, mt: 8 }}>
          <Routes>
            <Route path="/" element={<MobileDashboard />} />
            <Route path="/employee-dashboard" element={<EmployeeDashboard />} />
            <Route path="/sales/*" element={<SalesDashboard />} />
            <Route path="/sync" element={<SyncDashboard />} />
            <Route path="/warehouse-transfer" element={<WarehouseTransferModule />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Box>

        {/* Floating Sync Button */}
        <Fab 
          color="primary" 
          aria-label="sync"
          sx={{ 
            position: 'fixed', 
            bottom: 16, 
            right: 16,
            bgcolor: syncStatus.syncing ? '#FF9800' : '#2196F3',
            '&:hover': {
              bgcolor: syncStatus.syncing ? '#F57C00' : '#1976D2'
            }
          }}
          onClick={handleAutoSync}
          disabled={syncStatus.syncing || !networkStatus.connected}
        >
          <SyncIcon sx={{ 
            animation: syncStatus.syncing ? 'spin 1s linear infinite' : 'none',
            '@keyframes spin': {
              '0%': { transform: 'rotate(0deg)' },
              '100%': { transform: 'rotate(360deg)' }
            }
          }} />
        </Fab>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleProfileMenuClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          <MenuItem onClick={handleProfileMenuClose}>
            <PersonIcon sx={{ mr: 1 }} />
            Profile
          </MenuItem>
          <MenuItem onClick={handleLogout}>
            <ExitToAppIcon sx={{ mr: 1 }} />
            Logout
          </MenuItem>
        </Menu>
      </Box>
    </ThemeProvider>
  );
};

export default MobileApp;

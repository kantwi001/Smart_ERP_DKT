import React, { useState, useContext, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  CssBaseline, 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Box, 
  IconButton,
  Badge,
  Avatar,
  Menu,
  MenuItem,
  ThemeProvider
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import SyncIcon from '@mui/icons-material/Sync';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';

import { AuthContext } from './AuthContext';
import { MOBILE_ROUTES, MOBILE_CONFIG } from './mobile_app_config';
import Dashboard from './Dashboard';
import EmployeeDashboard from './EmployeeDashboard';
import SalesDashboard from './SalesDashboard';
import SyncDashboard from './SyncDashboard';
import WarehouseTransferModule from './WarehouseTransferModule';
import Login from './Login';
import theme from './theme';

const MobileApp = () => {
  const { user, logout } = useContext(AuthContext);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [networkStatus, setNetworkStatus] = useState({ connected: true, connectionType: 'wifi' });
  const [syncStatus, setSyncStatus] = useState({ lastSync: null, syncing: false });

  useEffect(() => {
    // Check network status (web fallback)
    const updateOnlineStatus = () => {
      setNetworkStatus({ 
        connected: navigator.onLine, 
        connectionType: navigator.onLine ? 'wifi' : 'none' 
      });
    };

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    updateOnlineStatus();

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  useEffect(() => {
    // Auto-sync every 30 seconds when connected
    if (networkStatus.connected) {
      const syncInterval = setInterval(() => {
        handleAutoSync();
      }, MOBILE_CONFIG.syncInterval);

      return () => clearInterval(syncInterval);
    }
  }, [networkStatus.connected]);

  const handleAutoSync = async () => {
    if (!networkStatus.connected || syncStatus.syncing) return;

    setSyncStatus(prev => ({ ...prev, syncing: true }));
    
    try {
      // Emit sync event for all modules to sync their data
      window.dispatchEvent(new CustomEvent('mobileSync', {
        detail: { type: 'auto', timestamp: new Date().toISOString() }
      }));

      setSyncStatus({
        lastSync: new Date().toISOString(),
        syncing: false
      });
    } catch (error) {
      console.error('Auto-sync failed:', error);
      setSyncStatus(prev => ({ ...prev, syncing: false }));
    }
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleProfileMenuClose();
  };

  const getModuleIcon = (iconName) => {
    const icons = {
      'home': <HomeIcon />,
      'person': <PersonIcon />,
      'point-of-sale': <PointOfSaleIcon />,
      'sync': <SyncIcon />,
      'warehouse-transfer': <LocalShippingIcon />,
    };
    return icons[iconName] || <HomeIcon />;
  };

  const drawer = (
    <div>
      <Box sx={{ p: 2, textAlign: 'center', bgcolor: '#FF9800', color: 'white' }}>
        <Typography variant="h6" fontWeight="bold">
          {MOBILE_CONFIG.appName}
        </Typography>
        <Typography variant="caption">
          v{MOBILE_CONFIG.version}
        </Typography>
      </Box>
      
      <List>
        {MOBILE_ROUTES.map((route) => (
          <ListItem 
            button 
            key={route.path}
            component="a"
            href={route.path}
            onClick={() => setMobileOpen(false)}
          >
            <ListItemIcon sx={{ color: '#FF9800' }}>
              {getModuleIcon(route.icon)}
            </ListItemIcon>
            <ListItemText 
              primary={route.name}
              sx={{ color: '#333' }}
            />
          </ListItem>
        ))}
      </List>

      <Box sx={{ position: 'absolute', bottom: 16, left: 16, right: 16 }}>
        <Box sx={{ 
          p: 2, 
          bgcolor: networkStatus.connected ? '#e8f5e8' : '#ffebee', 
          borderRadius: 1,
          mb: 2
        }}>
          <Typography variant="caption" display="block">
            Status: {networkStatus.connected ? 'Online' : 'Offline'}
          </Typography>
          {syncStatus.lastSync && (
            <Typography variant="caption" display="block">
              Last Sync: {new Date(syncStatus.lastSync).toLocaleTimeString()}
            </Typography>
          )}
        </Box>
      </Box>
    </div>
  );

  if (!user) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Login />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ display: 'flex' }}>
          <AppBar position="fixed" sx={{ bgcolor: '#FF9800' }}>
            <Toolbar>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
              
              <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
                {MOBILE_CONFIG.appName}
              </Typography>

              <IconButton color="inherit">
                <Badge badgeContent={syncStatus.syncing ? '●' : 0} color="error">
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

          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{
              keepMounted: true,
            }}
            sx={{
              '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 280 },
            }}
          >
            {drawer}
          </Drawer>

          <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/employee-dashboard" element={<EmployeeDashboard />} />
              <Route path="/sales/*" element={<SalesDashboard />} />
              <Route path="/sync" element={<SyncDashboard />} />
              <Route path="/warehouse-transfer" element={<WarehouseTransferModule />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Box>

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
      </Router>
    </ThemeProvider>
  );
};

export default MobileApp;

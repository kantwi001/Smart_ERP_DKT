import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, CssBaseline, Drawer, List, ListItem, ListItemIcon, ListItemText, Box, Divider, Button, Collapse } from '@mui/material';
import InventoryIcon from '@mui/icons-material/Inventory';
import PeopleIcon from '@mui/icons-material/People';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'; // Only import once
import FactoryIcon from '@mui/icons-material/Factory';
import AssessmentIcon from '@mui/icons-material/Assessment';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import SettingsIcon from '@mui/icons-material/Settings';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { AuthProvider, AuthContext } from './AuthContext';
import ProtectedRoute from './ProtectedRoute';
import Login from './Login';
import Register from './Register';
import Inventory from './Inventory';
import WarehouseTransfers from './WarehouseTransfers';
import Dashboard from './Dashboard';
import HRDashboard from './HR/HRDashboard';
import InventoryDashboard from './InventoryDashboard';
import SalesDashboard from './SalesDashboard';
import ManufacturingDashboard from './ManufacturingDashboard';
import ProcurementDashboard from './ProcurementDashboard';
import AccountingDashboard from './AccountingDashboard';
import CustomersDashboard from './CustomersDashboard';
import POSDashboard from './POSDashboard';
import ReportingDashboard from './ReportingDashboard';
import Leave from './HR/Leave';
import Payroll from './HR/Payroll';
import Attendance from './HR/Attendance';
import Performance from './HR/Performance';
import EmployeeData from './HR/EmployeeData';
import Recruitment from './HR/Recruitment';
import HRCalendar from './HR/HRCalendar';
import Training from './HR/Training';
import Task from './HR/Task';
import ExitInterview from './HR/ExitInterview';
import VisitLogs from './HR/VisitLogs';
import Meetings from './HR/Meetings';
import EmployeeDashboard from './EmployeeDashboard';
import ApartmentIcon from '@mui/icons-material/Apartment';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PersonIcon from '@mui/icons-material/Person';
import CampaignIcon from '@mui/icons-material/Campaign';
import SchoolIcon from '@mui/icons-material/School';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import GroupsIcon from '@mui/icons-material/Groups';
import SyncIcon from '@mui/icons-material/Sync';
import Sales from './Sales';
import Accounting from './Accounting';
import Purchasing from './Purchasing';
import Manufacturing from './Manufacturing';
import POS from './POS';
import Reporting from './Reporting';
import Users from './Users';
import Customers from './Customers';
import Products from './Products';
import Categories from './Categories';
import CategoryIcon from '@mui/icons-material/Category';
import Procurement from './Procurement';
import Notifications from './HR/Notifications';
import DepartmentManagement from './HR/DepartmentManagement';
import Survey from './Survey';
import RoutePlanning from './RoutePlanning';
import PowerBIDashboard from './PowerBIDashboard';
import OfflineSync from './OfflineSync';
import SurveyAdmin from './SurveyAdmin';
import RoutePlanningAdmin from './RoutePlanningAdmin';
import WarehouseDashboard from './WarehouseDashboard';
import SurveyDashboard from './SurveyDashboard';
import RoutePlanningDashboard from './RoutePlanningDashboard';
import SurveyAdminDashboard from './SurveyAdminDashboard';
import UsersDashboard from './UsersDashboard';
import NotificationCenter from './components/NotificationCenter';
import SystemSettingsDashboard from './SystemSettingsDashboard';
import LockIcon from '@mui/icons-material/Lock';

const drawerWidth = 260;

function AppShell() {
  const { user, logout } = useContext(AuthContext);
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);
  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  return (
    <>
      {!isOnline && (
        <Box sx={{ width: '100%', bgcolor: 'warning.main', color: 'black', p: 1, textAlign: 'center', fontWeight: 'bold', zIndex: 2000, position: 'fixed', top: 0 }}>
          Offline Mode: Some actions will be queued for sync.
        </Box>
      )}
      <Box sx={{ pt: !isOnline ? 4 : 0 }}>
        <AppShellContent user={user} logout={logout} />
      </Box>
    </>
  );
}

function AppShellContent({ user, logout }) {
  const location = useLocation();
  const [sidebarMini, setSidebarMini] = React.useState(() => {
    const saved = localStorage.getItem('sidebarMini');
    return saved ? JSON.parse(saved) : false;
  });
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [openHR, setOpenHR] = React.useState(() => {
    const saved = localStorage.getItem('openHR');
    return saved ? JSON.parse(saved) : true;
  });
  const [openPeople, setOpenPeople] = React.useState(() => {
    const saved = localStorage.getItem('openPeople');
    return saved ? JSON.parse(saved) : true;
  });
  const [openProcesses, setOpenProcesses] = React.useState(() => {
    const saved = localStorage.getItem('openProcesses');
    return saved ? JSON.parse(saved) : true;
  });
  const [openSales, setOpenSales] = React.useState(() => {
    const saved = localStorage.getItem('openSales');
    return saved ? JSON.parse(saved) : true;
  });

  React.useEffect(() => {
    localStorage.setItem('sidebarMini', JSON.stringify(sidebarMini));
  }, [sidebarMini]);
  React.useEffect(() => {
    localStorage.setItem('openHR', JSON.stringify(openHR));
  }, [openHR]);
  React.useEffect(() => {
    localStorage.setItem('openPeople', JSON.stringify(openPeople));
  }, [openPeople]);
  React.useEffect(() => {
    localStorage.setItem('openProcesses', JSON.stringify(openProcesses));
  }, [openProcesses]);
  React.useEffect(() => {
    localStorage.setItem('openSales', JSON.stringify(openSales));
  }, [openSales]);

  const isMobile = window.innerWidth < 900;
  const drawerWidth = sidebarMini && !isMobile ? 72 : 260;

  // Function to check if user has access to a module
  const hasModuleAccess = (moduleName) => {
    // Debug logging
    console.log('Checking module access for:', moduleName, {
      user: user,
      is_superuser: user?.is_superuser,
      role: user?.role,
      is_module_restricted: user?.is_module_restricted,
      accessible_modules: user?.accessible_modules
    });
    
    // Superusers and admins have access to everything
    if (user?.is_superuser || user?.role === 'superadmin' || user?.role === 'admin') {
      console.log('Access granted: User is superuser/admin');
      return true;
    }
    
    // If module restrictions are not enabled, allow access
    if (!user?.is_module_restricted) {
      console.log('Access granted: Module restrictions not enabled');
      return true;
    }
    
    // Check if user has access to this specific module
    const accessibleModules = user?.accessible_modules || [];
    const hasAccess = accessibleModules.includes(moduleName);
    console.log('Module access check result:', hasAccess, 'for module:', moduleName);
    return hasAccess;
  };

  // Function to filter sidebar items based on user's module access
  const filterSidebarItems = (items) => {
    return items.filter(item => {
      // Map navigation items to module names
      const moduleMap = {
        'Dashboard': 'dashboard',
        'Employee Dashboard': 'hr',
        'Inventory': 'inventory',
        'Warehouse': 'warehouse',
        'Warehouse Transfers': 'warehouse',
        'Surveys': 'surveys',
        'Route Planning': 'route_planning',
        'PowerBI': 'reporting',
        'Offline Sync': 'dashboard',
        'Survey Admin': 'surveys',
        'Route Planning Admin': 'route_planning',
        'HR': 'hr',
        'Sales': 'sales',
        'Accounting': 'accounting',
        'Manufacturing': 'manufacturing',
        'POS': 'pos',
        'Inventory': 'inventory',
        'Warehouse': 'warehouse',
        'Warehouse Transfers': 'warehouse',
        'Surveys': 'surveys',
        'Route Planning': 'route_planning',
        'Survey Admin': 'surveys',
        'PowerBI': 'reporting',
        'Route Planning Admin': 'route_planning',
        'Reporting': 'reporting',
        'Customers': 'customers',
        'Products': 'inventory',
        'Categories': 'inventory',
        'Procurement': 'procurement',
        'Users': 'users',
        'Notifications': 'dashboard',
        'System Settings': 'system_settings'
      };
      
      const moduleName = moduleMap[item.text];
      
      // If no module mapping found, allow access (for safety)
      if (!moduleName) {
        return true;
      }
      
      // Check if user has access to this module
      const hasAccess = hasModuleAccess(moduleName);
      
      // If item has subItems, filter them recursively
      if (item.subItems) {
        item.subItems = filterSidebarItems(item.subItems);
        // Only show parent if it has accessible sub-items or if user has direct access
        return hasAccess || item.subItems.length > 0;
      }
      
      return hasAccess;
    });
  };

  function renderSidebar(items, level = 0, openStates = {}) {
    return items.map((item, idx) => {
      if (item.text === 'HR' && item.subItems) {
        const open = openStates.openHR;
        const handleClick = () => openStates.setOpenHR(o => !o);
        return (
          <React.Fragment key={item.text}>
            <ListItem button={true} onClick={handleClick} sx={{ pl: 2 + 2 * level, bgcolor: open ? '#e3f2fd' : undefined, borderRadius: 2, mb: 0.5, '&:hover': { bgcolor: '#f5f5f5' } }}>
              <ListItemIcon sx={{ color: open ? '#1976d2' : '#424242' }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} sx={{ color: open ? '#1976d2' : '#424242', fontWeight: 600 }} />
              {open ? <ExpandLess /> : <ExpandMore />}
            </ListItem>
            <Collapse in={open} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {renderSidebar(item.subItems, level + 1, openStates)}
              </List>
            </Collapse>
          </React.Fragment>
        );
      }
      if (item.text === 'People' && item.subItems) {
        const open = openStates.openPeople;
        const handleClick = () => openStates.setOpenPeople(o => !o);
        return (
          <React.Fragment key={item.text}>
            <ListItem button={true} onClick={handleClick} sx={{ pl: 2 + 2 * level, bgcolor: open ? '#f5f5f5' : undefined, borderRadius: 2, mb: 0.5 }}>
              <ListItemIcon sx={{ color: open ? '#f57c00' : '#424242' }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} sx={{ color: open ? '#f57c00' : '#424242', fontWeight: 600 }} />
              {open ? <ExpandLess /> : <ExpandMore />}
            </ListItem>
            <Collapse in={open} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {renderSidebar(item.subItems, level + 1, openStates)}
              </List>
            </Collapse>
          </React.Fragment>
        );
      }
      if (item.text === 'Processes' && item.subItems) {
        const open = openStates.openProcesses;
        const handleClick = () => openStates.setOpenProcesses(o => !o);
        return (
          <React.Fragment key={item.text}>
            <ListItem button={true} onClick={handleClick} sx={{ pl: 2 + 2 * level, bgcolor: open ? '#f5f5f5' : undefined, borderRadius: 2, mb: 0.5 }}>
              <ListItemIcon sx={{ color: open ? '#f57c00' : '#424242' }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} sx={{ color: open ? '#f57c00' : '#424242', fontWeight: 600 }} />
              {open ? <ExpandLess /> : <ExpandMore />}
            </ListItem>
            <Collapse in={open} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {renderSidebar(item.subItems, level + 1, openStates)}
              </List>
            </Collapse>
          </React.Fragment>
        );
      }
      if (item.text === 'Sales' && item.subItems) {
        const open = openStates.openSales;
        const handleClick = () => openStates.setOpenSales(o => !o);
        return (
          <React.Fragment key={item.text}>
            <ListItem button={true} onClick={handleClick} sx={{ pl: 2 + 2 * level, bgcolor: open ? '#e8f5e8' : undefined, borderRadius: 2, mb: 0.5 }}>
              <ListItemIcon sx={{ color: open ? '#2e7d32' : '#4caf50' }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} sx={{ color: open ? '#2e7d32' : '#4caf50', fontWeight: 600 }} />
              {open ? <ExpandLess /> : <ExpandMore />}
            </ListItem>
            <Collapse in={open} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {renderSidebar(item.subItems, level + 1, openStates)}
              </List>
            </Collapse>
          </React.Fragment>
        );
      }
      if (!item.subItems && (!item.role || (user && user.role === item.role))) {
        return (
          <ListItem button={true} key={item.text} component={Link} to={item.path} selected={location.pathname === item.path}
            sx={{ pl: 2 + 2 * level, bgcolor: location.pathname === item.path ? '#e3f2fd' : undefined, borderRadius: 2, mb: 0.5, '&:hover': { bgcolor: '#f5f5f5' } }}>
            <ListItemIcon sx={{ color: location.pathname === item.path ? '#1976d2' : '#424242' }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} sx={{ color: location.pathname === item.path ? '#1976d2' : '#424242' }} />
            {item.badge && <Box component="span" sx={{ bgcolor: '#f44336', color: '#fff', borderRadius: 2, px: 1, ml: 1, fontSize: 12 }}>{item.badge}</Box>}
          </ListItem>
        );
      }
      return null;
    });
  }

  const sidebarItems = [
    { text: 'Dashboard', icon: <AssessmentIcon />, path: '/' },
    { text: 'Employee Dashboard', icon: <PersonIcon />, path: '/employee' },
    { text: 'Offline Sync', icon: <SyncIcon />, path: '/offline-sync' },
    {
      text: 'HR', icon: <PeopleIcon />, subItems: [
        {
          text: 'People', icon: <PeopleIcon />, subItems: [
            { text: 'Employee Data', icon: <PeopleIcon />, path: '/hr/employees', badge: 2 },
            { text: 'Recruitment', icon: <WorkOutlineIcon />, path: '/hr/recruitment' }
          ]
        },
        {
          text: 'Processes', icon: <AssignmentTurnedInIcon />, subItems: [
            { text: 'HR Calendar', icon: <CalendarMonthIcon />, path: '/hr/calendar' },
            { text: 'Leave Management', icon: <PeopleIcon />, path: '/hr/leave', badge: 5 },
            { text: 'Payroll', icon: <PeopleIcon />, path: '/hr/payroll' },
            { text: 'Attendance', icon: <PeopleIcon />, path: '/hr/attendance' },
            { text: 'Performance', icon: <PeopleIcon />, path: '/hr/performance' },
            { text: 'Training', icon: <SchoolIcon />, path: '/hr/training' },
            { text: 'Task', icon: <AssignmentTurnedInIcon />, path: '/hr/task' },
            { text: 'Employee Exit Interview', icon: <ExitToAppIcon />, path: '/hr/exit-interview' },
            { text: 'Visit Logs', icon: <LocationOnIcon />, path: '/hr/visit-logs' },
            { text: 'Meetings & Events', icon: <GroupsIcon />, path: '/hr/meetings' },
            { text: 'Department Management', icon: <ApartmentIcon />, path: '/hr/departments' }
          ]
        }
      ]
    },
    {
      text: 'Sales', icon: <MonetizationOnIcon />, subItems: [
        { text: 'Sales Dashboard', icon: <MonetizationOnIcon />, path: '/sales' },
        { text: 'Inventory', icon: <InventoryIcon />, path: '/inventory' },
        { text: 'Warehouse', icon: <InventoryIcon />, path: '/warehouse' },
        { text: 'Warehouse Transfers', icon: <SwapHorizIcon />, path: '/warehouse-transfers' },
        { text: 'POS', icon: <PointOfSaleIcon />, path: '/pos' },
        { text: 'Surveys', icon: <AssessmentIcon />, path: '/surveys' },
        { text: 'Route Planning', icon: <LocationOnIcon />, path: '/route-planning' },
        { text: 'Survey Admin', icon: <LockIcon />, path: '/survey-admin' },
        { text: 'PowerBI', icon: <AssessmentIcon />, path: '/powerbi' },
        { text: 'Route Planning Admin', icon: <LockIcon />, path: '/route-planning-admin' },
        { text: 'Customers', icon: <PeopleIcon />, path: '/customers' }
      ]
    },
    { text: 'Accounting', icon: <AccountBalanceIcon />, path: '/accounting' },
    { text: 'Manufacturing', icon: <FactoryIcon />, path: '/manufacturing' },

    { text: 'Reporting', icon: <AssessmentIcon />, path: '/reporting' },

    { text: 'Products', icon: <InventoryIcon />, path: '/products', role: 'sales' },
    { text: 'Categories', icon: <CategoryIcon />, path: '/categories', role: 'sales' },
    { text: 'Procurement', icon: <ShoppingCartIcon />, path: '/procurement' },
    { text: 'Users', icon: <SupervisorAccountIcon />, path: '/users' },
    { text: 'Notifications', icon: <NotificationsIcon />, path: '/notifications' },
    { text: 'System Settings', icon: <SettingsIcon />, path: '/system-settings', role: 'superadmin' },
  ];
  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Button color="inherit" onClick={() => isMobile ? setMobileOpen(!mobileOpen) : setSidebarMini(m => !m)} sx={{ mr: 2 }}>
            <span className="material-icons">menu</span>
          </Button>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            ERP System
          </Typography>
          <Notifications sidebar />
          {user && (
            <React.Fragment>
              <Typography variant="body1" sx={{ mr: 2 }}>
                {user.first_name || user.username}{user.role ? ` (${user.role})` : ''}
              </Typography>
              <Button color="inherit" onClick={logout}>Logout</Button>
            </React.Fragment>
          )}
        </Toolbar>
      </AppBar>
      <Drawer
        variant={isMobile ? "temporary" : sidebarMini ? "permanent" : "persistent"}
        open={isMobile ? mobileOpen : true}
        onClose={() => setMobileOpen(false)}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            background: 'linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%)',
            color: '#212529',
            overflowX: 'hidden',
            borderRight: '1px solid #dee2e6',
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto', pt: 1 }}>
          <List>
            {renderSidebar(filterSidebarItems(sidebarItems), 0, { openHR, setOpenHR, openPeople, setOpenPeople, openProcesses, setOpenProcesses, openSales, setOpenSales, sidebarMini })}
          </List>
          <Divider sx={{ background: '#dee2e6' }} />
        </Box>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, bgcolor: '#f4f6fa', p: 3, minHeight: '100vh' }}>
        <Toolbar />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/employee" element={<ProtectedRoute><EmployeeDashboard /></ProtectedRoute>} />
          <Route path="/inventory" element={<ProtectedRoute><InventoryDashboard /></ProtectedRoute>} />
          <Route path="/inventory/management" element={<ProtectedRoute><Inventory /></ProtectedRoute>} />
          <Route path="/warehouse-transfers" element={<ProtectedRoute><WarehouseTransfers /></ProtectedRoute>} />
          <Route path="/hr" element={<ProtectedRoute><HRDashboard /></ProtectedRoute>} />
          <Route path="/hr/employees" element={<ProtectedRoute><EmployeeData /></ProtectedRoute>} />
          <Route path="/hr/recruitment" element={<ProtectedRoute><Recruitment /></ProtectedRoute>} />
          <Route path="/hr/calendar" element={<ProtectedRoute><HRCalendar /></ProtectedRoute>} />

          <Route path="/hr/leave" element={<ProtectedRoute><Leave /></ProtectedRoute>} />
          <Route path="/hr/payroll" element={<ProtectedRoute><Payroll /></ProtectedRoute>} />
          <Route path="/hr/attendance" element={<ProtectedRoute><Attendance /></ProtectedRoute>} />
          <Route path="/hr/performance" element={<ProtectedRoute><Performance /></ProtectedRoute>} />
          <Route path="/hr/training" element={<ProtectedRoute><Training /></ProtectedRoute>} />
          <Route path="/hr/task" element={<ProtectedRoute><Task /></ProtectedRoute>} />
          <Route path="/hr/exit-interview" element={<ProtectedRoute><ExitInterview /></ProtectedRoute>} />
          <Route path="/hr/visit-logs" element={<ProtectedRoute><VisitLogs /></ProtectedRoute>} />
          <Route path="/hr/meetings" element={<ProtectedRoute><Meetings /></ProtectedRoute>} />
          <Route path="/hr/departments" element={<ProtectedRoute><DepartmentManagement /></ProtectedRoute>} />
          <Route path="/sales" element={<ProtectedRoute><SalesDashboard /></ProtectedRoute>} />
          <Route path="/sales/management" element={<ProtectedRoute><Sales /></ProtectedRoute>} />
          <Route path="/accounting" element={<ProtectedRoute><AccountingDashboard /></ProtectedRoute>} />
          <Route path="/accounting/management" element={<ProtectedRoute><Accounting /></ProtectedRoute>} />
          <Route path="/purchasing" element={<ProtectedRoute><Purchasing /></ProtectedRoute>} />
          <Route path="/manufacturing" element={<ProtectedRoute><ManufacturingDashboard /></ProtectedRoute>} />
          <Route path="/manufacturing/management" element={<ProtectedRoute><Manufacturing /></ProtectedRoute>} />
          <Route path="/pos" element={<ProtectedRoute><POSDashboard /></ProtectedRoute>} />
          <Route path="/pos/management" element={<ProtectedRoute><POS /></ProtectedRoute>} />
          <Route path="/reporting" element={<ProtectedRoute><ReportingDashboard /></ProtectedRoute>} />
          <Route path="/reporting/management" element={<ProtectedRoute><Reporting /></ProtectedRoute>} />
          <Route path="/customers" element={<ProtectedRoute><CustomersDashboard /></ProtectedRoute>} />
          <Route path="/customers/management" element={<ProtectedRoute><Customers /></ProtectedRoute>} />
          <Route path="/products" element={<ProtectedRoute><Products /></ProtectedRoute>} />
          <Route path="/categories" element={<ProtectedRoute><Categories /></ProtectedRoute>} />
          <Route path="/procurement" element={<ProtectedRoute><ProcurementDashboard /></ProtectedRoute>} />
          <Route path="/procurement/management" element={<ProtectedRoute><Procurement /></ProtectedRoute>} />
          <Route path="/users" element={<ProtectedRoute><UsersDashboard /></ProtectedRoute>} />
          <Route path="/users/management" element={<ProtectedRoute><Users /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><NotificationCenter /></ProtectedRoute>} />
          <Route path="/system-settings" element={<ProtectedRoute><SystemSettingsDashboard /></ProtectedRoute>} />
          <Route path="/warehouse" element={<ProtectedRoute><WarehouseDashboard /></ProtectedRoute>} />
          <Route path="/surveys" element={<ProtectedRoute><SurveyDashboard /></ProtectedRoute>} />
          <Route path="/surveys/management" element={<ProtectedRoute><Survey /></ProtectedRoute>} />
          <Route path="/route-planning" element={<ProtectedRoute><RoutePlanningDashboard /></ProtectedRoute>} />
          <Route path="/route-planning/management" element={<ProtectedRoute><RoutePlanning /></ProtectedRoute>} />
          <Route path="/survey-admin" element={<ProtectedRoute><SurveyAdminDashboard /></ProtectedRoute>} />
          <Route path="/survey-admin/management" element={<ProtectedRoute><SurveyAdmin /></ProtectedRoute>} />
          <Route path="/powerbi" element={<ProtectedRoute><PowerBIDashboard /></ProtectedRoute>} />
          <Route path="/offline-sync" element={<ProtectedRoute><OfflineSync /></ProtectedRoute>} />
          <Route path="/route-planning-admin" element={<ProtectedRoute><RoutePlanningAdmin /></ProtectedRoute>} />
          <Route path="*" element={user ? <Navigate to="/" replace /> : <Navigate to="/login" replace />} />
        </Routes>
      </Box>
    </Box>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/*" element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

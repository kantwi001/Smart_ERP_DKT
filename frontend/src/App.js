import React, { useContext, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
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
  Divider, 
  Button, 
  Collapse, 
  ThemeProvider,
  IconButton,
  Badge,
  Avatar,
  Menu,
  MenuItem
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import InventoryIcon from '@mui/icons-material/Inventory';
import PeopleIcon from '@mui/icons-material/People';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import FactoryIcon from '@mui/icons-material/Factory';
import AssessmentIcon from '@mui/icons-material/Assessment';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import SettingsIcon from '@mui/icons-material/Settings';
import ApartmentIcon from '@mui/icons-material/Apartment';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PersonIcon from '@mui/icons-material/Person';
import SchoolIcon from '@mui/icons-material/School';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import GroupsIcon from '@mui/icons-material/Groups';
import SyncIcon from '@mui/icons-material/Sync';
import CategoryIcon from '@mui/icons-material/Category';
import LockIcon from '@mui/icons-material/Lock';
import { createTheme } from '@mui/material/styles';
import './mobile.css'; // Mobile-optimized styles
import { AuthProvider, AuthContext } from './AuthContext';
import ProtectedRoute from './ProtectedRoute';
import Login from './Login';
import Register from './Register';
import ResetPassword from './ResetPassword';
import Inventory from './Inventory';
import WarehouseTransfers from './WarehouseTransfers';
import Dashboard from './Dashboard';
import ExecutiveDashboard from './ExecutiveDashboard';
import HRDashboard from './HR/HRDashboard';
import InventoryDashboard from './InventoryDashboard';
import SalesDashboard from './SalesDashboard';
import ManufacturingDashboard from './ManufacturingDashboard';
import ProcurementDashboard from './ProcurementDashboard';
import ProcurementDashboardManagement from './Procurement/ProcurementDashboardManagement';
import AccountingDashboard from './AccountingDashboard';
import Accounting from './Accounting';
import CustomersDashboard from './CustomersDashboard';
import ReportingDashboard from './ReportingDashboard';
import Leave from './HR/Leave';
import Payroll from './HR/Payroll';
import Payslips from './HR/Payslips';
import Attendance from './HR/Attendance';
import Performance from './HR/Performance';
import EmployeeData from './HR/EmployeeData';
import Recruitment from './HR/Recruitment';
import HRCalendar from './HR/HRCalendar';
import HRCalendarView from './HR/HRCalendarView';
import Training from './HR/Training';
import Task from './HR/Task';
import ExitInterview from './HR/ExitInterview';
import VisitLogs from './HR/VisitLogs';
import Meetings from './HR/Meetings';
import EmployeeDashboard from './EmployeeDashboard';
import Sales from './Sales';
import ProductsModule from './Sales/ProductsModule';
import Purchasing from './Purchasing';
import Manufacturing from './Manufacturing';
import Reporting from './Reporting';
import Users from './Users';
import Customers from './Customers';
import Products from './Products';
import Categories from './Categories';
import Procurement from './Procurement';
import ProcurementModule from './Procurement/ProcurementModule';
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
import MobileEmployeeApp from './MobileEmployeeApp';
import PayrollManagement from './Finance/PayrollManagement';
import FinanceDashboard from './Finance/FinanceDashboard';
import PurchaseOrderManagement from './Procurement/PurchaseOrderManagement';
import NetworkStatusIndicator from './components/NetworkStatusIndicator';
import MobileApp from './MobileApp';
import { Capacitor } from '@capacitor/core';

const drawerWidth = 260;

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#f57c00',
    },
  },
});

function AppShell() {
  // Safe destructuring with fallback values
  const authContext = useContext(AuthContext);
  const user = authContext?.user || null;
  const logout = authContext?.logout || (() => {});
  
  const location = useLocation();
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [sidebarMini, setSidebarMini] = React.useState(false);
  const [openHR, setOpenHR] = React.useState(false);
  const [openPeople, setOpenPeople] = React.useState(false);
  const [openProcesses, setOpenProcesses] = React.useState(false);
  const [openSales, setOpenSales] = React.useState(false);
  const [notifications, setNotifications] = React.useState([]);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [userMenuAnchor, setUserMenuAnchor] = React.useState(null);

  const isMobile = window.innerWidth < 600;

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNotificationClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleUserMenuClick = (event) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const handleLogout = () => {
    handleUserMenuClose();
    logout();
  };

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

  // Function to check if user has access to a module
  const hasModuleAccess = (moduleName) => {
    if (!user) return false;
    
    console.log('🔍 Checking module access for:', moduleName, 'User:', user?.username);
    
    // Superusers and admins have access to everything
    if (user?.is_superuser || user?.role === 'superadmin' || user?.role === 'admin') {
      console.log('👑 SUPERUSER/ADMIN - Full access granted for:', user?.username);
      return true;
    }

    // Define allowed modules for regular employees (consumer/read-only access)
    const employeeAllowedModules = [
      'employee_dashboard',    // Full access to personal dashboard
      'payslips',             // View/download own payslips (not full payroll)
      'hr_calendar_view',     // View calendar/notifications (not create/edit)
      'training_consumer',    // View materials, take exams (not upload/manage)
      'tasks_assigned',       // View only assigned tasks (not create/assign)
      'notifications'         // View notifications
    ];

    // Check if user is in Sales department - case insensitive matching with proper type checks
    const isSalesUser = (user?.department_name && typeof user.department_name === 'string' && user.department_name.toLowerCase() === 'sales') || 
                       (user?.department && typeof user.department === 'string' && user.department.toLowerCase() === 'sales') ||
                       user?.role === 'sales_manager' ||
                       user?.role === 'sales_rep' ||
                       (user?.role === 'employee' && ((user?.department_name && typeof user.department_name === 'string' && user.department_name.toLowerCase() === 'sales') || (user?.department && typeof user.department === 'string' && user.department.toLowerCase() === 'sales')));

    console.log('🏢 Sales user check:', {
      department_name: user?.department_name,
      department: user?.department,
      role: user?.role,
      isSalesUser: isSalesUser,
      'department_name_type': typeof user?.department_name,
      'department_type': typeof user?.department,
      'department_name_lower': (user?.department_name && typeof user.department_name === 'string') ? user.department_name.toLowerCase() : 'not_string',
      'department_lower': (user?.department && typeof user.department === 'string') ? user.department.toLowerCase() : 'not_string'
    });
    
    if (isSalesUser) {
      console.log('🔍 SALES USER DEBUG - Edmund Sekyere Check:', {
        username: user?.username,
        email: user?.email,
        department_name: user?.department_name,
        department: user?.department,
        role: user?.role,
        is_superuser: user?.is_superuser,
        full_user_object: user,
        isSalesUser: isSalesUser,
        'department_name === Sales': user?.department_name === 'Sales',
        'department === Sales': user?.department === 'Sales',
        'role === sales_rep': user?.role === 'sales_rep',
        'role === sales_manager': user?.role === 'sales_manager'
      });

      console.log('✅ SALES USER DETECTED - Showing Sales modules for:', user?.username);
      return [
        'employee_dashboard',    // Personal dashboard
        'inventory_view',        // View inventory (limited operations)
        'customers_view',        // View/add customers (limited)
        'surveys_consumer',      // Answer surveys (not create/manage)
        'route_planning_view',   // View routes (not create/manage)
        'payslips',             // Own payslips
        'hr_calendar_view',     // View calendar
        'training_consumer',    // Training materials
        'tasks_assigned',       // Assigned tasks
        'notifications'         // Notifications
      ].includes(moduleName);
    }
    
    // Check if user is in HR department or is superadmin for full payroll and HR calendar access
    const isHRUser = (user?.department_name && typeof user.department_name === 'string' && user.department_name.toLowerCase() === 'hr') || 
                     (user?.department && typeof user.department === 'string' && user.department.toLowerCase() === 'hr') ||
                     user?.role === 'hr_manager' ||
                     user?.role === 'hr_admin';

    // Regular employees - consumer access only (excluding superusers)
    const isRegularEmployee = user?.role === 'employee' || 
                             (!user?.role && !user?.is_superuser) ||
                             (user?.department_name && 
                              user?.department_name !== 'Sales' && 
                              user?.role !== 'manager' && 
                              user?.role !== 'supervisor');
    
    console.log('👥 Regular employee check:', {
      role: user?.role,
      is_superuser: user?.is_superuser,
      department_name: user?.department_name,
      isRegularEmployee: isRegularEmployee
    });
    
    if (isRegularEmployee) {
      console.log('👤 Checking regular employee access for module:', moduleName);
      const hasEmployeeAccess = employeeAllowedModules.includes(moduleName);
      console.log('👤 Regular employee access result:', hasEmployeeAccess);
      return hasEmployeeAccess;
    }
    
    // For managers, supervisors, and other roles - be more restrictive by default
    // Only allow access if explicitly granted
    if (user?.is_module_restricted === false) {
      console.log('⚠️ Access granted: Module restrictions explicitly disabled');
      return true;
    }
    
    // Check if user has access to this specific module
    const accessibleModules = user?.accessible_modules || [];
    const hasAccess = accessibleModules.includes(moduleName);
    console.log('📋 Module access check result:', hasAccess, 'for module:', moduleName);
    return hasAccess;
  };

  // Define sidebar items based on user role and department
  const getSidebarItems = () => {
    // Superusers and admins see everything
    if (user?.is_superuser || user?.role === 'superadmin' || user?.role === 'admin') {
      return [
        { text: 'Executive Dashboard', icon: <AssessmentIcon />, path: '/executive-dashboard' },
        { text: 'Employee Dashboard', icon: <PersonIcon />, path: '/employee-dashboard' },
        {
          text: 'HR', icon: <PeopleIcon />, subItems: [
            { text: 'HR Dashboard', icon: <PeopleIcon />, path: '/hr' },
            { text: 'HR Calendar', icon: <CalendarMonthIcon />, path: '/hr/calendar-management' },
            { text: 'Leave Management', icon: <PeopleIcon />, path: '/hr/leave', badge: 5 },
            { text: 'Payroll', icon: <PeopleIcon />, path: '/hr/payroll' },
            { text: 'Payslips', icon: <PeopleIcon />, path: '/hr/payslips' },
            { text: 'Attendance', icon: <PeopleIcon />, path: '/hr/attendance' },
            { text: 'Performance', icon: <PeopleIcon />, path: '/hr/performance' },
            { text: 'Training', icon: <SchoolIcon />, path: '/hr/training' },
            { text: 'Task', icon: <AssignmentTurnedInIcon />, path: '/hr/task' },
            { text: 'Employee Exit Interview', icon: <ExitToAppIcon />, path: '/hr/exit-interview' },
            { text: 'Visit Logs', icon: <LocationOnIcon />, path: '/hr/visit-logs' },
            { text: 'Meetings & Events', icon: <GroupsIcon />, path: '/hr/meetings' },
            { text: 'Department Management', icon: <ApartmentIcon />, path: '/hr/departments' }
          ]
        },
        {
          text: 'Sales', icon: <MonetizationOnIcon />, subItems: [
            { text: 'Sales Dashboard', icon: <MonetizationOnIcon />, path: '/sales' },
            { text: 'Inventory', icon: <InventoryIcon />, path: '/inventory' },
            { text: 'Warehouse', icon: <InventoryIcon />, path: '/warehouse' },
            { text: 'Warehouse Transfers', icon: <SwapHorizIcon />, path: '/warehouse-transfers' },
            { text: 'Customers', icon: <PeopleIcon />, path: '/customers' },
            { text: 'Surveys', icon: <AssessmentIcon />, path: '/surveys' },
            { text: 'Route Planning', icon: <LocationOnIcon />, path: '/route-planning' },
            { text: 'Survey Admin', icon: <LockIcon />, path: '/survey-admin' },
            { text: 'PowerBI', icon: <AssessmentIcon />, path: '/powerbi' },
            { text: 'Route Planning Admin', icon: <LockIcon />, path: '/route-planning-admin' },
            { text: 'Products', icon: <ShoppingCartIcon />, path: '/products' },
            { text: 'Categories', icon: <CategoryIcon />, path: '/categories' }
          ]
        },
        { text: 'Finance', icon: <AccountBalanceIcon />, path: '/finance' },
        { text: 'Manufacturing', icon: <FactoryIcon />, path: '/manufacturing' },
        { text: 'Reporting', icon: <AssessmentIcon />, path: '/reporting' },
        { text: 'Procurement & Logistics Report', icon: <ShoppingCartIcon />, path: '/procurement' },
        { text: 'Procurement Management', icon: <ShoppingCartIcon />, path: '/procurement/management' },
        { text: 'Users', icon: <SupervisorAccountIcon />, path: '/users' },
        { text: 'Sync', icon: <SyncIcon />, path: '/sync' },
        { text: 'Notifications', icon: <NotificationsIcon />, path: '/notifications' },
        { text: 'System Settings', icon: <SettingsIcon />, path: '/system-settings' }
      ];
    }

    // Sales department users - consumer access to sales modules
    const isSalesUser = (user?.department_name && typeof user.department_name === 'string' && user.department_name.toLowerCase() === 'sales') || 
                       (user?.department && typeof user.department === 'string' && user.department.toLowerCase() === 'sales') ||
                       user?.role === 'sales_manager' ||
                       user?.role === 'sales_rep';

    if (isSalesUser) {
      return [
        { text: 'Employee Dashboard', icon: <PersonIcon />, path: '/employee-dashboard' },
        {
          text: 'Sales', icon: <MonetizationOnIcon />, subItems: [
            { text: 'Sales Dashboard', icon: <MonetizationOnIcon />, path: '/sales' },
            { text: 'Inventory', icon: <InventoryIcon />, path: '/inventory' },
            { text: 'Warehouse', icon: <InventoryIcon />, path: '/warehouse' },
            { text: 'Customers', icon: <PeopleIcon />, path: '/customers' },
            { text: 'Surveys', icon: <AssessmentIcon />, path: '/surveys' },
            { text: 'Route Planning', icon: <LocationOnIcon />, path: '/route-planning' },
            { text: 'Sync', icon: <SyncIcon />, path: '/sync' },
            { text: 'Notifications', icon: <NotificationsIcon />, path: '/notifications' }
          ]
        },
        { text: 'Payslips', icon: <MonetizationOnIcon />, path: '/hr/payslips' }, // Read-only payslips for Sales
        { text: 'HR Calendar', icon: <CalendarMonthIcon />, path: '/hr/calendar' }, // Read-only calendar for Sales
        { text: 'Training', icon: <SchoolIcon />, path: '/hr/training' },
        { text: 'Task', icon: <AssignmentTurnedInIcon />, path: '/hr/task' },
        { text: 'Notifications', icon: <NotificationsIcon />, path: '/notifications' }
      ];
    }

    console.log('❌ NOT SALES USER - Showing regular employee modules for:', user?.username);
    
    // Check if user is in HR department or is superadmin for full payroll and HR calendar access
    const isHRUser = (user?.department_name && typeof user.department_name === 'string' && user.department_name.toLowerCase() === 'hr') || 
                     (user?.department && typeof user.department === 'string' && user.department.toLowerCase() === 'hr') ||
                     user?.role === 'hr_manager' ||
                     user?.role === 'hr_admin';

    // Regular employees - consumer access only
    return [
      { text: 'Employee Dashboard', icon: <PersonIcon />, path: '/employee-dashboard' },
      { text: isHRUser ? 'Payroll' : 'Payslips', icon: <MonetizationOnIcon />, path: isHRUser ? '/hr/payroll' : '/hr/payslips' }, // HR gets full Payroll, others get read-only Payslips
      { text: isHRUser ? 'HR Calendar' : 'HR Calendar', icon: <CalendarMonthIcon />, path: isHRUser ? '/hr/calendar-management' : '/hr/calendar' }, // HR gets full HR Calendar, others get read-only HR Calendar
      { text: 'Training', icon: <SchoolIcon />, path: '/hr/training' },
      { text: 'Task', icon: <AssignmentTurnedInIcon />, path: '/hr/task' },
      { text: 'Sync', icon: <SyncIcon />, path: '/sync' },
      { text: 'Notifications', icon: <NotificationsIcon />, path: '/notifications' }
    ];
  };

  const sidebarItems = getSidebarItems();

  // Filter sidebar items based on user role and permissions
  const filterSidebarItems = (items) => {
    return items.filter(item => {
      // Map navigation items to module names
      const moduleMap = {
        'Dashboard': 'dashboard',
        'Employee Dashboard': 'employee_dashboard',
        'HR Calendar': 'hr_calendar_view',     // View-only access for employees
        'Payroll': 'payslips',                 // Only payslips, not full payroll admin
        'Training': 'training_consumer',       // Consumer access - view/take exams only
        'Task': 'tasks_assigned',              // Only assigned tasks, not task management
        'Notifications': 'notifications',
        'Inventory': 'inventory_view',         // View-only for sales
        'Customers': 'customers_view',         // Limited customer access
        'Surveys': 'surveys_consumer',         // Answer surveys, not create/manage
        'Route Planning': 'route_planning_view', // View routes, not create/manage
        'Warehouse': 'warehouse',              // Full admin access (managers only)
        'Warehouse Transfers': 'warehouse',
        'PowerBI': 'reporting',
        'Offline Sync': 'dashboard',
        'Survey Admin': 'surveys',             // Full admin access (managers only)
        'Route Planning Admin': 'route_planning', // Full admin access (managers only)
        'HR': 'hr',                           // Full HR admin (HR staff only)
        'Sales': 'sales',                     // Full sales admin (managers only)
        'Sales Dashboard': 'sales',
        'Finance': 'finance',           // Full admin access (managers only)
        'Manufacturing': 'manufacturing',     // Full admin access (managers only)
        'Reporting': 'reporting',             // Full admin access (managers only)
        'Products': 'sales',                  // Sales users can manage products
        'Categories': 'sales',                // Sales users can manage categories
        'Procurement & Logistics Report': 'procurement',         // Full admin access (managers only)
        'Procurement Management': 'procurement',         // Full admin access (managers only)
        'Users': 'users',                     // Full admin access (managers only)
        'System Settings': 'system_settings', // Full admin access (admins only)
        'Leave Management': 'hr',             // Full HR admin (HR staff only)
        'Attendance': 'hr',                   // Full HR admin (HR staff only)
        'Performance': 'hr',                  // Full HR admin (HR staff only)
        'Employee Exit Interview': 'hr',      // Full HR admin (HR staff only)
        'Visit Logs': 'hr',                   // Full HR admin (HR staff only)
        'Meetings & Events': 'hr',            // Full HR admin (HR staff only)
        'Department Management': 'hr'         // Full HR admin (HR staff only)
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

  const filteredSidebarItems = filterSidebarItems(sidebarItems);

  // Create the drawer content
  const drawer = (
    <div>
      <Toolbar />
      <Box sx={{ overflow: 'auto', pt: 1 }}>
        <List>
          {renderSidebar(filteredSidebarItems, 0, { openHR, setOpenHR, openPeople, setOpenPeople, openProcesses, setOpenProcesses, openSales, setOpenSales, sidebarMini })}
        </List>
        <Divider sx={{ background: '#dee2e6' }} />
      </Box>
    </div>
  );

  function renderSidebar(items, level = 0, openStates = {}) {
    return items.map((item, idx) => {
      if (item.text === 'HR' && item.subItems) {
        const open = openStates.openHR;
        const handleClick = () => openStates.setOpenHR(o => !o);
        return (
          <React.Fragment key={item.text}>
            <ListItem onClick={handleClick} sx={{ pl: 2 + 2 * level, bgcolor: open ? '#e3f2fd' : undefined, borderRadius: 2, mb: 0.5, '&:hover': { bgcolor: '#f5f5f5' } }}>
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
            <ListItem onClick={handleClick} sx={{ pl: 2 + 2 * level, bgcolor: open ? '#f5f5f5' : undefined, borderRadius: 2, mb: 0.5 }}>
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
            <ListItem onClick={handleClick} sx={{ pl: 2 + 2 * level, bgcolor: open ? '#f5f5f5' : undefined, borderRadius: 2, mb: 0.5 }}>
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
            <ListItem onClick={handleClick} sx={{ pl: 2 + 2 * level, bgcolor: open ? '#e8f5e8' : undefined, borderRadius: 2, mb: 0.5 }}>
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
          <ListItem key={item.text} component={Link} to={item.path} selected={location.pathname === item.path}
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

  // Add authentication status check
  const isAuthenticated = user && (user.id || user.username);
  
  // If not authenticated, show login screen instead of dashboards
  if (!isAuthenticated && location.pathname !== '/login') {
    return <Login />;
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ 
        display: 'flex', 
        minHeight: '100vh',
        overflow: 'hidden',
        bgcolor: '#f5f5f5'
      }}>
        {/* App Bar */}
        <AppBar 
          position="fixed" 
          sx={{ 
            zIndex: (theme) => theme.zIndex.drawer + 1,
            bgcolor: '#1976d2',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            height: { xs: 56, sm: 64 }
          }}
        >
          <Toolbar sx={{ 
            minHeight: { xs: 56, sm: 64 },
            px: { xs: 1, sm: 2 }
          }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ 
                mr: { xs: 1, sm: 2 },
                display: { sm: 'none' }
              }}
            >
              <MenuIcon />
            </IconButton>
            
            {/* Smart ERP Software Logo and Title */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              flexGrow: 1,
              gap: { xs: 1, sm: 2 }
            }}>
              {/* Logo Icon */}
              <Box
                sx={{
                  width: { xs: 28, sm: 36, md: 40 },
                  height: { xs: 28, sm: 36, md: 40 },
                  background: 'white',
                  borderRadius: { xs: '6px', sm: '8px' },
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: { xs: '2px', sm: '4px' },
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  flexShrink: 0,
                }}
              >
                <img
                  src="/smart-erp-logo.png"
                  alt="Smart ERP Software"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    maxWidth: '100%',
                    maxHeight: '100%',
                  }}
                />
              </Box>
              
              {/* Title */}
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Typography 
                  variant="h6" 
                  noWrap 
                  component="div" 
                  sx={{ 
                    fontSize: { xs: '0.9rem', sm: '1.1rem' },
                    fontWeight: 700,
                    lineHeight: 1.1,
                    color: 'white'
                  }}
                >
                  Smart ERP
                </Typography>
                <Typography 
                  variant="caption" 
                  noWrap 
                  sx={{ 
                    fontSize: { xs: '0.6rem', sm: '0.7rem' },
                    fontWeight: 500,
                    lineHeight: 1,
                    color: 'rgba(255,255,255,0.9)',
                    display: { xs: 'none', sm: 'block' }
                  }}
                >
                  SOFTWARE
                </Typography>
              </Box>
            </Box>
            
            {/* User Profile Section */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: { xs: 1, sm: 2 }
            }}>
              {/* Notifications */}
              <IconButton 
                color="inherit" 
                size={isMobile ? 'small' : 'medium'}
                onClick={handleNotificationClick}
              >
                <Badge badgeContent={notifications.length} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>

              {/* Network Status Indicator */}
              <NetworkStatusIndicator />

              {/* User Menu */}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: { xs: 0.5, sm: 1 }
              }}>
                <Avatar 
                  sx={{ 
                    width: { xs: 32, sm: 40 }, 
                    height: { xs: 32, sm: 40 },
                    bgcolor: '#ff9800'
                  }}
                >
                  {user?.first_name?.[0] || user?.username?.[0] || 'U'}
                </Avatar>
                <Box sx={{ 
                  display: { xs: 'none', sm: 'block' },
                  textAlign: 'left'
                }}>
                  <Typography variant="body2" sx={{ 
                    color: 'white', 
                    fontWeight: 500,
                    lineHeight: 1.2
                  }}>
                    {user?.first_name} {user?.last_name}
                  </Typography>
                  <Typography variant="caption" sx={{ 
                    color: 'rgba(255,255,255,0.8)',
                    lineHeight: 1
                  }}>
                    {user?.role || 'User'}
                  </Typography>
                </Box>
                <IconButton 
                  color="inherit" 
                  onClick={handleUserMenuClick}
                  size={isMobile ? 'small' : 'medium'}
                >
                  <ExpandMoreIcon />
                </IconButton>
              </Box>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Navigation Drawer */}
        <Box
          component="nav"
          sx={{ 
            width: { sm: drawerWidth }, 
            flexShrink: { sm: 0 }
          }}
        >
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={() => setMobileOpen(false)}
            ModalProps={{
              keepMounted: true, // Better open performance on mobile.
            }}
            sx={{
              display: { xs: 'block', sm: 'none' },
              '& .MuiDrawer-paper': { 
                boxSizing: 'border-box', 
                width: drawerWidth,
                bgcolor: '#fafafa',
                borderRight: '1px solid #e0e0e0'
              },
            }}
          >
            {drawer}
          </Drawer>
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: 'none', sm: 'block' },
              '& .MuiDrawer-paper': { 
                boxSizing: 'border-box', 
                width: drawerWidth,
                bgcolor: '#fafafa',
                borderRight: '1px solid #e0e0e0'
              },
            }}
            open
          >
            {drawer}
          </Drawer>
        </Box>

        {/* Main Content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            width: { sm: `calc(100% - ${drawerWidth}px)` },
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          <Toolbar sx={{ minHeight: { xs: 56, sm: 64 } }} />
          
          <Box sx={{ 
            flexGrow: 1,
            overflow: 'auto',
            p: { xs: 1, sm: 2, md: 3 },
            bgcolor: '#f5f5f5',
            minHeight: 'calc(100vh - 64px)'
          }}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/reset-password/:uid/:token" element={<ResetPassword />} />
              <Route path="/" element={
                <ProtectedRoute>
                  {user?.role === 'admin' || user?.role === 'manager' || user?.role === 'superadmin' ? <Dashboard /> : <MobileEmployeeApp />}
                </ProtectedRoute>
              } />
              <Route path="/employee-dashboard" element={<ProtectedRoute><EmployeeDashboard /></ProtectedRoute>} />
              <Route path="/executive-dashboard" element={<ProtectedRoute><ExecutiveDashboard /></ProtectedRoute>} />
              <Route path="/mobile-employee" element={<ProtectedRoute><MobileEmployeeApp /></ProtectedRoute>} />
              <Route path="/inventory" element={<ProtectedRoute><InventoryDashboard /></ProtectedRoute>} />
              <Route path="/inventory/management" element={<ProtectedRoute><Inventory /></ProtectedRoute>} />
              <Route path="/warehouse-transfers" element={<ProtectedRoute><WarehouseTransfers /></ProtectedRoute>} />
              <Route path="/hr" element={<ProtectedRoute><HRDashboard /></ProtectedRoute>} />
              <Route path="/hr/employees" element={<ProtectedRoute><EmployeeData /></ProtectedRoute>} />
              <Route path="/hr/recruitment" element={<ProtectedRoute><Recruitment /></ProtectedRoute>} />
              <Route path="/hr/calendar" element={
                <ProtectedRoute>
                  {user?.department_name?.toLowerCase() === 'hr' || user?.role === 'hr_manager' || user?.role === 'hr_admin' ? <HRCalendar /> : <HRCalendarView />}
                </ProtectedRoute>
              } />
              <Route path="/hr/calendar-management" element={<ProtectedRoute><HRCalendar /></ProtectedRoute>} />
              <Route path="/hr/leave" element={<ProtectedRoute><Leave /></ProtectedRoute>} />
              <Route path="/hr/payroll" element={<ProtectedRoute><PayrollManagement /></ProtectedRoute>} />
              <Route path="/hr/payslips" element={<ProtectedRoute><Payslips /></ProtectedRoute>} />
              <Route path="/hr/attendance" element={<ProtectedRoute><Attendance /></ProtectedRoute>} />
              <Route path="/hr/performance" element={<ProtectedRoute><Performance /></ProtectedRoute>} />
              <Route path="/hr/training" element={<ProtectedRoute><Training /></ProtectedRoute>} />
              <Route path="/hr/task" element={<ProtectedRoute><Task /></ProtectedRoute>} />
              <Route path="/hr/exit-interview" element={<ProtectedRoute><ExitInterview /></ProtectedRoute>} />
              <Route path="/hr/visit-logs" element={<ProtectedRoute><VisitLogs /></ProtectedRoute>} />
              <Route path="/hr/meetings" element={<ProtectedRoute><Meetings /></ProtectedRoute>} />
              <Route path="/hr/departments" element={<ProtectedRoute><DepartmentManagement /></ProtectedRoute>} />
              <Route path="/sales" element={<ProtectedRoute><SalesDashboard /></ProtectedRoute>} />
              <Route path="/finance" element={<ProtectedRoute><FinanceDashboard /></ProtectedRoute>} />
              <Route path="/finance/management" element={<ProtectedRoute><Accounting /></ProtectedRoute>} />
              <Route path="/finance/payroll" element={<ProtectedRoute><PayrollManagement /></ProtectedRoute>} />
              <Route path="/purchasing" element={<ProtectedRoute><Purchasing /></ProtectedRoute>} />
              <Route path="/manufacturing" element={<ProtectedRoute><ManufacturingDashboard /></ProtectedRoute>} />
              <Route path="/manufacturing/management" element={<ProtectedRoute><Manufacturing /></ProtectedRoute>} />
              <Route path="/reporting" element={<ProtectedRoute><ReportingDashboard /></ProtectedRoute>} />
              <Route path="/reporting/management" element={<ProtectedRoute><Reporting /></ProtectedRoute>} />
              <Route path="/customers" element={<ProtectedRoute><CustomersDashboard /></ProtectedRoute>} />
              <Route path="/customers/management" element={<ProtectedRoute><Customers /></ProtectedRoute>} />
              <Route path="/products" element={<ProtectedRoute><ProductsModule /></ProtectedRoute>} />
              <Route path="/categories" element={<ProtectedRoute><Categories /></ProtectedRoute>} />
              <Route path="/procurement" element={<ProtectedRoute><ProcurementModule /></ProtectedRoute>} />
              <Route path="/procurement/management" element={<ProtectedRoute><ProcurementDashboardManagement /></ProtectedRoute>} />
              <Route path="/users" element={<ProtectedRoute><UsersDashboard /></ProtectedRoute>} />
              <Route path="/users/management" element={<ProtectedRoute><Users /></ProtectedRoute>} />
              <Route path="/sync" element={<ProtectedRoute><OfflineSync /></ProtectedRoute>} />
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
              <Route path="/sync" element={<ProtectedRoute><OfflineSync /></ProtectedRoute>} />
              <Route path="*" element={user ? <Navigate to="/" replace /> : <Navigate to="/login" replace />} />
            </Routes>
          </Box>
        </Box>

        {/* User Menu */}
        <Menu
          anchorEl={userMenuAnchor}
          open={Boolean(userMenuAnchor)}
          onClose={handleUserMenuClose}
          onClick={handleUserMenuClose}
        >
          <MenuItem onClick={handleLogout}>
            <ExitToAppIcon sx={{ mr: 1 }} />
            Logout
          </MenuItem>
        </Menu>
      </Box>
    </ThemeProvider>
  );
}

function App() {
  const [mobileMode, setMobileMode] = React.useState(false);

  React.useEffect(() => {
    const isMobileMode = () => {
      // Force desktop mode on port 3000
      if (window.location.port === '3000') {
        console.log("🖥️ Port 3000 detected - forcing desktop mode");
        return false;
      }
      
      const envMobileMode = process.env.REACT_APP_MOBILE_MODE === "true";
      const isCapacitor = window.Capacitor !== undefined;
      const urlMobile = window.location.pathname.includes("/mobile") || 
                       window.location.search.includes("mobile=true");
      
      console.log("🔍 Mobile mode detection:", {
        port: window.location.port,
        envMobileMode,
        isCapacitor,
        urlMobile,
        finalDecision: envMobileMode || isCapacitor || urlMobile
      });
      
      return envMobileMode || isCapacitor || urlMobile;
    };

    setMobileMode(isMobileMode());
  }, []);

  return (
    <AuthProvider>
      <Router>
        {mobileMode ? <MobileApp /> : <AppShell />}
      </Router>
    </AuthProvider>
  );
}
export default App;

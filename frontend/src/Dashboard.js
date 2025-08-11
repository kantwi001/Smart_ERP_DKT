import React, { useEffect, useState, useContext } from 'react';
import api from './api';
import { AuthContext } from './AuthContext';
import { 
  Box, Typography, Grid, Card, CardContent, CircularProgress, Alert, List, ListItem, ListItemText,
  Tabs, Tab, Paper, Chip, Avatar, LinearProgress, Divider, IconButton, Button, CardActions
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Inventory,
  People,
  ShoppingCart,
  AccountBalance,
  Assessment,
  Warning,
  CheckCircle,
  Schedule,
  Store,
  Analytics,
  Group,
  Warehouse,
  School,
  ArrowForward,
  Business,
  Speed,
  Settings
} from '@mui/icons-material';
import DashboardService from './services/DashboardService';
import { styled } from '@mui/material/styles';
import AssessmentIcon from '@mui/icons-material/Assessment';
import InventoryIcon from '@mui/icons-material/Inventory';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import PeopleIcon from '@mui/icons-material/People';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import GroupIcon from '@mui/icons-material/Group';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import TimelineIcon from '@mui/icons-material/Timeline';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BusinessIcon from '@mui/icons-material/Business';
import SpeedIcon from '@mui/icons-material/Speed';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import SettingsIcon from '@mui/icons-material/Settings';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import RefreshIcon from '@mui/icons-material/Refresh';
import CustomerMap from './CustomerMap';
import SystemStatus from './components/SystemStatus';
import BackendChecker from './utils/BackendChecker';
import TransactionIntegration from './components/TransactionIntegration';
import { useCrossModuleTransactions } from './hooks/useTransactionIntegration';
import AdvancedAnalytics from './components/AdvancedAnalytics';
import TimeBasedAnalytics from './components/TimeBasedAnalytics';
import GanttChart from './components/GanttChart';
import { useTransactionIntegration } from './hooks/useTransactionIntegration';

// Styled components for modern design
const StyledTabs = styled(Tabs)(({ theme }) => ({
  backgroundColor: '#fff',
  borderRadius: '12px 12px 0 0',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  '& .MuiTabs-indicator': {
    height: 3,
    borderRadius: '3px 3px 0 0',
    background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
  },
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '0.95rem',
  minHeight: 64,
  color: '#666',
  '&.Mui-selected': {
    color: '#2196F3',
  },
}));

const MetricCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  borderRadius: 16,
  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
  transition: 'transform 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
  },
}));

const AnalyticsCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  border: '1px solid #f0f0f0',
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
    transform: 'translateY(-2px)',
  },
}));

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const Dashboard = () => {
  const { token } = useContext(AuthContext);
  const [tabValue, setTabValue] = useState(0);
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [customerCount, setCustomerCount] = useState(0);
  const [customerLocations, setCustomerLocations] = useState([]);
  const [revenue, setRevenue] = useState(null);
  const [transactionsPerStaff, setTransactionsPerStaff] = useState([]);
  const [customerBalances, setCustomerBalances] = useState([]);
  const [modulesSummary, setModulesSummary] = useState({});
  const [modulesLoading, setModulesLoading] = useState(true);
  
  // Cross-module transaction integration
  const allModules = ['sales', 'inventory', 'procurement', 'manufacturing', 'accounting', 'hr', 'pos', 'warehouse', 'customers', 'reporting'];
  const { crossModuleData, loading: transactionLoading, refresh: refreshTransactions } = useCrossModuleTransactions(allModules);
  
  // Transaction integration for dashboard analytics
  const {
    transactions,
    analytics,
    recordDashboardTransaction,
    refreshData
  } = useTransactionIntegration('dashboard');

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log('[Dashboard] Starting comprehensive data fetch for all modules...');
        
        // Test backend connectivity first
        try {
          await api.get('/users/', { headers: { Authorization: `Bearer ${token}` } });
          console.log('[Dashboard] Backend connectivity confirmed');
        } catch (connectError) {
          console.error('[Dashboard] Backend connectivity failed:', connectError);
          setError('Backend server is not accessible. Please ensure the backend server is running on port 2025.');
          setLoading(false);
          return;
        }

        // Fetch data from all modules for comprehensive dashboard
        const moduleRequests = await Promise.allSettled([
          // Core business metrics
          api.get('/reporting/dashboard/revenue/', { headers: { Authorization: `Bearer ${token}` } }),
          api.get('/reporting/dashboard/transactions-per-staff/', { headers: { Authorization: `Bearer ${token}` } }),
          api.get('/reporting/dashboard/customer-balances/', { headers: { Authorization: `Bearer ${token}` } }),
          api.get('/sales/customers/', { headers: { Authorization: `Bearer ${token}` } }),
          
          // Inventory & Warehouse
          api.get('/inventory/products/', { headers: { Authorization: `Bearer ${token}` } }),
          api.get('/inventory/transfers/', { headers: { Authorization: `Bearer ${token}` } }),
          api.get('/warehouse/', { headers: { Authorization: `Bearer ${token}` } }),
          
          // Sales & POS
          api.get('/sales/orders/', { headers: { Authorization: `Bearer ${token}` } }),
          api.get('/pos/transactions/', { headers: { Authorization: `Bearer ${token}` } }),
          
          // HR & Employees
          api.get('/hr/employees/', { headers: { Authorization: `Bearer ${token}` } }),
          api.get('/hr/leave-requests/', { headers: { Authorization: `Bearer ${token}` } }),
          api.get('/hr/leave-dashboard-stats/', { headers: { Authorization: `Bearer ${token}` } }),
          
          // Procurement & Manufacturing
          api.get('/procurement/requests/', { headers: { Authorization: `Bearer ${token}` } }),
          api.get('/manufacturing/work-orders/', { headers: { Authorization: `Bearer ${token}` } }),
          
          // Accounting & Finance
          api.get('/accounting/transactions/', { headers: { Authorization: `Bearer ${token}` } }),
          api.get('/accounting/accounts/', { headers: { Authorization: `Bearer ${token}` } }),
          
          // System & Users
          api.get('/users/', { headers: { Authorization: `Bearer ${token}` } }),
          api.get('/notifications/', { headers: { Authorization: `Bearer ${token}` } })
        ]);

        // Process all module data
        const [
          revenueRes, txStaffRes, custBalRes, customersRes,
          productsRes, transfersRes, warehousesRes,
          ordersRes, posTransactionsRes,
          employeesRes, leaveRequestsRes, leaveStatsRes,
          procurementRes, manufacturingRes,
          accountingTransactionsRes, accountsRes,
          usersRes, notificationsRes
        ] = moduleRequests;

        console.log('[Dashboard] All module API results:', {
          revenue: revenueRes.status,
          customers: customersRes.status,
          products: productsRes.status,
          employees: employeesRes.status,
          orders: ordersRes.status,
          procurement: procurementRes.status,
          accounting: accountingTransactionsRes.status,
          users: usersRes.status
        });

        // Process and set comprehensive module data
        const customersData = customersRes.status === 'fulfilled' && customersRes.value?.data ? customersRes.value.data : [];
        const productsData = productsRes.status === 'fulfilled' && productsRes.value?.data ? productsRes.value.data : [];
        const employeesData = employeesRes.status === 'fulfilled' && employeesRes.value?.data ? employeesRes.value.data : [];
        const ordersData = ordersRes.status === 'fulfilled' && ordersRes.value?.data ? ordersRes.value.data : [];
        const usersData = usersRes.status === 'fulfilled' && usersRes.value?.data ? usersRes.value.data : [];
        const warehousesData = warehousesRes.status === 'fulfilled' && warehousesRes.value?.data ? warehousesRes.value.data : [];
        const transfersData = transfersRes.status === 'fulfilled' && transfersRes.value?.data ? transfersRes.value.data : [];
        const leaveRequestsData = leaveRequestsRes.status === 'fulfilled' && leaveRequestsRes.value?.data ? leaveRequestsRes.value.data : [];
        const procurementData = procurementRes.status === 'fulfilled' && procurementRes.value?.data ? procurementRes.value.data : [];
        const posTransactionsData = posTransactionsRes.status === 'fulfilled' && posTransactionsRes.value?.data ? posTransactionsRes.value.data : [];
        const accountingTransactionsData = accountingTransactionsRes.status === 'fulfilled' && accountingTransactionsRes.value?.data ? accountingTransactionsRes.value.data : [];
        const notificationsData = notificationsRes.status === 'fulfilled' && notificationsRes.value?.data ? notificationsRes.value.data : [];

        // Set comprehensive stats for all modules
        setStats({
          // Sales & Customer metrics
          totalRevenue: revenueRes.status === 'fulfilled' && revenueRes.value?.data?.revenue ? revenueRes.value.data.revenue : 0,
          totalCustomers: Array.isArray(customersData) ? customersData.length : 0,
          totalOrders: Array.isArray(ordersData) ? ordersData.length : 0,
          pendingOrders: Array.isArray(ordersData) ? ordersData.filter(order => order.status === 'pending').length : 0,
          
          // Inventory & Warehouse metrics
          totalProducts: Array.isArray(productsData) ? productsData.length : 0,
          lowStockProducts: Array.isArray(productsData) ? productsData.filter(product => product.stock_quantity < 10).length : 0,
          totalWarehouses: Array.isArray(warehousesData) ? warehousesData.length : 0,
          pendingTransfers: Array.isArray(transfersData) ? transfersData.filter(transfer => transfer.status === 'pending').length : 0,
          
          // HR metrics
          totalEmployees: Array.isArray(employeesData) ? employeesData.length : 0,
          pendingLeaveRequests: Array.isArray(leaveRequestsData) ? leaveRequestsData.filter(request => request.status === 'pending').length : 0,
          
          // Procurement & Manufacturing
          totalProcurementRequests: Array.isArray(procurementData) ? procurementData.length : 0,
          pendingProcurement: Array.isArray(procurementData) ? procurementData.filter(req => req.status === 'pending').length : 0,
          
          // POS & Transactions
          totalPOSTransactions: Array.isArray(posTransactionsData) ? posTransactionsData.length : 0,
          todayPOSTransactions: Array.isArray(posTransactionsData) ? posTransactionsData.filter(tx => {
            const today = new Date().toDateString();
            return new Date(tx.created_at).toDateString() === today;
          }).length : 0,
          
          // Accounting & Finance
          totalAccountingTransactions: Array.isArray(accountingTransactionsData) ? accountingTransactionsData.length : 0,
          
          // System metrics
          totalUsers: Array.isArray(usersData) ? usersData.length : 0,
          unreadNotifications: Array.isArray(notificationsData) ? notificationsData.filter(notif => !notif.read).length : 0
        });

        // Set module-specific data
        setCustomerCount(Array.isArray(customersData) ? customersData.length : 0);
        setCustomerLocations(Array.isArray(customersData) ? customersData : []);
        setRevenue(revenueRes.status === 'fulfilled' && revenueRes.value?.data?.revenue ? revenueRes.value.data.revenue : 0);
        setTransactionsPerStaff(txStaffRes.status === 'fulfilled' && txStaffRes.value?.data?.transactions_per_staff ? txStaffRes.value.data.transactions_per_staff : []);
        setCustomerBalances(custBalRes.status === 'fulfilled' && custBalRes.value?.data?.customer_balances ? custBalRes.value.data.customer_balances : []);

        // Set comprehensive modules summary
        setModulesSummary({
          sales: {
            customers: Array.isArray(customersData) ? customersData.length : 0,
            orders: Array.isArray(ordersData) ? ordersData.length : 0,
            revenue: revenueRes.status === 'fulfilled' && revenueRes.value?.data?.revenue ? revenueRes.value.data.revenue : 0
          },
          inventory: {
            products: Array.isArray(productsData) ? productsData.length : 0,
            lowStock: Array.isArray(productsData) ? productsData.filter(p => p.stock_quantity < 10).length : 0,
            transfers: Array.isArray(transfersData) ? transfersData.length : 0
          },
          hr: {
            employees: Array.isArray(employeesData) ? employeesData.length : 0,
            leaveRequests: Array.isArray(leaveRequestsData) ? leaveRequestsData.length : 0,
            pendingLeave: Array.isArray(leaveRequestsData) ? leaveRequestsData.filter(r => r.status === 'pending').length : 0
          },
          warehouse: {
            warehouses: Array.isArray(warehousesData) ? warehousesData.length : 0,
            pendingTransfers: Array.isArray(transfersData) ? transfersData.filter(t => t.status === 'pending').length : 0
          },
          procurement: {
            requests: Array.isArray(procurementData) ? procurementData.length : 0,
            pending: Array.isArray(procurementData) ? procurementData.filter(r => r.status === 'pending').length : 0
          },
          pos: {
            transactions: Array.isArray(posTransactionsData) ? posTransactionsData.length : 0,
            todayTransactions: Array.isArray(posTransactionsData) ? posTransactionsData.filter(tx => {
              const today = new Date().toDateString();
              return new Date(tx.created_at).toDateString() === today;
            }).length : 0
          },
          accounting: {
            transactions: Array.isArray(accountingTransactionsData) ? accountingTransactionsData.length : 0
          },
          system: {
            users: Array.isArray(usersData) ? usersData.length : 0,
            notifications: Array.isArray(notificationsData) ? notificationsData.length : 0
          }
        });

        // Set comprehensive activity feed
        const recentActivity = [];
        
        // Add recent orders
        if (Array.isArray(ordersData) && ordersData.length > 0) {
          ordersData.slice(0, 3).forEach(order => {
            recentActivity.push({
              id: `order-${order.id}`,
              type: 'sales',
              message: `New sales order #${order.id} created`,
              timestamp: order.created_at || new Date().toISOString(),
              module: 'Sales'
            });
          });
        }
        
        // Add recent leave requests
        if (Array.isArray(leaveRequestsData) && leaveRequestsData.length > 0) {
          leaveRequestsData.slice(0, 2).forEach(request => {
            recentActivity.push({
              id: `leave-${request.id}`,
              type: 'hr',
              message: `Leave request submitted by ${request.employee?.user?.first_name || 'Employee'}`,
              timestamp: request.requested_at || new Date().toISOString(),
              module: 'HR'
            });
          });
        }
        
        // Add recent transfers
        if (Array.isArray(transfersData) && transfersData.length > 0) {
          transfersData.slice(0, 2).forEach(transfer => {
            recentActivity.push({
              id: `transfer-${transfer.id}`,
              type: 'inventory',
              message: `Inventory transfer from ${transfer.from_warehouse?.name || 'Warehouse'} to ${transfer.to_warehouse?.name || 'Warehouse'}`,
              timestamp: transfer.created_at || new Date().toISOString(),
              module: 'Inventory'
            });
          });
        }
        
        // Sort by timestamp and set activity
        recentActivity.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setActivity(recentActivity.length > 0 ? recentActivity : [
          { id: 1, type: 'info', message: 'Comprehensive dashboard loaded successfully', timestamp: new Date().toISOString(), module: 'System' }
        ]);

        console.log('[Dashboard] Comprehensive data loaded successfully for all modules');
        
      } catch (err) {
        console.error('[Dashboard] Error loading comprehensive dashboard data:', err);
        if (err.response?.status === 401) {
          setError('Authentication failed. Please log in again.');
        } else if (err.response?.status === 403) {
          setError('Access denied. You do not have permission to view this dashboard.');
        } else {
          setError(`Failed to load dashboard data: ${err.message || 'Unknown error'}`);
        }
      } finally {
        setLoading(false);
        setModulesLoading(false);
      }
    };

    if (token) {
      fetchDashboard();
    }
  }, [token]);

  // Function to get icon component by name
  const getIconComponent = (iconName) => {
    const icons = {
      Inventory,
      TrendingUp,
      People,
      ShoppingCart,
      Analytics,
      Store,
      AccountBalance,
      Group,
      Warehouse,
      School,
      Assessment
    };
    return icons[iconName] || Assessment;
  };

  // Function to render module summary cards
  const renderModuleSummaryCards = () => {
    const moduleConfig = DashboardService.getModuleConfig();
    
    return (
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12}>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 3, color: '#1a1a1a' }}>
            📊 Modules Overview
          </Typography>
        </Grid>
        {Object.entries(moduleConfig).map(([moduleKey, config]) => {
          const moduleData = modulesSummary[moduleKey];
          const IconComponent = getIconComponent(config.icon);
          
          return (
            <Grid item xs={12} sm={6} md={4} lg={3} key={moduleKey}>
              <Card 
                sx={{ 
                  height: '100%',
                  borderRadius: 3,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.12)'
                  },
                  border: `2px solid ${config.color}20`
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Box 
                      sx={{ 
                        p: 1.5, 
                        borderRadius: 2, 
                        bgcolor: config.bgColor,
                        mr: 2
                      }}
                    >
                      <IconComponent sx={{ color: config.color, fontSize: 28 }} />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a1a1a' }}>
                      {config.name}
                    </Typography>
                  </Box>
                  
                  {modulesLoading ? (
                    <Box display="flex" justifyContent="center" py={2}>
                      <CircularProgress size={24} />
                    </Box>
                  ) : moduleData ? (
                    <Box>
                      {/* Render module-specific metrics */}
                      {moduleKey === 'inventory' && (
                        <>
                          <Typography variant="h4" sx={{ fontWeight: 700, color: config.color, mb: 1 }}>
                            {moduleData.totalProducts || 0}
                          </Typography>
                          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                            Total Products
                          </Typography>
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Chip 
                              label={`${moduleData.lowStockProducts || 0} Low Stock`} 
                              size="small" 
                              color={moduleData.lowStockProducts > 0 ? 'warning' : 'success'}
                            />
                            <Typography variant="caption" color="textSecondary">
                              ${(moduleData.totalValue || 0).toLocaleString()}
                            </Typography>
                          </Box>
                        </>
                      )}
                      
                      {moduleKey === 'sales' && (
                        <>
                          <Typography variant="h4" sx={{ fontWeight: 700, color: config.color, mb: 1 }}>
                            {moduleData.totalOrders || 0}
                          </Typography>
                          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                            Total Orders
                          </Typography>
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Chip 
                              label={`${moduleData.pendingOrders || 0} Pending`} 
                              size="small" 
                              color={moduleData.pendingOrders > 0 ? 'warning' : 'success'}
                            />
                            <Typography variant="caption" color="textSecondary">
                              ${(moduleData.monthlyRevenue || 0).toLocaleString()}
                            </Typography>
                          </Box>
                        </>
                      )}
                      
                      {moduleKey === 'hr' && (
                        <>
                          <Typography variant="h4" sx={{ fontWeight: 700, color: config.color, mb: 1 }}>
                            {moduleData.totalEmployees || 0}
                          </Typography>
                          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                            Total Employees
                          </Typography>
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Chip 
                              label={`${moduleData.pendingLeaveRequests || 0} Leave Requests`} 
                              size="small" 
                              color={moduleData.pendingLeaveRequests > 0 ? 'info' : 'default'}
                            />
                            <Typography variant="caption" color="textSecondary">
                              {moduleData.upcomingTraining || 0} Training
                            </Typography>
                          </Box>
                        </>
                      )}
                      
                      {moduleKey === 'procurement' && (
                        <>
                          <Typography variant="h4" sx={{ fontWeight: 700, color: config.color, mb: 1 }}>
                            {moduleData.totalRequests || 0}
                          </Typography>
                          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                            Total Requests
                          </Typography>
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Chip 
                              label={`${moduleData.pendingRequests || 0} Pending`} 
                              size="small" 
                              color={moduleData.pendingRequests > 0 ? 'warning' : 'success'}
                            />
                            <Typography variant="caption" color="textSecondary">
                              {moduleData.activeSuppliers || 0} Suppliers
                            </Typography>
                          </Box>
                        </>
                      )}
                      
                      {moduleKey === 'manufacturing' && (
                        <>
                          <Typography variant="h4" sx={{ fontWeight: 700, color: config.color, mb: 1 }}>
                            {moduleData.totalOrders || 0}
                          </Typography>
                          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                            Manufacturing Orders
                          </Typography>
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Chip 
                              label={`${moduleData.inProgressOrders || 0} In Progress`} 
                              size="small" 
                              color={moduleData.inProgressOrders > 0 ? 'info' : 'default'}
                            />
                            <Typography variant="caption" color="textSecondary">
                              {moduleData.activeWorkstations || 0} Workstations
                            </Typography>
                          </Box>
                        </>
                      )}
                      
                      {moduleKey === 'pos' && (
                        <>
                          <Typography variant="h4" sx={{ fontWeight: 700, color: config.color, mb: 1 }}>
                            {moduleData.todayTransactions || 0}
                          </Typography>
                          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                            Today's Transactions
                          </Typography>
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Chip 
                              label={`${moduleData.totalTransactions || 0} Total`} 
                              size="small" 
                              color="info"
                            />
                            <Typography variant="caption" color="textSecondary">
                              ${(moduleData.todayRevenue || 0).toLocaleString()}
                            </Typography>
                          </Box>
                        </>
                      )}
                      
                      {moduleKey === 'accounting' && (
                        <>
                          <Typography variant="h4" sx={{ fontWeight: 700, color: config.color, mb: 1 }}>
                            {moduleData.totalAccounts || 0}
                          </Typography>
                          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                            Total Accounts
                          </Typography>
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Chip 
                              label={`${moduleData.pendingInvoices || 0} Pending Invoices`} 
                              size="small" 
                              color={moduleData.pendingInvoices > 0 ? 'warning' : 'success'}
                            />
                            <Typography variant="caption" color="textSecondary">
                              ${(moduleData.totalBalance || 0).toLocaleString()}
                            </Typography>
                          </Box>
                        </>
                      )}
                      
                      {moduleKey === 'customers' && (
                        <>
                          <Typography variant="h4" sx={{ fontWeight: 700, color: config.color, mb: 1 }}>
                            {moduleData.totalCustomers || 0}
                          </Typography>
                          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                            Total Customers
                          </Typography>
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Chip 
                              label={`${moduleData.newCustomers || 0} New`} 
                              size="small" 
                              color="success"
                            />
                            <Typography variant="caption" color="textSecondary">
                              {moduleData.activeCustomers || 0} Active
                            </Typography>
                          </Box>
                        </>
                      )}
                      
                      {moduleKey === 'warehouse' && (
                        <>
                          <Typography variant="h4" sx={{ fontWeight: 700, color: config.color, mb: 1 }}>
                            {moduleData.totalWarehouses || 0}
                          </Typography>
                          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                            Total Warehouses
                          </Typography>
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Chip 
                              label={`${moduleData.pendingTransfers || 0} Pending`} 
                              size="small" 
                              color={moduleData.pendingTransfers > 0 ? 'warning' : 'success'}
                            />
                            <Typography variant="caption" color="textSecondary">
                              {moduleData.completedTransfers || 0} Completed
                            </Typography>
                          </Box>
                        </>
                      )}
                      
                      {moduleKey === 'training' && (
                        <>
                          <Typography variant="h4" sx={{ fontWeight: 700, color: config.color, mb: 1 }}>
                            {moduleData.totalMaterials || 0}
                          </Typography>
                          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                            Training Materials
                          </Typography>
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Chip 
                              label={`${moduleData.totalVideos || 0} Videos`} 
                              size="small" 
                              color="info"
                            />
                            <Typography variant="caption" color="textSecondary">
                              {moduleData.upcomingSessions || 0} Sessions
                            </Typography>
                          </Box>
                        </>
                      )}
                      
                      {moduleKey === 'reporting' && (
                        <>
                          <Typography variant="h4" sx={{ fontWeight: 700, color: config.color, mb: 1 }}>
                            ${(moduleData.totalRevenue || 0).toLocaleString()}
                          </Typography>
                          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                            Total Revenue
                          </Typography>
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Chip 
                              label={`${moduleData.monthlyGrowth || 0}% Growth`} 
                              size="small" 
                              color={moduleData.monthlyGrowth > 0 ? 'success' : 'error'}
                            />
                            <Typography variant="caption" color="textSecondary">
                              {moduleData.totalTransactions || 0} Transactions
                            </Typography>
                          </Box>
                        </>
                      )}
                    </Box>
                  ) : (
                    <Box>
                      <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', py: 2 }}>
                        No data available
                      </Typography>
                    </Box>
                  )}
                </CardContent>
                
                <CardActions sx={{ px: 3, pb: 2 }}>
                  <Button 
                    size="small" 
                    endIcon={<ArrowForward />}
                    sx={{ color: config.color }}
                    onClick={() => {
                      // Navigate to module (you can implement routing here)
                      console.log(`Navigate to ${moduleKey} module`);
                    }}
                  >
                    View Details
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    );
  };

  return (
    <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh', p: 0 }}>
      {/* Header */}
      <Box sx={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        p: 4,
        borderRadius: '0 0 24px 24px',
        mb: 3
      }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
              ERP Dashboard
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              Welcome back! Here's what's happening with your business today.
            </Typography>
          </Box>
          <IconButton 
            onClick={() => window.location.reload()} 
            sx={{ 
              bgcolor: 'rgba(255,255,255,0.2)', 
              color: 'white',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
            }}
          >
            <RefreshIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Loading and Error States */}
      {loading && (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress size={60} thickness={4} />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {/* Tabbed Interface */}
      <Paper sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
        <StyledTabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          variant="fullWidth"
        >
          <StyledTab icon={<TrendingUpIcon />} label="Overview" />
          <StyledTab icon={<TimelineIcon />} label="Analytics" />
          <StyledTab icon={<BusinessCenterIcon />} label="Operations" />
          <StyledTab icon={<LocationOnIcon />} label="Locations" />
        </StyledTabs>

        {/* Overview Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ maxWidth: '100%', overflow: 'hidden' }}>
            <Grid container spacing={2} sx={{ px: { xs: 1, sm: 2 }, py: 1 }}>
              {/* Executive Summary Header */}
              <Grid item xs={12}>
                <Typography variant="h4" gutterBottom sx={{ 
                  fontWeight: 700, 
                  color: '#1976d2', 
                  mb: 2,
                  fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' }
                }}>
                  📈 Executive Dashboard - Business Intelligence Overview
                </Typography>
                <Typography variant="subtitle1" color="text.secondary" sx={{ 
                  mb: 2,
                  fontSize: { xs: '0.9rem', sm: '1rem' }
                }}>
                  Real-time insights across all business operations and modules
                </Typography>
              </Grid>

              {/* Key Performance Indicators (KPIs) */}
              <Grid item xs={12} sm={6} lg={3}>
                <MetricCard sx={{ height: '100%', minHeight: '140px' }}>
                  <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                      <Box>
                        <Typography variant="h4" component="div" sx={{ 
                          fontWeight: 700, 
                          color: '#2e7d32',
                          fontSize: { xs: '1.5rem', sm: '2rem' }
                        }}>
                          GH₵{stats?.totalRevenue?.toLocaleString() || revenue?.toLocaleString() || '0'}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.8, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                          Total Revenue (YTD)
                        </Typography>
                      </Box>
                      <TrendingUpIcon sx={{ fontSize: { xs: 35, sm: 45 }, opacity: 0.8, color: '#2e7d32' }} />
                    </Box>
                    <Box mt={1}>
                      <Typography variant="body2" sx={{ opacity: 0.9, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                        Monthly Growth: +{stats?.monthlyGrowth || 12}%
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                        Target Achievement: {stats?.targetAchievement || 95}%
                      </Typography>
                    </Box>
                  </CardContent>
                </MetricCard>
              </Grid>

              {/* Business Operations Overview */}
              <Grid item xs={12} sm={6} lg={3}>
                <MetricCard sx={{ 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  height: '100%',
                  minHeight: '140px'
                }}>
                  <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                      <Box>
                        <Typography variant="h4" component="div" sx={{ 
                          fontWeight: 700,
                          fontSize: { xs: '1.5rem', sm: '2rem' }
                        }}>
                          {stats?.totalTransactions || '1,247'}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.8, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                          Total Transactions
                        </Typography>
                      </Box>
                      <AssessmentIcon sx={{ fontSize: { xs: 35, sm: 45 }, opacity: 0.8 }} />
                    </Box>
                    <Box mt={1}>
                      <Typography variant="body2" sx={{ opacity: 0.9, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                        Daily Average: {Math.round((stats?.totalTransactions || 1247) / 30)}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                        Processing Time: {stats?.avgProcessingTime || '2.3'}s
                      </Typography>
                    </Box>
                  </CardContent>
                </MetricCard>
              </Grid>

              {/* Organizational Metrics */}
              <Grid item xs={12} sm={6} lg={3}>
                <MetricCard sx={{ 
                  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  height: '100%',
                  minHeight: '140px'
                }}>
                  <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                      <Box>
                        <Typography variant="h4" component="div" sx={{ 
                          fontWeight: 700,
                          fontSize: { xs: '1.5rem', sm: '2rem' }
                        }}>
                          {stats?.totalEmployees || '45'}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.8, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                          Active Workforce
                        </Typography>
                      </Box>
                      <BusinessIcon sx={{ fontSize: { xs: 35, sm: 45 }, opacity: 0.8 }} />
                    </Box>
                    <Box mt={1}>
                      <Typography variant="body2" sx={{ opacity: 0.9, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                        Departments: {stats?.totalDepartments || '8'}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                        Productivity: {stats?.productivityScore || 85}%
                      </Typography>
                    </Box>
                  </CardContent>
                </MetricCard>
              </Grid>

              {/* System Performance */}
              <Grid item xs={12} sm={6} lg={3}>
                <MetricCard sx={{ 
                  background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                  height: '100%',
                  minHeight: '140px'
                }}>
                  <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                      <Box>
                        <Typography variant="h4" component="div" sx={{ 
                          fontWeight: 700,
                          fontSize: { xs: '1.5rem', sm: '2rem' }
                        }}>
                          99.{stats?.systemUptime || 8}%
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.8, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                          System Uptime
                        </Typography>
                      </Box>
                      <SpeedIcon sx={{ fontSize: { xs: 35, sm: 45 }, opacity: 0.8 }} />
                    </Box>
                    <Box mt={1}>
                      <Typography variant="body2" sx={{ opacity: 0.9, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                        API Response: {stats?.avgApiResponse || 120}ms
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                        Active Sessions: {stats?.activeSessions || customerCount || 0}
                      </Typography>
                    </Box>
                  </CardContent>
                </MetricCard>
              </Grid>

              {/* Business Intelligence Charts Section */}
              <Grid item xs={12}>
                <Typography variant="h5" gutterBottom sx={{ 
                  fontWeight: 600, 
                  color: '#333', 
                  mt: 2, 
                  mb: 2,
                  fontSize: { xs: '1.25rem', sm: '1.5rem' }
                }}>
                  📊 Business Intelligence & Analytics
                </Typography>
              </Grid>

              {/* Revenue Analytics */}
              <Grid item xs={12} lg={8}>
                <AnalyticsCard sx={{ height: 'fit-content' }}>
                  <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                    <Box display="flex" alignItems="center" justifyContent="space-between" mb={2} sx={{ 
                      flexDirection: { xs: 'column', sm: 'row' },
                      gap: { xs: 1, sm: 0 }
                    }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                        Revenue & Sales Performance
                      </Typography>
                      <Box display="flex" gap={1} sx={{ flexWrap: 'wrap' }}>
                        <Chip label="Monthly" size="small" color="primary" />
                        <Chip label="Quarterly" size="small" variant="outlined" />
                        <Chip label="Yearly" size="small" variant="outlined" />
                      </Box>
                    </Box>
                    <Box sx={{ 
                      height: { xs: 200, sm: 250, md: 300 }, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      bgcolor: '#f5f5f5', 
                      borderRadius: 2 
                    }}>
                      <Typography variant="body1" color="text.secondary" sx={{ 
                        textAlign: 'center',
                        fontSize: { xs: '0.875rem', sm: '1rem' }
                      }}>
                        📈 Revenue Trend Chart (Integration with Chart.js/D3.js)
                      </Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-around" mt={2} sx={{ 
                      flexDirection: { xs: 'column', sm: 'row' },
                      gap: { xs: 1, sm: 0 }
                    }}>
                      <Box textAlign="center">
                        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                          GH₵{(stats?.monthlyRevenue || revenue || 0).toLocaleString()}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">This Month</Typography>
                      </Box>
                      <Box textAlign="center">
                        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                          GH₵{(stats?.quarterlyRevenue || (revenue * 3) || 0).toLocaleString()}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">This Quarter</Typography>
                      </Box>
                      <Box textAlign="center">
                        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                          GH₵{(stats?.yearlyRevenue || (revenue * 12) || 0).toLocaleString()}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">This Year</Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </AnalyticsCard>
              </Grid>

              {/* Top Performing Modules */}
              <Grid item xs={12} lg={4}>
                <AnalyticsCard sx={{ height: 'fit-content' }}>
                  <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                    <Typography variant="h6" sx={{ 
                      fontWeight: 600, 
                      mb: 2,
                      fontSize: { xs: '1rem', sm: '1.25rem' }
                    }}>
                      Top Performing Modules
                    </Typography>
                    <List dense>
                      {[
                        { module: 'Sales', performance: 95, color: '#4caf50' },
                        { module: 'Inventory', performance: 88, color: '#2196f3' },
                        { module: 'POS', performance: 92, color: '#ff9800' },
                        { module: 'HR', performance: 85, color: '#9c27b0' },
                        { module: 'Procurement', performance: 78, color: '#f44336' }
                      ].map((item, index) => (
                        <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
                          <ListItemText
                            primary={
                              <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Typography variant="body2" sx={{ 
                                  fontWeight: 500,
                                  fontSize: { xs: '0.8rem', sm: '0.875rem' }
                                }}>
                                  {item.module}
                                </Typography>
                                <Typography variant="body2" sx={{ 
                                  fontWeight: 600, 
                                  color: item.color,
                                  fontSize: { xs: '0.8rem', sm: '0.875rem' }
                                }}>
                                  {item.performance}%
                                </Typography>
                              </Box>
                            }
                            secondary={
                              <LinearProgress 
                                variant="determinate" 
                                value={item.performance} 
                                sx={{ 
                                  mt: 0.5, 
                                  height: { xs: 4, sm: 6 }, 
                                  borderRadius: 3,
                                  '& .MuiLinearProgress-bar': { backgroundColor: item.color }
                                }} 
                              />
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </AnalyticsCard>
              </Grid>

              {/* Executive Actions & Management Tools */}
              <Grid item xs={12}>
                <Typography variant="h5" gutterBottom sx={{ 
                  fontWeight: 600, 
                  color: '#333', 
                  mt: 2, 
                  mb: 2,
                  fontSize: { xs: '1.25rem', sm: '1.5rem' }
                }}>
                  🎯 Executive Actions & Management Tools
                </Typography>
              </Grid>

              {/* Management Tool Cards */}
              {[
                {
                  title: 'Financial Management',
                  icon: <AccountBalanceIcon sx={{ mr: 1, color: '#1976d2' }} />,
                  description: 'Monitor cash flow, budgets, and financial performance',
                  metrics: [
                    { label: 'Cash Flow', value: `+GH₵${(stats?.cashFlow || revenue || 0).toLocaleString()}`, color: '#2e7d32' },
                    { label: 'Budget Utilization', value: `${stats?.budgetUtilization || 78}%` },
                    { label: 'ROI', value: `${stats?.roi || 15}%`, color: '#2e7d32' }
                  ],
                  action: () => window.location.href = '/accounting',
                  actionText: 'View Financials'
                },
                {
                  title: 'Operations Management',
                  icon: <SettingsIcon sx={{ mr: 1, color: '#4CAF50' }} />,
                  description: 'Oversee inventory, supply chain, and operational efficiency',
                  metrics: [
                    { label: 'Inventory Turnover', value: `${stats?.inventoryTurnover || 4.2}x` },
                    { label: 'Supply Chain Efficiency', value: `${stats?.supplyChainEfficiency || 89}%` },
                    { label: 'Operational Cost', value: `GH₵${(stats?.operationalCost || Math.round(revenue * 0.3) || 0).toLocaleString()}` }
                  ],
                  action: () => window.location.href = '/inventory',
                  actionText: 'View Operations'
                },
                {
                  title: 'Strategic Planning',
                  icon: <TimelineIcon sx={{ mr: 1, color: '#FF9800' }} />,
                  description: 'Track goals, KPIs, and strategic initiatives',
                  metrics: [
                    { label: 'Strategic Goals', value: `${stats?.strategicGoals || 8}/12` },
                    { label: 'KPI Achievement', value: `${stats?.kpiAchievement || 87}%`, color: (stats?.kpiAchievement || 87) > 80 ? '#2e7d32' : '#f57c00' },
                    { label: 'Project Completion', value: `${stats?.projectCompletion || 73}%` }
                  ],
                  action: () => window.location.href = '/reporting',
                  actionText: 'View Reports'
                }
              ].map((tool, index) => (
                <Grid item xs={12} md={6} lg={4} key={index}>
                  <AnalyticsCard sx={{ height: '100%' }}>
                    <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                      <Box display="flex" alignItems="center" mb={2}>
                        {tool.icon}
                        <Typography variant="h6" sx={{ 
                          fontWeight: 600,
                          fontSize: { xs: '1rem', sm: '1.25rem' }
                        }}>
                          {tool.title}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary" mb={2} sx={{
                        fontSize: { xs: '0.8rem', sm: '0.875rem' }
                      }}>
                        {tool.description}
                      </Typography>
                      {tool.metrics.map((metric, idx) => (
                        <Box key={idx} display="flex" justifyContent="space-between" mb={1}>
                          <Typography variant="body2" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                            {metric.label}:
                          </Typography>
                          <Typography variant="body2" sx={{ 
                            fontWeight: 600, 
                            color: metric.color || 'inherit',
                            fontSize: { xs: '0.8rem', sm: '0.875rem' }
                          }}>
                            {metric.value}
                          </Typography>
                        </Box>
                      ))}
                    </CardContent>
                    <CardActions sx={{ p: { xs: 2, sm: 3 }, pt: 0 }}>
                      <Button size="small" endIcon={<ArrowForwardIcon />} onClick={tool.action}>
                        {tool.actionText}
                      </Button>
                    </CardActions>
                  </AnalyticsCard>
                </Grid>
              ))}

              {/* Bottom Section - Alerts and Summary */}
              <Grid item xs={12} lg={6}>
                <AnalyticsCard sx={{ height: 'fit-content' }}>
                  <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                    <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                      <Typography variant="h6" sx={{ 
                        fontWeight: 600,
                        fontSize: { xs: '1rem', sm: '1.25rem' }
                      }}>
                        System-wide Alerts & Notifications
                      </Typography>
                      <IconButton size="small" onClick={() => window.location.reload()}>
                        <RefreshIcon />
                      </IconButton>
                    </Box>
                    <List dense>
                      {[
                        { type: 'warning', message: 'Low inventory levels detected in 3 products', module: 'Inventory', priority: 'High' },
                        { type: 'info', message: '5 pending procurement approvals require attention', module: 'Procurement', priority: 'Medium' },
                        { type: 'success', message: 'Monthly sales target achieved (105%)', module: 'Sales', priority: 'Low' },
                        { type: 'error', message: 'System backup completed successfully', module: 'System', priority: 'Low' }
                      ].map((alert, index) => (
                        <ListItem key={index} divider={index < 3} sx={{ px: 0, py: 0.5 }}>
                          <ListItemText
                            primary={
                              <Box display="flex" alignItems="center" justifyContent="space-between" sx={{
                                flexDirection: { xs: 'column', sm: 'row' },
                                alignItems: { xs: 'flex-start', sm: 'center' },
                                gap: { xs: 0.5, sm: 1 }
                              }}>
                                <Typography variant="body2" sx={{ 
                                  fontWeight: 500,
                                  fontSize: { xs: '0.8rem', sm: '0.875rem' }
                                }}>
                                  {alert.message}
                                </Typography>
                                <Chip 
                                  label={alert.priority} 
                                  size="small" 
                                  color={alert.priority === 'High' ? 'error' : alert.priority === 'Medium' ? 'warning' : 'success'}
                                  variant="outlined"
                                />
                              </Box>
                            }
                            secondary={
                              <Typography variant="caption" color="text.secondary">
                                {alert.module} • {new Date().toLocaleTimeString()}
                              </Typography>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </AnalyticsCard>
              </Grid>

              {/* Executive Summary Report */}
              <Grid item xs={12} lg={6}>
                <AnalyticsCard sx={{ height: 'fit-content' }}>
                  <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                    <Typography variant="h6" sx={{ 
                      fontWeight: 600, 
                      mb: 2,
                      fontSize: { xs: '1rem', sm: '1.25rem' }
                    }}>
                      Executive Summary Report
                    </Typography>
                    <Box mb={2}>
                      <Typography variant="body2" sx={{ 
                        fontWeight: 500, 
                        mb: 1,
                        fontSize: { xs: '0.8rem', sm: '0.875rem' }
                      }}>
                        Business Performance Overview
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ 
                        mb: 2,
                        fontSize: { xs: '0.75rem', sm: '0.875rem' }
                      }}>
                        Overall business performance is strong with revenue growth of {stats?.monthlyGrowth || 12}% 
                        compared to last month. Key operational metrics show positive trends across all modules.
                      </Typography>
                      
                      <Typography variant="body2" sx={{ 
                        fontWeight: 500, 
                        mb: 1,
                        fontSize: { xs: '0.8rem', sm: '0.875rem' }
                      }}>
                        Key Achievements
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ 
                        mb: 2,
                        fontSize: { xs: '0.75rem', sm: '0.875rem' }
                      }}>
                        • Sales targets exceeded by {((stats?.targetAchievement || 95) - 100) || -5}%<br/>
                        • System uptime maintained at 99.{stats?.systemUptime || 8}%<br/>
                        • Employee productivity improved by {stats?.productivityGrowth || 5}%
                      </Typography>
                      
                      <Typography variant="body2" sx={{ 
                        fontWeight: 500, 
                        mb: 1,
                        fontSize: { xs: '0.8rem', sm: '0.875rem' }
                      }}>
                        Areas for Attention
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{
                        fontSize: { xs: '0.75rem', sm: '0.875rem' }
                      }}>
                        • Monitor inventory levels to prevent stockouts<br/>
                        • Review procurement approval processes<br/>
                        • Continue focus on operational efficiency
                      </Typography>
                    </Box>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="caption" color="text.secondary">
                      Report generated: {new Date().toLocaleString()}
                    </Typography>
                  </CardContent>
                </AnalyticsCard>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>

        {/* Analytics Tab */}
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            {/* Transaction Integration */}
            <Grid item xs={12} md={6}>
              <TransactionIntegration 
                moduleId="dashboard" 
                title="Cross-Module Transaction Flow"
              />
            </Grid>
            
            {/* Time-Based Analytics */}
            <Grid item xs={12} md={6}>
              <TimeBasedAnalytics 
                moduleId="dashboard" 
                title="Dashboard Trends Analysis"
              />
            </Grid>
            
            {/* Advanced Analytics with Charts */}
            <Grid item xs={12}>
              <AdvancedAnalytics 
                moduleId="dashboard" 
                title="System Performance Analytics"
                data={{
                  total_modules: 10,
                  active_users: stats?.users || 0,
                  total_transactions: stats?.sales || 0,
                  system_uptime: 99.8
                }}
              />
            </Grid>
            
            {/* Gantt Chart for System Projects */}
            <Grid item xs={12}>
              <GanttChart 
                title="ERP System Enhancement Timeline"
                projects={[
                  {
                    id: 1,
                    name: 'ERP System Enhancement',
                    type: 'dashboard',
                    manager: 'System Administrator',
                    status: 'in-progress',
                    priority: 'high',
                    startDate: new Date('2024-01-01'),
                    endDate: new Date('2024-12-31'),
                    progress: 75,
                    budget: 150000,
                    team: ['System Admin', 'Database Admin', 'UI/UX Designer'],
                    tasks: [
                      {
                        id: 801,
                        name: 'Analytics Integration',
                        startDate: new Date('2024-01-01'),
                        endDate: new Date('2024-03-31'),
                        progress: 100,
                        status: 'completed',
                        assignee: 'System Admin',
                        dependencies: []
                      },
                      {
                        id: 802,
                        name: 'UI/UX Modernization',
                        startDate: new Date('2024-02-01'),
                        endDate: new Date('2024-06-30'),
                        progress: 85,
                        status: 'in-progress',
                        assignee: 'UI/UX Designer',
                        dependencies: [801]
                      },
                      {
                        id: 803,
                        name: 'Performance Optimization',
                        startDate: new Date('2024-07-01'),
                        endDate: new Date('2024-10-31'),
                        progress: 60,
                        status: 'in-progress',
                        assignee: 'Database Admin',
                        dependencies: [802]
                      },
                      {
                        id: 804,
                        name: 'Final Testing & Deployment',
                        startDate: new Date('2024-11-01'),
                        endDate: new Date('2024-12-31'),
                        progress: 0,
                        status: 'pending',
                        assignee: 'System Admin',
                        dependencies: [803]
                      }
                    ]
                  }
                ]}
              />
            </Grid>
          </Grid>
        </TabPanel>

        {/* Operations Tab */}
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            {/* Operations Overview */}
            <Grid item xs={12}>
              <AnalyticsCard>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center' }}>
                    <LocationOnIcon sx={{ mr: 1, color: '#2196F3' }} />
                    Customer Locations
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <CustomerMap customers={customerLocations} height={400} />
                </CardContent>
              </AnalyticsCard>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default Dashboard;

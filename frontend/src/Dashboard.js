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
  ArrowForward
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
import TransactionIntegration from './components/TransactionIntegration';
import { useCrossModuleTransactions } from './hooks/useTransactionIntegration';
import AdvancedAnalytics from './components/AdvancedAnalytics';
import TimeBasedAnalytics from './components/TimeBasedAnalytics';
import GanttChart from './components/GanttChart';
import { useTransactionIntegration } from './hooks/useTransactionIntegration';
import RefreshIcon from '@mui/icons-material/Refresh';
import CustomerMap from './CustomerMap';

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
        const [revenueRes, txStaffRes, custBalRes, statsRes, activityRes, customersRes] = await Promise.all([
          api.get('/reporting/dashboard/revenue/', { headers: { Authorization: `Bearer ${token}` } }).catch(e => null),
          api.get('/reporting/dashboard/transactions-per-staff/', { headers: { Authorization: `Bearer ${token}` } }).catch(e => null),
          api.get('/reporting/dashboard/customer-balances/', { headers: { Authorization: `Bearer ${token}` } }).catch(e => null),
          // api.get('/dashboard/stats/', { headers: { Authorization: `Bearer ${token}` } }).catch(e => null),
          // api.get('/dashboard/activity/', { headers: { Authorization: `Bearer ${token}` } }).catch(e => null),
          api.get('/sales/customers/', { headers: { Authorization: `Bearer ${token}` } }).catch(e => null)
        ]);
        // Allow partial data loading: always render, even if some API calls fail
        setRevenue(revenueRes && revenueRes.data && revenueRes.data.revenue ? revenueRes.data.revenue : null);
        setTransactionsPerStaff(txStaffRes && txStaffRes.data && txStaffRes.data.transactions_per_staff ? txStaffRes.data.transactions_per_staff : null);
        setCustomerBalances(custBalRes && custBalRes.data && custBalRes.data.customer_balances ? custBalRes.data.customer_balances : null);
        setStats(statsRes && statsRes.data ? statsRes.data : null);
        setActivity(activityRes && activityRes.data ? activityRes.data : null);
        setCustomerCount(customersRes && customersRes.data && Array.isArray(customersRes.data) ? customersRes.data.length : null);
        setCustomerLocations(customersRes && customersRes.data && Array.isArray(customersRes.data) ? customersRes.data : null);
      } catch (err) {
        console.error(err);
        setError('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    
    const fetchModulesSummary = async () => {
      setModulesLoading(true);
      try {
        const summary = await DashboardService.getAllModulesSummary();
        setModulesSummary(summary);
      } catch (err) {
        console.error('Error loading modules summary:', err);
      } finally {
        setModulesLoading(false);
      }
    };
    
    fetchDashboard();
    fetchModulesSummary();
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
                  transition: 'all 0.3s ease',
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
          {/* Module Summary Cards */}
          {renderModuleSummaryCards()}
          
          <Grid container spacing={3}>
            {/* Key Metrics */}
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="body2" sx={{ opacity: 0.8, mb: 1 }}>Total Customers</Typography>
                      <Typography variant="h3" sx={{ fontWeight: 700 }}>
                        {customerCount !== null ? customerCount : '0'}
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                      <GroupIcon sx={{ fontSize: 28 }} />
                    </Avatar>
                  </Box>
                </CardContent>
              </MetricCard>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <MetricCard sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="body2" sx={{ opacity: 0.8, mb: 1 }}>Total Revenue</Typography>
                      <Typography variant="h3" sx={{ fontWeight: 700 }}>
                        {revenue !== null ? `₵${revenue?.toLocaleString()}` : '₵0'}
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                      <AccountBalanceWalletIcon sx={{ fontSize: 28 }} />
                    </Avatar>
                  </Box>
                </CardContent>
              </MetricCard>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <MetricCard sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="body2" sx={{ opacity: 0.8, mb: 1 }}>Active Sales</Typography>
                      <Typography variant="h3" sx={{ fontWeight: 700 }}>
                        {stats?.sales || '0'}
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                      <TrendingUpIcon sx={{ fontSize: 28 }} />
                    </Avatar>
                  </Box>
                </CardContent>
              </MetricCard>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <MetricCard sx={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="body2" sx={{ opacity: 0.8, mb: 1 }}>Inventory Items</Typography>
                      <Typography variant="h3" sx={{ fontWeight: 700 }}>
                        {stats?.inventory || '0'}
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                      <InventoryIcon sx={{ fontSize: 28 }} />
                    </Avatar>
                  </Box>
                </CardContent>
              </MetricCard>
            </Grid>

            {/* Recent Activity */}
            <Grid item xs={12} md={8}>
              <AnalyticsCard>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center' }}>
                    <TimelineIcon sx={{ mr: 1, color: '#2196F3' }} />
                    Recent Activity
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  {activity && activity.length > 0 ? (
                    <List sx={{ py: 0 }}>
                      {activity.slice(0, 5).map((item, idx) => (
                        <ListItem key={idx} sx={{ px: 0, py: 1 }}>
                          <ListItemText 
                            primary={item.action || 'Unknown action'}
                            secondary={item.timestamp || 'No timestamp'}
                            primaryTypographyProps={{ fontWeight: 500 }}
                          />
                          <Chip label="New" size="small" color="primary" variant="outlined" />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Alert severity="info" sx={{ borderRadius: 2 }}>Activity data unavailable</Alert>
                  )}
                </CardContent>
              </AnalyticsCard>
            </Grid>

            {/* Quick Stats */}
            <Grid item xs={12} md={4}>
              <AnalyticsCard>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Quick Stats</Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Box sx={{ space: 2 }}>
                    <Box sx={{ mb: 2 }}>
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="body2">Sales Progress</Typography>
                        <Typography variant="body2" color="primary">75%</Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={75} sx={{ borderRadius: 1, height: 8 }} />
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="body2">Inventory Status</Typography>
                        <Typography variant="body2" color="success.main">92%</Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={92} color="success" sx={{ borderRadius: 1, height: 8 }} />
                    </Box>
                    <Box>
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="body2">Customer Satisfaction</Typography>
                        <Typography variant="body2" color="warning.main">68%</Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={68} color="warning" sx={{ borderRadius: 1, height: 8 }} />
                    </Box>
                  </Box>
                </CardContent>
              </AnalyticsCard>
            </Grid>
          </Grid>
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
            <Grid item xs={12}>
              <AnalyticsCard>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Operations Overview</Typography>
                  <Divider sx={{ mb: 3 }} />
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} md={3}>
                      <Box textAlign="center" p={2}>
                        <Avatar sx={{ bgcolor: '#e3f2fd', color: '#1976d2', width: 64, height: 64, mx: 'auto', mb: 2 }}>
                          <AssessmentIcon sx={{ fontSize: 32 }} />
                        </Avatar>
                        <Typography variant="h4" color="primary" fontWeight={700}>{stats?.sales || 0}</Typography>
                        <Typography variant="body2" color="textSecondary">Sales</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Box textAlign="center" p={2}>
                        <Avatar sx={{ bgcolor: '#f3e5f5', color: '#7b1fa2', width: 64, height: 64, mx: 'auto', mb: 2 }}>
                          <InventoryIcon sx={{ fontSize: 32 }} />
                        </Avatar>
                        <Typography variant="h4" color="secondary" fontWeight={700}>{stats?.inventory || 0}</Typography>
                        <Typography variant="body2" color="textSecondary">Inventory</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Box textAlign="center" p={2}>
                        <Avatar sx={{ bgcolor: '#e8f5e8', color: '#388e3c', width: 64, height: 64, mx: 'auto', mb: 2 }}>
                          <SwapHorizIcon sx={{ fontSize: 32 }} />
                        </Avatar>
                        <Typography variant="h4" sx={{ color: '#4caf50', fontWeight: 700 }}>{stats?.transfers || 0}</Typography>
                        <Typography variant="body2" color="textSecondary">Transfers</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Box textAlign="center" p={2}>
                        <Avatar sx={{ bgcolor: '#fff3e0', color: '#f57c00', width: 64, height: 64, mx: 'auto', mb: 2 }}>
                          <PeopleIcon sx={{ fontSize: 32 }} />
                        </Avatar>
                        <Typography variant="h4" sx={{ color: '#ff9800', fontWeight: 700 }}>{stats?.users || 0}</Typography>
                        <Typography variant="body2" color="textSecondary">Users</Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </AnalyticsCard>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Locations Tab */}
        <TabPanel value={tabValue} index={3}>
          <Grid container spacing={3}>
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

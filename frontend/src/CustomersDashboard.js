import React, { useState, useEffect, useContext } from 'react';
import { 
  Box, Typography, Grid, Card, CardContent, CircularProgress, Alert,
  Tabs, Tab, Paper, Chip, Avatar, LinearProgress, Divider, IconButton, List, ListItem, ListItemText,
  Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Snackbar
} from '@mui/material';
import { styled } from '@mui/material/styles';
import PeopleIcon from '@mui/icons-material/People';
import AssessmentIcon from '@mui/icons-material/Assessment';
import InventoryIcon from '@mui/icons-material/Inventory';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import GroupIcon from '@mui/icons-material/Group';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import RefreshIcon from '@mui/icons-material/Refresh';
import BusinessIcon from '@mui/icons-material/Business';
import api from './api';
import { AuthContext } from './AuthContext';
import AdvancedAnalytics from './components/AdvancedAnalytics';
import TimeBasedAnalytics from './components/TimeBasedAnalytics';
import GanttChart from './components/GanttChart';
import TransactionIntegration from './components/TransactionIntegration';
import { useTransactionIntegration } from './hooks/useTransactionIntegration';
import CustomerApprovalService from './services/CustomerApprovalService';
import CustomerApprovalDialog from './components/CustomerApprovalDialog';
import LocationPicker from './components/LocationPicker';

// Styled components for modern design
const StyledTabs = styled(Tabs)(({ theme }) => ({
  backgroundColor: '#fff',
  borderRadius: '12px 12px 0 0',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  '& .MuiTabs-indicator': {
    height: 3,
    borderRadius: '3px 3px 0 0',
    background: 'linear-gradient(45deg, #2196F3 30%, #1565C0 90%)',
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
  background: 'linear-gradient(135deg, #2196F3 0%, #1565C0 100%)',
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
      id={`customers-tabpanel-${index}`}
      aria-labelledby={`customers-tab-${index}`}
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

const periods = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: 'custom', label: 'Custom' },
];

const mockSummary = [
  { title: 'Total Customers', value: 310, icon: <PeopleIcon />, color: 'primary' },
  { title: 'New This Month', value: 25, icon: <AssessmentIcon />, color: 'success' },
  { title: 'Active', value: 280, icon: <InventoryIcon />, color: 'info' },
  { title: 'Inactive', value: 30, icon: <SwapHorizIcon />, color: 'warning' },
];

const mockLineData = [
  { date: 'Jul 14', New: 2, Active: 40 },
  { date: 'Jul 15', New: 4, Active: 50 },
  { date: 'Jul 16', New: 5, Active: 60 },
  { date: 'Jul 17', New: 3, Active: 55 },
  { date: 'Jul 18', New: 6, Active: 70 },
  { date: 'Jul 19', New: 2, Active: 30 },
  { date: 'Jul 20', New: 3, Active: 35 },
];

const mockPieData1 = [
  { name: 'Retail', value: 180 },
  { name: 'Wholesale', value: 130 },
];
const mockPieData2 = [
  { name: 'Accra', value: 170 },
  { name: 'Kumasi', value: 80 },
  { name: 'Takoradi', value: 60 },
];
const CustomersDashboard = () => {
  const { token } = useContext(AuthContext);
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [customers, setCustomers] = useState([]);
  const [filters, setFilters] = useState({});
  
  // Transaction integration
  const {
    transactions,
    analytics,
    recordCustomerTransaction,
    refreshData
  } = useTransactionIntegration('customers');
  
  // Quick Actions State
  const [customerDialogOpen, setCustomerDialogOpen] = useState(false);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  
  // Customer approval state
  const [canCreateDirectly, setCanCreateDirectly] = useState(false);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  
  // Form State
  const [customerForm, setCustomerForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    customer_type: 'retailer',
    payment_terms: 30,
    latitude: null,
    longitude: null,
    location_accuracy: null,
    location_timestamp: null
  });
  
  const [contactForm, setContactForm] = useState({
    customer: '',
    subject: '',
    date: '',
    notes: ''
  });
  
  // Quick Action Handlers
  const handleAddCustomer = async () => {
    try {
      if (canCreateDirectly) {
        // Superuser/Sales Manager can create customers directly
        await CustomerApprovalService.createCustomerDirectly(customerForm);
        setSnackbarMessage('Customer created successfully!');
        
        // Record transaction
        await recordCustomerTransaction({
          type: 'customer_created',
          description: `Customer ${customerForm.name} created directly`,
          amount: 0,
          metadata: { customer_name: customerForm.name, customer_type: customerForm.customer_type }
        });
      } else {
        // Sales Rep creates approval request
        const result = await CustomerApprovalService.createCustomerRequest(customerForm);
        setSnackbarMessage('Customer request submitted for approval!');
        
        // Record transaction
        await recordCustomerTransaction({
          type: 'customer_request',
          description: `Customer approval request for ${customerForm.name}`,
          amount: 0,
          metadata: { customer_name: customerForm.name, approval_id: result.approval_id }
        });
        
        // Refresh my requests
        fetchMyRequests();
      }
      
      setSnackbarOpen(true);
      setCustomerDialogOpen(false);
      setCustomerForm({ 
        name: '', 
        email: '', 
        phone: '', 
        address: '', 
        customer_type: 'retailer', 
        payment_terms: 30,
        latitude: null,
        longitude: null,
        location_accuracy: null,
        location_timestamp: null
      });
      
      // Refresh data
      fetchCustomers();
      refreshData();
    } catch (error) {
      console.error('Error adding customer:', error);
      setSnackbarMessage(canCreateDirectly ? 'Failed to create customer' : 'Failed to submit customer request');
      setSnackbarOpen(true);
    }
  };
  
  const handleCreateContact = async () => {
    try {
      console.log('Creating contact:', contactForm);
      setSnackbarMessage('Contact created successfully!');
      setSnackbarOpen(true);
      setContactDialogOpen(false);
      setContactForm({ customer: '', subject: '', date: '', notes: '' });
    } catch (error) {
      setSnackbarMessage('Failed to create contact');
      setSnackbarOpen(true);
    }
  };
  
  // Customer approval functions
  const fetchCustomers = async () => {
    try {
      const response = await api.get('/sales/customers/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCustomers(response.data || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };
  
  const fetchPendingApprovals = async () => {
    try {
      const approvals = await CustomerApprovalService.getPendingApprovals();
      setPendingApprovals(approvals);
    } catch (error) {
      console.error('Error fetching pending approvals:', error);
      setPendingApprovals([]);
    }
  };
  
  const fetchMyRequests = async () => {
    try {
      const requests = await CustomerApprovalService.getMyRequests();
      setMyRequests(requests);
    } catch (error) {
      console.error('Error fetching my requests:', error);
      setMyRequests([]);
    }
  };
  
  const checkUserPermissions = async () => {
    try {
      const canCreate = await CustomerApprovalService.canCreateDirectly();
      setCanCreateDirectly(canCreate);
    } catch (error) {
      console.error('Error checking permissions:', error);
      setCanCreateDirectly(false);
    }
  };
  
  const handleApprovalComplete = () => {
    // Refresh data after approval/rejection
    fetchCustomers();
    fetchPendingApprovals();
    fetchMyRequests();
    refreshData();
  };
  
  const handleScheduleFollowup = () => {
    window.open('/customers/followup', '_blank');
  };
  
  const handleUpdateProfile = () => {
    window.open('/customers/profiles', '_blank');
  };

  // Mock data for demonstration
  const recentActivity = [
    { action: 'New customer "ABC Corp" registered', timestamp: '5 minutes ago', type: 'success' },
    { action: 'Customer "XYZ Ltd" updated profile', timestamp: '15 minutes ago', type: 'info' },
    { action: 'Customer "DEF Inc" placed large order', timestamp: '30 minutes ago', type: 'success' },
    { action: 'Customer "GHI Co" payment overdue', timestamp: '1 hour ago', type: 'warning' },
    { action: 'Customer "JKL Enterprises" renewed contract', timestamp: '2 hours ago', type: 'success' },
  ];

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;
      
      setLoading(true);
      try {
        // Initialize customer approval system
        await checkUserPermissions();
        
        // Fetch customers with error handling
        try {
          await fetchCustomers();
        } catch (err) {
          console.warn('Failed to load customers:', err);
        }
        
        // Fetch approval data based on user permissions
        try {
          const canCreate = await CustomerApprovalService.canCreateDirectly();
          if (canCreate) {
            // Sales Manager/Superuser: fetch pending approvals
            await fetchPendingApprovals();
          } else {
            // Sales Rep: fetch their own requests
            await fetchMyRequests();
          }
        } catch (err) {
          console.warn('Failed to load approval data:', err);
        }

      } catch (err) {
        setError('Failed to load customers dashboard data.');
        console.error('Customers dashboard error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  return (
    <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh', p: 0 }}>
      {/* Header */}
      <Box sx={{ 
        background: 'linear-gradient(135deg, #2196F3 0%, #1565C0 100%)',
        color: 'white',
        p: 4,
        borderRadius: '0 0 24px 24px',
        mb: 3
      }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
              Customers Dashboard
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              Manage customer relationships and track engagement metrics.
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

      {/* Quick Actions Panel */}
      <Paper sx={{ 
        p: 3, 
        mb: 3, 
        borderRadius: 3, 
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
      }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#333' }}>
          Quick Actions
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<PersonAddIcon />}
              onClick={() => setCustomerDialogOpen(true)}
              sx={{ 
                background: 'linear-gradient(45deg, #2196F3 30%, #1565C0 90%)',
                color: 'white',
                borderRadius: 2,
                py: 1.5,
                fontWeight: 600,
                textTransform: 'none',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
                }
              }}
            >
              Add Customer
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<BusinessIcon />}
              onClick={() => setContactDialogOpen(true)}
              sx={{ 
                background: 'linear-gradient(45deg, #4CAF50 30%, #2E7D32 90%)',
                color: 'white',
                borderRadius: 2,
                py: 1.5,
                fontWeight: 600,
                textTransform: 'none',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
                }
              }}
            >
              Create Contact
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<LocationOnIcon />}
              onClick={handleScheduleFollowup}
              sx={{ 
                background: 'linear-gradient(45deg, #FF9800 30%, #FF5722 90%)',
                color: 'white',
                borderRadius: 2,
                py: 1.5,
                fontWeight: 600,
                textTransform: 'none',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
                }
              }}
            >
              Schedule Follow-up
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<AssessmentIcon />}
              onClick={handleUpdateProfile}
              sx={{ 
                background: 'linear-gradient(45deg, #9C27B0 30%, #7B1FA2 90%)',
                color: 'white',
                borderRadius: 2,
                py: 1.5,
                fontWeight: 600,
                textTransform: 'none',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
                }
              }}
            >
              Update Profile
            </Button>
          </Grid>
        </Grid>
      </Paper>

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
          <StyledTab icon={<GroupIcon />} label="Customers" />
          <StyledTab icon={<AssessmentIcon />} label="Analytics" />
          <StyledTab icon={<LocationOnIcon />} label="Locations" />
        </StyledTabs>

        {/* Overview Tab */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            {/* Key Metrics */}
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="body2" sx={{ opacity: 0.8, mb: 1 }}>Total Customers</Typography>
                      <Typography variant="h3" sx={{ fontWeight: 700 }}>
                        {customers.length || 310}
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                      <PeopleIcon sx={{ fontSize: 28 }} />
                    </Avatar>
                  </Box>
                </CardContent>
              </MetricCard>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <MetricCard sx={{ background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="body2" sx={{ opacity: 0.8, mb: 1 }}>New This Month</Typography>
                      <Typography variant="h3" sx={{ fontWeight: 700 }}>
                        25
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                      <PersonAddIcon sx={{ fontSize: 28 }} />
                    </Avatar>
                  </Box>
                </CardContent>
              </MetricCard>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <MetricCard sx={{ background: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="body2" sx={{ opacity: 0.8, mb: 1 }}>Active</Typography>
                      <Typography variant="h3" sx={{ fontWeight: 700 }}>
                        280
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                      <InventoryIcon sx={{ fontSize: 28 }} />
                    </Avatar>
                  </Box>
                </CardContent>
              </MetricCard>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <MetricCard sx={{ background: 'linear-gradient(135deg, #9C27B0 0%, #6A1B9A 100%)' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="body2" sx={{ opacity: 0.8, mb: 1 }}>Inactive</Typography>
                      <Typography variant="h3" sx={{ fontWeight: 700 }}>
                        30
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                      <SwapHorizIcon sx={{ fontSize: 28 }} />
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
                    <BusinessIcon sx={{ mr: 1, color: '#2196F3' }} />
                    Recent Customer Activity
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <List sx={{ py: 0 }}>
                    {recentActivity.map((item, idx) => (
                      <ListItem key={idx} sx={{ px: 0, py: 1 }}>
                        <ListItemText 
                          primary={item.action}
                          secondary={item.timestamp}
                          primaryTypographyProps={{ fontWeight: 500 }}
                        />
                        <Chip 
                          label={item.type === 'success' ? 'Completed' : item.type === 'warning' ? 'Alert' : 'Info'}
                          size="small" 
                          color={item.type === 'success' ? 'success' : item.type === 'warning' ? 'warning' : 'info'}
                          variant="outlined" 
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </AnalyticsCard>
            </Grid>

            {/* Customer Metrics */}
            <Grid item xs={12} md={4}>
              <AnalyticsCard>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Customer Health</Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Box sx={{ space: 2 }}>
                    <Box sx={{ mb: 2 }}>
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="body2">Satisfaction Rate</Typography>
                        <Typography variant="body2" color="success.main">92%</Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={92} color="success" sx={{ borderRadius: 1, height: 8 }} />
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="body2">Retention Rate</Typography>
                        <Typography variant="body2" color="primary">85%</Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={85} sx={{ borderRadius: 1, height: 8 }} />
                    </Box>
                    <Box>
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="body2">Churn Rate</Typography>
                        <Typography variant="body2" color="warning.main">8%</Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={8} color="warning" sx={{ borderRadius: 1, height: 8 }} />
                    </Box>
                  </Box>
                </CardContent>
              </AnalyticsCard>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Customers Tab */}
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <AnalyticsCard>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Customer List</Typography>
                  <Divider sx={{ mb: 2 }} />
                  {customers.length > 0 ? (
                    <List sx={{ py: 0 }}>
                      {customers.slice(0, 10).map((customer, idx) => (
                        <ListItem key={idx} sx={{ px: 0, py: 1 }}>
                          <ListItemText 
                            primary={`${customer.name || `Customer ${idx + 1}`} - ${customer.email || 'customer@example.com'}`}
                            secondary={`Phone: ${customer.phone || 'N/A'} | Type: ${customer.customer_type || 'Retail'} | Location: ${customer.location || 'Accra'}`}
                            primaryTypographyProps={{ fontWeight: 500 }}
                          />
                          <Chip 
                            label={customer.status || 'Active'}
                            size="small" 
                            color={customer.status === 'Active' ? 'success' : customer.status === 'Inactive' ? 'error' : 'warning'}
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Alert severity="info" sx={{ borderRadius: 2 }}>No customers available</Alert>
                  )}
                </CardContent>
              </AnalyticsCard>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Analytics Tab */}
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <AnalyticsCard>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Customer Analytics</Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} md={3}>
                      <Box textAlign="center" p={2}>
                        <Avatar sx={{ bgcolor: '#e3f2fd', color: '#1976d2', width: 64, height: 64, mx: 'auto', mb: 2 }}>
                          <TrendingUpIcon sx={{ fontSize: 32 }} />
                        </Avatar>
                        <Typography variant="h4" color="primary" fontWeight={700}>₵2.5M</Typography>
                        <Typography variant="body2" color="textSecondary">Total Revenue</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Box textAlign="center" p={2}>
                        <Avatar sx={{ bgcolor: '#f3e5f5', color: '#7b1fa2', width: 64, height: 64, mx: 'auto', mb: 2 }}>
                          <PeopleIcon sx={{ fontSize: 32 }} />
                        </Avatar>
                        <Typography variant="h4" color="secondary" fontWeight={700}>310</Typography>
                        <Typography variant="body2" color="textSecondary">Total Customers</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Box textAlign="center" p={2}>
                        <Avatar sx={{ bgcolor: '#e8f5e8', color: '#388e3c', width: 64, height: 64, mx: 'auto', mb: 2 }}>
                          <PersonAddIcon sx={{ fontSize: 32 }} />
                        </Avatar>
                        <Typography variant="h4" sx={{ color: '#4caf50', fontWeight: 700 }}>25</Typography>
                        <Typography variant="body2" color="textSecondary">New This Month</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Box textAlign="center" p={2}>
                        <Avatar sx={{ bgcolor: '#fff3e0', color: '#f57c00', width: 64, height: 64, mx: 'auto', mb: 2 }}>
                          <AssessmentIcon sx={{ fontSize: 32 }} />
                        </Avatar>
                        <Typography variant="h4" sx={{ color: '#ff9800', fontWeight: 700 }}>92%</Typography>
                        <Typography variant="body2" color="textSecondary">Satisfaction Rate</Typography>
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
            {/* Transaction Integration */}
            <Grid item xs={12} md={6}>
              <TransactionIntegration 
                moduleId="customers" 
                title="Customer Transaction Flow"
              />
            </Grid>
            
            {/* Time-Based Analytics */}
            <Grid item xs={12} md={6}>
              <TimeBasedAnalytics 
                moduleId="customers" 
                title="Customer Trends Analysis"
              />
            </Grid>
            
            {/* Advanced Analytics with Charts */}
            <Grid item xs={12}>
              <AdvancedAnalytics 
                moduleId="customers" 
                title="Customer Performance Analytics"
                data={{
                  accra_customers: 170,
                  kumasi_customers: 80,
                  takoradi_customers: 60,
                  total_customers: 310
                }}
              />
            </Grid>
            
            {/* Gantt Chart for Customer Projects */}
            <Grid item xs={12}>
              <GanttChart 
                title="Customer Experience Project Timeline"
                projects={[
                  {
                    id: 1,
                    name: 'Customer Experience Enhancement',
                    type: 'customers',
                    manager: 'Customer Success Manager',
                    status: 'in-progress',
                    priority: 'high',
                    startDate: new Date('2024-01-01'),
                    endDate: new Date('2024-06-30'),
                    progress: 65,
                    budget: 70000,
                    team: ['Customer Service Rep', 'Marketing Specialist', 'Data Analyst'],
                    tasks: [
                      {
                        id: 601,
                        name: 'Customer Survey',
                        startDate: new Date('2024-01-01'),
                        endDate: new Date('2024-01-31'),
                        progress: 100,
                        status: 'completed',
                        assignee: 'Marketing Specialist',
                        dependencies: []
                      },
                      {
                        id: 602,
                        name: 'Data Analysis',
                        startDate: new Date('2024-02-01'),
                        endDate: new Date('2024-02-28'),
                        progress: 90,
                        status: 'in-progress',
                        assignee: 'Data Analyst',
                        dependencies: [601]
                      },
                      {
                        id: 603,
                        name: 'Process Improvement',
                        startDate: new Date('2024-03-01'),
                        endDate: new Date('2024-05-31'),
                        progress: 45,
                        status: 'in-progress',
                        assignee: 'Customer Service Rep',
                        dependencies: [602]
                      },
                      {
                        id: 604,
                        name: 'Implementation & Monitoring',
                        startDate: new Date('2024-06-01'),
                        endDate: new Date('2024-06-30'),
                        progress: 0,
                        status: 'pending',
                        assignee: 'Customer Success Manager',
                        dependencies: [603]
                      }
                    ]
                  }
                ]}
              />
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>
      
      {/* Add Customer Dialog */}
      <Dialog open={customerDialogOpen} onClose={() => setCustomerDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {canCreateDirectly ? 'Add Customer' : 'Submit Customer Request'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Customer Name"
                value={customerForm.name}
                onChange={(e) => setCustomerForm({...customerForm, name: e.target.value})}
                margin="normal"
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                value={customerForm.email}
                onChange={(e) => setCustomerForm({...customerForm, email: e.target.value})}
                margin="normal"
                type="email"
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone"
                value={customerForm.phone}
                onChange={(e) => setCustomerForm({...customerForm, phone: e.target.value})}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Customer Type"
                value={customerForm.customer_type}
                onChange={(e) => setCustomerForm({...customerForm, customer_type: e.target.value})}
                margin="normal"
                SelectProps={{ native: true }}
              >
                <option value="retailer">Retailer</option>
                <option value="wholesaler">Wholesaler</option>
                <option value="distributor">Distributor</option>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                value={customerForm.address}
                onChange={(e) => setCustomerForm({...customerForm, address: e.target.value})}
                margin="normal"
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Payment Terms (Days)"
                value={customerForm.payment_terms}
                onChange={(e) => setCustomerForm({...customerForm, payment_terms: parseInt(e.target.value) || 30})}
                margin="normal"
                type="number"
                inputProps={{ min: 1, max: 365 }}
              />
            </Grid>
            <Grid item xs={12}>
              <LocationPicker
                onLocationSelect={(location) => {
                  setCustomerForm({
                    ...customerForm,
                    latitude: location?.latitude,
                    longitude: location?.longitude,
                    location_accuracy: location?.accuracy,
                    location_timestamp: location?.timestamp
                  });
                }}
                initialLocation={{
                  latitude: customerForm.latitude,
                  longitude: customerForm.longitude
                }}
                showMap={true}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCustomerDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleAddCustomer} 
            variant="contained"
            sx={{ background: 'linear-gradient(45deg, #2196F3 30%, #1565C0 90%)' }}
          >
            Add Customer
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Create Contact Dialog */}
      <Dialog open={contactDialogOpen} onClose={() => setContactDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create Contact</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Customer"
            value={contactForm.customer}
            onChange={(e) => setContactForm({...contactForm, customer: e.target.value})}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Subject"
            value={contactForm.subject}
            onChange={(e) => setContactForm({...contactForm, subject: e.target.value})}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Contact Date"
            type="datetime-local"
            value={contactForm.date}
            onChange={(e) => setContactForm({...contactForm, date: e.target.value})}
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            fullWidth
            label="Notes"
            value={contactForm.notes}
            onChange={(e) => setContactForm({...contactForm, notes: e.target.value})}
            margin="normal"
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setContactDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleCreateContact} 
            variant="contained"
            sx={{ background: 'linear-gradient(45deg, #4CAF50 30%, #2E7D32 90%)' }}
          >
            Create Contact
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Success/Error Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
    </Box>
  );
};

export default CustomersDashboard;

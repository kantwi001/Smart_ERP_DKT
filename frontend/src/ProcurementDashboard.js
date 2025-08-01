import React, { useState, useEffect, useContext } from 'react';
import { 
  Box, Typography, Grid, Card, CardContent, CircularProgress, Alert,
  Tabs, Tab, Paper, Chip, Avatar, LinearProgress, Divider, IconButton, List, ListItem, ListItemText,
  Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Snackbar
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AssessmentIcon from '@mui/icons-material/Assessment';
import InventoryIcon from '@mui/icons-material/Inventory';
import PeopleIcon from '@mui/icons-material/People';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import BusinessIcon from '@mui/icons-material/Business';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import RefreshIcon from '@mui/icons-material/Refresh';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import WarningIcon from '@mui/icons-material/Warning';
import AddIcon from '@mui/icons-material/Add';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import api from './api';
import { AuthContext } from './AuthContext';
import AdvancedAnalytics from './components/AdvancedAnalytics';
import TimeBasedAnalytics from './components/TimeBasedAnalytics';
import GanttChart from './components/GanttChart';
import TransactionIntegration from './components/TransactionIntegration';
import { useTransactionIntegration } from './hooks/useTransactionIntegration';

// Styled components for modern design
const StyledTabs = styled(Tabs)(({ theme }) => ({
  backgroundColor: '#fff',
  borderRadius: '12px 12px 0 0',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  '& .MuiTabs-indicator': {
    height: 3,
    borderRadius: '3px 3px 0 0',
    background: 'linear-gradient(45deg, #795548 30%, #5D4037 90%)',
  },
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '0.95rem',
  minHeight: 64,
  color: '#666',
  '&.Mui-selected': {
    color: '#795548',
  },
}));

const MetricCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(135deg, #795548 0%, #5D4037 100%)',
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

const QuickActionButton = styled(Button)(({ theme }) => ({
  borderRadius: 12,
  padding: '12px 24px',
  textTransform: 'none',
  fontWeight: 600,
  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
  },
}));

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`procurement-tabpanel-${index}`}
      aria-labelledby={`procurement-tab-${index}`}
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
  { title: 'Purchase Orders', value: 42, icon: <AssessmentIcon />, color: 'primary' },
  { title: 'Vendors', value: 18, icon: <PeopleIcon />, color: 'secondary' },
  { title: 'Items Procured', value: 120, icon: <InventoryIcon />, color: 'info' },
  { title: 'Pending Orders', value: 5, icon: <SwapHorizIcon />, color: 'warning' },
];

const mockLineData = [
  { date: 'Jul 14', Orders: 2, Items: 10 },
  { date: 'Jul 15', Orders: 5, Items: 20 },
  { date: 'Jul 16', Orders: 7, Items: 25 },
  { date: 'Jul 17', Orders: 4, Items: 15 },
  { date: 'Jul 18', Orders: 8, Items: 30 },
  { date: 'Jul 19', Orders: 6, Items: 18 },
  { date: 'Jul 20', Orders: 10, Items: 35 },
];

const mockPieData1 = [
  { name: 'Electronics', value: 40 },
  { name: 'Office Supplies', value: 30 },
  { name: 'Furniture', value: 25 },
  { name: 'Other', value: 25 },
];
const mockPieData2 = [
  { name: 'Accra', value: 60 },
  { name: 'Tema', value: 30 },
  { name: 'Takoradi', value: 10 },
];
const mockPieData3 = [
  { name: 'Completed', value: 35 },
  { name: 'Pending', value: 5 },
  { name: 'Cancelled', value: 2 },
];

const ProcurementDashboard = () => {
  const { token } = useContext(AuthContext);
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [filters, setFilters] = useState({});
  
  // Transaction integration
  const {
    transactions,
    analytics,
    recordProcurementTransaction,
    refreshData
  } = useTransactionIntegration('procurement');
  
  // Quick Actions State
  const [quoteDialogOpen, setQuoteDialogOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  
  // Form State
  const [quoteForm, setQuoteForm] = useState({
    vendor: '',
    product: '',
    quantity: '',
    deadline: ''
  });

  // Mock data for demonstration
  const recentActivity = [
    { action: 'Purchase order #PO-5678 approved', timestamp: '10 minutes ago', type: 'success' },
    { action: 'New vendor registration pending', timestamp: '30 minutes ago', type: 'warning' },
    { action: 'Delivery received from Supplier ABC', timestamp: '1 hour ago', type: 'success' },
    { action: 'Quote request sent to 3 vendors', timestamp: '2 hours ago', type: 'info' },
    { action: 'Purchase order #PO-5677 completed', timestamp: '3 hours ago', type: 'success' },
  ];
  
  // Quick Action Handlers
  const handleCreatePO = () => {
    window.open('/procurement/management', '_blank');
  };
  
  const handleAddVendor = () => {
    window.open('/procurement/vendors', '_blank');
  };
  
  const handleRequestQuote = async () => {
    try {
      console.log('Requesting quote:', quoteForm);
      setSnackbarMessage('Quote request sent successfully!');
      setSnackbarOpen(true);
      setQuoteDialogOpen(false);
      setQuoteForm({ vendor: '', product: '', quantity: '', deadline: '' });
    } catch (error) {
      setSnackbarMessage('Failed to send quote request');
      setSnackbarOpen(true);
    }
  };
  
  const handleApproveRequest = () => {
    setSnackbarMessage('Request approved successfully!');
    setSnackbarOpen(true);
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;
      
      setLoading(true);
      try {
        // Fetch purchase orders with error handling
        try {
          const ordersRes = await api.get('/procurement/purchase-orders/', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setPurchaseOrders(ordersRes.data || []);
        } catch (err) {
          console.warn('Failed to load purchase orders:', err);
        }

        // Fetch vendors with error handling
        try {
          const vendorsRes = await api.get('/procurement/vendors/', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setVendors(vendorsRes.data || []);
        } catch (err) {
          console.warn('Failed to load vendors:', err);
        }

      } catch (err) {
        setError('Failed to load procurement dashboard data.');
        console.error('Procurement dashboard error:', err);
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
        background: 'linear-gradient(135deg, #795548 0%, #5D4037 100%)',
        color: 'white',
        p: 4,
        borderRadius: '0 0 24px 24px',
        mb: 3
      }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
              Procurement Dashboard
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              Manage purchase orders, vendors, and procurement processes.
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
            <QuickActionButton
              fullWidth
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreatePO}
              sx={{ 
                background: 'linear-gradient(45deg, #4CAF50 30%, #2E7D32 90%)',
                color: 'white'
              }}
            >
              Create Purchase Order
            </QuickActionButton>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <QuickActionButton
              fullWidth
              variant="contained"
              startIcon={<PersonAddIcon />}
              onClick={handleAddVendor}
              sx={{ 
                background: 'linear-gradient(45deg, #FF9800 30%, #FF5722 90%)',
                color: 'white'
              }}
            >
              Add Vendor
            </QuickActionButton>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <QuickActionButton
              fullWidth
              variant="contained"
              startIcon={<RequestQuoteIcon />}
              onClick={() => setQuoteDialogOpen(true)}
              sx={{ 
                background: 'linear-gradient(45deg, #2196F3 30%, #1976D2 90%)',
                color: 'white'
              }}
            >
              Request Quote
            </QuickActionButton>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <QuickActionButton
              fullWidth
              variant="contained"
              startIcon={<CheckCircleIcon />}
              onClick={handleApproveRequest}
              sx={{ 
                background: 'linear-gradient(45deg, #9C27B0 30%, #7B1FA2 90%)',
                color: 'white'
              }}
            >
              Approve Request
            </QuickActionButton>
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
          <StyledTab icon={<ShoppingCartIcon />} label="Orders" />
          <StyledTab icon={<BusinessIcon />} label="Vendors" />
          <StyledTab icon={<AssessmentIcon />} label="Analytics" />
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
                      <Typography variant="body2" sx={{ opacity: 0.8, mb: 1 }}>Purchase Orders</Typography>
                      <Typography variant="h3" sx={{ fontWeight: 700 }}>
                        {purchaseOrders.length || 42}
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                      <AssessmentIcon sx={{ fontSize: 28 }} />
                    </Avatar>
                  </Box>
                </CardContent>
              </MetricCard>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <MetricCard sx={{ background: 'linear-gradient(135deg, #2196F3 0%, #1565C0 100%)' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="body2" sx={{ opacity: 0.8, mb: 1 }}>Vendors</Typography>
                      <Typography variant="h3" sx={{ fontWeight: 700 }}>
                        {vendors.length || 18}
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                      <BusinessIcon sx={{ fontSize: 28 }} />
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
                      <Typography variant="body2" sx={{ opacity: 0.8, mb: 1 }}>Items Procured</Typography>
                      <Typography variant="h3" sx={{ fontWeight: 700 }}>
                        120
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
              <MetricCard sx={{ background: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="body2" sx={{ opacity: 0.8, mb: 1 }}>Pending Orders</Typography>
                      <Typography variant="h3" sx={{ fontWeight: 700 }}>
                        5
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                      <WarningIcon sx={{ fontSize: 28 }} />
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
                    <LocalShippingIcon sx={{ mr: 1, color: '#795548' }} />
                    Recent Procurement Activity
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
                          label={item.type === 'success' ? 'Completed' : item.type === 'warning' ? 'Pending' : 'Info'}
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

            {/* Procurement Metrics */}
            <Grid item xs={12} md={4}>
              <AnalyticsCard>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Procurement Performance</Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Box sx={{ space: 2 }}>
                    <Box sx={{ mb: 2 }}>
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="body2">Order Fulfillment</Typography>
                        <Typography variant="body2" color="success.main">94%</Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={94} color="success" sx={{ borderRadius: 1, height: 8 }} />
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="body2">Cost Savings</Typography>
                        <Typography variant="body2" color="primary">12%</Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={12} sx={{ borderRadius: 1, height: 8 }} />
                    </Box>
                    <Box>
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="body2">Vendor Performance</Typography>
                        <Typography variant="body2" color="warning.main">87%</Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={87} color="warning" sx={{ borderRadius: 1, height: 8 }} />
                    </Box>
                  </Box>
                </CardContent>
              </AnalyticsCard>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Orders Tab */}
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <AnalyticsCard>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Purchase Orders</Typography>
                  <Divider sx={{ mb: 2 }} />
                  {purchaseOrders.length > 0 ? (
                    <List sx={{ py: 0 }}>
                      {purchaseOrders.slice(0, 10).map((order, idx) => (
                        <ListItem key={idx} sx={{ px: 0, py: 1 }}>
                          <ListItemText 
                            primary={`PO #${order.id || `PO-${5000 + idx}`} - ${order.vendor?.name || 'Vendor'}`}
                            secondary={`Amount: ₵${order.total_amount || (Math.random() * 5000).toFixed(2)} | Status: ${order.status || 'Pending'}`}
                            primaryTypographyProps={{ fontWeight: 500 }}
                          />
                          <Chip 
                            label={order.status || 'Pending'}
                            size="small" 
                            color={order.status === 'Completed' ? 'success' : order.status === 'Pending' ? 'warning' : 'default'}
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Alert severity="info" sx={{ borderRadius: 2 }}>No purchase orders available</Alert>
                  )}
                </CardContent>
              </AnalyticsCard>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Vendors Tab */}
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <AnalyticsCard>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Vendor Directory</Typography>
                  <Divider sx={{ mb: 2 }} />
                  {vendors.length > 0 ? (
                    <List sx={{ py: 0 }}>
                      {vendors.slice(0, 10).map((vendor, idx) => (
                        <ListItem key={idx} sx={{ px: 0, py: 1 }}>
                          <ListItemText 
                            primary={vendor.name || `Vendor ${idx + 1}`}
                            secondary={`Contact: ${vendor.contact_person || 'N/A'} | Email: ${vendor.email || 'N/A'}`}
                            primaryTypographyProps={{ fontWeight: 500 }}
                          />
                          <Chip 
                            label={vendor.status || 'Active'}
                            size="small" 
                            color={vendor.status === 'Active' ? 'success' : 'default'}
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Alert severity="info" sx={{ borderRadius: 2 }}>No vendors available</Alert>
                  )}
                </CardContent>
              </AnalyticsCard>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Analytics Tab */}
        <TabPanel value={tabValue} index={3}>
          <Grid container spacing={3}>
            {/* Transaction Integration */}
            <Grid item xs={12} md={6}>
              <TransactionIntegration 
                moduleId="procurement" 
                title="Procurement Transaction Flow"
              />
            </Grid>
            
            {/* Time-Based Analytics */}
            <Grid item xs={12} md={6}>
              <TimeBasedAnalytics 
                moduleId="procurement" 
                title="Procurement Trends Analysis"
              />
            </Grid>
            
            {/* Advanced Analytics with Charts */}
            <Grid item xs={12}>
              <AdvancedAnalytics 
                moduleId="procurement" 
                title="Procurement Performance Analytics"
                data={{
                  total_spend: 85000,
                  active_vendors: 18,
                  purchase_orders: 42,
                  delivery_rate: 94
                }}
              />
            </Grid>
            
            {/* Gantt Chart for Procurement Projects */}
            <Grid item xs={12}>
              <GanttChart 
                title="Procurement Project Timeline"
                projects={[
                  {
                    id: 1,
                    name: 'Supplier Evaluation Process',
                    type: 'procurement',
                    manager: 'Procurement Manager',
                    status: 'in-progress',
                    priority: 'medium',
                    startDate: new Date('2024-01-15'),
                    endDate: new Date('2024-04-15'),
                    progress: 55,
                    budget: 80000,
                    team: ['Procurement Officer', 'Quality Assessor', 'Contract Specialist'],
                    tasks: [
                      {
                        id: 201,
                        name: 'Market Research',
                        startDate: new Date('2024-01-15'),
                        endDate: new Date('2024-02-05'),
                        progress: 100,
                        status: 'completed',
                        assignee: 'Procurement Officer',
                        dependencies: []
                      },
                      {
                        id: 202,
                        name: 'Supplier Identification',
                        startDate: new Date('2024-02-01'),
                        endDate: new Date('2024-02-20'),
                        progress: 85,
                        status: 'in-progress',
                        assignee: 'Procurement Officer',
                        dependencies: [201]
                      },
                      {
                        id: 203,
                        name: 'Quality Assessment',
                        startDate: new Date('2024-02-15'),
                        endDate: new Date('2024-03-15'),
                        progress: 40,
                        status: 'in-progress',
                        assignee: 'Quality Assessor',
                        dependencies: [202]
                      },
                      {
                        id: 204,
                        name: 'Contract Negotiation',
                        startDate: new Date('2024-03-10'),
                        endDate: new Date('2024-04-15'),
                        progress: 10,
                        status: 'pending',
                        assignee: 'Contract Specialist',
                        dependencies: [203]
                      }
                    ]
                  }
                ]}
              />
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default ProcurementDashboard;

import React, { useState, useEffect, useContext } from 'react';
import { 
  Box, Typography, Grid, Card, CardContent, CircularProgress, Alert,
  Tabs, Tab, Paper, Chip, Avatar, LinearProgress, Divider, IconButton, List, ListItem, ListItemText,
  Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Snackbar
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AssessmentIcon from '@mui/icons-material/Assessment';
import PeopleIcon from '@mui/icons-material/People';
import InventoryIcon from '@mui/icons-material/Inventory';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import ReceiptIcon from '@mui/icons-material/Receipt';
import PaymentIcon from '@mui/icons-material/Payment';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import RefreshIcon from '@mui/icons-material/Refresh';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
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
    background: 'linear-gradient(45deg, #4CAF50 30%, #2E7D32 90%)',
  },
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '0.95rem',
  minHeight: 64,
  color: '#666',
  '&.Mui-selected': {
    color: '#4CAF50',
  },
}));

const MetricCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
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
      id={`accounting-tabpanel-${index}`}
      aria-labelledby={`accounting-tab-${index}`}
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
  { title: 'Invoices', value: 56, icon: <AssessmentIcon />, color: 'primary' },
  { title: 'Payments', value: 44, icon: <SwapHorizIcon />, color: 'success' },
  { title: 'Vendors', value: 18, icon: <PeopleIcon />, color: 'secondary' },
  { title: 'Expenses', value: '₵8,500', icon: <InventoryIcon />, color: 'error' },
];

const mockLineData = [
  { date: 'Jul 14', Invoices: 4, Payments: 3 },
  { date: 'Jul 15', Invoices: 6, Payments: 5 },
  { date: 'Jul 16', Invoices: 8, Payments: 6 },
  { date: 'Jul 17', Invoices: 7, Payments: 4 },
  { date: 'Jul 18', Invoices: 10, Payments: 8 },
  { date: 'Jul 19', Invoices: 9, Payments: 7 },
  { date: 'Jul 20', Invoices: 12, Payments: 11 },
];

const mockPieData1 = [
  { name: 'Paid', value: 40 },
  { name: 'Unpaid', value: 16 },
];
const mockPieData2 = [
  { name: 'Accra', value: 30 },
  { name: 'Kumasi', value: 14 },
  { name: 'Takoradi', value: 12 },
];
const mockPieData3 = [
  { name: 'Utilities', value: 20 },
  { name: 'Supplies', value: 18 },
  { name: 'Travel', value: 10 },
  { name: 'Other', value: 8 },
];

const AccountingDashboard = () => {
  const { token } = useContext(AuthContext);
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [filters, setFilters] = useState({});
  
  // Transaction integration
  const {
    transactions,
    analytics,
    recordAccountingTransaction,
    refreshData
  } = useTransactionIntegration('accounting');
  
  // Quick Actions State
  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  
  // Form State
  const [invoiceForm, setInvoiceForm] = useState({
    customer: '',
    amount: '',
    dueDate: '',
    description: ''
  });
  
  // Quick Action Handlers
  const handleCreateInvoice = async () => {
    try {
      console.log('Creating invoice:', invoiceForm);
      setSnackbarMessage('Invoice created successfully!');
      setSnackbarOpen(true);
      setInvoiceDialogOpen(false);
      setInvoiceForm({ customer: '', amount: '', dueDate: '', description: '' });
    } catch (error) {
      setSnackbarMessage('Failed to create invoice');
      setSnackbarOpen(true);
    }
  };
  
  const handleRecordPayment = () => {
    window.open('/accounting/payments/record', '_blank');
  };
  
  const handleGenerateStatement = () => {
    window.open('/accounting/statements', '_blank');
  };
  
  const handleReconcileAccount = () => {
    window.open('/accounting/reconcile', '_blank');
  };

  // Mock data for demonstration
  const recentActivity = [
    { action: 'Invoice #INV-3456 created', timestamp: '5 minutes ago', type: 'success' },
    { action: 'Payment received from Customer ABC', timestamp: '15 minutes ago', type: 'success' },
    { action: 'Expense report submitted', timestamp: '30 minutes ago', type: 'info' },
    { action: 'Invoice #INV-3455 overdue', timestamp: '1 hour ago', type: 'warning' },
    { action: 'Monthly reconciliation completed', timestamp: '2 hours ago', type: 'success' },
  ];

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;
      
      setLoading(true);
      try {
        // Fetch invoices with error handling
        try {
          const invoicesRes = await api.get('/accounting/invoices/', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setInvoices(invoicesRes.data || []);
        } catch (err) {
          console.warn('Failed to load invoices:', err);
        }

        // Fetch payments with error handling
        try {
          const paymentsRes = await api.get('/accounting/payments/', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setPayments(paymentsRes.data || []);
        } catch (err) {
          console.warn('Failed to load payments:', err);
        }

      } catch (err) {
        setError('Failed to load accounting dashboard data.');
        console.error('Accounting dashboard error:', err);
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
        background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
        color: 'white',
        p: 4,
        borderRadius: '0 0 24px 24px',
        mb: 3
      }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
              Accounting Dashboard
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              Track financial performance and manage accounting processes.
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
              startIcon={<ReceiptIcon />}
              onClick={() => setInvoiceDialogOpen(true)}
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
              Create Invoice
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<PaymentIcon />}
              onClick={handleRecordPayment}
              sx={{ 
                background: 'linear-gradient(45deg, #2196F3 30%, #1976D2 90%)',
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
              Record Payment
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<AssessmentIcon />}
              onClick={handleGenerateStatement}
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
              Generate Statement
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<AccountBalanceIcon />}
              onClick={handleReconcileAccount}
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
              Reconcile Account
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
          <StyledTab icon={<ReceiptIcon />} label="Invoices" />
          <StyledTab icon={<PaymentIcon />} label="Payments" />
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
                      <Typography variant="body2" sx={{ opacity: 0.8, mb: 1 }}>Invoices</Typography>
                      <Typography variant="h3" sx={{ fontWeight: 700 }}>
                        {invoices.length || 56}
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                      <ReceiptIcon sx={{ fontSize: 28 }} />
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
                      <Typography variant="body2" sx={{ opacity: 0.8, mb: 1 }}>Payments</Typography>
                      <Typography variant="h3" sx={{ fontWeight: 700 }}>
                        {payments.length || 44}
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                      <PaymentIcon sx={{ fontSize: 28 }} />
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
                      <Typography variant="body2" sx={{ opacity: 0.8, mb: 1 }}>Vendors</Typography>
                      <Typography variant="h3" sx={{ fontWeight: 700 }}>
                        18
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
              <MetricCard sx={{ background: 'linear-gradient(135deg, #FF5722 0%, #D84315 100%)' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="body2" sx={{ opacity: 0.8, mb: 1 }}>Expenses</Typography>
                      <Typography variant="h3" sx={{ fontWeight: 700 }}>
                        ₵8.5K
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                      <MonetizationOnIcon sx={{ fontSize: 28 }} />
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
                    <AccountBalanceIcon sx={{ mr: 1, color: '#4CAF50' }} />
                    Recent Financial Activity
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

            {/* Financial Metrics */}
            <Grid item xs={12} md={4}>
              <AnalyticsCard>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Financial Health</Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Box sx={{ space: 2 }}>
                    <Box sx={{ mb: 2 }}>
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="body2">Cash Flow</Typography>
                        <Typography variant="body2" color="success.main">Positive</Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={78} color="success" sx={{ borderRadius: 1, height: 8 }} />
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="body2">Collection Rate</Typography>
                        <Typography variant="body2" color="primary">89%</Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={89} sx={{ borderRadius: 1, height: 8 }} />
                    </Box>
                    <Box>
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="body2">Expense Ratio</Typography>
                        <Typography variant="body2" color="warning.main">65%</Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={65} color="warning" sx={{ borderRadius: 1, height: 8 }} />
                    </Box>
                  </Box>
                </CardContent>
              </AnalyticsCard>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Invoices Tab */}
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <AnalyticsCard>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Recent Invoices</Typography>
                  <Divider sx={{ mb: 2 }} />
                  {invoices.length > 0 ? (
                    <List sx={{ py: 0 }}>
                      {invoices.slice(0, 10).map((invoice, idx) => (
                        <ListItem key={idx} sx={{ px: 0, py: 1 }}>
                          <ListItemText 
                            primary={`Invoice #${invoice.number || `INV-${3000 + idx}`} - ${invoice.customer?.name || 'Customer'}`}
                            secondary={`Amount: ₵${invoice.amount || (Math.random() * 2000).toFixed(2)} | Due: ${invoice.due_date || 'N/A'}`}
                            primaryTypographyProps={{ fontWeight: 500 }}
                          />
                          <Chip 
                            label={invoice.status || 'Pending'}
                            size="small" 
                            color={invoice.status === 'Paid' ? 'success' : invoice.status === 'Overdue' ? 'error' : 'warning'}
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Alert severity="info" sx={{ borderRadius: 2 }}>No invoices available</Alert>
                  )}
                </CardContent>
              </AnalyticsCard>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Payments Tab */}
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <AnalyticsCard>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Recent Payments</Typography>
                  <Divider sx={{ mb: 2 }} />
                  {payments.length > 0 ? (
                    <List sx={{ py: 0 }}>
                      {payments.slice(0, 10).map((payment, idx) => (
                        <ListItem key={idx} sx={{ px: 0, py: 1 }}>
                          <ListItemText 
                            primary={`Payment #${payment.id || `PAY-${2000 + idx}`} - ${payment.customer?.name || 'Customer'}`}
                            secondary={`Amount: ₵${payment.amount || (Math.random() * 1500).toFixed(2)} | Method: ${payment.method || 'Bank Transfer'}`}
                            primaryTypographyProps={{ fontWeight: 500 }}
                          />
                          <Chip 
                            label={payment.status || 'Completed'}
                            size="small" 
                            color="success"
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Alert severity="info" sx={{ borderRadius: 2 }}>No payments available</Alert>
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
                moduleId="accounting" 
                title="Accounting Transaction Flow"
              />
            </Grid>
            
            {/* Time-Based Analytics */}
            <Grid item xs={12} md={6}>
              <TimeBasedAnalytics 
                moduleId="accounting" 
                title="Financial Trends Analysis"
              />
            </Grid>
            
            {/* Advanced Analytics with Charts */}
            <Grid item xs={12}>
              <AdvancedAnalytics 
                moduleId="accounting" 
                title="Financial Performance Analytics"
                data={{
                  total_revenue: 125000,
                  total_invoices: 56,
                  payments_received: 44,
                  collection_rate: 89
                }}
              />
            </Grid>
            
            {/* Gantt Chart for Accounting Projects */}
            <Grid item xs={12}>
              <GanttChart 
                title="Accounting Project Timeline"
                projects={[
                  {
                    id: 1,
                    name: 'Financial System Upgrade',
                    type: 'accounting',
                    manager: 'Finance Manager',
                    status: 'in-progress',
                    priority: 'high',
                    startDate: new Date('2024-01-01'),
                    endDate: new Date('2024-05-31'),
                    progress: 60,
                    budget: 100000,
                    team: ['Accountant', 'IT Specialist', 'Auditor'],
                    tasks: [
                      {
                        id: 401,
                        name: 'System Analysis',
                        startDate: new Date('2024-01-01'),
                        endDate: new Date('2024-01-31'),
                        progress: 100,
                        status: 'completed',
                        assignee: 'IT Specialist',
                        dependencies: []
                      },
                      {
                        id: 402,
                        name: 'Data Migration',
                        startDate: new Date('2024-02-01'),
                        endDate: new Date('2024-03-15'),
                        progress: 85,
                        status: 'in-progress',
                        assignee: 'Accountant',
                        dependencies: [401]
                      },
                      {
                        id: 403,
                        name: 'System Testing',
                        startDate: new Date('2024-03-10'),
                        endDate: new Date('2024-04-30'),
                        progress: 40,
                        status: 'in-progress',
                        assignee: 'Auditor',
                        dependencies: [402]
                      },
                      {
                        id: 404,
                        name: 'Go-Live & Training',
                        startDate: new Date('2024-05-01'),
                        endDate: new Date('2024-05-31'),
                        progress: 0,
                        status: 'pending',
                        assignee: 'Finance Manager',
                        dependencies: [403]
                      }
                    ]
                  }
                ]}
              />
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>
      
      {/* Invoice Creation Dialog */}
      <Dialog open={invoiceDialogOpen} onClose={() => setInvoiceDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create Invoice</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Customer"
            value={invoiceForm.customer}
            onChange={(e) => setInvoiceForm({...invoiceForm, customer: e.target.value})}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Amount"
            value={invoiceForm.amount}
            onChange={(e) => setInvoiceForm({...invoiceForm, amount: e.target.value})}
            margin="normal"
            type="number"
            InputProps={{ startAdornment: '₵' }}
          />
          <TextField
            fullWidth
            label="Due Date"
            type="date"
            value={invoiceForm.dueDate}
            onChange={(e) => setInvoiceForm({...invoiceForm, dueDate: e.target.value})}
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            fullWidth
            label="Description"
            value={invoiceForm.description}
            onChange={(e) => setInvoiceForm({...invoiceForm, description: e.target.value})}
            margin="normal"
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInvoiceDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleCreateInvoice} 
            variant="contained"
            sx={{ background: 'linear-gradient(45deg, #4CAF50 30%, #2E7D32 90%)' }}
          >
            Create Invoice
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

export default AccountingDashboard;

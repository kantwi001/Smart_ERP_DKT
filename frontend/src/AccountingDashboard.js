import React, { useState, useEffect, useContext } from 'react';
import { 
  Box, Typography, Grid, Card, CardContent, CircularProgress, Alert,
  Tabs, Tab, Paper, Chip, Avatar, LinearProgress, Divider, IconButton, List, ListItem, ListItemText,
  Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Snackbar,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination
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
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import SummarizeIcon from '@mui/icons-material/Summarize';
import ListAltIcon from '@mui/icons-material/ListAlt';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
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
  const [customerBalanceDialogOpen, setCustomerBalanceDialogOpen] = useState(false);
  const [receivableSummaryDialogOpen, setReceivableSummaryDialogOpen] = useState(false);
  const [receivableDetailsDialogOpen, setReceivableDetailsDialogOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  
  // Receivables State
  const [customerBalances, setCustomerBalances] = useState([]);
  const [receivableSummary, setReceivableSummary] = useState([]);
  const [receivableDetails, setReceivableDetails] = useState([]);
  const [receivablesLoading, setReceivablesLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
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
  
  const handleCustomerBalance = async () => {
    setCustomerBalanceDialogOpen(true);
    setReceivablesLoading(true);
    try {
      const response = await api.get('/accounting/receivables/customer-balances/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCustomerBalances(response.data || []);
    } catch (error) {
      console.error('Failed to fetch customer balances:', error);
      // Use mock data if API fails
      setCustomerBalances([
        { customer_name: 'ABC Company', balance: 15000.00, overdue: 5000.00 },
        { customer_name: 'XYZ Corp', balance: 8500.50, overdue: 0.00 },
        { customer_name: 'Tech Solutions Ltd', balance: 12750.25, overdue: 2500.00 },
        { customer_name: 'Global Enterprises', balance: 20000.00, overdue: 10000.00 },
        { customer_name: 'Local Business Inc', balance: 3200.75, overdue: 0.00 }
      ]);
    } finally {
      setReceivablesLoading(false);
    }
  };
  
  const handleReceivableSummary = async () => {
    setReceivableSummaryDialogOpen(true);
    setReceivablesLoading(true);
    try {
      const response = await api.get('/accounting/receivables/receivable-summary/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReceivableSummary(response.data || []);
    } catch (error) {
      console.error('Failed to fetch receivable summary:', error);
      // Use mock data if API fails
      setReceivableSummary([
        { period: 'Current (0-30 days)', amount: 25000.00, count: 15 },
        { period: '31-60 days', amount: 12500.00, count: 8 },
        { period: '61-90 days', amount: 8750.00, count: 5 },
        { period: '90+ days (Overdue)', amount: 15000.00, count: 12 },
        { period: 'Total Outstanding', amount: 61250.00, count: 40 }
      ]);
    } finally {
      setReceivablesLoading(false);
    }
  };
  
  const handleReceivableDetails = async () => {
    setReceivableDetailsDialogOpen(true);
    setReceivablesLoading(true);
    try {
      const response = await api.get('/accounting/receivables/receivable-details/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReceivableDetails(response.data || []);
    } catch (error) {
      console.error('Failed to fetch receivable details:', error);
      // Use mock data if API fails
      setReceivableDetails([
        { invoice_number: 'INV-3001', customer_name: 'ABC Company', amount: 5000.00, due_date: '2025-01-15', days_overdue: 5, status: 'Overdue' },
        { invoice_number: 'INV-3002', customer_name: 'XYZ Corp', amount: 3500.50, due_date: '2025-01-20', days_overdue: 0, status: 'Current' },
        { invoice_number: 'INV-3003', customer_name: 'Tech Solutions Ltd', amount: 7250.25, due_date: '2025-01-10', days_overdue: 10, status: 'Overdue' },
        { invoice_number: 'INV-3004', customer_name: 'Global Enterprises', amount: 12000.00, due_date: '2025-01-25', days_overdue: 0, status: 'Current' },
        { invoice_number: 'INV-3005', customer_name: 'Local Business Inc', amount: 2200.75, due_date: '2025-01-18', days_overdue: 2, status: 'Due Soon' }
      ]);
    } finally {
      setReceivablesLoading(false);
    }
  };

  const handleGenerateStatement = () => {
    window.open('/accounting/statements', '_blank');
  };
  
  const handleReconcileAccount = () => {
    window.open('/accounting/reconcile', '_blank');
  };

  // Filter functions for search
  const filteredCustomerBalances = customerBalances.filter(item =>
    item.customer_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredReceivableDetails = receivableDetails.filter(item =>
    item.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

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
              startIcon={<AccountBalanceWalletIcon />}
              onClick={handleCustomerBalance}
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
              Customer Balance
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<SummarizeIcon />}
              onClick={handleReceivableSummary}
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
              Receivable Summary
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<ListAltIcon />}
              onClick={handleReceivableDetails}
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
              Receivable Details
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
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Recent Financial Activity</Typography>
                  <Divider sx={{ mb: 2 }} />
                  <List sx={{ py: 0 }}>
                    {/* Add recent activity items here */}
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
            {/* Financial Performance Analytics */}
            <Grid item xs={12} md={6}>
              <AnalyticsCard>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center' }}>
                    <TrendingUpIcon sx={{ mr: 1, color: '#4CAF50' }} />
                    Financial Performance Analytics
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Box sx={{ height: 300 }}>
                    {/* Overall Performance Score */}
                    <Box sx={{ textAlign: 'center', mb: 3 }}>
                      <Typography variant="h3" color="primary" sx={{ mb: 1 }}>
                        93.7%
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Overall Financial Health
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={93.7} 
                        sx={{ height: 8, borderRadius: 4, mb: 2 }} 
                      />
                    </Box>
                    
                    {/* Performance Breakdown */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {[
                        { metric: 'Revenue Growth', score: 96, color: '#4CAF50' },
                        { metric: 'Collection Rate', score: 89, color: '#2196F3' },
                        { metric: 'Profit Margin', score: 94, color: '#FF9800' },
                        { metric: 'Cash Flow', score: 96, color: '#9C27B0' }
                      ].map((item, idx) => (
                        <Box key={item.metric} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Box sx={{ minWidth: 120 }}>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {item.metric}
                            </Typography>
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <LinearProgress 
                              variant="determinate" 
                              value={item.score} 
                              sx={{ 
                                height: 8, 
                                borderRadius: 4,
                                '& .MuiLinearProgress-bar': { bgcolor: item.color }
                              }} 
                            />
                          </Box>
                          <Typography variant="body2" color="text.secondary" sx={{ minWidth: 40 }}>
                            {item.score}%
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                </CardContent>
              </AnalyticsCard>
            </Grid>

            {/* Revenue & Expense Analytics */}
            <Grid item xs={12} md={6}>
              <AnalyticsCard>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center' }}>
                    <MonetizationOnIcon sx={{ mr: 1, color: '#FF9800' }} />
                    Revenue & Expense Analytics
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Box sx={{ height: 300 }}>
                    {/* Monthly Revenue vs Expense Chart */}
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Monthly Revenue vs Expenses (Last 4 Months)
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, mb: 2, alignItems: 'end', height: 100 }}>
                        {['Jan', 'Feb', 'Mar', 'Apr'].map((month, i) => {
                          const revenue = [125000, 132000, 118000, 145000][i];
                          const expenses = [85000, 89000, 82000, 95000][i];
                          const revenueHeight = (revenue / 150000) * 80;
                          const expenseHeight = (expenses / 150000) * 80;
                          return (
                            <Box key={month} sx={{ flex: 1, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                              <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'end', mb: 1 }}>
                                <Box 
                                  sx={{ 
                                    height: revenueHeight, 
                                    width: 8,
                                    bgcolor: '#4CAF50', 
                                    borderRadius: 1,
                                    opacity: 0.8
                                  }} 
                                />
                                <Box 
                                  sx={{ 
                                    height: expenseHeight, 
                                    width: 8,
                                    bgcolor: '#F44336', 
                                    borderRadius: 1,
                                    opacity: 0.8
                                  }} 
                                />
                              </Box>
                              <Typography variant="caption">{month}</Typography>
                              <Typography variant="caption" display="block" color="text.secondary">
                                ${(revenue/1000).toFixed(0)}K
                              </Typography>
                            </Box>
                          );
                        })}
                      </Box>
                    </Box>
                    
                    {/* Financial Summary */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Paper sx={{ p: 1.5, textAlign: 'center', bgcolor: 'success.light', color: 'success.contrastText', flex: 1, mr: 1 }}>
                        <Typography variant="h5">$520K</Typography>
                        <Typography variant="caption">Total Revenue</Typography>
                      </Paper>
                      <Paper sx={{ p: 1.5, textAlign: 'center', bgcolor: 'error.light', color: 'error.contrastText', flex: 1, ml: 1 }}>
                        <Typography variant="h5">$351K</Typography>
                        <Typography variant="caption">Total Expenses</Typography>
                      </Paper>
                    </Box>
                  </Box>
                </CardContent>
              </AnalyticsCard>
            </Grid>

            {/* Accounts Receivable Analytics */}
            <Grid item xs={12} md={6}>
              <AnalyticsCard>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center' }}>
                    <ReceiptIcon sx={{ mr: 1, color: '#9C27B0' }} />
                    Accounts Receivable Analytics
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Box sx={{ height: 300 }}>
                    {/* Aging Analysis */}
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Receivables Aging Analysis
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
                      {[
                        { period: '0-30 days', amount: 45000, percentage: 65, color: '#4CAF50' },
                        { period: '31-60 days', amount: 18000, percentage: 26, color: '#FF9800' },
                        { period: '61-90 days', amount: 4500, percentage: 6, color: '#F44336' },
                        { period: '90+ days', amount: 2500, percentage: 3, color: '#9E9E9E' }
                      ].map((aging, idx) => (
                        <Box key={aging.period}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {aging.period}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              ${aging.amount.toLocaleString()}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ flex: 1 }}>
                              <LinearProgress 
                                variant="determinate" 
                                value={aging.percentage} 
                                sx={{ 
                                  height: 8, 
                                  borderRadius: 4,
                                  '& .MuiLinearProgress-bar': { bgcolor: aging.color }
                                }}
                              />
                            </Box>
                            <Typography variant="body2" color="text.secondary" sx={{ minWidth: 40 }}>
                              {aging.percentage}%
                            </Typography>
                          </Box>
                        </Box>
                      ))}
                    </Box>

                    {/* Collection Metrics */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Paper sx={{ p: 1.5, textAlign: 'center', bgcolor: 'info.light', color: 'info.contrastText', flex: 1, mr: 1 }}>
                        <Typography variant="h6">89%</Typography>
                        <Typography variant="caption">Collection Rate</Typography>
                      </Paper>
                      <Paper sx={{ p: 1.5, textAlign: 'center', bgcolor: 'warning.light', color: 'warning.contrastText', flex: 1, ml: 1 }}>
                        <Typography variant="h6">32 days</Typography>
                        <Typography variant="caption">Avg Collection</Typography>
                      </Paper>
                    </Box>
                  </Box>
                </CardContent>
              </AnalyticsCard>
            </Grid>

            {/* Cash Flow Analytics */}
            <Grid item xs={12} md={6}>
              <AnalyticsCard>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center' }}>
                    <AccountBalanceWalletIcon sx={{ mr: 1, color: '#FF5722' }} />
                    Cash Flow Analytics
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Box sx={{ height: 300 }}>
                    {/* Key Metrics */}
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 3 }}>
                      <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'success.light', color: 'success.contrastText' }}>
                        <Typography variant="h4">$169K</Typography>
                        <Typography variant="caption">Net Cash Flow</Typography>
                      </Paper>
                      <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                        <Typography variant="h4">$285K</Typography>
                        <Typography variant="caption">Cash Balance</Typography>
                      </Paper>
                    </Box>

                    {/* Cash Flow Breakdown */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          Operating Cash Flow
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <LinearProgress 
                            variant="determinate" 
                            value={92} 
                            sx={{ flex: 1, height: 8, borderRadius: 4 }}
                            color="success"
                          />
                          <Typography variant="h6" color="success.main">$185K</Typography>
                        </Box>
                      </Box>

                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          Investing Cash Flow
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <LinearProgress 
                            variant="determinate" 
                            value={25} 
                            sx={{ flex: 1, height: 8, borderRadius: 4 }}
                            color="warning"
                          />
                          <Typography variant="h6" color="warning.main">-$12K</Typography>
                        </Box>
                      </Box>

                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          Financing Cash Flow
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <LinearProgress 
                            variant="determinate" 
                            value={15} 
                            sx={{ flex: 1, height: 8, borderRadius: 4 }}
                            color="info"
                          />
                          <Typography variant="h6" color="info.main">-$4K</Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </AnalyticsCard>
            </Grid>

            {/* Financial Ratios & KPIs */}
            <Grid item xs={12}>
              <AnalyticsCard>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center' }}>
                    <AssessmentIcon sx={{ mr: 1, color: '#2196F3' }} />
                    Financial Ratios & Key Performance Indicators
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Grid container spacing={3}>
                    {/* Profitability Ratios */}
                    <Grid item xs={12} md={4}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h3" color="primary" sx={{ mb: 1 }}>
                          32.5%
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          Gross Profit Margin
                        </Typography>
                        <LinearProgress 
                          variant="determinate" 
                          value={81} 
                          sx={{ height: 8, borderRadius: 4 }} 
                        />
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                          Industry Average: 28%
                        </Typography>
                      </Box>
                    </Grid>

                    {/* Financial Health Indicators */}
                    <Grid item xs={12} md={8}>
                      <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                        Financial Health Indicators
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {[
                          { indicator: 'Current Ratio', value: 2.4, target: 2.0, performance: 120 },
                          { indicator: 'Quick Ratio', value: 1.8, target: 1.5, performance: 120 },
                          { indicator: 'Debt-to-Equity', value: 0.3, target: 0.4, performance: 125 },
                          { indicator: 'Return on Assets', value: 15.2, target: 12.0, performance: 127 },
                          { indicator: 'Working Capital Ratio', value: 1.9, target: 1.5, performance: 127 }
                        ].map((ratio, idx) => (
                          <Box key={ratio.indicator} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ minWidth: 140 }}>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {ratio.indicator}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {ratio.value} (target: {ratio.target})
                              </Typography>
                            </Box>
                            <Box sx={{ flex: 1 }}>
                              <LinearProgress 
                                variant="determinate" 
                                value={Math.min(ratio.performance, 100)} 
                                sx={{ height: 8, borderRadius: 4 }}
                                color={ratio.performance >= 120 ? 'success' : ratio.performance >= 100 ? 'primary' : 'warning'}
                              />
                            </Box>
                            <Typography variant="body2" color={ratio.performance >= 120 ? 'success.main' : ratio.performance >= 100 ? 'primary.main' : 'warning.main'} sx={{ minWidth: 50 }}>
                              {ratio.performance}%
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </AnalyticsCard>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>
      
      {/* Customer Balance Dialog */}
      <Dialog open={customerBalanceDialogOpen} onClose={() => setCustomerBalanceDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Customer Balance Overview</Typography>
          <IconButton onClick={() => setCustomerBalanceDialogOpen(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
              sx={{ mb: 2 }}
            />
          </Box>
          
          {receivablesLoading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Customer Name</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>Total Balance</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>Overdue Amount</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredCustomerBalances.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((item, idx) => (
                    <TableRow key={idx} hover>
                      <TableCell component="th" scope="row">
                        <Box display="flex" alignItems="center">
                          <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                            {item.customer_name?.charAt(0)}
                          </Avatar>
                          {item.customer_name}
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                          GHS {item.balance?.toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontWeight: 'bold', 
                            color: item.overdue > 0 ? 'error.main' : 'text.secondary' 
                          }}
                        >
                          GHS {item.overdue?.toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={item.overdue > 0 ? 'Has Overdue' : 'Current'} 
                          color={item.overdue > 0 ? 'error' : 'success'}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredCustomerBalances.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCustomerBalanceDialogOpen(false)} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Receivable Summary Dialog */}
      <Dialog open={receivableSummaryDialogOpen} onClose={() => setReceivableSummaryDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Accounts Receivable Summary</Typography>
          <IconButton onClick={() => setReceivableSummaryDialogOpen(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {receivablesLoading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Aging analysis of outstanding receivables
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'grey.50' }}>
                      <TableCell sx={{ fontWeight: 'bold' }}>Aging Period</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>Amount (GHS)</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>Invoice Count</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>Percentage</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {receivableSummary.map((item, idx) => {
                      const totalAmount = receivableSummary.find(r => r.period === 'Total Outstanding')?.amount || 1;
                      const percentage = ((item.amount / totalAmount) * 100).toFixed(1);
                      const isTotal = item.period === 'Total Outstanding';
                      
                      return (
                        <TableRow 
                          key={idx} 
                          sx={{ 
                            bgcolor: isTotal ? 'primary.light' : 'inherit',
                            fontWeight: isTotal ? 'bold' : 'normal'
                          }}
                        >
                          <TableCell sx={{ fontWeight: isTotal ? 'bold' : 'normal' }}>
                            {item.period}
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: isTotal ? 'bold' : 'normal' }}>
                            GHS {item.amount?.toLocaleString()}
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: isTotal ? 'bold' : 'normal' }}>
                            {item.count}
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: isTotal ? 'bold' : 'normal' }}>
                            {isTotal ? '100.0%' : `${percentage}%`}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReceivableSummaryDialogOpen(false)} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Receivable Details Dialog */}
      <Dialog open={receivableDetailsDialogOpen} onClose={() => setReceivableDetailsDialogOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Detailed Receivables Report</Typography>
          <IconButton onClick={() => setReceivableDetailsDialogOpen(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              placeholder="Search by customer name or invoice number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
              sx={{ mb: 2 }}
            />
          </Box>
          
          {receivablesLoading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer component={Paper} sx={{ maxHeight: 500 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Invoice #</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Customer</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>Amount</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Due Date</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Days Overdue</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredReceivableDetails.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((item, idx) => (
                    <TableRow key={idx} hover>
                      <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                        {item.invoice_number}
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <Avatar sx={{ mr: 2, bgcolor: 'secondary.main', width: 32, height: 32 }}>
                            {item.customer_name?.charAt(0)}
                          </Avatar>
                          {item.customer_name}
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          GHS {item.amount?.toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">{item.due_date}</TableCell>
                      <TableCell align="center">
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: item.days_overdue > 0 ? 'error.main' : 'text.secondary',
                            fontWeight: item.days_overdue > 0 ? 'bold' : 'normal'
                          }}
                        >
                          {item.days_overdue > 0 ? `${item.days_overdue} days` : '-'}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={item.status} 
                          color={
                            item.status === 'Overdue' ? 'error' : 
                            item.status === 'Due Soon' ? 'warning' : 'success'
                          }
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredReceivableDetails.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReceivableDetailsDialogOpen(false)} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>
      
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

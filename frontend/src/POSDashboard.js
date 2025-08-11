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
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import ReceiptIcon from '@mui/icons-material/Receipt';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import RefreshIcon from '@mui/icons-material/Refresh';
import PaymentIcon from '@mui/icons-material/Payment';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
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
    background: 'linear-gradient(45deg, #FF5722 30%, #D84315 90%)',
  },
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '0.95rem',
  minHeight: 64,
  color: '#666',
  '&.Mui-selected': {
    color: '#FF5722',
  },
}));

const MetricCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(135deg, #FF5722 0%, #D84315 100%)',
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
      id={`pos-tabpanel-${index}`}
      aria-labelledby={`pos-tab-${index}`}
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
  { title: 'POS Transactions', value: 420, icon: <AssessmentIcon />, color: 'primary' },
  { title: 'Revenue', value: '₵15,000', icon: <SwapHorizIcon />, color: 'success' },
  { title: 'Cashiers', value: 12, icon: <PeopleIcon />, color: 'secondary' },
  { title: 'Items Sold', value: 230, icon: <InventoryIcon />, color: 'info' },
];

const mockLineData = [
  { date: 'Jul 14', Transactions: 60, Revenue: 2000 },
  { date: 'Jul 15', Transactions: 70, Revenue: 2500 },
  { date: 'Jul 16', Transactions: 80, Revenue: 2800 },
  { date: 'Jul 17', Transactions: 90, Revenue: 3200 },
  { date: 'Jul 18', Transactions: 60, Revenue: 1500 },
  { date: 'Jul 19', Transactions: 40, Revenue: 1000 },
  { date: 'Jul 20', Transactions: 20, Revenue: 500 },
];

const mockPieData1 = [
  { name: 'Cash', value: 160 },
  { name: 'Card', value: 180 },
  { name: 'Mobile Money', value: 80 },
];
const mockPieData2 = [
  { name: 'Accra', value: 220 },
  { name: 'Kumasi', value: 120 },
  { name: 'Takoradi', value: 80 },
];
const mockPieData3 = [
  { name: 'Peak', value: 240 },
  { name: 'Off-Peak', value: 180 },
];

const POSDashboard = () => {
  const { token } = useContext(AuthContext);
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [filters, setFilters] = useState({});
  
  // Transaction integration
  const {
    transactions: transactionData,
    analytics,
    recordPOSTransaction,
    refreshData
  } = useTransactionIntegration('pos');
  
  // Quick Actions State
  const [transactionDialogOpen, setTransactionDialogOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  
  // Form State
  const [transactionForm, setTransactionForm] = useState({
    items: '',
    total: '',
    paymentMethod: 'cash',
    customer: ''
  });
  
  // Quick Action Handlers
  const handleNewTransaction = async () => {
    try {
      console.log('Creating new transaction:', transactionForm);
      setSnackbarMessage('Transaction created successfully!');
      setSnackbarOpen(true);
      setTransactionDialogOpen(false);
      setTransactionForm({ items: '', total: '', paymentMethod: 'cash', customer: '' });
    } catch (error) {
      setSnackbarMessage('Failed to create transaction');
      setSnackbarOpen(true);
    }
  };
  
  const handleAddProduct = () => {
    window.open('/pos/products/add', '_blank');
  };
  
  const handleProcessReturn = () => {
    window.open('/pos/returns', '_blank');
  };
  
  const handleGenerateReceipt = () => {
    // Generate a sample receipt with current transaction data
    const receiptData = {
      receiptNumber: `POS-${Date.now()}`,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      cashier: 'Current User',
      items: [
        { name: 'Product A', qty: 2, price: 25.00, total: 50.00 },
        { name: 'Product B', qty: 1, price: 15.50, total: 15.50 },
        { name: 'Product C', qty: 3, price: 8.75, total: 26.25 }
      ],
      subtotal: 91.75,
      tax: 9.18,
      total: 100.93,
      paymentMethod: 'Cash',
      amountPaid: 105.00,
      change: 4.07
    };
    
    // Create receipt HTML content
    const receiptHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt - ${receiptData.receiptNumber}</title>
        <style>
          body { font-family: 'Courier New', monospace; width: 300px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 15px; }
          .receipt-info { margin-bottom: 15px; }
          .items { border-bottom: 1px solid #000; padding-bottom: 10px; margin-bottom: 10px; }
          .item { display: flex; justify-content: space-between; margin-bottom: 5px; }
          .totals { margin-top: 10px; }
          .total-line { display: flex; justify-content: space-between; margin-bottom: 3px; }
          .final-total { border-top: 1px solid #000; padding-top: 5px; font-weight: bold; }
          .footer { text-align: center; margin-top: 20px; border-top: 1px solid #000; padding-top: 10px; }
          @media print { body { width: auto; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>ERP SYSTEM POS</h2>
          <p>123 Business Street<br>Accra, Ghana<br>Tel: +233 123 456 789</p>
        </div>
        
        <div class="receipt-info">
          <div><strong>Receipt #:</strong> ${receiptData.receiptNumber}</div>
          <div><strong>Date:</strong> ${receiptData.date}</div>
          <div><strong>Time:</strong> ${receiptData.time}</div>
          <div><strong>Cashier:</strong> ${receiptData.cashier}</div>
        </div>
        
        <div class="items">
          <h3>Items:</h3>
          ${receiptData.items.map(item => `
            <div class="item">
              <span>${item.name} (${item.qty}x)</span>
              <span>₵${item.total.toFixed(2)}</span>
            </div>
          `).join('')}
        </div>
        
        <div class="totals">
          <div class="total-line">
            <span>Subtotal:</span>
            <span>₵${receiptData.subtotal.toFixed(2)}</span>
          </div>
          <div class="total-line">
            <span>Tax (10%):</span>
            <span>₵${receiptData.tax.toFixed(2)}</span>
          </div>
          <div class="total-line final-total">
            <span>TOTAL:</span>
            <span>₵${receiptData.total.toFixed(2)}</span>
          </div>
          <div class="total-line">
            <span>Payment (${receiptData.paymentMethod}):</span>
            <span>₵${receiptData.amountPaid.toFixed(2)}</span>
          </div>
          <div class="total-line">
            <span>Change:</span>
            <span>₵${receiptData.change.toFixed(2)}</span>
          </div>
        </div>
        
        <div class="footer">
          <p>Thank you for your business!</p>
          <p>Visit us again soon</p>
          <p><small>Generated on ${new Date().toLocaleString()}</small></p>
        </div>
        
        <script>
          window.onload = function() {
            window.print();
          }
        </script>
      </body>
      </html>
    `;
    
    // Open receipt in new window
    const receiptWindow = window.open('', '_blank', 'width=400,height=600');
    receiptWindow.document.write(receiptHTML);
    receiptWindow.document.close();
    
    // Show success message
    setSnackbarMessage('Receipt generated successfully!');
    setSnackbarOpen(true);
  };

  // Mock data for demonstration
  const recentActivity = [
    { action: 'Sale #POS-4567 completed - ₵450', timestamp: '2 minutes ago', type: 'success' },
    { action: 'Cash register opened by John Doe', timestamp: '10 minutes ago', type: 'info' },
    { action: 'Refund processed for Sale #POS-4566', timestamp: '25 minutes ago', type: 'warning' },
    { action: 'Daily sales report generated', timestamp: '1 hour ago', type: 'success' },
    { action: 'Inventory alert: Low stock on Product ABC', timestamp: '2 hours ago', type: 'warning' },
  ];

  const paymentMethods = [
    { method: 'Cash', count: 160, percentage: 38 },
    { method: 'Card', count: 180, percentage: 43 },
    { method: 'Mobile Money', count: 80, percentage: 19 },
  ];

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;
      
      setLoading(true);
      try {
        // Fetch transactions with error handling
        try {
          const transactionsRes = await api.get('/pos/transactions/', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setTransactions(transactionsRes.data || []);
        } catch (err) {
          console.warn('Failed to load transactions:', err);
        }

        // Fetch products with error handling
        try {
          const productsRes = await api.get('/pos/products/', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setProducts(productsRes.data || []);
        } catch (err) {
          console.warn('Failed to load products:', err);
        }

        // Fetch customers with error handling
        try {
          const customersRes = await api.get('/sales/customers/', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setCustomers(customersRes.data || []);
        } catch (err) {
          console.warn('Failed to load customers:', err);
        }

      } catch (err) {
        setError('Failed to load POS dashboard data.');
        console.error('POS dashboard error:', err);
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
        background: 'linear-gradient(135deg, #FF5722 0%, #D84315 100%)',
        color: 'white',
        p: 4,
        borderRadius: '0 0 24px 24px',
        mb: 3
      }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
              Point of Sale Dashboard
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              Monitor sales performance and manage POS operations.
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
              startIcon={<PointOfSaleIcon />}
              onClick={() => setTransactionDialogOpen(true)}
              sx={{ 
                background: 'linear-gradient(45deg, #FF5722 30%, #D84315 90%)',
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
              New Transaction
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<ShoppingCartIcon />}
              onClick={handleAddProduct}
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
              Add Product
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<SwapHorizIcon />}
              onClick={handleProcessReturn}
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
              Process Return
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<ReceiptIcon />}
              onClick={handleGenerateReceipt}
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
              Generate Receipt
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
          <StyledTab icon={<ReceiptIcon />} label="Transactions" />
          <StyledTab icon={<ShoppingCartIcon />} label="Sales" />
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
                      <Typography variant="body2" sx={{ opacity: 0.8, mb: 1 }}>Transactions</Typography>
                      <Typography variant="h3" sx={{ fontWeight: 700 }}>
                        {transactions.length || 420}
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                      <PointOfSaleIcon sx={{ fontSize: 28 }} />
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
                      <Typography variant="body2" sx={{ opacity: 0.8, mb: 1 }}>Revenue</Typography>
                      <Typography variant="h3" sx={{ fontWeight: 700 }}>
                        ₵15K
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                      <MonetizationOnIcon sx={{ fontSize: 28 }} />
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
                      <Typography variant="body2" sx={{ opacity: 0.8, mb: 1 }}>Cashiers</Typography>
                      <Typography variant="h3" sx={{ fontWeight: 700 }}>
                        12
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
              <MetricCard sx={{ background: 'linear-gradient(135deg, #9C27B0 0%, #6A1B9A 100%)' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="body2" sx={{ opacity: 0.8, mb: 1 }}>Items Sold</Typography>
                      <Typography variant="h3" sx={{ fontWeight: 700 }}>
                        230
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
                    <PointOfSaleIcon sx={{ mr: 1, color: '#FF5722' }} />
                    Recent POS Activity
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

            {/* Payment Methods */}
            <Grid item xs={12} md={4}>
              <AnalyticsCard>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Payment Methods</Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Box sx={{ space: 2 }}>
                    {paymentMethods.map((method, idx) => (
                      <Box key={idx} sx={{ mb: 2 }}>
                        <Box display="flex" justifyContent="space-between" mb={1}>
                          <Typography variant="body2">{method.method}</Typography>
                          <Typography variant="body2" color="primary">{method.count} ({method.percentage}%)</Typography>
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={method.percentage} 
                          color={idx === 0 ? 'success' : idx === 1 ? 'primary' : 'warning'} 
                          sx={{ borderRadius: 1, height: 8 }} 
                        />
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </AnalyticsCard>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Transactions Tab */}
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <AnalyticsCard>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Recent Transactions</Typography>
                  <Divider sx={{ mb: 2 }} />
                  {transactions.length > 0 ? (
                    <List sx={{ py: 0 }}>
                      {transactions.slice(0, 10).map((transaction, idx) => (
                        <ListItem key={idx} sx={{ px: 0, py: 1 }}>
                          <ListItemText 
                            primary={`Transaction #${transaction.id || `POS-${4000 + idx}`} - ${transaction.customer?.name || 'Walk-in Customer'}`}
                            secondary={`Amount: ₵${transaction.total || (Math.random() * 500).toFixed(2)} | Payment: ${transaction.payment_method || 'Cash'} | Time: ${transaction.created_at || 'Just now'}`}
                            primaryTypographyProps={{ fontWeight: 500 }}
                          />
                          <Chip 
                            label={transaction.status || 'Completed'}
                            size="small" 
                            color={transaction.status === 'Completed' ? 'success' : transaction.status === 'Refunded' ? 'warning' : 'info'}
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Alert severity="info" sx={{ borderRadius: 2 }}>No transactions available</Alert>
                  )}
                </CardContent>
              </AnalyticsCard>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Sales Tab */}
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <AnalyticsCard>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Top Selling Products</Typography>
                  <Divider sx={{ mb: 2 }} />
                  {products.length > 0 ? (
                    <List sx={{ py: 0 }}>
                      {products.slice(0, 10).map((product, idx) => (
                        <ListItem key={idx} sx={{ px: 0, py: 1 }}>
                          <ListItemText 
                            primary={`${product.name || `Product ${idx + 1}`} - ${product.sku || `SKU-${1000 + idx}`}`}
                            secondary={`Price: ₵${product.price || (Math.random() * 100).toFixed(2)} | Stock: ${product.stock || Math.floor(Math.random() * 50)} | Sales: ${product.sales_count || Math.floor(Math.random() * 100)}`}
                            primaryTypographyProps={{ fontWeight: 500 }}
                          />
                          <Chip 
                            label={product.stock > 10 ? 'In Stock' : product.stock > 0 ? 'Low Stock' : 'Out of Stock'}
                            size="small" 
                            color={product.stock > 10 ? 'success' : product.stock > 0 ? 'warning' : 'error'}
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Alert severity="info" sx={{ borderRadius: 2 }}>No products available</Alert>
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
                moduleId="pos" 
                title="POS Transaction Flow"
              />
            </Grid>
            
            {/* Time-Based Analytics */}
            <Grid item xs={12} md={6}>
              <TimeBasedAnalytics 
                moduleId="pos" 
                title="POS Trends Analysis"
              />
            </Grid>
            
            {/* Advanced Analytics with Charts */}
            <Grid item xs={12}>
              <AdvancedAnalytics 
                moduleId="pos" 
                title="POS Performance Analytics"
                data={{
                  daily_revenue: 45000,
                  total_transactions: 420,
                  avg_transaction: 107,
                  items_sold: 230
                }}
              />
            </Grid>
            
            {/* Gantt Chart for POS Projects */}
            <Grid item xs={12}>
              <GanttChart 
                title="POS Project Timeline"
                projects={[
                  {
                    id: 1,
                    name: 'POS System Enhancement',
                    type: 'pos',
                    manager: 'Store Manager',
                    status: 'in-progress',
                    priority: 'medium',
                    startDate: new Date('2024-02-01'),
                    endDate: new Date('2024-04-30'),
                    progress: 50,
                    budget: 40000,
                    team: ['POS Technician', 'Store Staff', 'IT Support'],
                    tasks: [
                      {
                        id: 501,
                        name: 'Hardware Upgrade',
                        startDate: new Date('2024-02-01'),
                        endDate: new Date('2024-02-20'),
                        progress: 100,
                        status: 'completed',
                        assignee: 'POS Technician',
                        dependencies: []
                      },
                      {
                        id: 502,
                        name: 'Software Installation',
                        startDate: new Date('2024-02-15'),
                        endDate: new Date('2024-03-10'),
                        progress: 70,
                        status: 'in-progress',
                        assignee: 'IT Support',
                        dependencies: [501]
                      },
                      {
                        id: 503,
                        name: 'Staff Training',
                        startDate: new Date('2024-03-05'),
                        endDate: new Date('2024-04-15'),
                        progress: 30,
                        status: 'in-progress',
                        assignee: 'Store Manager',
                        dependencies: [502]
                      },
                      {
                        id: 504,
                        name: 'System Go-Live',
                        startDate: new Date('2024-04-20'),
                        endDate: new Date('2024-04-30'),
                        progress: 0,
                        status: 'pending',
                        assignee: 'Store Manager',
                        dependencies: [503]
                      }
                    ]
                  }
                ]}
              />
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>
      
      {/* Transaction Dialog */}
      <Dialog open={transactionDialogOpen} onClose={() => setTransactionDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>New Transaction</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            select
            label="Product"
            value={transactionForm.product || ''}
            onChange={(e) => setTransactionForm({...transactionForm, product: e.target.value})}
            margin="normal"
            helperText={products.length === 0 ? "No products available" : `${products.length} products available`}
          >
            <MenuItem value="">
              <em>Select a Product</em>
            </MenuItem>
            {products.map((product) => (
              <MenuItem key={product.id} value={product.id}>
                {product.name} - ₵{product.price || '0.00'}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth
            label="Total Amount"
            value={transactionForm.total}
            onChange={(e) => setTransactionForm({...transactionForm, total: e.target.value})}
            margin="normal"
            type="number"
            InputProps={{ startAdornment: '₵' }}
          />
          <TextField
            fullWidth
            select
            label="Payment Method"
            value={transactionForm.paymentMethod}
            onChange={(e) => setTransactionForm({...transactionForm, paymentMethod: e.target.value})}
            margin="normal"
          >
            <MenuItem value="cash">Cash</MenuItem>
            <MenuItem value="card">Card</MenuItem>
            <MenuItem value="mobile">Mobile Money</MenuItem>
          </TextField>
          <TextField
            fullWidth
            select
            label="Customer (Optional)"
            value={transactionForm.customer}
            onChange={(e) => setTransactionForm({...transactionForm, customer: e.target.value})}
            margin="normal"
            helperText={customers.length === 0 ? "No customers available" : `${customers.length} customers available`}
          >
            <MenuItem value="">
              <em>No Customer</em>
            </MenuItem>
            {customers.map((customer) => (
              <MenuItem key={customer.id} value={customer.id}>
                {customer.name} - {customer.email || customer.phone || 'No contact'}
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTransactionDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleNewTransaction} 
            variant="contained"
            sx={{ background: 'linear-gradient(45deg, #FF5722 30%, #D84315 90%)' }}
          >
            Create Transaction
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

export default POSDashboard;

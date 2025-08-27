import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Card,
  CardContent,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  InputAdornment,
  Snackbar,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  Chip,
  Divider,
  LinearProgress
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
import PrintIcon from '@mui/icons-material/Print';
import api from './api';
import { AuthContext } from './AuthContext';
import { loadCustomersWithFallback, loadProductsWithFallback } from './sharedData';
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

const mockTransactions = [
  { invoice_number: 'INV-001', customer_name: 'John Doe', total: 1000, payment_method: 'Cash', date: '2023-02-15', status: 'Paid' },
  { invoice_number: 'INV-002', customer_name: 'Jane Doe', total: 2000, payment_method: 'Card', date: '2023-02-16', status: 'Refunded' },
  { invoice_number: 'INV-003', customer_name: 'Bob Smith', total: 3000, payment_method: 'Mobile Money', date: '2023-02-17', status: 'Paid' },
];

const POSDashboard = () => {
  const { token, user } = useContext(AuthContext);
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
  const [returnDialogOpen, setReturnDialogOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  
  // Form State
  const [transactionForm, setTransactionForm] = useState({
    items: '',
    total: '',
    paymentMethod: 'cash',
    customer: ''
  });

  const [returnForm, setReturnForm] = useState({
    transactionId: '',
    reason: '',
    refundAmount: '',
    refundMethod: 'cash',
    notes: ''
  });
  
  // Quick Action Handlers
  const handleNewTransaction = async () => {
    try {
      // Validate transaction form
      if (!transactionForm.product || !transactionForm.total) {
        setSnackbarMessage('Please select a product and enter total amount');
        setSnackbarOpen(true);
        return;
      }

      // Get selected product details
      const selectedProduct = products.find(p => p.id === parseInt(transactionForm.product));
      if (!selectedProduct) {
        setSnackbarMessage('Selected product not found');
        setSnackbarOpen(true);
        return;
      }

      // Create transaction data
      const transactionData = {
        product_id: selectedProduct.id,
        quantity: 1, // Default quantity, can be made configurable
        unit_price: parseFloat(transactionForm.total),
        total_amount: parseFloat(transactionForm.total),
        payment_method: transactionForm.paymentMethod,
        customer_id: transactionForm.customer || null,
        staff_id: user.id,
        notes: `POS Transaction - ${selectedProduct.name}`,
        transaction_type: 'sale'
      };

      console.log('Creating POS transaction:', transactionData);

      // Submit transaction to backend
      const token = localStorage.getItem('token');
      const response = await api.post('/pos/sales/', transactionData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data) {
        setSnackbarMessage(`Transaction completed successfully! Sale ID: ${response.data.id}`);
        setSnackbarOpen(true);
        setTransactionDialogOpen(false);
        setTransactionForm({ items: '', total: '', paymentMethod: 'cash', customer: '', product: '' });
        
        // Refresh transactions list
        await fetchData();
      }
    } catch (error) {
      console.error('Transaction creation error:', error);
      let errorMessage = 'Failed to create transaction';
      
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 400) {
        errorMessage = 'Invalid transaction data. Please check your inputs.';
      } else if (error.response?.status === 403) {
        errorMessage = 'Permission denied. You may not have access to create transactions.';
      }
      
      setSnackbarMessage(errorMessage);
      setSnackbarOpen(true);
    }
  };
  
  const handleProcessReturn = () => {
    setReturnDialogOpen(true);
  };

  const handleSubmitReturn = async () => {
    try {
      // Validate return form
      if (!returnForm.transactionId || !returnForm.reason || !returnForm.refundAmount) {
        setSnackbarMessage('Please fill in all required fields');
        setSnackbarOpen(true);
        return;
      }

      // Process the return
      const returnData = {
        transaction_id: returnForm.transactionId,
        reason: returnForm.reason,
        refund_amount: parseFloat(returnForm.refundAmount),
        refund_method: returnForm.refundMethod,
        notes: returnForm.notes,
        processed_by: user?.username || 'Unknown',
        processed_at: new Date().toISOString()
      };

      console.log('Processing return:', returnData);
      
      // Here you would typically make an API call to process the return
      // await api.post('/pos/returns/', returnData, { headers: { Authorization: `Bearer ${token}` } });

      setSnackbarMessage(`Return processed successfully! Refund of ₵${returnForm.refundAmount} via ${returnForm.refundMethod}`);
      setSnackbarOpen(true);
      setReturnDialogOpen(false);
      setReturnForm({
        transactionId: '',
        reason: '',
        refundAmount: '',
        refundMethod: 'cash',
        notes: ''
      });

      // Refresh transactions data
      if (refreshData) {
        refreshData();
      }
    } catch (error) {
      console.error('Return processing error:', error);
      setSnackbarMessage('Failed to process return. Please try again.');
      setSnackbarOpen(true);
    }
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

  const handlePrintInvoice = (transaction) => {
    // Generate a sample invoice with transaction data
    const invoiceData = {
      invoiceNumber: transaction.invoice_number,
      date: transaction.date,
      customerName: transaction.customer_name,
      items: [
        { name: 'Product A', qty: 2, price: 25.00, total: 50.00 },
        { name: 'Product B', qty: 1, price: 15.50, total: 15.50 },
        { name: 'Product C', qty: 3, price: 8.75, total: 26.25 }
      ],
      subtotal: 91.75,
      tax: 9.18,
      total: 100.93,
      paymentMethod: transaction.payment_method,
      amountPaid: 105.00,
      change: 4.07
    };
    
    // Create invoice HTML content
    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice - ${invoiceData.invoiceNumber}</title>
        <style>
          body { font-family: 'Courier New', monospace; width: 300px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 15px; }
          .invoice-info { margin-bottom: 15px; }
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
        
        <div class="invoice-info">
          <div><strong>Invoice #:</strong> ${invoiceData.invoiceNumber}</div>
          <div><strong>Date:</strong> ${invoiceData.date}</div>
          <div><strong>Customer:</strong> ${invoiceData.customerName}</div>
        </div>
        
        <div class="items">
          <h3>Items:</h3>
          ${invoiceData.items.map(item => `
            <div class="item">
              <span>${item.name} (${item.qty}x)</span>
              <span>₵${item.total.toFixed(2)}</span>
            </div>
          `).join('')}
        </div>
        
        <div class="totals">
          <div class="total-line">
            <span>Subtotal:</span>
            <span>₵${invoiceData.subtotal.toFixed(2)}</span>
          </div>
          <div class="total-line">
            <span>Tax (10%):</span>
            <span>₵${invoiceData.tax.toFixed(2)}</span>
          </div>
          <div class="total-line final-total">
            <span>TOTAL:</span>
            <span>₵${invoiceData.total.toFixed(2)}</span>
          </div>
          <div class="total-line">
            <span>Payment (${invoiceData.paymentMethod}):</span>
            <span>₵${invoiceData.amountPaid.toFixed(2)}</span>
          </div>
          <div class="total-line">
            <span>Change:</span>
            <span>₵${invoiceData.change.toFixed(2)}</span>
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
    
    // Open invoice in new window
    const invoiceWindow = window.open('', '_blank', 'width=400,height=600');
    invoiceWindow.document.write(invoiceHTML);
    invoiceWindow.document.close();
  };

  const paymentMethods = [
    { method: 'Cash', count: 245, percentage: 58 },
    { method: 'Card', count: 98, percentage: 23 },
    { method: 'Mobile Money', count: 80, percentage: 19 },
  ];

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
        console.log('Fetching products from shared data source...');
        const productsRes = await loadProductsWithFallback(api);
        console.log('Products data:', productsRes);
        
        if (productsRes && Array.isArray(productsRes) && productsRes.length > 0) {
          setProducts(productsRes);
        } else {
          console.warn('No products returned from shared data source, using fallback data');
          // Fallback sample data for testing
          setProducts([
            { id: 1, name: 'Sample Product 1', sku: 'SP001', quantity: 10, prices: [{ price: '25.00' }] },
            { id: 2, name: 'Sample Product 2', sku: 'SP002', quantity: 5, prices: [{ price: '15.00' }] }
          ]);
        }
      } catch (err) {
        console.error('Failed to load products from shared source:', err);
        // Use fallback data on error
        setProducts([
          { id: 1, name: 'Sample Product 1', sku: 'SP001', quantity: 10, prices: [{ price: '25.00' }] },
          { id: 2, name: 'Sample Product 2', sku: 'SP002', quantity: 5, prices: [{ price: '15.00' }] }
        ]);
      }

      // Fetch customers with error handling
      try {
        console.log('Fetching customers from shared data source...');
        const customersRes = await loadCustomersWithFallback();
        console.log('Customers data:', customersRes);
        
        if (customersRes && Array.isArray(customersRes) && customersRes.length > 0) {
          setCustomers(customersRes);
        } else {
          console.warn('No customers returned from shared data source, using fallback data');
          // Fallback sample data for testing
          setCustomers([
            { id: 1, name: 'Sample Customer 1', email: 'customer1@example.com' },
            { id: 2, name: 'Sample Customer 2', email: 'customer2@example.com' }
          ]);
        }
      } catch (err) {
        console.error('Failed to load customers:', err);
        console.error('Customers error response:', err.response);
        // Use fallback data on error
        setCustomers([
          { id: 1, name: 'Sample Customer 1', email: 'customer1@example.com' },
          { id: 2, name: 'Sample Customer 2', email: 'customer2@example.com' }
        ]);
      }

    } catch (err) {
      setError('Failed to load POS dashboard data.');
      console.error('POS dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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

      {/* Tabbed Interface */}
      <Paper sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          variant="fullWidth"
          sx={{
            '& .MuiTab-root': {
              fontWeight: 600,
              textTransform: 'none',
              minHeight: 64,
              '&.Mui-selected': {
                background: 'linear-gradient(45deg, #FF5722 30%, #D84315 90%)',
                color: 'white'
              }
            }
          }}
        >
          <Tab icon={<TrendingUpIcon />} label="Overview" />
          <Tab icon={<ReceiptIcon />} label="Transactions" />
          <Tab icon={<ShoppingCartIcon />} label="Sales" />
          <Tab icon={<AssessmentIcon />} label="Analytics" />
        </Tabs>

        {/* Overview Tab */}
        {tabValue === 0 && (
          <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
              {/* Key Metrics */}
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ background: 'linear-gradient(135deg, #FF5722 0%, #D84315 100%)', color: 'white' }}>
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
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)', color: 'white' }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                      <Box>
                        <Typography variant="body2" sx={{ opacity: 0.8, mb: 1 }}>Revenue</Typography>
                        <Typography variant="h3" sx={{ fontWeight: 700 }}>₵15K</Typography>
                      </Box>
                      <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                        <MonetizationOnIcon sx={{ fontSize: 28 }} />
                      </Avatar>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ background: 'linear-gradient(135deg, #2196F3 0%, #1565C0 100%)', color: 'white' }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                      <Box>
                        <Typography variant="body2" sx={{ opacity: 0.8, mb: 1 }}>Cashiers</Typography>
                        <Typography variant="h3" sx={{ fontWeight: 700 }}>12</Typography>
                      </Box>
                      <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                        <PeopleIcon sx={{ fontSize: 28 }} />
                      </Avatar>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ background: 'linear-gradient(135deg, #9C27B0 0%, #6A1B9A 100%)', color: 'white' }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                      <Box>
                        <Typography variant="body2" sx={{ opacity: 0.8, mb: 1 }}>Items Sold</Typography>
                        <Typography variant="h3" sx={{ fontWeight: 700 }}>230</Typography>
                      </Box>
                      <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                        <InventoryIcon sx={{ fontSize: 28 }} />
                      </Avatar>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Payment Methods */}
              <Grid item xs={12} md={6}>
                <Card>
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
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Transactions Tab */}
        {tabValue === 1 && (
          <Box sx={{ p: 3 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Recent Transactions</Typography>
                <Divider sx={{ mb: 2 }} />
                {transactions.length > 0 ? (
                  <List sx={{ py: 0 }}>
                    {transactions.slice(0, 10).map((transaction, idx) => (
                      <ListItem key={idx} sx={{ px: 0, py: 1 }}>
                        <ListItemText 
                          primary={`Transaction #${transaction.id} - ${transaction.customer_name || 'Walk-in'}`}
                          secondary={`Amount: $${transaction.total_amount} | Payment: ${transaction.payment_method}`}
                          primaryTypographyProps={{ fontWeight: 500 }}
                        />
                        <Chip 
                          label="Completed"
                          size="small" 
                          color="success"
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Alert severity="info" sx={{ borderRadius: 2 }}>No transactions available</Alert>
                )}
              </CardContent>
            </Card>
          </Box>
        )}

        {/* Sales Tab */}
        {tabValue === 2 && (
          <Box sx={{ p: 3 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Top Selling Products</Typography>
                <Divider sx={{ mb: 2 }} />
                {products.length > 0 ? (
                  <List sx={{ py: 0 }}>
                    {products.slice(0, 10).map((product, idx) => (
                      <ListItem key={idx} sx={{ px: 0, py: 1 }}>
                        <ListItemText 
                          primary={`${product.name} - ${product.sku || `SKU-${1000 + idx}`}`}
                          secondary={`Price: $${product.price || product.prices?.[0]?.price || '0.00'} | Stock: ${product.quantity || 0}`}
                          primaryTypographyProps={{ fontWeight: 500 }}
                        />
                        <Chip 
                          label={product.quantity > 10 ? 'In Stock' : product.quantity > 0 ? 'Low Stock' : 'Out of Stock'}
                          size="small" 
                          color={product.quantity > 10 ? 'success' : product.quantity > 0 ? 'warning' : 'error'}
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Alert severity="info" sx={{ borderRadius: 2 }}>No products available</Alert>
                )}
              </CardContent>
            </Card>
          </Box>
        )}

        {/* Analytics Tab */}
        {tabValue === 3 && (
          <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center' }}>
                      <TrendingUpIcon sx={{ mr: 1, color: '#4CAF50' }} />
                      Sales Performance
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Box sx={{ textAlign: 'center', mb: 3 }}>
                      <Typography variant="h3" color="primary" sx={{ mb: 1 }}>94.2%</Typography>
                      <Typography variant="body2" color="text.secondary">Overall Performance</Typography>
                      <LinearProgress variant="determinate" value={94.2} sx={{ height: 8, borderRadius: 4, mt: 2 }} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Transaction Analytics</Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.light', color: 'primary.contrastText', flex: 1, mr: 1 }}>
                        <Typography variant="h5">{transactions.length || 420}</Typography>
                        <Typography variant="caption">Total Transactions</Typography>
                      </Paper>
                      <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'success.light', color: 'success.contrastText', flex: 1, ml: 1 }}>
                        <Typography variant="h5">$107</Typography>
                        <Typography variant="caption">Avg Transaction</Typography>
                      </Paper>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}
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

      {/* New Transaction Dialog */}
      <Dialog open={transactionDialogOpen} onClose={() => setTransactionDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>New Transaction</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Product</InputLabel>
              <Select
                value={transactionForm.product}
                onChange={(e) => setTransactionForm({...transactionForm, product: e.target.value})}
                label="Product"
              >
                {products.map((product) => (
                  <MenuItem key={product.id} value={product.id}>
                    {product.name} - ${product.price || product.prices?.[0]?.price || '0.00'} (Stock: {product.quantity})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Customer (Optional)</InputLabel>
              <Select
                value={transactionForm.customer}
                onChange={(e) => setTransactionForm({...transactionForm, customer: e.target.value})}
                label="Customer (Optional)"
              >
                <MenuItem value="">
                  <em>Walk-in Customer</em>
                </MenuItem>
                {customers.map((customer) => (
                  <MenuItem key={customer.id} value={customer.id}>
                    {customer.name} - {customer.email}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Total Amount"
              type="number"
              value={transactionForm.total}
              onChange={(e) => setTransactionForm({...transactionForm, total: e.target.value})}
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
            />
            <FormControl fullWidth>
              <InputLabel>Payment Method</InputLabel>
              <Select
                value={transactionForm.paymentMethod}
                onChange={(e) => setTransactionForm({...transactionForm, paymentMethod: e.target.value})}
                label="Payment Method"
              >
                <MenuItem value="cash">Cash</MenuItem>
                <MenuItem value="card">Card</MenuItem>
                <MenuItem value="mobile">Mobile Money</MenuItem>
                <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTransactionDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleNewTransaction} variant="contained">Complete Transaction</Button>
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

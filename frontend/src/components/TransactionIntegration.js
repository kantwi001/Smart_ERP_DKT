// TransactionIntegration.js - Cross-module transaction integration widget
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Tooltip,
  Badge,
  Tabs,
  Tab,
  Grid,
  LinearProgress,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  SwapHoriz,
  AccountBalance,
  Inventory,
  ShoppingCart,
  Factory,
  People,
  PointOfSale,
  Assessment,
  Refresh,
  Visibility,
  Timeline,
  Analytics,
  Payment,
  PhotoCamera,
  CheckCircle,
  Cancel
} from '@mui/icons-material';
import { getGlobalTransactionHistory, getGlobalPaymentHistory, addPayment, updatePaymentStatus, getTransactions } from '../sharedData';

const moduleIcons = {
  sales: <TrendingUp />,
  inventory: <Inventory />,
  procurement: <ShoppingCart />,
  manufacturing: <Factory />,
  accounting: <AccountBalance />,
  hr: <People />,
  pos: <PointOfSale />,
  warehouse: <SwapHoriz />,
  customers: <People />,
  reporting: <Assessment />
};

const moduleColors = {
  sales: '#4caf50',
  inventory: '#2196f3',
  procurement: '#ff9800',
  manufacturing: '#9c27b0',
  accounting: '#f44336',
  hr: '#00bcd4',
  pos: '#795548',
  warehouse: '#607d8b',
  customers: '#8bc34a',
  reporting: '#3f51b5'
};

const TransactionIntegration = ({ moduleId, title = "Transaction Integration" }) => {
  const [transactions, setTransactions] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [paymentForm, setPaymentForm] = useState({
    transaction_id: '',
    amount: '',
    payment_method: 'cash',
    cheque_photo: null,
    cheque_number: '',
    notes: ''
  });

  useEffect(() => {
    loadTransactionData();
    
    // Listen for transaction updates
    const handleTransactionUpdate = () => {
      loadTransactionData();
    };
    
    const handlePaymentUpdate = () => {
      loadTransactionData();
    };
    
    const handleSalesTransactionUpdate = () => {
      loadTransactionData();
    };
    
    window.addEventListener('transactionHistoryUpdated', handleTransactionUpdate);
    window.addEventListener('paymentHistoryUpdated', handlePaymentUpdate);
    window.addEventListener('salesTransactionUpdated', handleSalesTransactionUpdate);
    
    return () => {
      window.removeEventListener('transactionHistoryUpdated', handleTransactionUpdate);
      window.removeEventListener('paymentHistoryUpdated', handlePaymentUpdate);
      window.removeEventListener('salesTransactionUpdated', handleSalesTransactionUpdate);
    };
  }, []);

  const loadTransactionData = () => {
    try {
      setLoading(true);
      const transactionData = getTransactions();
      const paymentData = getGlobalPaymentHistory();
      
      setTransactions(transactionData);
      setPayments(paymentData);
      setError(null);
    } catch (err) {
      setError('Failed to load transaction data');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleTransactionClick = (transaction) => {
    setSelectedTransaction(transaction);
    setDetailsOpen(true);
  };

  const handlePaymentSubmit = async () => {
    try {
      const paymentData = {
        transaction_id: selectedTransaction.id,
        invoice_reference: selectedTransaction.reference,
        customer_id: selectedTransaction.customer_id,
        customer_name: selectedTransaction.customer_name,
        amount: parseFloat(paymentForm.amount),
        payment_method: paymentForm.payment_method,
        cheque_photo: paymentForm.cheque_photo,
        cheque_number: paymentForm.cheque_number,
        notes: paymentForm.notes
      };

      addPayment(paymentData);
      
      setPaymentDialogOpen(false);
      setPaymentForm({
        transaction_id: '',
        amount: '',
        payment_method: 'cash',
        cheque_photo: null,
        cheque_number: '',
        notes: ''
      });
      
      alert(`Payment submitted successfully! ${paymentForm.payment_method === 'cheque' ? 'Cheque is pending approval.' : 'Payment processed.'}`);
    } catch (error) {
      alert('Error submitting payment');
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPaymentForm({
          ...paymentForm,
          cheque_photo: e.target.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePaymentApproval = (paymentId, status) => {
    updatePaymentStatus(paymentId, status, 'Collins Arku', `Payment ${status} by finance manager`);
    alert(`Payment ${status} successfully!`);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  if (error) {
    return (
      <Card>
        <CardContent>
          <Alert 
            severity="error" 
            action={
              <Button color="inherit" size="small" onClick={() => setError(null)}>
                Dismiss
              </Button>
            }
          >
            {error}
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" component="div">
            {title}
          </Typography>
          <Tooltip title="Refresh transaction data">
            <IconButton onClick={loadTransactionData} disabled={loading}>
              <Refresh />
            </IconButton>
          </Tooltip>
        </Box>

        {loading && <LinearProgress sx={{ mb: 2 }} />}

        <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 2 }}>
          <Tab label="Recent Transactions" />
          <Tab label="Analytics" />
        </Tabs>

        {/* Recent Transactions Tab */}
        {tabValue === 0 && (
          <Box>
            {transactions.length === 0 ? (
              <Typography color="textSecondary" align="center" py={3}>
                No recent transactions
              </Typography>
            ) : (
              <List dense>
                {transactions.slice(0, 10).map((transaction, index) => (
                  <ListItem
                    key={transaction.id || index}
                    button
                    onClick={() => handleTransactionClick(transaction)}
                    sx={{
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 1,
                      mb: 1,
                      '&:hover': {
                        backgroundColor: 'action.hover'
                      }
                    }}
                  >
                    <ListItemIcon>
                      <TrendingUp color={transaction.status === 'completed' ? 'success' : 'warning'} />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="body2" fontWeight="medium">
                            {transaction.reference} - {transaction.customer_name}
                          </Typography>
                          <Chip
                            label={transaction.status}
                            size="small"
                            color={getStatusColor(transaction.status)}
                            variant="outlined"
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="caption" color="textSecondary">
                            {transaction.date} - {transaction.payment_method}
                          </Typography>
                          <Typography variant="caption" display="block">
                            Amount: {formatCurrency(transaction.amount)}
                          </Typography>
                        </Box>
                      }
                    />
                    {transaction.status === 'pending' && transaction.payment_method === 'credit' && (
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<Payment />}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTransaction(transaction);
                          setPaymentForm({
                            ...paymentForm,
                            transaction_id: transaction.id,
                            amount: transaction.amount
                          });
                          setPaymentDialogOpen(true);
                        }}
                      >
                        Pay
                      </Button>
                    )}
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        )}

        {/* Analytics Tab */}
        {tabValue === 1 && (
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Card variant="outlined">
                <CardContent sx={{ textAlign: 'center' }}>
                  <TrendingUp color="success" sx={{ fontSize: 40 }} />
                  <Typography variant="h4" color="success.main">
                    {transactions.filter(t => t.status === 'completed').length}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Completed Sales
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6}>
              <Card variant="outlined">
                <CardContent sx={{ textAlign: 'center' }}>
                  <TrendingDown color="warning" sx={{ fontSize: 40 }} />
                  <Typography variant="h4" color="warning.main">
                    {transactions.filter(t => t.status === 'pending').length}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Pending Receivables
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12}>
              <Card variant="outlined">
                <CardContent sx={{ textAlign: 'center' }}>
                  <AccountBalance color="primary" sx={{ fontSize: 40 }} />
                  <Typography variant="h4" color="primary">
                    {formatCurrency(transactions.reduce((acc, t) => acc + t.amount, 0))}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Total Transaction Value
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Payment Dialog */}
        <Dialog open={paymentDialogOpen} onClose={() => setPaymentDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Submit Payment</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Amount"
                  type="number"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({...paymentForm, amount: e.target.value})}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  select
                  fullWidth
                  label="Payment Method"
                  value={paymentForm.payment_method}
                  onChange={(e) => setPaymentForm({...paymentForm, payment_method: e.target.value})}
                >
                  <MenuItem value="cash">Cash</MenuItem>
                  <MenuItem value="cheque">Cheque</MenuItem>
                  <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
                </TextField>
              </Grid>
              {paymentForm.payment_method === 'cheque' && (
                <>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Cheque Number"
                      value={paymentForm.cheque_number}
                      onChange={(e) => setPaymentForm({...paymentForm, cheque_number: e.target.value})}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      variant="outlined"
                      component="label"
                      startIcon={<PhotoCamera />}
                      fullWidth
                    >
                      Upload Cheque Photo
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={handleFileUpload}
                      />
                    </Button>
                    {paymentForm.cheque_photo && (
                      <Box mt={2}>
                        <img
                          src={paymentForm.cheque_photo}
                          alt="Cheque"
                          style={{ width: '100%', maxHeight: '200px', objectFit: 'contain' }}
                        />
                      </Box>
                    )}
                  </Grid>
                </>
              )}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notes"
                  multiline
                  rows={3}
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm({...paymentForm, notes: e.target.value})}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setPaymentDialogOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={handlePaymentSubmit}>Submit Payment</Button>
          </DialogActions>
        </Dialog>

        {/* Transaction Details Dialog */}
        <Dialog
          open={detailsOpen}
          onClose={() => setDetailsOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            Transaction Details
          </DialogTitle>
          <DialogContent>
            {selectedTransaction && (
              <Box>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2">Transaction Reference</Typography>
                    <Typography variant="body2" gutterBottom>
                      {selectedTransaction.reference}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2">Customer</Typography>
                    <Typography variant="body2" gutterBottom>
                      {selectedTransaction.customer_name}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2">Amount</Typography>
                    <Typography variant="body2" gutterBottom>
                      {formatCurrency(selectedTransaction.amount)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2">Payment Method</Typography>
                    <Typography variant="body2" gutterBottom>
                      {selectedTransaction.payment_method}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2">Status</Typography>
                    <Chip
                      label={selectedTransaction.status}
                      color={getStatusColor(selectedTransaction.status)}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2">Date</Typography>
                    <Typography variant="body2" gutterBottom>
                      {selectedTransaction.date}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2">Products</Typography>
                    <TableContainer component={Paper} sx={{ mt: 1 }}>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Product</TableCell>
                            <TableCell>Quantity</TableCell>
                            <TableCell>Unit Price</TableCell>
                            <TableCell>Total</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {selectedTransaction.products?.map((product, idx) => (
                            <TableRow key={idx}>
                              <TableCell>{product.product_name}</TableCell>
                              <TableCell>{product.quantity}</TableCell>
                              <TableCell>{formatCurrency(product.unit_price)}</TableCell>
                              <TableCell>{formatCurrency(product.total)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Grid>
                </Grid>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDetailsOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default TransactionIntegration;

import React, { useEffect, useState, useContext } from 'react';
import api from './api';
import { AuthContext } from './AuthContext';
import offlineStorage from './utils/offlineStorage';
import { 
  Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  CircularProgress, Alert, Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, 
  TextField, Autocomplete, Grid, Card, CardContent, Chip, IconButton, Toolbar, 
  InputAdornment, FormControl, InputLabel, Select, MenuItem, Checkbox, 
  TablePagination, Fab, Tooltip as MuiTooltip, Badge
} from '@mui/material';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import PeopleIcon from '@mui/icons-material/People';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import GetAppIcon from '@mui/icons-material/GetApp';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import PrintIcon from '@mui/icons-material/Print';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const CURRENCIES = [
  { code: 'SLL', label: 'Sierra Leonean Leone' },
  { code: 'USD', label: 'US Dollar' },
  { code: 'LRD', label: 'Liberian Dollar' },
  { code: 'GHS', label: 'Ghana Cedi' },
];

const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'card', label: 'Card' },
  { value: 'mobile_money', label: 'Mobile Money' },
  { value: 'credit', label: 'Credit' },
];

const POS = () => {
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [currency, setCurrency] = useState('SLL');
  const { token } = useContext(AuthContext);
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ product: '', quantity: '', total: '', customer: '', payment_method: 'cash' });
  const [stockWarning, setStockWarning] = useState('');
  const [customerWarning, setCustomerWarning] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  
  // Enhanced state for advanced features
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedTransactions, setSelectedTransactions] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  useEffect(() => {
    console.log('POS component mounted, fetching data...');
    fetchTransactions();
    fetchProducts();
    fetchCustomers();
    // eslint-disable-next-line
  }, [token]);

  useEffect(() => {
    console.log('Products state updated:', products);
  }, [products]);

  const fetchProducts = async () => {
    try {
      const res = await api.get('/api/inventory/products/', { headers: { Authorization: `Bearer ${token}` } });
      console.log('Products API Response:', res.data);
      console.log('Products count:', res.data.length);
      if (res.data && Array.isArray(res.data)) {
        setProducts(res.data);
        console.log('Products set in state:', res.data);
      } else {
        console.error('Invalid products data format:', res.data);
        setProducts([]);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
      console.error('Error details:', error.response?.data);
      setError('Failed to load products for POS transactions.');
      setProducts([]);
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await api.get('/sales/customers/', { headers: { Authorization: `Bearer ${token}` } });
      setCustomers(res.data);
    } catch {}
  };

  const fetchTransactions = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/pos/transactions/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTransactions(res.data);
    } catch (err) {
      setError('Failed to load POS transactions.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setForm({ product: '', quantity: '', total: '', customer: '', payment_method: 'cash' });
    setCustomerWarning('');
    setSelectedCustomer(null);
  };

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  const handleProductChange = (event, value) => {
    const price = value ? (value.prices.find(p => p.currency === currency)?.price || 0) : 0;
    setForm({
      ...form,
      product: value ? value.id : '',
      total: price * Number(form.quantity || 1),
    });
    setStockWarning('');
  };
  const handleQuantityChange = e => {
    const qty = e.target.value;
    const product = products.find(p => p.id === form.product);
    if (product && Number(qty) > product.quantity) {
      setStockWarning('Insufficient stock for this product.');
    } else {
      setStockWarning('');
    }
    const price = product ? (product.prices.find(p => p.currency === currency)?.price || 0) : 0;
    setForm({
      ...form,
      quantity: qty,
      total: price * Number(qty),
    });
  };
  const handleCurrencyChange = (event, value) => {
    setCurrency(value.code);
    // recalculate total if product is selected
    const product = products.find(p => p.id === form.product);
    const price = product ? (product.prices.find(p => p.currency === value.code)?.price || 0) : 0;
    setForm(f => ({ ...f, total: price * Number(f.quantity || 1) }));
  };
  const handleCustomerChange = (event, value) => {
    setForm(f => ({ ...f, customer: value ? value.id : '' }));
    setSelectedCustomer(value || null);
    if (value) {
      if (value.is_blacklisted) {
        setCustomerWarning('This customer is blacklisted and cannot make purchases.');
      } else if (value.aging > value.payment_terms) {
        setCustomerWarning(`Customer is overdue (${value.aging} days > allowed ${value.payment_terms}).`);
      } else {
        setCustomerWarning('');
      }
    } else {
      setCustomerWarning('');
    }
  };
  const handlePaymentMethodChange = (event, value) => {
    setForm(f => ({ ...f, payment_method: value.value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (selectedCustomer && selectedCustomer.is_blacklisted) {
      setCustomerWarning('This customer is blacklisted and cannot make purchases.');
      return;
    }
    try {
      await api.post('/pos/transactions/', { ...form, currency }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTransactions();
      handleClose();
    } catch (err) {
      console.error('Failed to record transaction.');
      // Fallback to offline storage
      offlineStorage.addTransaction({ ...form, currency });
      setError('Failed to record transaction. Saved offline.');
    }
  };

  // Dashboard summary data
  const totalTransactions = transactions.length;
  const totalSales = transactions.reduce((sum, tx) => sum + (Number(tx.total) || 0), 0);
  const uniqueCustomers = Array.from(new Set(transactions.map(tx => tx.customer))).length;
  const salesByCustomer = Array.from(
    transactions.reduce((map, tx) => {
      const key = tx.customer || 'Unknown';
      map.set(key, (map.get(key) || 0) + (Number(tx.total) || 0));
      return map;
    }, new Map())
  ).map(([customer, total]) => ({ customer, total }));
  const recentTransactions = transactions.slice(0, 5);

  return (
    <Box>
      <Typography variant="h5" mb={2}>Point of Sale (POS)</Typography>
      <Grid container spacing={2} mb={2}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <PointOfSaleIcon color="primary" sx={{ fontSize: 32, mr: 1 }} />
                <Box>
                  <Typography variant="h6">Total Transactions</Typography>
                  <Typography variant="h4">{totalTransactions}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <MonetizationOnIcon color="success" sx={{ fontSize: 32, mr: 1 }} />
                <Box>
                  <Typography variant="h6">Total Sales</Typography>
                  <Typography variant="h4">₵{totalSales}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <PeopleIcon color="info" sx={{ fontSize: 32, mr: 1 }} />
                <Box>
                  <Typography variant="h6">Unique Customers</Typography>
                  <Typography variant="h4">{uniqueCustomers}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Grid container spacing={2} mb={2}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>Sales by Customer</Typography>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={salesByCustomer} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
                  <XAxis dataKey="customer" interval={0} angle={-15} textAnchor="end" height={60} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="total" fill="#1976d2" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>Recent Transactions</Typography>
              {recentTransactions.length === 0 ? (
                <Typography color="text.secondary">No recent transactions.</Typography>
              ) : (
                <ul style={{ margin: 0, paddingLeft: 16 }}>
                  {recentTransactions.map((tx, idx) => (
                    <li key={tx.id || idx}>
                      <Typography variant="body2">{tx.date} &mdash; {tx.product} &mdash; {tx.customer} &mdash; ₵{tx.total}</Typography>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Product</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Currency</TableCell>
                <TableCell>Payment Method</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">No transactions found.</TableCell>
                </TableRow>
              ) : (
                transactions.map((tx, idx) => (
                  <TableRow key={tx.id || idx}>
                    <TableCell>{tx.date}</TableCell>
                    <TableCell>{tx.product}</TableCell>
                    <TableCell>{tx.customer}</TableCell>
                    <TableCell>{tx.quantity}</TableCell>
                    <TableCell>{tx.total}</TableCell>
                    <TableCell>{tx.currency}</TableCell>
                    <TableCell>{tx.payment_method || 'Cash'}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h5">POS</Typography>
        <Button variant="contained" onClick={handleOpen}>New Transaction</Button>
      </Box>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>New POS Transaction</DialogTitle>
        <DialogContent>
          <form id="pos-form" onSubmit={handleSubmit}>
            {stockWarning && <Alert severity="warning">{stockWarning}</Alert>}
            {customerWarning && <Alert severity="warning">{customerWarning}</Alert>}
            <Autocomplete
              options={CURRENCIES}
              getOptionLabel={option => option.label}
              value={CURRENCIES.find(c => c.code === currency) || null}
              onChange={handleCurrencyChange}
              renderInput={params => <TextField {...params} label="Currency" margin="normal" required fullWidth />}
            />
            <Autocomplete
              options={products}
              getOptionLabel={option => `${option.name} (SKU: ${option.sku}) [${option.quantity} in stock]`}
              value={products.find(p => p.id === form.product) || null}
              onChange={handleProductChange}
              renderInput={params => <TextField {...params} label="Product" margin="normal" required fullWidth placeholder="Select a Product" />}
              noOptionsText={products.length === 0 ? "No products available - Check console for errors" : "No matching products"}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              loading={products.length === 0}
              onOpen={() => {
                console.log('Product dropdown opened, products available:', products.length);
                console.log('Products data:', products);
              }}
            />
            <Autocomplete
              options={customers}
              getOptionLabel={option => `${option.name} (${option.email})`}
              value={customers.find(c => c.id === form.customer) || null}
              onChange={handleCustomerChange}
              renderInput={params => <TextField {...params} label="Customer" margin="normal" required fullWidth />}
            />
            <Autocomplete
              options={PAYMENT_METHODS}
              getOptionLabel={option => option.label}
              value={PAYMENT_METHODS.find(p => p.value === form.payment_method) || null}
              onChange={handlePaymentMethodChange}
              renderInput={params => <TextField {...params} label="Payment Method" margin="normal" required fullWidth />}
            />
            <TextField label="Quantity" name="quantity" value={form.quantity} onChange={handleQuantityChange} fullWidth margin="normal" type="number" required />
            <TextField label="Total" name="total" value={form.total} onChange={handleChange} fullWidth margin="normal" type="number" required />
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="submit" form="pos-form" variant="contained">Record</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default POS;

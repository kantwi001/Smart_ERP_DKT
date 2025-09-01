import React, { useEffect, useState, useContext } from 'react';
import api from './api';
import { AuthContext } from './AuthContext';
import { Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress, Alert, Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Autocomplete } from '@mui/material';

const Sales = () => {
  const [products, setProducts] = useState([]);
  const { token } = useContext(AuthContext);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ customer: '', product: '', quantity: '', total: '' });
  const [stockWarning, setStockWarning] = useState('');

  useEffect(() => {
    fetchSales();
    fetchProducts();
    // eslint-disable-next-line
  }, [token]);

  const fetchProducts = async () => {
    try {
      const res = await api.get('/inventory/products/', { headers: { Authorization: `Bearer ${token}` } });
      setProducts(res.data);
    } catch {}
  };

  const fetchSales = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/sales/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSales(res.data);
    } catch (err) {
      setError('Failed to load sales.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setForm({ customer: '', product: '', quantity: '', total: '' });
  };

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  const handleProductChange = (event, value) => {
    setForm({
      ...form,
      product: value ? value.id : '',
      total: value ? value.price * Number(form.quantity || 1) : '',
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
    setForm({
      ...form,
      quantity: qty,
      total: product ? product.price * Number(qty) : '',
    });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await api.post('/sales/', form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchSales();
      handleClose();
    } catch (err) {
      setError('Failed to record sale.');
    }
  };

  const handlePrint = (saleId, type) => {
    // Print functionality for invoice/receipt
    // In a real implementation, this would generate and print documents
    console.log(`Printing ${type} for sale ${saleId}`);
    alert(`${type.charAt(0).toUpperCase() + type.slice(1)} printing functionality would be implemented here.`);
  };

  return (
    <Box>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h5">Sales</Typography>
        <Button variant="contained" onClick={handleOpen}>Record Sale</Button>
      </Box>
      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Customer</TableCell>
                <TableCell>Product</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Print</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sales.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">No sales found.</TableCell>
                </TableRow>
              ) : (
                sales.map(sale => (
                  <TableRow key={sale.id}>
                    <TableCell>{sale.customer}</TableCell>
                    <TableCell>{sale.product}</TableCell>
                    <TableCell>{sale.quantity}</TableCell>
                    <TableCell>{sale.total}</TableCell>
                    <TableCell>{sale.created_at ? new Date(sale.created_at).toLocaleString() : '-'}</TableCell>
                    <TableCell>
                      <Button size="small" variant="outlined" onClick={() => handlePrint(sale.id, 'invoice')} sx={{ mr: 1 }}>Invoice</Button>
                      <Button size="small" variant="outlined" color="success" onClick={() => handlePrint(sale.id, 'receipt')}>Receipt</Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Record Sale</DialogTitle>
        <DialogContent>
          <form id="sale-form" onSubmit={handleSubmit}>
            {stockWarning && <Alert severity="warning">{stockWarning}</Alert>}
            <TextField label="Customer" name="customer" value={form.customer} onChange={handleChange} fullWidth margin="normal" required />
            <Autocomplete
              options={products}
              getOptionLabel={option => `${option.name} (SKU: ${option.sku}) [${option.quantity} in stock]`}
              value={products.find(p => p.id === form.product) || null}
              onChange={handleProductChange}
              renderInput={params => <TextField {...params} label="Product" margin="normal" required fullWidth />}
            />
            <TextField label="Quantity" name="quantity" value={form.quantity} onChange={handleQuantityChange} fullWidth margin="normal" type="number" required />
            <TextField label="Total" name="total" value={form.total} onChange={handleChange} fullWidth margin="normal" type="number" required />
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="submit" form="sale-form" variant="contained">Record</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Sales;

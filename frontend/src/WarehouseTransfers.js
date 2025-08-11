import React, { useEffect, useState, useContext } from 'react';
import api from './api';
import { AuthContext } from './AuthContext';
import { Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress, Alert, Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem } from '@mui/material';

const WarehouseTransfers = () => {
  const { token } = useContext(AuthContext);
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ sku: '', quantity: '', from_location: '', to_location: '' });

  useEffect(() => {
    fetchTransfers();
    // eslint-disable-next-line
  }, [token]);

  const fetchTransfers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/inventory/transfers/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTransfers(res.data);
    } catch (err) {
      setError('Failed to load transfers.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setForm({ sku: '', quantity: '', from_location: '', to_location: '' });
  };

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await api.post('/inventory/transfers/', form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTransfers();
      handleClose();
    } catch (err) {
      setError('Failed to create transfer.');
    }
  };

  // Print waybill for a warehouse transfer
  const handlePrintWaybill = async (id) => {
    try {
      // First get transfer details to create a better filename
      const transferRes = await api.get(`/inventory/transfers/${id}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const transfer = transferRes.data;
      
      // Generate PDF waybill
      const res = await api.get(`/inventory/transfers/${id}/print_waybill/`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
      });
      
      // Create descriptive filename
      const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      const transferDate = transfer.created_at ? new Date(transfer.created_at).toISOString().split('T')[0] : currentDate;
      const fromWarehouse = transfer.from_warehouse_name || transfer.from_location || 'Unknown';
      const toWarehouse = transfer.to_warehouse_name || transfer.to_location || 'Unknown';
      const productSku = transfer.product_sku || transfer.sku || 'Multiple';
      
      // Clean warehouse names for filename (remove special characters)
      const cleanFromWarehouse = fromWarehouse.replace(/[^a-zA-Z0-9]/g, '');
      const cleanToWarehouse = toWarehouse.replace(/[^a-zA-Z0-9]/g, '');
      const cleanProductSku = productSku.replace(/[^a-zA-Z0-9]/g, '');
      
      // Create professional filename: Waybill_TransferID_FromWarehouse_ToWarehouse_ProductSKU_Date.pdf
      const filename = `Waybill_T${id}_${cleanFromWarehouse}_to_${cleanToWarehouse}_${cleanProductSku}_${transferDate}.pdf`;
      
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = filename;
      link.click();
      window.URL.revokeObjectURL(link.href);
      
      console.log(`Waybill downloaded: ${filename}`);
    } catch (err) {
      console.error('Failed to print waybill:', err);
      alert('Failed to print waybill. Please try again.');
    }
  };

  return (
    <Box>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h5">Warehouse Transfers</Typography>
        <Button variant="contained" onClick={handleOpen}>New Transfer</Button>
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
                <TableCell>SKU</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>From</TableCell>
                <TableCell>To</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Print</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transfers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">No transfers found.</TableCell>
                </TableRow>
              ) : (
                transfers.map(tr => (
                  <TableRow key={tr.id}>
                    <TableCell>{tr.sku || (tr.product && tr.product.sku) || ''}</TableCell>
                    <TableCell>{tr.quantity}</TableCell>
                    <TableCell>{tr.from_location}</TableCell>
                    <TableCell>{tr.to_location}</TableCell>
                    <TableCell>{tr.created_at ? new Date(tr.created_at).toLocaleString() : '-'}</TableCell>
                    <TableCell>
                      <Button size="small" variant="outlined" color="primary" onClick={() => handlePrintWaybill(tr.id)}>
                        Print Waybill
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>New Warehouse Transfer</DialogTitle>
        <DialogContent>
          <form id="transfer-form" onSubmit={handleSubmit}>
            <TextField label="SKU" name="sku" value={form.sku} onChange={handleChange} fullWidth margin="normal" required />
            <TextField label="Quantity" name="quantity" value={form.quantity} onChange={handleChange} fullWidth margin="normal" type="number" required />
            <TextField label="From Location" name="from_location" value={form.from_location} onChange={handleChange} fullWidth margin="normal" required />
            <TextField label="To Location" name="to_location" value={form.to_location} onChange={handleChange} fullWidth margin="normal" required />
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="submit" form="transfer-form" variant="contained">Create</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WarehouseTransfers;

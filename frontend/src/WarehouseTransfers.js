import React, { useEffect, useState, useContext } from 'react';
import api from './api';
import { AuthContext } from './AuthContext';
import { 
  getGlobalTransferHistory,
  addTransferToHistory,
  updateTransferStatus,
  getGlobalProducts,
  loadWarehousesWithFallback
} from './sharedData';
import { Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress, Alert, Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Chip, FormControl, InputLabel, Select } from '@mui/material';

const WarehouseTransfers = () => {
  const { token } = useContext(AuthContext);
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ product: '', quantity: '', fromWarehouse: '', toWarehouse: '', notes: '' });
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [user, setUser] = useState({});

  useEffect(() => {
    fetchTransfers();
    fetchProducts();
    fetchWarehouses();
    fetchUser();
    // eslint-disable-next-line
  }, [token]);

  const fetchTransfers = async () => {
    setLoading(true);
    setError(null);
    try {
      // Use global transfer history instead of API
      const transferHistory = getGlobalTransferHistory();
      setTransfers(transferHistory);
      console.log('[Warehouse Transfers] Loaded transfers:', transferHistory.length);
    } catch (err) {
      console.error('[Warehouse Transfers] Error loading transfers:', err);
      setError('Failed to load transfers.');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const products = await getGlobalProducts();
      setProducts(products);
    } catch (err) {
      console.error('Failed to load products:', err);
    }
  };

  const fetchWarehouses = async () => {
    try {
      const warehouses = await loadWarehousesWithFallback();
      setWarehouses(warehouses);
    } catch (err) {
      console.error('Failed to load warehouses:', err);
    }
  };

  const fetchUser = async () => {
    try {
      const user = await api.get('/users/me/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(user.data);
    } catch (err) {
      console.error('Failed to load user:', err);
    }
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setForm({ product: '', quantity: '', fromWarehouse: '', toWarehouse: '', notes: '' });
  };

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      if (!form.product || !form.quantity || !form.fromWarehouse || !form.toWarehouse) {
        setError('Please fill in all required fields');
        return;
      }

      if (form.fromWarehouse === form.toWarehouse) {
        setError('Source and destination warehouses must be different');
        return;
      }

      // Find selected product and warehouses
      const selectedProduct = products.find(p => p.name === form.product || p.id === parseInt(form.product));
      const fromWarehouse = warehouses.find(w => w.name === form.fromWarehouse || w.id === parseInt(form.fromWarehouse));
      const toWarehouse = warehouses.find(w => w.name === form.toWarehouse || w.id === parseInt(form.toWarehouse));

      // Create transfer record
      const transferData = {
        product: selectedProduct?.name || form.product,
        productSku: selectedProduct?.sku || 'MANUAL-TRANSFER',
        quantity: parseInt(form.quantity),
        from: fromWarehouse?.name || form.fromWarehouse,
        to: toWarehouse?.name || form.toWarehouse,
        status: 'pending',
        transferType: 'inter_warehouse',
        requestedBy: user?.first_name + ' ' + user?.last_name || 'Warehouse Manager',
        approvedBy: null,
        notes: form.notes || `Transfer ${selectedProduct?.name || form.product} from ${fromWarehouse?.name || form.fromWarehouse} to ${toWarehouse?.name || form.toWarehouse}`
      };

      // Add to transfer history
      addTransferToHistory(transferData);
      
      setError(null);
      setForm({ product: '', quantity: '', fromWarehouse: '', toWarehouse: '', notes: '' });
      handleClose();
    } catch (err) {
      console.error('Failed to create transfer:', err);
      setError('Failed to create transfer.');
    }
  };

  // Print waybill for a warehouse transfer
  const handlePrintWaybill = (transfer) => {
    try {
      // Create a new window for printing
      const printWindow = window.open('', '_blank');
      
      // Generate waybill HTML content
      const waybillHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Waybill - ${transfer.referenceNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .company-name { font-size: 24px; font-weight: bold; color: #1976d2; }
            .waybill-title { font-size: 20px; margin: 10px 0; }
            .reference { font-size: 14px; color: #666; }
            .details-section { margin: 20px 0; }
            .details-row { display: flex; justify-content: space-between; margin: 10px 0; }
            .details-label { font-weight: bold; }
            .transfer-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .transfer-table th, .transfer-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .transfer-table th { background-color: #f5f5f5; }
            .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
            .signatures { display: flex; justify-content: space-between; margin-top: 40px; }
            .signature-box { width: 200px; text-align: center; }
            .signature-line { border-top: 1px solid #000; margin-top: 40px; padding-top: 5px; }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-name">Smart ERP Software</div>
            <div class="waybill-title">WAREHOUSE TRANSFER WAYBILL</div>
            <div class="reference">Reference: ${transfer.referenceNumber}</div>
          </div>
          
          <div class="details-section">
            <div class="details-row">
              <span><span class="details-label">Date:</span> ${transfer.date}</span>
              <span><span class="details-label">Status:</span> ${transfer.status.toUpperCase()}</span>
            </div>
            <div class="details-row">
              <span><span class="details-label">Transfer Type:</span> ${transfer.transferType === 'inter_warehouse' ? 'Inter-Warehouse' : 'Supplier'}</span>
              <span><span class="details-label">Requested By:</span> ${transfer.requestedBy}</span>
            </div>
          </div>
          
          <div class="details-section">
            <h3>Transfer Details</h3>
            <div class="details-row">
              <span><span class="details-label">From Warehouse:</span> ${transfer.from}</span>
              <span><span class="details-label">To Warehouse:</span> ${transfer.to}</span>
            </div>
          </div>
          
          <table class="transfer-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Quantity</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${transfer.product}</td>
                <td>${transfer.productSku}</td>
                <td>${transfer.quantity}</td>
                <td>${transfer.notes || 'N/A'}</td>
              </tr>
            </tbody>
          </table>
          
          <div class="details-section">
            <div class="details-row">
              <span><span class="details-label">Approved By:</span> ${transfer.approvedBy || 'Pending Approval'}</span>
              <span><span class="details-label">Print Date:</span> ${new Date().toLocaleString()}</span>
            </div>
          </div>
          
          <div class="signatures">
            <div class="signature-box">
              <div class="signature-line">Sender Signature</div>
            </div>
            <div class="signature-box">
              <div class="signature-line">Receiver Signature</div>
            </div>
          </div>
          
          <div class="footer">
            <p>This is a computer-generated waybill. Please verify all details before processing.</p>
            <p>Smart ERP Software - Warehouse Management System</p>
          </div>
          
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() {
                window.close();
              };
            };
          </script>
        </body>
        </html>
      `;
      
      // Write content to print window and trigger print
      printWindow.document.write(waybillHTML);
      printWindow.document.close();
      
      console.log(`Waybill printed for transfer: ${transfer.referenceNumber}`);
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
                      <Button size="small" variant="outlined" color="primary" onClick={() => handlePrintWaybill(tr)}>
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
            <FormControl fullWidth margin="normal">
              <InputLabel id="product-label">Product</InputLabel>
              <Select
                labelId="product-label"
                id="product"
                name="product"
                value={form.product}
                label="Product"
                onChange={handleChange}
              >
                {products.map(p => (
                  <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField label="Quantity" name="quantity" value={form.quantity} onChange={handleChange} fullWidth margin="normal" type="number" required />
            <FormControl fullWidth margin="normal">
              <InputLabel id="from-warehouse-label">From Warehouse</InputLabel>
              <Select
                labelId="from-warehouse-label"
                id="fromWarehouse"
                name="fromWarehouse"
                value={form.fromWarehouse}
                label="From Warehouse"
                onChange={handleChange}
              >
                {warehouses.map(w => (
                  <MenuItem key={w.id} value={w.id}>{w.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal">
              <InputLabel id="to-warehouse-label">To Warehouse</InputLabel>
              <Select
                labelId="to-warehouse-label"
                id="toWarehouse"
                name="toWarehouse"
                value={form.toWarehouse}
                label="To Warehouse"
                onChange={handleChange}
              >
                {warehouses.map(w => (
                  <MenuItem key={w.id} value={w.id}>{w.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
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

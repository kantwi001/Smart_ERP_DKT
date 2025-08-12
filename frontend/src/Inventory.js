import React, { useEffect, useState, useContext } from 'react';
import api from './api';
import { AuthContext } from './AuthContext';
import { 
  Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  CircularProgress, Alert, Box, Grid, Card, CardContent, Button, Dialog, DialogTitle, 
  DialogContent, DialogActions, TextField, MenuItem, Snackbar
} from '@mui/material';
import InventoryIcon from '@mui/icons-material/Inventory';
import WarningIcon from '@mui/icons-material/Warning';
import RemoveShoppingCartIcon from '@mui/icons-material/RemoveShoppingCart';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const Inventory = () => {
  const { token } = useContext(AuthContext);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Transfer functionality state
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [transferHistoryOpen, setTransferHistoryOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [transferForm, setTransferForm] = useState({
    product: '',
    quantity: '',
    fromWarehouse: '',
    toWarehouse: '',
    notes: ''
  });

  useEffect(() => {
    const fetchInventory = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get('/inventory/transfers/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setItems(res.data);
      } catch (err) {
        setError('Failed to load inventory.');
      } finally {
        setLoading(false);
      }
    };
    fetchInventory();
  }, [token]);

  // Load additional data for transfer functionality
  useEffect(() => {
    const loadTransferData = async () => {
      try {
        const [productsRes, warehousesRes, transfersRes] = await Promise.all([
          api.get('/inventory/products/', { headers: { Authorization: `Bearer ${token}` } }),
          api.get('/warehouse/', { headers: { Authorization: `Bearer ${token}` } }),
          api.get('/inventory/transfers/', { headers: { Authorization: `Bearer ${token}` } })
        ]);
        
        setProducts(productsRes.data.results || productsRes.data);
        setWarehouses(warehousesRes.data.results || warehousesRes.data);
        setTransfers(transfersRes.data.results || transfersRes.data);
      } catch (error) {
        console.error('Failed to load transfer data:', error);
      }
    };

    if (token) {
      loadTransferData();
    }
  }, [token]);

  // Transfer handlers
  const handleTransferStock = async () => {
    try {
      if (!transferForm.product || !transferForm.quantity || !transferForm.fromWarehouse || !transferForm.toWarehouse) {
        setSnackbarMessage('Please fill in all required fields');
        setSnackbarOpen(true);
        return;
      }

      if (transferForm.fromWarehouse === transferForm.toWarehouse) {
        setSnackbarMessage('Source and destination warehouses must be different');
        setSnackbarOpen(true);
        return;
      }

      const transferData = {
        product: transferForm.product,
        quantity: parseInt(transferForm.quantity),
        from_warehouse: transferForm.fromWarehouse,
        to_warehouse: transferForm.toWarehouse,
        notes: transferForm.notes
      };

      await api.post('/inventory/transfers/', transferData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSnackbarMessage('Stock transfer initiated successfully!');
      setSnackbarOpen(true);
      setTransferDialogOpen(false);
      
      // Reset form
      setTransferForm({
        product: '',
        quantity: '',
        fromWarehouse: '',
        toWarehouse: '',
        notes: ''
      });

      // Refresh data
      window.location.reload();
    } catch (error) {
      console.error('Transfer error:', error);
      setSnackbarMessage('Failed to initiate stock transfer. Please try again.');
      setSnackbarOpen(true);
    }
  };

  // Dashboard summary data
  const totalItems = items.length;
  const lowStock = items.filter(i => i.quantity !== undefined && i.quantity < 10 && i.quantity > 0).length;
  const outOfStock = items.filter(i => i.quantity === 0).length;
  const stockChartData = items.slice(0, 8).map(i => ({ name: i.name, quantity: i.quantity }));
  const recentItems = items.slice(0, 5);

  // Fallback UI if no items or loading/error
  const showFallback = !loading && (error || items.length === 0);

  return (
    <Box>
      <Typography variant="h5" mb={2}>Inventory</Typography>
      {showFallback ? (
        <Alert severity={error ? "error" : "info"} sx={{ mb: 2 }}>
          {error ? error : "No inventory found."}
        </Alert>
      ) : (
        <>
          <Grid container spacing={2} mb={2}>
            <Grid item xs={12} sm={4}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <InventoryIcon color="primary" sx={{ fontSize: 32, mr: 1 }} />
                    <Box>
                      <Typography variant="h6">Total Items</Typography>
                      <Typography variant="h4">{totalItems}</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <WarningIcon color="warning" sx={{ fontSize: 32, mr: 1 }} />
                    <Box>
                      <Typography variant="h6">Low Stock</Typography>
                      <Typography variant="h4">{lowStock}</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <RemoveShoppingCartIcon color="error" sx={{ fontSize: 32, mr: 1 }} />
                    <Box>
                      <Typography variant="h6">Out of Stock</Typography>
                      <Typography variant="h4">{outOfStock}</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          <Grid container spacing={2} mb={2}>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" mb={1}>Transfer Quick Actions</Typography>
                  <Button 
                    startIcon={<SwapHorizIcon />} 
                    variant="contained" 
                    color="primary"
                    onClick={() => setTransferDialogOpen(true)}
                  >
                    Transfer Stock
                  </Button>
                  <Button 
                    startIcon={<VisibilityIcon />} 
                    variant="contained" 
                    color="secondary" 
                    sx={{ ml: 1 }}
                    onClick={() => setTransferHistoryOpen(true)}
                  >
                    View Transfer History
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          <Grid container spacing={2} mb={2}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>Stock Levels (Top 8)</Typography>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={stockChartData} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
                      <XAxis dataKey="name" interval={0} angle={-15} textAnchor="end" height={60} />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="quantity" fill="#1976d2" radius={[4,4,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>Recent Items</Typography>
                  {recentItems.length === 0 ? (
                    <Typography color="text.secondary">No recent items.</Typography>
                  ) : (
                    <ul style={{ margin: 0, paddingLeft: 16 }}>
                      {recentItems.map((item, idx) => (
                        <li key={item.id || idx}>
                          <Typography variant="body2">{item.name} &mdash; SKU: {item.sku} &mdash; Qty: {item.quantity}</Typography>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      )}
      {loading ? (
        <CircularProgress />
      ) : !showFallback && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>SKU</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>Location</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">No inventory found.</TableCell>
                </TableRow>
              ) : (
                items.map(item => (
                  <TableRow key={item.id}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.sku}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>{item.location || '-'}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Transfer Stock Dialog */}
      <Dialog open={transferDialogOpen} onClose={() => setTransferDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Transfer Stock</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            select
            label="Product"
            value={transferForm.product}
            onChange={(e) => setTransferForm({...transferForm, product: e.target.value})}
            margin="normal"
          >
            {products.map((product) => (
              <MenuItem key={product.id} value={product.id}>
                {product.name} - {product.sku} (Stock: {product.quantity || 0})
              </MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth
            label="Quantity"
            value={transferForm.quantity}
            onChange={(e) => setTransferForm({...transferForm, quantity: e.target.value})}
            margin="normal"
            type="number"
          />
          <TextField
            fullWidth
            select
            label="From Warehouse"
            value={transferForm.fromWarehouse}
            onChange={(e) => setTransferForm({...transferForm, fromWarehouse: e.target.value})}
            margin="normal"
          >
            {warehouses.map((warehouse) => (
              <MenuItem key={warehouse.id} value={warehouse.id}>
                {warehouse.name} - {warehouse.code}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth
            select
            label="To Warehouse"
            value={transferForm.toWarehouse}
            onChange={(e) => setTransferForm({...transferForm, toWarehouse: e.target.value})}
            margin="normal"
          >
            {warehouses.map((warehouse) => (
              <MenuItem key={warehouse.id} value={warehouse.id}>
                {warehouse.name} - {warehouse.code}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth
            label="Notes (Optional)"
            value={transferForm.notes}
            onChange={(e) => setTransferForm({...transferForm, notes: e.target.value})}
            margin="normal"
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTransferDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleTransferStock} variant="contained" color="primary">
            Transfer Stock
          </Button>
        </DialogActions>
      </Dialog>

      {/* Transfer History Dialog */}
      <Dialog open={transferHistoryOpen} onClose={() => setTransferHistoryOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Transfer History</DialogTitle>
        <DialogContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell>Quantity</TableCell>
                  <TableCell>From</TableCell>
                  <TableCell>To</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transfers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">No transfers found.</TableCell>
                  </TableRow>
                ) : (
                  transfers.map((transfer) => (
                    <TableRow key={transfer.id}>
                      <TableCell>{transfer.product_name || 'N/A'}</TableCell>
                      <TableCell>{transfer.quantity}</TableCell>
                      <TableCell>{transfer.from_warehouse_name || 'N/A'}</TableCell>
                      <TableCell>{transfer.to_warehouse_name || 'N/A'}</TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          variant="outlined"
                          color={transfer.status === 'completed' ? 'success' : 'warning'}
                        >
                          {transfer.status || 'pending'}
                        </Button>
                      </TableCell>
                      <TableCell>
                        {transfer.created_at ? new Date(transfer.created_at).toLocaleDateString() : 'N/A'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTransferHistoryOpen(false)}>Close</Button>
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

export default Inventory;

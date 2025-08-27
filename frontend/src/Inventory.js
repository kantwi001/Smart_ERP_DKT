import React, { useEffect, useState, useContext } from 'react';
import api from './api';
import { AuthContext } from './AuthContext';
import { 
  Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  CircularProgress, Alert, Box, Grid, Card, CardContent, Button, Dialog, DialogTitle, 
  DialogContent, DialogActions, TextField, MenuItem, Snackbar, Tabs, Tab, Chip
} from '@mui/material';
import InventoryIcon from '@mui/icons-material/Inventory';
import WarningIcon from '@mui/icons-material/Warning';
import RemoveShoppingCartIcon from '@mui/icons-material/RemoveShoppingCart';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
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

  const [tabValue, setTabValue] = useState(0);

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

  const handleAcceptTransfer = async (transferId) => {
    try {
      await api.post(`/inventory/transfers/${transferId}/accept/`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSnackbarMessage('Transfer accepted successfully!');
      setSnackbarOpen(true);
      // Refresh data in real implementation
    } catch (error) {
      console.error('Accept transfer error:', error);
      setSnackbarMessage('Failed to accept transfer. Please try again.');
      setSnackbarOpen(true);
    }
  };

  const handleRejectTransfer = async (transferId) => {
    try {
      await api.post(`/inventory/transfers/${transferId}/reject/`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSnackbarMessage('Transfer rejected successfully!');
      setSnackbarOpen(true);
      // Refresh data in real implementation
    } catch (error) {
      console.error('Reject transfer error:', error);
      setSnackbarMessage('Failed to reject transfer. Please try again.');
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

  // Mock data
  const mockMovements = [
    { date: '2024-02-15', product: 'Laptop Dell XPS 13', type: 'IN', quantity: 25, location: 'Main Warehouse', status: 'Completed', reference: 'PO-2024-001' },
    { date: '2024-02-14', product: 'iPhone 15 Pro', type: 'OUT', quantity: 10, location: 'Sales Floor', status: 'Completed', reference: 'SO-2024-045' },
    { date: '2024-02-13', product: 'Samsung Galaxy S24', type: 'IN', quantity: 30, location: 'Main Warehouse', status: 'Completed', reference: 'PO-2024-002' },
    { date: '2024-02-12', product: 'MacBook Air M3', type: 'OUT', quantity: 5, location: 'Customer Delivery', status: 'Completed', reference: 'SO-2024-046' },
    { date: '2024-02-11', product: 'iPad Pro 12.9"', type: 'IN', quantity: 15, location: 'Main Warehouse', status: 'Completed', reference: 'PO-2024-003' },
    { date: '2024-02-10', product: 'AirPods Pro 2', type: 'OUT', quantity: 20, location: 'Retail Store', status: 'Completed', reference: 'SO-2024-047' },
    { date: '2024-02-09', product: 'Surface Pro 9', type: 'IN', quantity: 12, location: 'Tech Warehouse', status: 'Completed', reference: 'PO-2024-004' },
    { date: '2024-02-08', product: 'Nintendo Switch OLED', type: 'OUT', quantity: 8, location: 'Gaming Section', status: 'Completed', reference: 'SO-2024-048' }
  ];

  const mockIncomingTransfers = [
    { id: 1, product: 'HP Pavilion Laptop', quantity: 20, from: 'Central Warehouse' },
    { id: 2, product: 'Wireless Mouse Logitech', quantity: 50, from: 'Tech Hub' },
    { id: 3, product: 'USB-C Charger 65W', quantity: 35, from: 'Accessories Store' },
    { id: 4, product: 'Bluetooth Headphones', quantity: 25, from: 'Audio Department' }
  ];

  const mockOutgoingTransfers = [
    { id: 1, product: 'Gaming Keyboard RGB', quantity: 15, to: 'Gaming Store', status: 'Pending Approval' },
    { id: 2, product: 'Webcam 4K Logitech', quantity: 10, to: 'Remote Work Hub', status: 'Pending Approval' },
    { id: 3, product: 'Monitor 27" 4K', quantity: 8, to: 'Office Branch', status: 'Pending Approval' }
  ];

  return (
    <Box>
      <Typography variant="h5" mb={2}>Inventory</Typography>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={(e, value) => setTabValue(value)}>
          <Tab label="Inventory" />
          <Tab label="Movements" />
          <Tab label="Pending Transfers" />
        </Tabs>
      </Box>
      
      {tabValue === 0 && (
        <>
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
            </>
          )}
        </>
      )}

      {tabValue === 1 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="h6" mb={2}>Stock Movements</Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Product</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Quantity</TableCell>
                  <TableCell>From/To</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Reference</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>2024-02-15</TableCell>
                  <TableCell>Laptop Dell XPS 13</TableCell>
                  <TableCell>
                    <Chip 
                      label="IN" 
                      color="success"
                      size="small"
                    />
                  </TableCell>
                  <TableCell>25</TableCell>
                  <TableCell>Main Warehouse</TableCell>
                  <TableCell>
                    <Chip 
                      label="Completed" 
                      color="success"
                      size="small"
                    />
                  </TableCell>
                  <TableCell>PO-2024-001</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>2024-02-14</TableCell>
                  <TableCell>iPhone 15 Pro</TableCell>
                  <TableCell>
                    <Chip 
                      label="OUT" 
                      color="warning"
                      size="small"
                    />
                  </TableCell>
                  <TableCell>10</TableCell>
                  <TableCell>Sales Floor</TableCell>
                  <TableCell>
                    <Chip 
                      label="Completed" 
                      color="success"
                      size="small"
                    />
                  </TableCell>
                  <TableCell>SO-2024-045</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>2024-02-13</TableCell>
                  <TableCell>Samsung Galaxy S24</TableCell>
                  <TableCell>
                    <Chip 
                      label="IN" 
                      color="success"
                      size="small"
                    />
                  </TableCell>
                  <TableCell>30</TableCell>
                  <TableCell>Main Warehouse</TableCell>
                  <TableCell>
                    <Chip 
                      label="Completed" 
                      color="success"
                      size="small"
                    />
                  </TableCell>
                  <TableCell>PO-2024-002</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>2024-02-12</TableCell>
                  <TableCell>MacBook Air M3</TableCell>
                  <TableCell>
                    <Chip 
                      label="OUT" 
                      color="warning"
                      size="small"
                    />
                  </TableCell>
                  <TableCell>5</TableCell>
                  <TableCell>Customer Delivery</TableCell>
                  <TableCell>
                    <Chip 
                      label="Completed" 
                      color="success"
                      size="small"
                    />
                  </TableCell>
                  <TableCell>SO-2024-046</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>2024-02-11</TableCell>
                  <TableCell>iPad Pro 12.9"</TableCell>
                  <TableCell>
                    <Chip 
                      label="IN" 
                      color="success"
                      size="small"
                    />
                  </TableCell>
                  <TableCell>15</TableCell>
                  <TableCell>Main Warehouse</TableCell>
                  <TableCell>
                    <Chip 
                      label="Completed" 
                      color="success"
                      size="small"
                    />
                  </TableCell>
                  <TableCell>PO-2024-003</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>2024-02-10</TableCell>
                  <TableCell>AirPods Pro 2</TableCell>
                  <TableCell>
                    <Chip 
                      label="OUT" 
                      color="warning"
                      size="small"
                    />
                  </TableCell>
                  <TableCell>20</TableCell>
                  <TableCell>Retail Store</TableCell>
                  <TableCell>
                    <Chip 
                      label="Completed" 
                      color="success"
                      size="small"
                    />
                  </TableCell>
                  <TableCell>SO-2024-047</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>2024-02-09</TableCell>
                  <TableCell>Surface Pro 9</TableCell>
                  <TableCell>
                    <Chip 
                      label="IN" 
                      color="success"
                      size="small"
                    />
                  </TableCell>
                  <TableCell>12</TableCell>
                  <TableCell>Tech Warehouse</TableCell>
                  <TableCell>
                    <Chip 
                      label="Completed" 
                      color="success"
                      size="small"
                    />
                  </TableCell>
                  <TableCell>PO-2024-004</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>2024-02-08</TableCell>
                  <TableCell>Nintendo Switch OLED</TableCell>
                  <TableCell>
                    <Chip 
                      label="OUT" 
                      color="warning"
                      size="small"
                    />
                  </TableCell>
                  <TableCell>8</TableCell>
                  <TableCell>Gaming Section</TableCell>
                  <TableCell>
                    <Chip 
                      label="Completed" 
                      color="success"
                      size="small"
                    />
                  </TableCell>
                  <TableCell>SO-2024-048</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {tabValue === 2 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="h6" mb={2}>Pending Stock Transfers</Typography>
          <Grid container spacing={2} mb={2}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom color="primary">
                    Incoming Transfers (Awaiting Your Approval)
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Product</TableCell>
                          <TableCell>Qty</TableCell>
                          <TableCell>From</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {mockIncomingTransfers.map((transfer, idx) => (
                          <TableRow key={idx}>
                            <TableCell>{transfer.product}</TableCell>
                            <TableCell>{transfer.quantity}</TableCell>
                            <TableCell>{transfer.from}</TableCell>
                            <TableCell>
                              <Button
                                size="small"
                                startIcon={<CheckIcon />}
                                color="success"
                                onClick={() => handleAcceptTransfer(transfer.id)}
                                sx={{ mr: 1 }}
                              >
                                Accept
                              </Button>
                              <Button
                                size="small"
                                startIcon={<CloseIcon />}
                                color="error"
                                onClick={() => handleRejectTransfer(transfer.id)}
                              >
                                Reject
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom color="warning.main">
                    Outgoing Transfers (Awaiting Approval)
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Product</TableCell>
                          <TableCell>Qty</TableCell>
                          <TableCell>To</TableCell>
                          <TableCell>Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {mockOutgoingTransfers.map((transfer, idx) => (
                          <TableRow key={idx}>
                            <TableCell>{transfer.product}</TableCell>
                            <TableCell>{transfer.quantity}</TableCell>
                            <TableCell>{transfer.to}</TableCell>
                            <TableCell>
                              <Chip 
                                label={transfer.status} 
                                color="warning"
                                size="small"
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
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

            import React, { useState, useEffect, useContext, useCallback } from 'react';
import { 
  Box, Typography, Grid, Card, CardContent, CircularProgress, Alert,
  Tabs, Tab, Paper, Chip, Avatar, LinearProgress, Divider, IconButton, List, ListItem, ListItemText, Button,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import { styled } from '@mui/material/styles';
import InventoryIcon from '@mui/icons-material/Inventory';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WarningIcon from '@mui/icons-material/Warning';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CategoryIcon from '@mui/icons-material/Category';
import RefreshIcon from '@mui/icons-material/Refresh';
import StorageIcon from '@mui/icons-material/Storage';
import AddIcon from '@mui/icons-material/Add';
import api from './api';
import { AuthContext } from './AuthContext';
import { 
  loadWarehousesWithStock, 
  loadProductsWithFallback, 
  getGlobalProducts, 
  getGlobalTransferHistory
} from './sharedData';
import offlineStorage from './utils/offlineStorage';

// Sample product data - Starting with zero inventory for testing
const sampleProducts = [
  { id: 1, name: 'Samsung Galaxy S23', sku: 'SGS23-001', quantity: 0, unit_price: 2500.00, category: 'Smartphones', reorder_level: 10 },
  { id: 2, name: 'iPhone 15 Pro', sku: 'IP15P-002', quantity: 0, unit_price: 3200.00, category: 'Smartphones', reorder_level: 8 },
  { id: 3, name: 'MacBook Air M2', sku: 'MBA-M2-003', quantity: 0, unit_price: 4500.00, category: 'Laptops', reorder_level: 5 },
  { id: 4, name: 'Dell XPS 13', sku: 'DXP13-004', quantity: 0, unit_price: 3800.00, category: 'Laptops', reorder_level: 6 },
  { id: 5, name: 'HP Pavilion 15', sku: 'HPP15-005', quantity: 0, unit_price: 2200.00, category: 'Laptops', reorder_level: 8 },
  { id: 6, name: 'iPad Pro 12.9', sku: 'IPP129-006', quantity: 0, unit_price: 3500.00, category: 'Tablets', reorder_level: 5 },
  { id: 7, name: 'Surface Laptop 5', sku: 'SL5-007', quantity: 0, unit_price: 4200.00, category: 'Laptops', reorder_level: 4 },
  { id: 8, name: 'AirPods Pro', sku: 'APP-008', quantity: 0, unit_price: 850.00, category: 'Accessories', reorder_level: 15 },
  { id: 9, name: 'Samsung Watch 6', sku: 'SW6-009', quantity: 0, unit_price: 1200.00, category: 'Wearables', reorder_level: 8 },
  { id: 10, name: 'Gaming Monitor 27"', sku: 'GM27-010', quantity: 0, unit_price: 1800.00, category: 'Monitors', reorder_level: 3 }
];

// Empty stock movements - Start with clean slate for testing
const sampleStockMovements = [];

// Sample warehouse data
const sampleWarehouses = [
  { id: 1, name: 'Main Warehouse', location: 'Accra Central', capacity: 10000 },
  { id: 2, name: 'Branch A', location: 'Kumasi', capacity: 5000 },
  { id: 3, name: 'Branch B', location: 'Tamale', capacity: 3000 },
  { id: 4, name: 'Branch C', location: 'Cape Coast', capacity: 4000 },
  { id: 5, name: 'Supplier Warehouse', location: 'Tema Port', capacity: 15000 }
];

// Styled components for modern design
const StyledTabs = styled(Tabs)(({ theme }) => ({
  backgroundColor: '#fff',
  borderRadius: '12px 12px 0 0',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  '& .MuiTabs-indicator': {
    height: 3,
    borderRadius: '3px 3px 0 0',
    background: 'linear-gradient(45deg, #9C27B0 30%, #673AB7 90%)',
  },
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '0.95rem',
  minHeight: 64,
  color: '#666',
  '&.Mui-selected': {
    color: '#9C27B0',
  },
}));

const MetricCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(135deg, #9C27B0 0%, #673AB7 100%)',
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
      id={`inventory-tabpanel-${index}`}
      aria-labelledby={`inventory-tab-${index}`}
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

const InventoryDashboard = () => {
  const { token } = useContext(AuthContext);
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false); // Set to false to show data immediately
  const [error, setError] = useState(null);
  const [products, setProducts] = useState([]); // Initialize empty, will load from global state
  const [stockMovements, setStockMovements] = useState(sampleStockMovements); // Initialize with sample movements
  const [lowStockItems, setLowStockItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [pendingTransfers, setPendingTransfers] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]); // Initialize empty, will load from shared data
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  
  const [warehouseTransferOpen, setWarehouseTransferOpen] = useState(false);
  const [transferForm, setTransferForm] = useState({
    product: '',
    quantity: '',
    fromWarehouse: '',
    toWarehouse: ''
  });

  const fetchInventoryData = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Load products from inventory API
      const productsResponse = await api.get('/inventory/products/');
      const products = productsResponse.data;
      setProducts(products);
      
      // Load warehouses from warehouse API
      const warehousesResponse = await api.get('/warehouse/');
      const warehouses = warehousesResponse.data;
      setWarehouses(warehouses);
      
      // Update global state for cross-module synchronization
      if (window.globalProducts) {
        window.globalProducts = products;
      }
      if (window.globalWarehouses) {
        window.globalWarehouses = warehouses;
      }
      
      // Dispatch events for other modules to sync
      window.dispatchEvent(new CustomEvent('productsUpdated', { 
        detail: { products: products, source: 'inventory_dashboard' } 
      }));
      window.dispatchEvent(new CustomEvent('warehousesUpdated', { 
        detail: { warehouses: warehouses, source: 'inventory_dashboard' } 
      }));
      
      // Load additional inventory-specific data
      const movementHistory = await getGlobalTransferHistory();
      setStockMovements(movementHistory);
      
    } catch (error) {
      console.error('Error fetching inventory data:', error);
      setError('Failed to load inventory data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInventoryData();

    const handleProductUpdate = (event) => {
      const { products: updatedProducts, source } = event.detail;
      if (source !== 'inventory_dashboard') {
        setProducts(updatedProducts);
        // Update global state
        if (window.globalProducts) {
          window.globalProducts = updatedProducts;
        }
      }
    };

    const handleWarehouseUpdate = (event) => {
      const { warehouses: updatedWarehouses, source } = event.detail;
      if (source !== 'inventory_dashboard') {
        setWarehouses(updatedWarehouses);
        // Update global state
        if (window.globalWarehouses) {
          window.globalWarehouses = updatedWarehouses;
        }
      }
    };

    const handleStockMovement = (event) => {
      const { movement } = event.detail;
      setStockMovements(prev => [movement, ...prev]);
      // Refresh inventory data to reflect stock changes
      fetchInventoryData();
    };

    window.addEventListener('productsUpdated', handleProductUpdate);
    window.addEventListener('warehousesUpdated', handleWarehouseUpdate);
    window.addEventListener('stockMovementAdded', handleStockMovement);

    return () => {
      window.removeEventListener('productsUpdated', handleProductUpdate);
      window.removeEventListener('warehousesUpdated', handleWarehouseUpdate);
      window.removeEventListener('stockMovementAdded', handleStockMovement);
    };
  }, [fetchInventoryData]);

  const handleTransferAction = async (id, action) => {
    try {
      const response = await api.put(`/inventory/transfers/${id}/`, {
        status: action === 'accept' ? 'accepted' : 'rejected'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Transfer updated:', response.data);
      // fetchInventoryData();
    } catch (err) {
      console.log('Error updating transfer:', err);
    }
  };

  const handleAcceptTransfer = async (movement) => {
    try {
      const updatedMovement = { 
        ...movement, 
        status: 'accepted',
        approved_by: 'Collins Arku',
        approved_at: new Date().toISOString(),
        notes: movement.notes + ' - Transfer approved'
      };
      const updatedMovements = stockMovements.map(m => m.id === movement.id ? updatedMovement : m);
      setStockMovements(updatedMovements);

      // Update product quantity
      const productIndex = products.findIndex(p => p.sku === movement.product_sku);
      if (productIndex !== -1) {
        const updatedProduct = { ...products[productIndex] };
        if (movement.movement_type === 'TRANSFER_IN') {
          updatedProduct.quantity += movement.quantity;
        } else if (movement.movement_type === 'TRANSFER_OUT') {
          updatedProduct.quantity -= movement.quantity;
        }
        const updatedProducts = [...products];
        updatedProducts[productIndex] = updatedProduct;
        setProducts(updatedProducts);
      }
      
      console.log('Transfer accepted:', updatedMovement);
      console.log('Updated movements:', updatedMovements);
    } catch (err) {
      console.log('Error accepting transfer:', err);
    }
  };

  const handleRejectTransfer = async (movement) => {
    try {
      const rejectionReason = prompt('Please provide a reason for rejection:') || 'No reason provided';
      const updatedMovement = { 
        ...movement, 
        status: 'rejected',
        rejected_by: 'Collins Arku',
        rejected_at: new Date().toISOString(),
        rejection_reason: rejectionReason,
        notes: movement.notes + ' - Transfer rejected'
      };
      const updatedMovements = stockMovements.map(m => m.id === movement.id ? updatedMovement : m);
      setStockMovements(updatedMovements);
      
      console.log('Transfer rejected:', updatedMovement);
      console.log('Updated movements:', updatedMovements);
    } catch (err) {
      console.log('Error rejecting transfer:', err);
    }
  };

  const handleTransferStock = async () => {
    try {
      if (!transferForm.product || !transferForm.quantity || !transferForm.fromWarehouse || !transferForm.toWarehouse) {
        alert('Please fill in all required fields');
        return;
      }

      if (transferForm.fromWarehouse === transferForm.toWarehouse) {
        alert('Source and destination warehouses must be different');
        return;
      }

      const selectedProduct = products.find(p => p.id === parseInt(transferForm.product));
      const transferQuantity = parseInt(transferForm.quantity);
      
      if (!selectedProduct) {
        alert('Selected product not found');
        return;
      }

      // Check if sufficient stock is available
      if (selectedProduct.quantity < transferQuantity) {
        alert(`Insufficient stock! Available: ${selectedProduct.quantity}, Requested: ${transferQuantity}`);
        return;
      }

      if (transferQuantity <= 0) {
        alert('Transfer quantity must be greater than 0');
        return;
      }

      // Find warehouse names
      const fromWarehouse = warehouses.find(w => w.id === parseInt(transferForm.fromWarehouse));
      const toWarehouse = warehouses.find(w => w.id === parseInt(transferForm.toWarehouse));

      // Create transfer record
      const transferData = {
        product: selectedProduct.name,
        productSku: selectedProduct.sku,
        quantity: transferQuantity,
        from: fromWarehouse?.name || 'Unknown',
        to: toWarehouse?.name || 'Unknown',
        status: 'pending',
        transferType: 'inter_warehouse',
        requestedBy: 'Collins Arku',
        approvedBy: null,
        notes: transferForm.notes || `Transfer ${selectedProduct.name} from ${fromWarehouse?.name} to ${toWarehouse?.name}`
      };

      let newTransfer;

      // Check if online or offline
      if (navigator.onLine) {
        try {
          // Try to create online first
          newTransfer = await api.post('/inventory/transfers/', transferData, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          setSnackbar({
            open: true,
            message: `Transfer initiated successfully!`,
            severity: 'success'
          });
        } catch (error) {
          console.error('Online creation failed, saving offline:', error);
          // Fallback to offline storage
          newTransfer = offlineStorage.addTransfer(transferData);
          
          setSnackbar({
            open: true,
            message: `Transfer saved offline - will sync when connection is restored`,
            severity: 'warning'
          });
        }
      } else {
        // Save offline when no connection
        newTransfer = offlineStorage.addTransfer(transferData);
        
        setSnackbar({
          open: true,
          message: `Transfer saved offline - will sync when connection is restored`,
          severity: 'info'
        });
      }

      // Add to transfer history
      const updatedMovements = [...stockMovements, newTransfer];
      setStockMovements(updatedMovements);

      alert('Stock transfer initiated successfully! Awaiting approval.');
      
      setWarehouseTransferOpen(false);
      
      // Reset form
      setTransferForm({
        product: '',
        quantity: '',
        fromWarehouse: '',
        toWarehouse: '',
        notes: ''
      });

      // Refresh data
      // fetchInventoryData();
    } catch (error) {
      console.error('Transfer stock error:', error);
      alert('Failed to initiate stock transfer. Please try again.');
    }
  };

  return (
    <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh', p: 0 }}>
      {/* Header */}
      <Box sx={{ 
        background: 'linear-gradient(135deg, #9C27B0 0%, #673AB7 100%)',
        color: 'white',
        p: 4,
        borderRadius: '0 0 24px 24px',
        mb: 3
      }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
              Inventory Dashboard
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              Monitor your stock levels and inventory movements efficiently.
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
          <StyledTab icon={<CategoryIcon />} label="Stock Levels" />
          <StyledTab icon={<SwapHorizIcon />} label="Movements" />
          <StyledTab icon={<AssessmentIcon />} label="Analytics" />
        </StyledTabs>

        {/* Overview Tab */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            {/* Quick Actions Section */}
            <Grid item xs={12}>
              <AnalyticsCard>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center' }}>
                    <SwapHorizIcon sx={{ mr: 1, color: '#9C27B0' }} />
                    Quick Actions
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Button
                      variant="contained"
                      startIcon={<SwapHorizIcon />}
                      onClick={() => setWarehouseTransferOpen(true)}
                      sx={{
                        bgcolor: '#9C27B0',
                        '&:hover': { bgcolor: '#7B1FA2' },
                        borderRadius: 2,
                        px: 3,
                        py: 1.5
                      }}
                    >
                      Transfer Stock
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<RefreshIcon />}
                      onClick={() => window.location.reload()}
                      sx={{
                        borderColor: '#2196F3',
                        color: '#2196F3',
                        '&:hover': { 
                          borderColor: '#1976D2',
                          color: '#1976D2',
                          bgcolor: 'rgba(33, 150, 243, 0.04)'
                        },
                        borderRadius: 2,
                        px: 3,
                        py: 1.5
                      }}
                    >
                      Refresh Data
                    </Button>
                  </Box>
                </CardContent>
              </AnalyticsCard>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <MetricCard>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="body2" sx={{ opacity: 0.8, mb: 1 }}>Total Products</Typography>
                      <Typography variant="h3" sx={{ fontWeight: 700 }}>
                        {products.length}
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                      <InventoryIcon sx={{ fontSize: 28 }} />
                    </Avatar>
                  </Box>
                </CardContent>
              </MetricCard>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <MetricCard>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="body2" sx={{ opacity: 0.8, mb: 1 }}>Total Stock Units</Typography>
                      <Typography variant="h3" sx={{ fontWeight: 700 }}>
                        {products.reduce((total, product) => total + (product.quantity || 0), 0)}
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                      <StorageIcon sx={{ fontSize: 28 }} />
                    </Avatar>
                  </Box>
                </CardContent>
              </MetricCard>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <MetricCard>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="body2" sx={{ opacity: 0.8, mb: 1 }}>Pending Transfers</Typography>
                      <Typography variant="h3" sx={{ fontWeight: 700 }}>
                        {stockMovements.filter(m => m.status === 'pending').length}
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                      <SwapHorizIcon sx={{ fontSize: 28 }} />
                    </Avatar>
                  </Box>
                </CardContent>
              </MetricCard>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <MetricCard>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="body2" sx={{ opacity: 0.8, mb: 1 }}>Low Stock Items</Typography>
                      <Typography variant="h3" sx={{ fontWeight: 700 }}>
                        {products.filter(p => (p.quantity || 0) <= (p.reorder_level || 10)).length}
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                      <WarningIcon sx={{ fontSize: 28 }} />
                    </Avatar>
                  </Box>
                </CardContent>
              </MetricCard>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Stock Levels Tab */}
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <AnalyticsCard>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Stock Availability</Typography>
                  <Divider sx={{ mb: 2 }} />
                  {products.length > 0 ? (
                    <List sx={{ py: 0 }}>
                      {products.map((product, idx) => (
                        <ListItem key={idx} sx={{ px: 0, py: 1 }}>
                          <ListItemText 
                            primary={product.name || `Product ${idx + 1}`}
                            secondary={`SKU: ${product.sku || 'N/A'} | Quantity: ${product.quantity || 0}`}
                            primaryTypographyProps={{ fontWeight: 500 }}
                          />
                          <Chip 
                            label={product.quantity > 50 ? 'In Stock' : product.quantity > 10 ? 'Low Stock' : 'Out of Stock'}
                            size="small" 
                            color={product.quantity > 50 ? 'success' : product.quantity > 10 ? 'warning' : 'error'}
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Alert severity="info" sx={{ borderRadius: 2 }}>No product data available</Alert>
                  )}
                </CardContent>
              </AnalyticsCard>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Movements Tab */}
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <AnalyticsCard>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center' }}>
                    <SwapHorizIcon sx={{ mr: 1, color: '#9C27B0' }} />
                    Stock Movements & Transfer Management
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  {console.log('Current stockMovements state:', stockMovements)}
                  {console.log('stockMovements length:', stockMovements?.length)}
                  {console.log('sampleStockMovements:', sampleStockMovements)}
                  {(stockMovements && stockMovements.length > 0) || sampleStockMovements.length > 0 ? (
                    <Box>
                      {/* Use stockMovements if available, otherwise use sampleStockMovements */}
                      {(() => {
                        const movements = stockMovements.length > 0 ? stockMovements : sampleStockMovements;
                        return (
                          <React.Fragment>
                            {/* Pending Transfers Section */}
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: '#FF9800' }}>
                              Pending Transfers ({movements.filter(m => m.status === 'pending').length})
                            </Typography>
                            
                            {movements.filter(m => m.status === 'pending').map((movement) => (
                              <Paper key={movement.id} sx={{ p: 2, mb: 2, border: '1px solid #FF9800', borderRadius: 2 }}>
                                <Grid container spacing={2} alignItems="center">
                                  <Grid item xs={12} md={6}>
                                    <Box>
                                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                        {movement.product_name}
                                      </Typography>
                                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                        SKU: {movement.product_sku} | Quantity: {movement.quantity} units
                                      </Typography>
                                      <Typography variant="body2" color="text.secondary">
                                        {movement.movement_type === 'TRANSFER_IN' ? 
                                          `From: ${movement.from_warehouse} → To: ${movement.to_warehouse}` :
                                          `From: ${movement.from_warehouse} → To: ${movement.to_warehouse}`
                                        }
                                      </Typography>
                                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                                        Requested by: {movement.requested_by} | {new Date(movement.created_at).toLocaleString()}
                                      </Typography>
                                      {movement.notes && (
                                        <Typography variant="caption" color="text.secondary" display="block">
                                          Notes: {movement.notes}
                                        </Typography>
                                      )}
                                    </Box>
                                  </Grid>
                                  <Grid item xs={12} md={3}>
                                    <Chip 
                                      icon={movement.movement_type === 'TRANSFER_IN' ? <TrendingUpIcon /> : <SwapHorizIcon />}
                                      label={movement.movement_type === 'TRANSFER_IN' ? 'Incoming' : 'Outgoing'}
                                      color={movement.movement_type === 'TRANSFER_IN' ? 'success' : 'primary'}
                                      variant="outlined"
                                    />
                                  </Grid>
                                  <Grid item xs={12} md={3}>
                                    <Box sx={{ display: 'flex', gap: 1, flexDirection: { xs: 'row', md: 'column' } }}>
                                      <Button
                                        variant="contained"
                                        color="success"
                                        size="small"
                                        startIcon={<TrendingUpIcon />}
                                        onClick={() => handleAcceptTransfer(movement)}
                                        sx={{ minWidth: 80 }}
                                      >
                                        Accept
                                      </Button>
                                      <Button
                                        variant="contained"
                                        color="error"
                                        size="small"
                                        startIcon={<WarningIcon />}
                                        onClick={() => handleRejectTransfer(movement)}
                                        sx={{ minWidth: 80 }}
                                      >
                                        Reject
                                      </Button>
                                    </Box>
                                  </Grid>
                                </Grid>
                              </Paper>
                            ))}
                          </React.Fragment>
                        );
                      })()}
                    </Box>
                  ) : (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                      <Typography variant="h6" sx={{ opacity: 0.8 }}>
                        No stock movement data available
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </AnalyticsCard>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Analytics Tab */}
        <TabPanel value={tabValue} index={3}>
          <Grid container spacing={3}>
            {/* Inventory Value Trends */}
            <Grid item xs={12} md={6}>
              <AnalyticsCard>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center' }}>
                    <TrendingUpIcon sx={{ mr: 1, color: '#4CAF50' }} />
                    Inventory Value Trends
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Box sx={{ height: 300 }}>
                    {/* Live Inventory Value Chart */}
                    <Box sx={{ width: '100%', textAlign: 'center', mb: 3 }}>
                      <Typography variant="h4" color="primary" sx={{ mb: 1 }}>
                        GHS {(products.reduce((sum, p) => sum + (p.quantity * (p.unit_price || 50)), 0)).toLocaleString()}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Total Inventory Value
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={75} 
                        sx={{ height: 8, borderRadius: 4, mb: 2 }} 
                      />
                    </Box>

                    {/* Value Breakdown by Category */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {[
                        { 
                          status: 'Smartphones', 
                          count: products.filter(p => p.category === 'Smartphones').length, 
                          percentage: Math.round((products.filter(p => p.category === 'Smartphones').length / Math.max(products.length, 1)) * 100), 
                          color: '#4CAF50' 
                        },
                        { 
                          status: 'Laptops', 
                          count: products.filter(p => p.category === 'Laptops').length, 
                          percentage: Math.round((products.filter(p => p.category === 'Laptops').length / Math.max(products.length, 1)) * 100), 
                          color: '#2196F3' 
                       },
                        { 
                          status: 'Tablets', 
                          count: products.filter(p => p.category === 'Tablets').length, 
                          percentage: Math.round((products.filter(p => p.category === 'Tablets').length / Math.max(products.length, 1)) * 100), 
                          color: '#FF9800' 
                        },
                        { 
                          status: 'Other Products', 
                          count: products.filter(p => p.category !== 'Smartphones' && p.category !== 'Laptops' && p.category !== 'Tablets').length, 
                          percentage: Math.round((products.filter(p => p.category !== 'Smartphones' && p.category !== 'Laptops' && p.category !== 'Tablets').length / Math.max(products.length, 1)) * 100), 
                          color: '#9C27B0' 
                        }
                      ].map((item, idx) => (
                        <Box key={item.status}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {item.status}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {item.count} products
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ flex: 1 }}>
                              <LinearProgress 
                                variant="determinate" 
                                value={item.percentage} 
                                sx={{ 
                                  height: 8, 
                                  borderRadius: 4,
                                  '& .MuiLinearProgress-bar': { bgcolor: item.color }
                                }}
                              />
                            </Box>
                            <Typography variant="body2" color="text.secondary" sx={{ minWidth: 40 }}>
                              {item.percentage}%
                            </Typography>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                </CardContent>
              </AnalyticsCard>
            </Grid>

            {/* Stock Movement Analytics */}
            <Grid item xs={12} md={6}>
              <AnalyticsCard>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center' }}>
                    <SwapHorizIcon sx={{ mr: 1, color: '#FF9800' }} />
                    Stock Movement Analytics
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Box sx={{ height: 300 }}>
                    {/* Stock Movement Chart */}
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Daily Stock Movements (Last 7 Days)
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, mb: 2, alignItems: 'end', height: 100 }}>
                        {[42, 38, 55, 47, 61, 39, 48].map((movements, i) => {
                          const height = (movements / 70) * 80;
                          return (
                            <Box key={i} sx={{ flex: 1, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                              <Box 
                                sx={{ 
                                  height: height, 
                                  width: 12,
                                  bgcolor: '#FF9800', 
                                  borderRadius: 1,
                                  mb: 1,
                                  opacity: 0.8
                                }} 
                              />
                              <Typography variant="caption">
                                {new Date(Date.now() - (6-i) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { weekday: 'short' })}
                              </Typography>
                              <Typography variant="caption" display="block" color="text.secondary">
                                {movements}
                              </Typography>
                            </Box>
                          );
                        })}
                      </Box>
                    </Box>
                    
                    {/* Movement Summary */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {[
                        { metric: 'Days Sales Outstanding', value: '58 days', performance: 78 },
                        { metric: 'Stock Accuracy', value: '96.5%', performance: 96 },
                        { metric: 'Order Fulfillment Rate', value: '94.2%', performance: 94 },
                        { metric: 'Carrying Cost Ratio', value: '12.3%', performance: 88 }
                      ].map((item, idx) => (
                        <Box key={item.metric}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {item.metric}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {item.value}
                            </Typography>
                          </Box>
                          <LinearProgress 
                            variant="determinate" 
                            value={item.performance} 
                            sx={{ height: 6, borderRadius: 3 }}
                            color={item.performance >= 90 ? 'success' : item.performance >= 80 ? 'primary' : 'warning'}
                          />
                        </Box>
                      ))}
                    </Box>
                  </Box>
                </CardContent>
              </AnalyticsCard>
            </Grid>

            {/* Stock Level Analytics */}
            <Grid item xs={12} md={6}>
              <AnalyticsCard>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center' }}>
                    <StorageIcon sx={{ mr: 1, color: '#9C27B0' }} />
                    Stock Level Analytics
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Box sx={{ height: 300 }}>
                    {/* Stock Status Distribution */}
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Stock Status Distribution
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
                      {[
                        { 
                          status: 'In Stock', 
                          count: products.filter(p => (p.quantity || 0) > (p.reorder_level || 10)).length, 
                          percentage: Math.round((products.filter(p => (p.quantity || 0) > (p.reorder_level || 10)).length / Math.max(products.length, 1)) * 100), 
                          color: '#4CAF50' 
                        },
                        { 
                          status: 'Low Stock', 
                          count: products.filter(p => (p.quantity || 0) <= (p.reorder_level || 10) && (p.quantity || 0) > 0).length, 
                          percentage: Math.round((products.filter(p => (p.quantity || 0) <= (p.reorder_level || 10) && (p.quantity || 0) > 0).length / Math.max(products.length, 1)) * 100), 
                          color: '#FF9800' 
                       },
                        { 
                          status: 'Out of Stock', 
                          count: products.filter(p => (p.quantity || 0) === 0).length, 
                          percentage: Math.round((products.filter(p => (p.quantity || 0) === 0).length / Math.max(products.length, 1)) * 100), 
                          color: '#F44336' 
                        }
                      ].map((stock, idx) => (
                        <Box key={stock.status}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {stock.status}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {stock.count} products
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ flex: 1 }}>
                              <LinearProgress 
                                variant="determinate" 
                                value={stock.percentage} 
                                sx={{ 
                                  height: 8, 
                                  borderRadius: 4,
                                  '& .MuiLinearProgress-bar': { bgcolor: stock.color }
                                }}
                              />
                            </Box>
                            <Typography variant="body2" color="text.secondary" sx={{ minWidth: 40 }}>
                              {stock.percentage}%
                            </Typography>
                          </Box>
                        </Box>
                      ))}
                    </Box>

                    {/* Reorder Alerts */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Paper sx={{ p: 1.5, textAlign: 'center', bgcolor: 'error.light', color: 'error.contrastText', flex: 1, mr: 1 }}>
                        <Typography variant="h6">{products.filter(p => (p.quantity || 0) <= (p.reorder_level || 10)).length}</Typography>
                        <Typography variant="caption">Reorder Alerts</Typography>
                      </Paper>
                      <Paper sx={{ p: 1.5, textAlign: 'center', bgcolor: 'warning.light', color: 'warning.contrastText', flex: 1, ml: 1 }}>
                        <Typography variant="h6">5</Typography>
                        <Typography variant="caption">Critical Items</Typography>
                      </Paper>
                    </Box>
                  </Box>
                </CardContent>
              </AnalyticsCard>
            </Grid>

            {/* Transfer Analytics */}
            <Grid item xs={12} md={6}>
              <AnalyticsCard>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center' }}>
                    <SwapHorizIcon sx={{ mr: 1, color: '#2196F3' }} />
                    Transfer Analytics
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Box sx={{ height: 300 }}>
                    {/* Transfer Status Distribution */}
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Transfer Status Overview
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
                      {[
                        { 
                          status: 'Pending', 
                          count: stockMovements.filter(m => m.status === 'pending').length, 
                          percentage: Math.round((stockMovements.filter(m => m.status === 'pending').length / Math.max(stockMovements.length, 1)) * 100), 
                          color: '#FF9800' 
                        },
                        { 
                          status: 'Accepted', 
                          count: stockMovements.filter(m => m.status === 'accepted').length, 
                          percentage: Math.round((stockMovements.filter(m => m.status === 'accepted').length / Math.max(stockMovements.length, 1)) * 100), 
                          color: '#4CAF50' 
                        },
                        { 
                          status: 'Rejected', 
                          count: stockMovements.filter(m => m.status === 'rejected').length, 
                          percentage: Math.round((stockMovements.filter(m => m.status === 'rejected').length / Math.max(stockMovements.length, 1)) * 100), 
                          color: '#F44336' 
                        }
                      ].map((transfer, idx) => (
                        <Box key={transfer.status}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {transfer.status}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {transfer.count} transfers
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ flex: 1 }}>
                              <LinearProgress 
                                variant="determinate" 
                                value={transfer.percentage} 
                                sx={{ 
                                  height: 8, 
                                  borderRadius: 4,
                                  '& .MuiLinearProgress-bar': { bgcolor: transfer.color }
                                }} 
                              />
                            </Box>
                            <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 40 }}>
                              {transfer.percentage}%
                            </Typography>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                    
                    {/* Total Units Transferred */}
                    <Box sx={{ mt: 3, p: 2, bgcolor: 'rgba(33, 150, 243, 0.1)', borderRadius: 2 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Total Units in Transit
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: '#2196F3' }}>
                        {stockMovements.filter(m => m.status === 'pending').reduce((total, m) => total + m.quantity, 0)}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </AnalyticsCard>
            </Grid>

            {/* Inventory Value Analytics */}
            <Grid item xs={12} md={6}>
              <AnalyticsCard>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center' }}>
                    <TrendingUpIcon sx={{ mr: 1, color: '#4CAF50' }} />
                    Inventory Value Analytics
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Box sx={{ height: 300 }}>
                    {/* Total Inventory Value */}
                    <Box sx={{ mb: 3, p: 2, bgcolor: 'rgba(76, 175, 80, 0.1)', borderRadius: 2 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Total Inventory Value
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: '#4CAF50' }}>
                        GH₵{products.reduce((total, p) => total + ((p.quantity || 0) * (p.unit_price || 0)), 0).toLocaleString()}
                      </Typography>
                    </Box>
                    
                    {/* Top Value Products */}
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Top Value Products
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {products
                        .map(p => ({ ...p, totalValue: (p.quantity || 0) * (p.unit_price || 0) }))
                        .sort((a, b) => b.totalValue - a.totalValue)
                        .slice(0, 5)
                        .map((product, idx) => (
                          <Box key={product.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1 }}>
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {product.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {product.quantity} units × GH₵{product.unit_price}
                              </Typography>
                            </Box>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#4CAF50' }}>
                              GH₵{product.totalValue.toLocaleString()}
                            </Typography>
                          </Box>
                        ))}
                    </Box>
                  </Box>
                </CardContent>
              </AnalyticsCard>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>
      <Dialog
        open={warehouseTransferOpen}
        onClose={() => setWarehouseTransferOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Transfer Stock</DialogTitle>
        <DialogContent>
          {console.log('Warehouses state in dialog:', warehouses)}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <FormControl variant="outlined" sx={{ width: '100%' }}>
              <InputLabel id="product-label">Product</InputLabel>
              <Select
                labelId="product-label"
                id="product-select"
                value={transferForm.product}
                onChange={(e) => setTransferForm({ ...transferForm, product: e.target.value })}
                label="Product"
              >
                {products.map((product) => (
                  <MenuItem key={product.id} value={product.id}>
                    {product.name} - {product.sku} (Stock: {product.quantity || 0})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <TextField
              label="Quantity"
              type="number"
              value={transferForm.quantity}
              onChange={(e) => setTransferForm({ ...transferForm, quantity: e.target.value })}
              variant="outlined"
              sx={{ width: '100%' }}
            />
            
            <FormControl variant="outlined" sx={{ width: '100%' }}>
              <InputLabel id="from-warehouse-label">From Warehouse</InputLabel>
              <Select
                labelId="from-warehouse-label"
                id="from-warehouse-select"
                value={transferForm.fromWarehouse}
                onChange={(e) => setTransferForm({ ...transferForm, fromWarehouse: e.target.value })}
              >
                {console.log('Warehouses available:', warehouses)}
                {warehouses.map((warehouse) => (
                  <MenuItem key={warehouse.id} value={warehouse.id}>
                    {warehouse.name} - {warehouse.location}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl variant="outlined" sx={{ width: '100%' }}>
              <InputLabel id="to-warehouse-label">To Warehouse</InputLabel>
              <Select
                labelId="to-warehouse-label"
                id="to-warehouse-select"
                value={transferForm.toWarehouse}
                onChange={(e) => setTransferForm({ ...transferForm, toWarehouse: e.target.value })}
              >
                {warehouses.map((warehouse) => (
                  <MenuItem key={warehouse.id} value={warehouse.id}>
                    {warehouse.name} - {warehouse.location}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setWarehouseTransferOpen(false)}>Cancel</Button>
          <Button onClick={handleTransferStock} variant="contained" color="primary">Transfer</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InventoryDashboard;

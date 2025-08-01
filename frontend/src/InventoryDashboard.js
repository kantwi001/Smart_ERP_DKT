import React, { useState, useEffect, useContext } from 'react';
import { 
  Box, Typography, Grid, Card, CardContent, CircularProgress, Alert,
  Tabs, Tab, Paper, Chip, Avatar, LinearProgress, Divider, IconButton, List, ListItem, ListItemText, Button,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import { styled } from '@mui/material/styles';
import InventoryIcon from '@mui/icons-material/Inventory';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import PeopleIcon from '@mui/icons-material/People';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WarningIcon from '@mui/icons-material/Warning';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CategoryIcon from '@mui/icons-material/Category';
import RefreshIcon from '@mui/icons-material/Refresh';
import StorageIcon from '@mui/icons-material/Storage';
import AddIcon from '@mui/icons-material/Add';
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

const QuickActionButton = styled(Button)(({ theme }) => ({
  borderRadius: 12,
  padding: '12px 24px',
  textTransform: 'none',
  fontWeight: 600,
  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
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

const periods = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: 'custom', label: 'Custom' },
];

const mockSummary = [
  { title: 'Total Products', value: 120, icon: <InventoryIcon />, color: 'primary' },
  { title: 'Stock Movements', value: 58, icon: <SwapHorizIcon />, color: 'success' },
  { title: 'Stockouts', value: 4, icon: <AssessmentIcon />, color: 'error' },
  { title: 'Suppliers', value: 8, icon: <PeopleIcon />, color: 'secondary' },
];

const mockLineData = [
  { date: 'Jul 14', In: 2, Out: 1 },
  { date: 'Jul 15', In: 4, Out: 2 },
  { date: 'Jul 16', In: 6, Out: 3 },
  { date: 'Jul 17', In: 3, Out: 5 },
  { date: 'Jul 18', In: 8, Out: 4 },
  { date: 'Jul 19', In: 7, Out: 2 },
  { date: 'Jul 20', In: 5, Out: 1 },
];

const mockPieData1 = [
  { name: 'Electronics', value: 40 },
  { name: 'Apparel', value: 30 },
  { name: 'Food', value: 25 },
  { name: 'Other', value: 25 },
];
const mockPieData2 = [
  { name: 'Warehouse A', value: 60 },
  { name: 'Warehouse B', value: 30 },
  { name: 'Warehouse C', value: 10 },
];
const mockPieData3 = [
  { name: 'Low', value: 10 },
  { name: 'Medium', value: 60 },
  { name: 'High', value: 30 },
];

const InventoryDashboard = () => {
  const { token } = useContext(AuthContext);
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [products, setProducts] = useState([]);
  const [stockMovements, setStockMovements] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [pendingTransfers, setPendingTransfers] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  
  // Transaction integration
  const {
    transactions,
    analytics,
    recordInventoryMovement,
    refreshData
  } = useTransactionIntegration('inventory');
  const [warehouseTransferOpen, setWarehouseTransferOpen] = useState(false);
  const [transferForm, setTransferForm] = useState({
    product: '',
    quantity: '',
    fromWarehouse: '',
    toWarehouse: ''
  });

  // Reusable function to fetch all dashboard data
  const fetchDashboardData = React.useCallback(async () => {
    try {
      setLoading(true);
      const [productsRes, movementsRes, categoriesRes, warehousesRes] = await Promise.all([
        api.get('/inventory/products/', { headers: { Authorization: `Bearer ${token}` } }).catch(e => ({ data: [] })),
        api.get('/inventory/stock-movements/', { headers: { Authorization: `Bearer ${token}` } }).catch(e => ({ data: [] })),
        api.get('/inventory/categories/', { headers: { Authorization: `Bearer ${token}` } }).catch(e => ({ data: [] })),
        api.get('/warehouse/', { headers: { Authorization: `Bearer ${token}` } }).catch(e => ({ data: [] }))
      ]);
      
      console.log('API Responses:', {
        products: productsRes.data?.length || 0,
        movements: movementsRes.data?.length || 0,
        categories: categoriesRes.data?.length || 0,
        warehouses: warehousesRes.data?.length || 0
      });
      
      setProducts(productsRes.data || []);
      setStockMovements(movementsRes.data || []);
      setCategories(categoriesRes.data || []);
      setWarehouses(warehousesRes.data || []);
      setLowStockItems(productsRes.data?.filter(p => p.quantity < 10) || []);
      setLowStockProducts(productsRes.data?.filter(p => p.quantity < (p.reorder_level || 10)) || []);
      
      // Fetch pending transfers (real data only)
      try {
        const transfersRes = await api.get('/inventory/transfers/', { 
          headers: { Authorization: `Bearer ${token}` },
          params: { status: 'pending' }
        });
        setPendingTransfers(transfersRes.data || []);
      } catch (err) {
        console.error('Failed to fetch pending transfers:', err);
        setPendingTransfers([]);
      }
      
      // Generate recent activity from real stock movements
      const recentMovements = movementsRes.data?.slice(0, 5).map(movement => ({
        action: `${movement.movement_type || 'Stock movement'}: ${movement.product_name || 'Product'} - ${movement.quantity || 0} units`,
        timestamp: movement.created_at ? new Date(movement.created_at).toLocaleString() : 'Unknown time',
        type: movement.movement_type === 'IN' ? 'success' : movement.movement_type === 'OUT' ? 'warning' : 'info'
      })) || [];
      
      setRecentActivity(recentMovements);
    } catch (err) {
      setError('Failed to load inventory data');
      console.error('Dashboard data fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchDashboardData();
  }, [token]);

  // Handler functions for inventory transfer functionality
  const handleAcceptTransfer = async (transferId) => {
    try {
      console.log('Accepting transfer:', transferId);
      const response = await api.post(`/inventory/transfers/${transferId}/approve/`, {
        action: 'approve'
      });
      
      console.log('Transfer approval response:', response.data);
      
      // Remove from pending transfers and refresh data
      setPendingTransfers(prev => prev.filter(t => t.id !== transferId));
      
      // Show success message
      alert('Transfer accepted successfully!');
      
      // Refresh dashboard data
      fetchDashboardData();
    } catch (err) {
      console.error('Failed to accept transfer:', err);
      const errorMessage = err.response?.data?.error || err.response?.data?.message || 'Failed to accept transfer. Please try again.';
      alert(errorMessage);
    }
  };

  const handleRejectTransfer = async (transferId) => {
    try {
      console.log('Rejecting transfer:', transferId);
      const response = await api.post(`/inventory/transfers/${transferId}/approve/`, {
        action: 'reject',
        rejection_reason: 'Rejected from inventory dashboard'
      });
      
      console.log('Transfer rejection response:', response.data);
      
      // Remove from pending transfers
      setPendingTransfers(prev => prev.filter(t => t.id !== transferId));
      
      // Show success message
      alert('Transfer rejected successfully!');
      
      // Refresh dashboard data
      fetchDashboardData();
    } catch (err) {
      console.error('Failed to reject transfer:', err);
      const errorMessage = err.response?.data?.error || err.response?.data?.message || 'Failed to reject transfer. Please try again.';
      alert(errorMessage);
    }
  };

  // Handler functions for Quick Actions
  const handleAddProduct = React.useCallback(() => {
    try {
      console.log('Opening inventory management page...');
      // Navigate to inventory management page
      const newWindow = window.open('/inventory/management', '_blank');
      if (!newWindow) {
        // If popup was blocked, try direct navigation
        window.location.href = '/inventory/management';
      }
    } catch (err) {
      console.error('Failed to open inventory management:', err);
      // Fallback: try direct navigation
      try {
        window.location.href = '/inventory/management';
      } catch (fallbackErr) {
        console.error('Fallback navigation also failed:', fallbackErr);
        alert('Unable to open inventory management page. Please navigate manually.');
      }
    }
  }, []);

  const handleRefreshData = React.useCallback(async () => {
    try {
      console.log('Refreshing dashboard data...');
      setLoading(true);
      await fetchDashboardData();
      alert('Data refreshed successfully!');
    } catch (err) {
      console.error('Failed to refresh data:', err);
      alert('Failed to refresh data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [fetchDashboardData]);

  const handleWarehouseTransfer = async () => {
    try {
      // Find the selected product to get its details
      const selectedProduct = products.find(p => p.id === parseInt(transferForm.product));
      if (!selectedProduct) {
        alert('Please select a valid product.');
        return;
      }

      // Prepare transfer data
      const transferData = {
        product: transferForm.product,
        quantity: parseInt(transferForm.quantity),
        from_location: transferForm.fromWarehouse,
        to_location: transferForm.toWarehouse,
        status: 'pending'
      };

      // Create inventory transfer
      await api.post('/inventory/transfers/', transferData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Reset form and close dialog
      setTransferForm({ product: '', quantity: '', fromWarehouse: '', toWarehouse: '' });
      setWarehouseTransferOpen(false);
      
      // Show success message
      alert(`Transfer request created successfully! ${transferForm.quantity} units of ${selectedProduct.name} will be transferred from ${transferForm.fromWarehouse} to ${transferForm.toWarehouse}.`);
      
      // Refresh data
      window.location.reload();
    } catch (err) {
      console.error('Failed to create warehouse transfer:', err);
      const errorMessage = err.response?.data?.error || err.response?.data?.message || 'Failed to create warehouse transfer. Please try again.';
      alert(errorMessage);
    }
  };

  const handleTransferFormChange = (field, value) => {
    setTransferForm(prev => ({ ...prev, [field]: value }));
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
          <StyledTab icon={<CategoryIcon />} label="Products" />
          <StyledTab icon={<SwapHorizIcon />} label="Movements" />
          <StyledTab icon={<AssessmentIcon />} label="Analytics" />
        </StyledTabs>

        {/* Overview Tab */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            {/* Quick Actions */}
            <Grid item xs={12}>
              <AnalyticsCard>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center' }}>
                    <PeopleIcon sx={{ mr: 1, color: '#FF9800' }} />
                    Quick Actions
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                   <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Button 
                      variant="contained" 
                      startIcon={<SwapHorizIcon />}
                      onClick={() => setWarehouseTransferOpen(true)}
                      sx={{ 
                        background: 'linear-gradient(45deg, #9C27B0 30%, #BA68C8 90%)',
                        '&:hover': { background: 'linear-gradient(45deg, #7B1FA2 30%, #9C27B0 90%)' }
                      }}
                    >
                      Transfer Stock
                    </Button>
                    <Button 
                      variant="contained" 
                      startIcon={<AddIcon />}
                      onClick={handleAddProduct}
                      sx={{ 
                        background: 'linear-gradient(45deg, #4CAF50 30%, #66BB6A 90%)',
                        '&:hover': { background: 'linear-gradient(45deg, #388E3C 30%, #4CAF50 90%)' }
                      }}
                    >
                      Add Product
                    </Button>
                    <Button 
                      variant="outlined" 
                      startIcon={<RefreshIcon />}
                      onClick={handleRefreshData}
                      disabled={loading}
                    >
                      {loading ? 'Refreshing...' : 'Refresh Data'}
                    </Button>
                  </Box>
                </CardContent>
              </AnalyticsCard>
            </Grid>

            {/* Pending Transfers */}
            <Grid item xs={12} md={6}>
              <AnalyticsCard>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center' }}>
                    <SwapHorizIcon sx={{ mr: 1, color: '#FF9800' }} />
                    Pending Warehouse Transfers
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  {pendingTransfers.length > 0 ? (
                    <List sx={{ py: 0 }}>
                      {pendingTransfers.slice(0, 5).map((transfer, idx) => (
                        <ListItem key={idx} sx={{ px: 0, py: 1 }}>
                          <ListItemText 
                            primary={`${transfer.product_name || `Product ${transfer.product}`} - ${transfer.quantity} units`}
                            secondary={`From: ${transfer.from_warehouse} → To: ${transfer.to_warehouse} | ${transfer.created_at || 'Just now'}`}
                            primaryTypographyProps={{ fontWeight: 500 }}
                          />
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button 
                              size="small" 
                              variant="contained" 
                              color="success"
                              onClick={() => handleAcceptTransfer(transfer.id)}
                            >
                              Accept
                            </Button>
                            <Button 
                              size="small" 
                              variant="outlined" 
                              color="error"
                              onClick={() => handleRejectTransfer(transfer.id)}
                            >
                              Reject
                            </Button>
                          </Box>
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Box textAlign="center" py={3}>
                      <Typography variant="body2" color="textSecondary" mb={2}>No pending transfers</Typography>
                      <Button 
                        variant="outlined" 
                        startIcon={<SwapHorizIcon />}
                        onClick={() => setWarehouseTransferOpen(true)}
                      >
                        Create Transfer
                      </Button>
                    </Box>
                  )}
                </CardContent>
              </AnalyticsCard>
            </Grid>

            {/* Low Stock Alerts */}
            <Grid item xs={12} md={6}>
              <AnalyticsCard>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center' }}>
                    <WarningIcon sx={{ mr: 1, color: '#f44336' }} />
                    Low Stock Alerts
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  {lowStockProducts.length > 0 ? (
                    <List sx={{ py: 0 }}>
                      {lowStockProducts.slice(0, 5).map((product, idx) => (
                        <ListItem key={idx} sx={{ px: 0, py: 1 }}>
                          <ListItemText 
                            primary={product.name}
                            secondary={`Current Stock: ${product.quantity} | Minimum: ${product.reorder_level || 10}`}
                            primaryTypographyProps={{ fontWeight: 500 }}
                          />
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Chip 
                              label="Low Stock"
                              size="small" 
                              color="error"
                              variant="outlined"
                            />

                          </Box>
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Box textAlign="center" py={3}>
                      <Typography variant="body2" color="textSecondary">All products are well stocked</Typography>
                    </Box>
                  )}
                </CardContent>
              </AnalyticsCard>
            </Grid>

            {/* Key Metrics */}
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
              <MetricCard sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="body2" sx={{ opacity: 0.8, mb: 1 }}>Stock Movements</Typography>
                      <Typography variant="h3" sx={{ fontWeight: 700 }}>
                        {stockMovements.length}
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
              <MetricCard sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="body2" sx={{ opacity: 0.8, mb: 1 }}>Low Stock Items</Typography>
                      <Typography variant="h3" sx={{ fontWeight: 700 }}>
                        {lowStockItems.length}
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                      <WarningIcon sx={{ fontSize: 28 }} />
                    </Avatar>
                  </Box>
                </CardContent>
              </MetricCard>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <MetricCard sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="body2" sx={{ opacity: 0.8, mb: 1 }}>Categories</Typography>
                      <Typography variant="h3" sx={{ fontWeight: 700 }}>
                        {categories.length}
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                      <CategoryIcon sx={{ fontSize: 28 }} />
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
                    <StorageIcon sx={{ mr: 1, color: '#9C27B0' }} />
                    Recent Inventory Activity
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

            {/* Inventory Metrics */}
            <Grid item xs={12} md={4}>
              <AnalyticsCard>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Inventory Health</Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Box sx={{ space: 2 }}>
                    <Box sx={{ mb: 2 }}>
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="body2">Stock Availability</Typography>
                        <Typography variant="body2" color="success.main">
                          {products.length > 0 ? 
                            Math.round((products.filter(p => p.quantity > 0).length / products.length) * 100) : 0}%
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={products.length > 0 ? (products.filter(p => p.quantity > 0).length / products.length) * 100 : 0} 
                        color="success" 
                        sx={{ borderRadius: 1, height: 8 }} 
                      />
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="body2">Products in Stock</Typography>
                        <Typography variant="body2" color="primary">
                          {products.filter(p => p.quantity > 10).length} / {products.length}
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={products.length > 0 ? (products.filter(p => p.quantity > 10).length / products.length) * 100 : 0} 
                        sx={{ borderRadius: 1, height: 8 }} 
                      />
                    </Box>
                    <Box>
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="body2">Low Stock Items</Typography>
                        <Typography variant="body2" color="warning.main">
                          {lowStockProducts.length} items
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={products.length > 0 ? Math.max(0, 100 - (lowStockProducts.length / products.length) * 100) : 100} 
                        color="warning" 
                        sx={{ borderRadius: 1, height: 8 }} 
                      />
                    </Box>
                  </Box>
                </CardContent>
              </AnalyticsCard>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Products Tab */}
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <AnalyticsCard>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Product Overview</Typography>
                  <Divider sx={{ mb: 2 }} />
                  {products.length > 0 ? (
                    <List sx={{ py: 0 }}>
                      {products.slice(0, 10).map((product, idx) => (
                        <ListItem key={idx} sx={{ px: 0, py: 1 }}>
                          <ListItemText 
                            primary={product.name || `Product ${idx + 1}`}
                            secondary={`SKU: ${product.sku || 'N/A'} | Quantity: ${product.quantity || 0} | Category: ${product.category?.name || 'Uncategorized'}`}
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
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Stock Movements & Transfers</Typography>
                  <Divider sx={{ mb: 2 }} />
                  {/* Display both pending transfers and completed movements */}
                  {(pendingTransfers.length > 0 || stockMovements.length > 0) ? (
                    <List sx={{ py: 0 }}>
                      {/* Show pending transfers first */}
                      {pendingTransfers.slice(0, 5).map((transfer, idx) => (
                        <ListItem key={`transfer-${idx}`} sx={{ px: 0, py: 1 }}>
                          <ListItemText 
                            primary={`Transfer Request: ${transfer.product?.name || transfer.product_name || 'Unknown Product'}`}
                            secondary={`${transfer.quantity || 0} units from ${transfer.from_location} to ${transfer.to_location} | ${new Date(transfer.created_at).toLocaleDateString()}`}
                            primaryTypographyProps={{ fontWeight: 500 }}
                          />
                          <Chip 
                            label={transfer.status === 'pending' ? 'Pending Approval' : transfer.status === 'pending_approval' ? 'Awaiting Approval' : 'In Progress'}
                            size="small" 
                            color={transfer.status === 'pending' || transfer.status === 'pending_approval' ? 'warning' : 'info'}
                          />
                        </ListItem>
                      ))}
                      {/* Show actual stock movements if any */}
                      {stockMovements.slice(0, 5).map((movement, idx) => (
                        <ListItem key={`movement-${idx}`} sx={{ px: 0, py: 1 }}>
                          <ListItemText 
                            primary={`${movement.movement_type || 'Movement'} - ${movement.product?.name || 'Unknown Product'}`}
                            secondary={`Quantity: ${movement.quantity || 0} | Date: ${movement.date || 'N/A'}`}
                            primaryTypographyProps={{ fontWeight: 500 }}
                          />
                          <Chip 
                            label={movement.movement_type === 'IN' ? 'Stock In' : 'Stock Out'}
                            size="small" 
                            color={movement.movement_type === 'IN' ? 'success' : 'warning'}
                          />
                        </ListItem>
                      ))}
                      {/* Show message if no recent activity */}
                      {pendingTransfers.length === 0 && stockMovements.length === 0 && (
                        <ListItem sx={{ px: 0, py: 2 }}>
                          <ListItemText 
                            primary="No recent stock movements or transfers"
                            secondary="Create a transfer request to see activity here"
                          />
                        </ListItem>
                      )}
                    </List>
                  ) : (
                    <Alert severity="info" sx={{ borderRadius: 2 }}>
                      No stock movements or transfers yet. Create a transfer request to see activity here.
                    </Alert>
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
                moduleId="inventory" 
                title="Inventory Transaction Flow"
              />
            </Grid>
            
            {/* Time-Based Analytics */}
            <Grid item xs={12} md={6}>
              <TimeBasedAnalytics 
                moduleId="inventory" 
                title="Inventory Trends Analysis"
              />
            </Grid>
            
            {/* Advanced Analytics with Charts */}
            <Grid item xs={12}>
              <AdvancedAnalytics 
                moduleId="inventory" 
                title="Inventory Performance Analytics"
                data={{
                  total_value: 125000,
                  pending_orders: 45,
                  warehouses: 3,
                  suppliers: 12
                }}
              />
            </Grid>
            
            {/* Gantt Chart for Inventory Projects */}
            <Grid item xs={12}>
              <GanttChart 
                title="Inventory Management Timeline"
                projects={[
                  {
                    id: 1,
                    name: 'Stock Replenishment',
                    type: 'inventory',
                    manager: 'Inventory Manager',
                    status: 'in-progress',
                    priority: 'high',
                    startDate: new Date('2024-01-01'),
                    endDate: new Date('2024-02-28'),
                    progress: 70,
                    budget: 75000,
                    team: ['Warehouse Staff', 'Procurement Team', 'Quality Control'],
                    tasks: [
                      {
                        id: 101,
                        name: 'Stock Assessment',
                        startDate: new Date('2024-01-01'),
                        endDate: new Date('2024-01-15'),
                        progress: 100,
                        status: 'completed',
                        assignee: 'Warehouse Staff',
                        dependencies: []
                      },
                      {
                        id: 102,
                        name: 'Supplier Negotiations',
                        startDate: new Date('2024-01-10'),
                        endDate: new Date('2024-01-25'),
                        progress: 90,
                        status: 'in-progress',
                        assignee: 'Procurement Team',
                        dependencies: [101]
                      },
                      {
                        id: 103,
                        name: 'Order Placement',
                        startDate: new Date('2024-01-20'),
                        endDate: new Date('2024-02-05'),
                        progress: 60,
                        status: 'in-progress',
                        assignee: 'Procurement Team',
                        dependencies: [102]
                      },
                      {
                        id: 104,
                        name: 'Goods Receipt & Quality Check',
                        startDate: new Date('2024-02-01'),
                        endDate: new Date('2024-02-20'),
                        progress: 30,
                        status: 'in-progress',
                        assignee: 'Quality Control',
                        dependencies: [103]
                      },
                      {
                        id: 105,
                        name: 'Stock Update & Distribution',
                        startDate: new Date('2024-02-15'),
                        endDate: new Date('2024-02-28'),
                        progress: 10,
                        status: 'pending',
                        assignee: 'Warehouse Staff',
                        dependencies: [104]
                      }
                    ]
                  }
                ]}
              />
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>

      {/* Warehouse Transfer Dialog */}
      <Dialog open={warehouseTransferOpen} onClose={() => setWarehouseTransferOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Typography variant="h6" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center' }}>
            <SwapHorizIcon sx={{ mr: 1, color: '#9C27B0' }} />
            Transfer Stock Between Warehouses
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            {/* Debug Info */}
            {process.env.NODE_ENV === 'development' && (
              <Box sx={{ mb: 2, p: 1, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                <Typography variant="caption" display="block">
                  Debug: Products: {products.length}, Warehouses: {warehouses.length}
                </Typography>
              </Box>
            )}
            <FormControl fullWidth margin="normal">
              <InputLabel>Product</InputLabel>
              <Select
                value={transferForm.product}
                onChange={(e) => handleTransferFormChange('product', e.target.value)}
                label="Product"
              >
                {products.length > 0 ? (
                  products.map((product) => (
                    <MenuItem key={product.id} value={product.id}>
                      {product.name} (Stock: {product.quantity || 0})
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled>
                    {products.length === 0 ? 'Loading products...' : 'No products available'}
                  </MenuItem>
                )}
              </Select>
            </FormControl>
            
            <TextField
              fullWidth
              margin="normal"
              label="Quantity"
              type="number"
              value={transferForm.quantity}
              onChange={(e) => handleTransferFormChange('quantity', e.target.value)}
              inputProps={{ min: 1 }}
            />
            
            <FormControl fullWidth margin="normal">
              <InputLabel>From Warehouse</InputLabel>
              <Select
                value={transferForm.fromWarehouse}
                onChange={(e) => handleTransferFormChange('fromWarehouse', e.target.value)}
                label="From Warehouse"
              >
                {warehouses.length > 0 ? (
                  warehouses.map((warehouse) => (
                    <MenuItem key={warehouse.id} value={warehouse.name}>
                      {warehouse.name} ({warehouse.code || 'N/A'})
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled>
                    {warehouses.length === 0 ? 'Loading warehouses...' : 'No warehouses available'}
                  </MenuItem>
                )}
              </Select>
            </FormControl>
            
            <FormControl fullWidth margin="normal">
              <InputLabel>To Warehouse</InputLabel>
              <Select
                value={transferForm.toWarehouse}
                onChange={(e) => handleTransferFormChange('toWarehouse', e.target.value)}
                label="To Warehouse"
              >
                {warehouses.length > 0 ? (
                  warehouses.map((warehouse) => (
                    <MenuItem key={warehouse.id} value={warehouse.name}>
                      {warehouse.name} ({warehouse.code || 'N/A'})
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled>
                    {warehouses.length === 0 ? 'Loading warehouses...' : 'No warehouses available'}
                  </MenuItem>
                )}
              </Select>
            </FormControl>
            
            {transferForm.fromWarehouse === transferForm.toWarehouse && transferForm.fromWarehouse && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                Source and destination warehouses cannot be the same.
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setWarehouseTransferOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleWarehouseTransfer}
            variant="contained"
            disabled={!transferForm.product || !transferForm.quantity || !transferForm.fromWarehouse || !transferForm.toWarehouse || transferForm.fromWarehouse === transferForm.toWarehouse}
            sx={{ 
              background: 'linear-gradient(45deg, #9C27B0 30%, #BA68C8 90%)',
              '&:hover': { background: 'linear-gradient(45deg, #7B1FA2 30%, #9C27B0 90%)' }
            }}
          >
            Transfer Stock
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InventoryDashboard;

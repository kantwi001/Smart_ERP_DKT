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
  
  const [warehouseTransferOpen, setWarehouseTransferOpen] = useState(false);
  const [transferForm, setTransferForm] = useState({
    product: '',
    quantity: '',
    fromWarehouse: '',
    toWarehouse: ''
  });

  // Fetch dashboard data
  const fetchDashboardData = React.useCallback(async () => {
    try {
      setLoading(true);
      const [productsRes, movementsRes, categoriesRes, warehousesRes] = await Promise.all([
        api.get('/inventory/products/', { headers: { Authorization: `Bearer ${token}` } }).catch(e => ({ data: [] })),
        api.get('/inventory/stock-movements/', { headers: { Authorization: `Bearer ${token}` } }).catch(e => ({ data: [] })),
        api.get('/inventory/categories/', { headers: { Authorization: `Bearer ${token}` } }).catch(e => ({ data: [] })),
        api.get('/warehouse/', { headers: { Authorization: `Bearer ${token}` } }).catch(e => ({ data: [] }))
      ]);
      
      setProducts(productsRes.data || []);
      setStockMovements(movementsRes.data || []);
      setCategories(categoriesRes.data || []);
      setWarehouses(warehousesRes.data || []);
      setLowStockItems(productsRes.data?.filter(p => p.quantity < 10) || []);
      setLowStockProducts(productsRes.data?.filter(p => p.quantity < (p.reorder_level || 10)) || []);
      
      try {
        const transfersRes = await api.get('/inventory/transfers/', { 
          headers: { Authorization: `Bearer ${token}` },
          params: { status: 'pending' }
        });
        setPendingTransfers(transfersRes.data || []);
      } catch (err) {
        setPendingTransfers([]);
      }
      
      const recentMovements = movementsRes.data?.slice(0, 5).map(movement => ({
        action: `${movement.movement_type || 'Stock movement'}: ${movement.product_name || 'Product'} - ${movement.quantity || 0} units`,
        timestamp: movement.created_at ? new Date(movement.created_at).toLocaleString() : 'Unknown time',
        type: movement.movement_type === 'IN' ? 'success' : movement.movement_type === 'OUT' ? 'warning' : 'info'
      })) || [];
      
      setRecentActivity(recentMovements);
    } catch (err) {
      setError('Failed to load inventory data');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

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
          <StyledTab icon={<CategoryIcon />} label="Products" />
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
                      startIcon={<AddIcon />}
                      onClick={() => window.location.href = '/inventory/management'}
                      sx={{
                        borderColor: '#9C27B0',
                        color: '#9C27B0',
                        '&:hover': { 
                          borderColor: '#7B1FA2',
                          color: '#7B1FA2',
                          bgcolor: 'rgba(156, 39, 176, 0.04)'
                        },
                        borderRadius: 2,
                        px: 3,
                        py: 1.5
                      }}
                    >
                      Add Product
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<RefreshIcon />}
                      onClick={fetchDashboardData}
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
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Stock Movements</Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Alert severity="info" sx={{ borderRadius: 2 }}>
                    Stock movements will be displayed here.
                  </Alert>
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
                        { category: 'Condoms', value: 45000, percentage: 35, color: '#4CAF50' },
                        { category: 'Contraceptives', value: 38000, percentage: 30, color: '#2196F3' },
                        { category: 'Medical Supplies', value: 25000, percentage: 20, color: '#FF9800' },
                        { category: 'Other Products', value: 19000, percentage: 15, color: '#9C27B0' }
                      ].map((item, idx) => (
                        <Box key={item.category}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {item.category}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              GHS {item.value.toLocaleString()}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ flex: 1 }}>
                              <LinearProgress 
                                variant="determinate" 
                                value={item.percentage} 
                                sx={{ 
                                  height: 6, 
                                  borderRadius: 3,
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
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
                      <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'success.light', color: 'success.contrastText' }}>
                        <Typography variant="h5">330</Typography>
                        <Typography variant="caption">Weekly Movements</Typography>
                      </Paper>
                      <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'info.light', color: 'info.contrastText' }}>
                        <Typography variant="h5">47</Typography>
                        <Typography variant="caption">Daily Average</Typography>
                      </Paper>
                    </Box>

                    {/* Movement Types */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="body2" color="success.main" sx={{ fontWeight: 600 }}>
                          185 IN
                        </Typography>
                        <Typography variant="caption">Stock In</Typography>
                      </Box>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="body2" color="error.main" sx={{ fontWeight: 600 }}>
                          145 OUT
                        </Typography>
                        <Typography variant="caption">Stock Out</Typography>
                      </Box>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="body2" color="warning.main" sx={{ fontWeight: 600 }}>
                          12 ADJ
                        </Typography>
                        <Typography variant="caption">Adjustments</Typography>
                      </Box>
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
                          count: products.filter(p => p.quantity > 20).length, 
                          percentage: Math.round((products.filter(p => p.quantity > 20).length / Math.max(products.length, 1)) * 100), 
                          color: '#4CAF50' 
                        },
                        { 
                          status: 'Low Stock', 
                          count: lowStockProducts.length, 
                          percentage: Math.round((lowStockProducts.length / Math.max(products.length, 1)) * 100), 
                          color: '#FF9800' 
                       },
                        { 
                          status: 'Out of Stock', 
                          count: products.filter(p => p.quantity === 0).length, 
                          percentage: Math.round((products.filter(p => p.quantity === 0).length / Math.max(products.length, 1)) * 100), 
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
                        <Typography variant="h6">{lowStockProducts.length}</Typography>
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

            {/* Turnover & Performance Analytics */}
            <Grid item xs={12} md={6}>
              <AnalyticsCard>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center' }}>
                    <AssessmentIcon sx={{ mr: 1, color: '#FF5722' }} />
                    Turnover & Performance Analytics
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Box sx={{ height: 300 }}>
                    {/* Inventory Turnover Rate */}
                    <Box sx={{ textAlign: 'center', mb: 3 }}>
                      <Typography variant="h3" color="primary" sx={{ mb: 1 }}>
                        6.2x
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Inventory Turnover Rate
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={87} 
                        sx={{ height: 8, borderRadius: 4, mb: 2 }} 
                        color="success"
                      />
                    </Box>

                    {/* Performance Metrics */}
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

            {/* Warehouse Performance Dashboard */}
            <Grid item xs={12}>
              <AnalyticsCard>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center' }}>
                    <LocalShippingIcon sx={{ mr: 1, color: '#2196F3' }} />
                    Warehouse Performance Dashboard
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Grid container spacing={3}>
                    {/* Top Performing Products */}
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                        Top Moving Products
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {products.slice(0, 4).map((product, idx) => (
                          <Box key={product.id} sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                            <Avatar sx={{ bgcolor: ['#4CAF50', '#2196F3', '#FF9800', '#9C27B0'][idx] }}>
                              {idx + 1}
                            </Avatar>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {product.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {product.category} • {product.quantity} units in stock
                              </Typography>
                            </Box>
                            <Chip 
                              label={`${Math.floor(Math.random() * 50 + 20)} moves`} 
                              color="primary" 
                              size="small"
                              sx={{ fontWeight: 600 }}
                            />
                          </Box>
                        ))}
                      </Box>
                    </Grid>

                    {/* Warehouse Efficiency Metrics */}
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                        Warehouse Efficiency Metrics
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {[
                          { metric: 'Space Utilization', value: 78, color: '#4CAF50' },
                          { metric: 'Pick Accuracy', value: 96, color: '#2196F3' },
                          { metric: 'Order Processing Speed', value: 89, color: '#FF9800' },
                          { metric: 'Inventory Accuracy', value: 94, color: '#9C27B0' }
                        ].map((metric, idx) => (
                          <Box key={metric.metric}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {metric.metric}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {metric.value}%
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Box sx={{ flex: 1 }}>
                                <LinearProgress 
                                  variant="determinate" 
                                  value={metric.value} 
                                  sx={{ 
                                    height: 8, 
                                    borderRadius: 4,
                                    '& .MuiLinearProgress-bar': { bgcolor: metric.color }
                                  }}
                                />
                              </Box>
                              <Typography variant="body2" color={metric.color} sx={{ minWidth: 40, fontWeight: 600 }}>
                                {metric.value}%
                              </Typography>
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    </Grid>
                  </Grid>
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
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl variant="outlined" sx={{ width: '100%' }}>
              <InputLabel id="product-label">Product</InputLabel>
              <Select
                labelId="product-label"
                id="product"
                label="Product"
                value={transferForm.product}
                onChange={(e) => setTransferForm({ ...transferForm, product: e.target.value })}
              >
                {products.map((product) => (
                  <MenuItem key={product.id} value={product.id}>
                    {product.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl variant="outlined" sx={{ width: '100%' }}>
              <InputLabel id="quantity-label">Quantity</InputLabel>
              <TextField
                id="quantity"
                label="Quantity"
                type="number"
                value={transferForm.quantity}
                onChange={(e) => setTransferForm({ ...transferForm, quantity: e.target.value })}
              />
            </FormControl>
            <FormControl variant="outlined" sx={{ width: '100%' }}>
              <InputLabel id="from-warehouse-label">From Warehouse</InputLabel>
              <Select
                labelId="from-warehouse-label"
                id="from-warehouse"
                label="From Warehouse"
                value={transferForm.fromWarehouse}
                onChange={(e) => setTransferForm({ ...transferForm, fromWarehouse: e.target.value })}
              >
                {warehouses.map((warehouse) => (
                  <MenuItem key={warehouse.id} value={warehouse.id}>
                    {warehouse.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl variant="outlined" sx={{ width: '100%' }}>
              <InputLabel id="to-warehouse-label">To Warehouse</InputLabel>
              <Select
                labelId="to-warehouse-label"
                id="to-warehouse"
                label="To Warehouse"
                value={transferForm.toWarehouse}
                onChange={(e) => setTransferForm({ ...transferForm, toWarehouse: e.target.value })}
              >
                {warehouses.map((warehouse) => (
                  <MenuItem key={warehouse.id} value={warehouse.id}>
                    {warehouse.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setWarehouseTransferOpen(false)}>Cancel</Button>
          <Button onClick={() => {
            // Add API call to transfer stock here
            setWarehouseTransferOpen(false);
          }}>Transfer</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InventoryDashboard;

import React, { useState, useEffect, useCallback, useContext } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Select, MenuItem, FormControl, InputLabel, Chip, IconButton, Tooltip, Switch,
  LinearProgress, CircularProgress, Snackbar, Alert, Avatar, Divider, List, ListItem, ListItemText,
  ListItemIcon, Badge, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Accordion, AccordionSummary, AccordionDetails, Tabs, Tab, AppBar, Fade, Grow, Autocomplete
} from '@mui/material';
import {
  Warehouse as WarehouseIcon, Add as AddIcon, TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon, Refresh as RefreshIcon, Search as SearchIcon,
  FilterList as FilterListIcon, ViewList as ViewListIcon, ViewModule as ViewModuleIcon,
  LocationOn as LocationIcon, Inventory as InventoryIcon, LocalShipping as LocalShippingIcon,
  Schedule as ScheduleIcon, CheckCircle as CheckCircleIcon, Warning as WarningIcon,
  Error as ErrorIcon, ExpandMore as ExpandMoreIcon, SupervisorAccount as SupervisorAccountIcon,
  Person as PersonIcon, BarChart as BarChartIcon, LocationOn as LocationOnIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { AuthContext } from './AuthContext';
import api from './api';
import { 
  loadWarehousesWithFallback, 
  loadProductsWithFallback, 
  getGlobalProducts, 
  updateGlobalProduct,
  getGlobalTransferHistory,
  addTransferToHistory,
  updateTransferStatus,
  loadWarehousesWithStock,
  API_BASE_URL
} from './sharedData';

const StyledTabs = styled(Tabs)(() => ({
  backgroundColor: '#fff',
  borderRadius: '12px 12px 0 0',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  '& .MuiTabs-indicator': {
    height: 3,
    borderRadius: '3px 3px 0 0',
    background: 'linear-gradient(45deg, #795548 30%, #5D4037 90%)',
  },
}));

const StyledTab = styled(Tab)(() => ({
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '0.95rem',
  minHeight: 64,
  color: '#666',
  '&.Mui-selected': { color: '#795548' },
}));

const DashboardContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  minHeight: '100vh',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(45deg, rgba(255,255,255,0.1) 0%, transparent 100%)',
    pointerEvents: 'none',
  },
}));

const HeaderCard = styled(Card)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.98)',
  backdropFilter: 'blur(20px)',
  borderRadius: theme.spacing(3),
  marginBottom: theme.spacing(3),
  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  position: 'relative',
  zIndex: 1,
}));

const SmartWarehouseSelector = styled(Card)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(15px)',
  borderRadius: theme.spacing(2),
  marginBottom: theme.spacing(3),
  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  position: 'relative',
  zIndex: 1,
}));

const MetricCard = styled(Card)(({ theme, variant = 'primary' }) => {
  const gradients = {
    primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    success: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    warning: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    info: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    danger: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
  };
  
  return {
    background: gradients[variant],
    color: 'white',
    borderRadius: theme.spacing(2),
    height: '100%',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
    overflow: 'hidden',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'linear-gradient(45deg, rgba(255,255,255,0.1) 0%, transparent 100%)',
      pointerEvents: 'none',
    },
    '&:hover': {
      transform: 'translateY(-8px) scale(1.02)',
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2)',
    },
  };
});

const WarehouseCard = styled(Card)(({ theme, selected, status = 'active' }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'high': return '#4caf50';
      case 'medium': return '#ff9800';
      case 'low': return '#f44336';
      default: return '#667eea';
    }
  };
  
  return {
    background: selected 
      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
      : 'rgba(255, 255, 255, 0.98)',
    color: selected ? 'white' : theme.palette.text.primary,
    borderRadius: theme.spacing(2),
    cursor: 'pointer',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    border: selected ? `3px solid ${getStatusColor()}` : '2px solid transparent',
    position: 'relative',
    overflow: 'hidden',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      width: '4px',
      height: '100%',
      background: getStatusColor(),
      transform: selected ? 'scaleY(1)' : 'scaleY(0)',
      transition: 'transform 0.3s ease',
    },
    '&:hover': {
      transform: 'translateY(-4px) scale(1.02)',
      boxShadow: '0 15px 40px rgba(0, 0, 0, 0.15)',
      border: `2px solid ${getStatusColor()}`,
      '&::before': {
        transform: 'scaleY(1)',
      },
    },
  };
});

const QuickActionButton = styled(Button)(({ theme, variant = 'primary' }) => {
  const variants = {
    primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    success: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    warning: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    danger: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
  };
  
  return {
    background: variants[variant],
    color: 'white',
    borderRadius: theme.spacing(3),
    padding: theme.spacing(1.5, 3),
    textTransform: 'none',
    fontWeight: 600,
    boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)',
    position: 'relative',
    overflow: 'hidden',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: '-100%',
      width: '100%',
      height: '100%',
      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
      transition: 'left 0.6s ease',
    },
    '&:hover': {
      background: variants[variant],
      transform: 'translateY(-3px)',
      boxShadow: '0 12px 35px rgba(102, 126, 234, 0.6)',
      '&::before': {
        left: '100%',
      },
    },
  };
});

function TabPanel({ children, value, index, ...other }) {
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function WarehouseDashboard() {
  const { user, token } = useContext(AuthContext);
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // Enhanced state management
  const [warehouses, setWarehouses] = useState([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [stockMovements, setStockMovements] = useState([]);
  const [warehouseSales, setWarehouseSales] = useState([]);
  const [locations, setLocations] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [userRole, setUserRole] = useState('sales_rep');
  const [userWarehouse, setUserWarehouse] = useState(null);
  const [products, setProducts] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [salesUsers, setSalesUsers] = useState([]); // Add sales users state
  const [warehouseStock, setWarehouseStock] = useState([]); // Add warehouse stock state
  
  // Smart filtering and search
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [realTimeMode, setRealTimeMode] = useState(true);
  
  // Dialog states
  const [stockTransferDialog, setStockTransferDialog] = useState(false);
  const [newLocationDialog, setNewLocationDialog] = useState(false);
  const [analyticsDialog, setAnalyticsDialog] = useState(false);
  const [addWarehouseDialog, setAddWarehouseDialog] = useState(false);
  const [addStockDialog, setAddStockDialog] = useState(false);
  const [quickActionOpen, setQuickActionOpen] = useState(false);
  const [warehouseDetailsOpen, setWarehouseDetailsOpen] = useState(false);
  
  // Form states
  const [transferForm, setTransferForm] = useState({
    fromWarehouse: '', toWarehouse: '', quantity: '', notes: ''
  });
  
  const [locationForm, setLocationForm] = useState({
    name: '', code: '', aisle: '', shelf: '', bin: ''
  });

  const [warehouseForm, setWarehouseForm] = useState({
    name: '', code: '', address: '', capacity: '', manager: ''
  });

  const [stockForm, setStockForm] = useState({
    product: '', warehouse: '', quantity: '', notes: ''
  });

  // Utility functions
  const getWarehouseStockSummary = (warehouse) => {
    // Get warehouse stock data from API or state
    const warehouseStocks = warehouseStock || [];
    const warehouseProducts = warehouseStocks.filter(stock => stock.warehouse === warehouse.id || stock.warehouse_id === warehouse.id);
    
    const totalProducts = warehouseProducts.length;
    const totalStock = warehouseProducts.reduce((sum, stock) => sum + (stock.quantity || 0), 0);
    const lowStockItems = warehouseProducts.filter(stock => (stock.quantity || 0) < (stock.min_stock || 10)).length;
    const outOfStockItems = warehouseProducts.filter(stock => (stock.quantity || 0) === 0).length;
    const capacity = warehouse.capacity || 10000;
    const utilizationPercent = Math.min((totalStock / capacity) * 100, 100);
    
    return {
      totalProducts,
      totalStock,
      lowStockItems,
      outOfStockItems,
      averageStock: totalProducts > 0 ? Math.round(totalStock / totalProducts) : 0,
      stockHealth: totalProducts > 0 ? Math.round(((totalProducts - lowStockItems) / totalProducts) * 100) : 100,
      capacity,
      utilizationPercent
    };
  };

  const getStatusColor = (warehouse) => {
    const summary = getWarehouseStockSummary(warehouse);
    if (summary.lowStockItems > summary.totalProducts * 0.3) return '#f44336'; // Red for critical
    if (summary.lowStockItems > 0) return '#ff9800'; // Orange for warning
    return '#4caf50'; // Green for good
  };

  // Handler functions
  const handleQuickAction = (actionType) => {
    setQuickActionOpen(false);
    switch (actionType) {
      case 'add_stock':
        setAddStockDialog(true);
        break;
      case 'transfer':
        setStockTransferDialog(true);
        break;
      case 'reports':
        setAnalyticsDialog(true);
        break;
      default:
        break;
    }
  };

  const handleViewWarehouseDetails = async (warehouse) => {
    setSelectedWarehouse(warehouse);
    setWarehouseDetailsOpen(true);
    
    // Load warehouse-specific stock data
    await fetchWarehouseDetails(warehouse.id);
  };

  const refreshWarehouses = async () => {
    await fetchWarehouseData();
  };

  // Enhanced data fetching with comprehensive analytics
  const fetchWarehouseData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      
      console.log('📦 [WarehouseDashboard] Loading warehouse data...');
      
      // Load warehouses directly from API
      const warehousesResponse = await api.get('/warehouse/');
      const warehouses = warehousesResponse.data;
      setWarehouses(warehouses);
      
      // Load products from inventory API
      const productsResponse = await api.get('/inventory/products/');
      const products = productsResponse.data;
      setProducts(products);
      
      // Load warehouse stock data
      const warehouseStockResponse = await api.get('/warehouse/stock/');
      const warehouseStockData = warehouseStockResponse.data;
      setWarehouseStock(warehouseStockData);
      
      console.log('✅ [WarehouseDashboard] Data loaded successfully:');
      console.log('   - Warehouses count:', warehouses?.length || 0);
      console.log('   - Products count:', products?.length || 0);
      console.log('   - Warehouse stock records:', warehouseStockData?.length || 0);
      
      // Update global state for cross-module synchronization
      if (window.globalWarehouses) {
        window.globalWarehouses = warehouses;
      }
      if (window.globalProducts) {
        window.globalProducts = products;
      }
      
      // Dispatch events for other modules to sync
      window.dispatchEvent(new CustomEvent('warehousesUpdated', { 
        detail: { warehouses: warehouses, source: 'warehouse_dashboard' } 
      }));
      window.dispatchEvent(new CustomEvent('productsUpdated', { 
        detail: { products: products, source: 'warehouse_dashboard' } 
      }));
      
      // Load additional data
      const transfersData = await getGlobalTransferHistory();
      setTransfers(transfersData);
      
    } catch (error) {
      console.error('❌ [WarehouseDashboard] Error fetching warehouse data:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      setError('Failed to load warehouse data. Please try again.');
      
      // Fallback to shared data
      console.log('🔄 [WarehouseDashboard] Attempting fallback data loading...');
      const fallbackProducts = getGlobalProducts();
      console.log('📦 [WarehouseDashboard] Fallback products count:', fallbackProducts?.length || 0);
      
      // Direct API call instead of loadWarehousesWithFallback
      let fallbackWarehouses = [];
      try {
        console.log('🏭 [WarehouseDashboard] Making direct warehouse API call...');
        const response = await fetch(`${API_BASE_URL}/api/warehouse/`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        });
        console.log('🌐 [WarehouseDashboard] Warehouse API response status:', response.status);
        if (response.ok) {
          fallbackWarehouses = await response.json();
          console.log('✅ [WarehouseDashboard] Fallback warehouses loaded:', fallbackWarehouses?.length || 0);
        } else {
          console.warn('⚠️ [WarehouseDashboard] Warehouse API failed:', response.statusText);
        }
      } catch (fallbackError) {
        console.error('❌ [WarehouseDashboard] Fallback warehouse loading failed:', fallbackError);
      }
      
      setProducts(fallbackProducts || []);
      setWarehouses(fallbackWarehouses || []);
    } finally {
      setLoading(false);
    }
  }, []);

  // Listen for product updates from other modules
  useEffect(() => {
    const handleProductUpdate = (event) => {
      const { products: updatedProducts, source } = event.detail;
      if (source !== 'warehouse_dashboard') {
        setProducts(updatedProducts);
        // Update global state
        if (window.globalProducts) {
          window.globalProducts = updatedProducts;
        }
      }
    };

    const handleWarehouseUpdate = (event) => {
      const { warehouses: updatedWarehouses, source } = event.detail;
      if (source !== 'warehouse_dashboard') {
        setWarehouses(updatedWarehouses);
        // Update global state
        if (window.globalWarehouses) {
          window.globalWarehouses = updatedWarehouses;
        }
      }
    };

    window.addEventListener('productsUpdated', handleProductUpdate);
    window.addEventListener('warehousesUpdated', handleWarehouseUpdate);

    return () => {
      window.removeEventListener('productsUpdated', handleProductUpdate);
      window.removeEventListener('warehousesUpdated', handleWarehouseUpdate);
    };
  }, []);

  const loadTransfers = async () => {
    try {
      const transferHistory = getGlobalTransferHistory();
      setTransfers(transferHistory);
      console.log('[Warehouse Dashboard] Loaded transfers:', transferHistory.length);
    } catch (error) {
      console.error('[Warehouse Dashboard] Failed to load transfers:', error);
      setSnackbar({ open: true, message: 'Failed to load transfers', severity: 'error' });
    }
  };

  useEffect(() => {
    const handleTransferHistoryUpdate = (event) => {
      setTransfers(event.detail);
      console.log('[Warehouse Dashboard] Transfer history updated:', event.detail.length);
    };

    window.addEventListener('transferHistoryUpdated', handleTransferHistoryUpdate);
    return () => window.removeEventListener('transferHistoryUpdated', handleTransferHistoryUpdate);
  }, []);

  const fetchWarehouseDetails = async (warehouseId) => {
    try {
      console.log(`🔍 [Warehouse Details] Loading data for warehouse ${warehouseId}`);
      
      // Try to load warehouse-specific stock data first
      let warehouseInventory = [];
      try {
        const warehouseStockRes = await api.get(`/warehouse/stock/?warehouse=${warehouseId}`);
        warehouseInventory = warehouseStockRes.data.results || warehouseStockRes.data || [];
        console.log(`📦 [Warehouse Stock] Loaded ${warehouseInventory.length} stock records from API`);
      } catch (stockError) {
        console.warn(`⚠️ [Warehouse Stock] API failed, trying fallback:`, stockError.message);
        
        // Fallback: Filter global products by warehouse or show all products
        const allProducts = getGlobalProducts() || products || [];
        warehouseInventory = allProducts.map(product => ({
          id: `${product.id}-${warehouseId}`,
          product_id: product.id,
          product_name: product.name,
          product_sku: product.sku,
          product: product,
          warehouse: warehouseId,
          quantity: product.quantity || 0,
          min_stock: product.min_stock || product.reorder_level || 10,
          unit_price: product.unit_price || 0,
          created_at: product.created_at,
          updated_at: product.updated_at
        }));
        console.log(`📦 [Warehouse Stock] Using fallback with ${warehouseInventory.length} products`);
      }
      
      setInventory(warehouseInventory);
      
      // Load other warehouse details
      const [movementsRes, salesRes, locationsRes, customersRes] = await Promise.allSettled([
        api.get(`/warehouse/movements/?warehouse=${warehouseId}`),
        api.get(`/sales/?staff__managed_warehouse=${warehouseId}`).catch(() => ({ data: { results: [] } })),
        api.get(`/warehouse/locations/?warehouse=${warehouseId}`),
        api.get(`/customers/?warehouse=${warehouseId}`).catch(() => ({ data: { results: [] } }))
      ]);
      
      if (movementsRes.status === 'fulfilled') {
        const movements = movementsRes.value.data.results || movementsRes.value.data;
        setStockMovements(movements);
      }
      
      if (salesRes.status === 'fulfilled') {
        const sales = salesRes.value.data.results || salesRes.value.data;
        setWarehouseSales(sales);
      }
      
      if (locationsRes.status === 'fulfilled') {
        setLocations(locationsRes.value.data.results || locationsRes.value.data);
      }
      
      if (customersRes.status === 'fulfilled') {
        setCustomers(customersRes.value.data.results || customersRes.value.data);
      }
      
      // Generate analytics from fetched data
      await generateAnalytics(warehouseId);
      
    } catch (error) {
      console.error('❌ [Warehouse Details] Error fetching warehouse details:', error);
      
      // Final fallback: Use global products
      const fallbackProducts = getGlobalProducts() || products || [];
      const fallbackInventory = fallbackProducts.map(product => ({
        id: `${product.id}-${warehouseId}`,
        product_id: product.id,
        product_name: product.name,
        product_sku: product.sku,
        product: product,
        warehouse: warehouseId,
        quantity: product.quantity || 0,
        min_stock: product.min_stock || product.reorder_level || 10,
        unit_price: product.unit_price || 0,
        created_at: product.created_at,
        updated_at: product.updated_at
      }));
      
      setInventory(fallbackInventory);
      console.log(`📦 [Warehouse Details] Using final fallback with ${fallbackInventory.length} products`);
    }
  };

  const generateAnalytics = async (warehouseId) => {
    try {
      const analyticsData = {
        stockTurnover: calculateStockTurnover(),
        agingAnalysis: calculateAgingAnalysis(),
        performanceMetrics: calculatePerformanceMetrics(),
        customerInsights: calculateCustomerInsights(),
        predictiveAnalytics: calculatePredictiveAnalytics()
      };
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Error generating analytics:', error);
    }
  };
  
  // Analytics calculation functions
  const calculateStockTurnover = () => {
    // Calculate stock turnover rate based on movements
    const totalMovements = stockMovements.length;
    const inMovements = stockMovements.filter(m => m.movement_type === 'IN').length;
    const outMovements = stockMovements.filter(m => m.movement_type === 'OUT').length;
    
    return {
      turnoverRate: totalMovements > 0 ? (outMovements / inMovements * 100).toFixed(2) : 0,
      totalMovements,
      inMovements,
      outMovements
    };
  };
  
  const calculateAgingAnalysis = () => {
    // Calculate inventory aging analysis
    const now = new Date();
    const aging = {
      fresh: 0, // < 30 days
      moderate: 0, // 30-90 days
      old: 0, // > 90 days
    };
    
    inventory.forEach(item => {
      const itemDate = new Date(item.created_at || item.updated_at);
      const daysDiff = Math.floor((now - itemDate) / (1000 * 60 * 60 * 24));
      
      if (daysDiff < 30) aging.fresh++;
      else if (daysDiff < 90) aging.moderate++;
      else aging.old++;
    });
    
    return aging;
  };
  
  const calculatePerformanceMetrics = () => {
    // Calculate warehouse performance metrics
    const totalSales = warehouseSales.reduce((sum, sale) => sum + (parseFloat(sale.total_amount) || 0), 0);
    const avgOrderValue = warehouseSales.length > 0 ? totalSales / warehouseSales.length : 0;
    
    return {
      totalSales: totalSales.toFixed(2),
      avgOrderValue: avgOrderValue.toFixed(2),
      totalOrders: warehouseSales.length,
      utilizationRate: locations.length > 0 ? ((inventory.length / locations.length) * 100).toFixed(2) : 0
    };
  };
  
  const calculateCustomerInsights = () => {
    // Calculate customer insights
    const uniqueCustomers = new Set(warehouseSales.map(sale => sale.customer_id)).size;
    const repeatCustomers = warehouseSales.reduce((acc, sale) => {
      acc[sale.customer_id] = (acc[sale.customer_id] || 0) + 1;
      return acc;
    }, {});
    
    const repeatCustomerCount = Object.values(repeatCustomers).filter(count => count > 1).length;
    
    return {
      totalCustomers: customers.length,
      uniqueCustomers,
      repeatCustomers: repeatCustomerCount,
      customerRetentionRate: uniqueCustomers > 0 ? ((repeatCustomerCount / uniqueCustomers) * 100).toFixed(2) : 0
    };
  };
  
  const calculatePredictiveAnalytics = () => {
    // Simple predictive analytics based on trends
    const recentSales = warehouseSales.slice(-30); // Last 30 sales
    const avgDailySales = recentSales.length / 30;
    const projectedMonthlySales = avgDailySales * 30;
    
    return {
      projectedMonthlySales: projectedMonthlySales.toFixed(0),
      trendDirection: recentSales.length > 15 ? 'up' : recentSales.length > 5 ? 'stable' : 'down',
      riskLevel: inventory.length < 10 ? 'high' : inventory.length < 50 ? 'medium' : 'low'
    };
  };
  
  // Helper functions for warehouse selector
  const getWarehouseStatus = (warehouse) => {
    const utilization = getCapacityUtilization(warehouse);
    if (utilization > 80) return 'high';
    if (utilization > 60) return 'medium';
    return 'low';
  };
  
  const getCapacityUtilization = (warehouse) => {
    // Calculate capacity utilization based on inventory vs capacity
    if (!warehouse.capacity) return 0;
    const inventoryCount = getWarehouseInventoryCount(warehouse);
    return Math.min(100, Math.round((inventoryCount / warehouse.capacity) * 100));
  };
  
  const getWarehouseInventoryCount = (warehouse) => {
    // Return mock inventory count based on warehouse ID
    return Math.floor(Math.random() * 100) + 10;
  };

  const getWarehouseProducts = (warehouse) => {
    // Return real products filtered by warehouse or use global products as fallback
    if (products && products.length > 0) {
      // Filter products that might be associated with this warehouse
      // For now, return all products as each warehouse can potentially have any product
      return products.map(product => ({
        id: product.id,
        name: product.name,
        sku: product.sku,
        quantity: product.quantity || 0
      }));
    }
    
    // Fallback to mock data if no real products available
    const mockProducts = [];
    for (let i = 0; i < getWarehouseProductCount(warehouse); i++) {
      mockProducts.push({
        id: i,
        name: `Product ${i}`,
        quantity: Math.floor(Math.random() * 100) + 1
      });
    }
    return mockProducts;
  };

  const getWarehouseProductCount = (warehouse) => {
    // Return real product count or mock count
    if (products && products.length > 0) {
      return products.length;
    }
    return Math.floor(Math.random() * 50) + 5;
  };

  useEffect(() => {
    fetchWarehouseData();
  }, []);
  
  const handleWarehouseSelect = async (warehouse) => {
    setSelectedWarehouse(warehouse);
    await fetchWarehouseDetails(warehouse.id);
  };
  
  const handleStockTransfer = async () => {
    try {
      await api.post('/warehouse/movements/', {
        warehouse: transferForm.fromWarehouse,
        movement_type: 'out',
        quantity: parseInt(transferForm.quantity),
        reference: `Transfer to warehouse ${transferForm.toWarehouse}`,
        notes: transferForm.notes
      });
      
      await api.post('/warehouse/movements/', {
        warehouse: transferForm.toWarehouse,
        movement_type: 'in',
        quantity: parseInt(transferForm.quantity),
        reference: `Transfer from warehouse ${transferForm.fromWarehouse}`,
        notes: transferForm.notes
      });
      
      setSnackbar({ open: true, message: 'Stock transfer completed successfully!', severity: 'success' });
      setStockTransferDialog(false);
      setTransferForm({ fromWarehouse: '', toWarehouse: '', quantity: '', notes: '' });
      
      if (selectedWarehouse) {
        await fetchWarehouseDetails(selectedWarehouse.id);
      }
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to complete stock transfer', severity: 'error' });
    }
  };
  
  const handleAddLocation = async () => {
    try {
      await api.post('/warehouse/locations/', {
        warehouse: selectedWarehouse.id,
        name: locationForm.name,
        code: locationForm.code,
        aisle: locationForm.aisle,
        shelf: locationForm.shelf,
        bin: locationForm.bin
      });
      
      setSnackbar({ open: true, message: 'Location added successfully!', severity: 'success' });
      setNewLocationDialog(false);
      setLocationForm({ name: '', code: '', aisle: '', shelf: '', bin: '' });
      
      if (selectedWarehouse) {
        await fetchWarehouseDetails(selectedWarehouse.id);
      }
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to add location', severity: 'error' });
    }
  };

  const handleAddWarehouse = async () => {
    try {
      // Validate required fields
      if (!warehouseForm.name || !warehouseForm.code || !warehouseForm.address) {
        setSnackbar({ 
          open: true, 
          message: 'Please fill in all required fields (Name, Code, Address)', 
          severity: 'error' 
        });
        return;
      }

      if (!warehouseForm.capacity || parseInt(warehouseForm.capacity) <= 0) {
        setSnackbar({ 
          open: true, 
          message: 'Please enter a valid capacity greater than 0', 
          severity: 'error' 
        });
        return;
      }

      const warehouseData = {
        name: warehouseForm.name,
        code: warehouseForm.code,
        address: warehouseForm.address,
        capacity: parseInt(warehouseForm.capacity),
        manager: warehouseForm.manager && warehouseForm.manager.trim() !== '' ? parseInt(warehouseForm.manager) : null
      };

      console.log('Creating warehouse with data:', warehouseData);

      const response = await api.post('/warehouse/create/', warehouseData);
      
      console.log('Warehouse created successfully:', response.data);
      
      setSnackbar({ open: true, message: 'Warehouse added successfully!', severity: 'success' });
      setAddWarehouseDialog(false);
      setWarehouseForm({ name: '', code: '', address: '', capacity: '', manager: '' });
      
      // Refresh warehouse data
      await fetchWarehouseData();
    } catch (error) {
      console.error('Error creating warehouse:', error);
      console.error('Error response data:', error.response?.data);
      console.error('Error response status:', error.response?.status);
      console.error('Error response headers:', error.response?.headers);
      
      let errorMessage = 'Failed to add warehouse';
      
      if (error.response?.data) {
        const errorData = error.response.data;
        console.error('Detailed error data:', JSON.stringify(errorData, null, 2));
        
        // Handle specific validation errors
        if (errorData.code && Array.isArray(errorData.code)) {
          errorMessage = `Code error: ${errorData.code[0]}`;
        } else if (errorData.code && errorData.code.includes('unique')) {
          errorMessage = 'Warehouse code already exists. Please use a different code.';
        } else if (errorData.name && Array.isArray(errorData.name)) {
          errorMessage = `Name error: ${errorData.name[0]}`;
        } else if (errorData.address && Array.isArray(errorData.address)) {
          errorMessage = `Address error: ${errorData.address[0]}`;
        } else if (errorData.capacity && Array.isArray(errorData.capacity)) {
          errorMessage = `Capacity error: ${errorData.capacity[0]}`;
        } else if (errorData.manager && Array.isArray(errorData.manager)) {
          errorMessage = `Manager error: ${errorData.manager[0]}`;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else {
          // Show all validation errors
          const errors = [];
          Object.keys(errorData).forEach(key => {
            if (Array.isArray(errorData[key])) {
              errors.push(`${key}: ${errorData[key][0]}`);
            } else {
              errors.push(`${key}: ${errorData[key]}`);
            }
          });
          if (errors.length > 0) {
            errorMessage = errors.join(', ');
          }
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    }
  };

  const handleAddStock = async () => {
    try {
      // Validate form data
      if (!stockForm.product || !stockForm.warehouse || !stockForm.quantity) {
        setSnackbar({ open: true, message: 'Please select a product, warehouse and enter quantity', severity: 'error' });
        return;
      }

      if (parseInt(stockForm.quantity) <= 0) {
        setSnackbar({ open: true, message: 'Quantity must be greater than 0', severity: 'error' });
        return;
      }

      // Find selected product and warehouse
      const selectedProduct = products.find(p => p.id === parseInt(stockForm.product));
      const selectedWarehouseData = warehouses.find(w => w.id === parseInt(stockForm.warehouse));
      
      if (!selectedProduct) {
        setSnackbar({ open: true, message: 'Selected product not found', severity: 'error' });
        return;
      }

      console.log('[Warehouse Dashboard] Adding stock:', {
        product: selectedProduct.name,
        currentStock: selectedProduct.quantity,
        addingQuantity: stockForm.quantity,
        warehouse: selectedWarehouseData?.name
      });

      // Create a stock movement entry with product details
      const newStockMovement = {
        id: Date.now(),
        product_id: selectedProduct.id,
        product_name: selectedProduct.name,
        product_sku: selectedProduct.sku,
        warehouse_name: selectedWarehouseData.name,
        movement_type: 'STOCK_IN',
        quantity: parseInt(stockForm.quantity),
        previous_stock: selectedProduct.quantity || 0,
        new_stock: (selectedProduct.quantity || 0) + parseInt(stockForm.quantity),
        notes: stockForm.notes || `Stock addition: ${selectedProduct.name} to ${selectedWarehouseData.name}`,
        created_at: new Date().toISOString(),
        status: 'completed',
        requested_by: 'Warehouse Manager'
      };

      // Update stock movements state
      setStockMovements(prev => [newStockMovement, ...prev]);

      // Update product quantity in products state
      const updatedProducts = products.map(product => {
        if (product.id === parseInt(stockForm.product)) {
          return {
            ...product,
            quantity: (product.quantity || 0) + parseInt(stockForm.quantity)
          };
        }
        return product;
      });
      setProducts(updatedProducts);

      // Update global product state to sync across all modules
      const newQuantity = (selectedProduct.quantity || 0) + parseInt(stockForm.quantity);
      updateGlobalProduct(selectedProduct.id, { quantity: newQuantity });

      console.log('[Warehouse Dashboard] Updated global product quantity:', {
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        oldQuantity: selectedProduct.quantity || 0,
        newQuantity: newQuantity
      });

      // Update warehouse current stock if available
      const updatedWarehouses = warehouses.map(warehouse => {
        if (warehouse.id === parseInt(stockForm.warehouse)) {
          return {
            ...warehouse,
            current_stock: (warehouse.current_stock || 0) + parseInt(stockForm.quantity)
          };
        }
        return warehouse;
      });
      setWarehouses(updatedWarehouses);

      // Update selected warehouse if it matches
      if (selectedWarehouse && selectedWarehouse.id === parseInt(stockForm.warehouse)) {
        setSelectedWarehouse({
          ...selectedWarehouse,
          current_stock: (selectedWarehouse.current_stock || 0) + parseInt(stockForm.quantity)
        });
      }

      setSnackbar({ 
        open: true, 
        message: `Successfully added ${stockForm.quantity} units of ${selectedProduct.name} to ${selectedWarehouseData.name}! New stock: ${(selectedProduct.quantity || 0) + parseInt(stockForm.quantity)}`, 
        severity: 'success' 
      });
      setAddStockDialog(false);
      setStockForm({ product: '', warehouse: '', quantity: '', notes: '' });
      
      console.log('[Warehouse Dashboard] Stock added successfully:', newStockMovement);
    } catch (error) {
      console.error('[Warehouse Dashboard] Error adding stock:', error);
      setSnackbar({ open: true, message: 'Failed to add stock', severity: 'error' });
    }
  };

  // Listen for global product updates
  useEffect(() => {
    const handleProductsUpdate = (event) => {
      setProducts(event.detail);
    };

    window.addEventListener('productsUpdated', handleProductsUpdate);
    return () => window.removeEventListener('productsUpdated', handleProductsUpdate);
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} sx={{ color: '#795548' }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
        <Button onClick={fetchWarehouseData} sx={{ ml: 2 }}>Retry</Button>
      </Alert>
    );
  }

  return (
    <DashboardContainer>
      <HeaderCard>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: '#667eea', width: 56, height: 56 }}>
                <WarehouseIcon sx={{ fontSize: 28 }} />
              </Avatar>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#333', mb: 1 }}>
                  Warehouse Management
                </Typography>
                <Typography variant="body1" sx={{ color: '#666' }}>
                  Manage inventory across all warehouse locations
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setQuickActionOpen(true)}
                sx={{
                  background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                  borderRadius: 3,
                  px: 3,
                  py: 1.5,
                  '&:hover': {
                    background: 'linear-gradient(45deg, #5a6fd8 30%, #6a4190 90%)',
                  }
                }}
              >
                Quick Actions
              </Button>
              <IconButton
                onClick={fetchWarehouseData}
                disabled={loading}
                sx={{
                  bgcolor: 'rgba(102, 126, 234, 0.1)',
                  color: '#667eea',
                  '&:hover': { bgcolor: 'rgba(102, 126, 234, 0.2)' }
                }}
              >
                <RefreshIcon />
              </IconButton>
            </Box>
          </Box>

          {/* Warehouse Selection Cards */}
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Select Warehouse Location
          </Typography>
          <Grid container spacing={3}>
            {warehouses.map((warehouse) => {
              const stockSummary = getWarehouseStockSummary(warehouse);
              const isSelected = selectedWarehouse?.id === warehouse.id;
              
              return (
                <Grid item xs={12} sm={6} md={4} key={warehouse.id}>
                  <WarehouseCard
                    selected={isSelected}
                    status={stockSummary.utilizationPercent > 80 ? 'high' : stockSummary.utilizationPercent > 50 ? 'medium' : 'low'}
                    onClick={() => handleWarehouseSelect(warehouse)}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ 
                            bgcolor: isSelected ? 'rgba(255,255,255,0.2)' : '#667eea', 
                            color: isSelected ? 'white' : 'white' 
                          }}>
                            <WarehouseIcon />
                          </Avatar>
                          <Box>
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                              {warehouse.name}
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.8 }}>
                              {warehouse.location || warehouse.address}
                            </Typography>
                          </Box>
                        </Box>
                        <Button
                          size="small"
                          variant={isSelected ? "outlined" : "contained"}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewWarehouseDetails(warehouse);
                          }}
                          sx={{
                            color: isSelected ? 'white' : '#667eea',
                            borderColor: isSelected ? 'rgba(255,255,255,0.5)' : '#667eea',
                            bgcolor: isSelected ? 'transparent' : 'rgba(255, 255, 255, 0.9)',
                            '&:hover': {
                              bgcolor: isSelected ? 'rgba(255,255,255,0.1)' : 'rgba(102, 126, 234, 0.1)',
                            }
                          }}
                        >
                          View Details
                        </Button>
                      </Box>

                      <Divider sx={{ my: 2, opacity: 0.3 }} />

                      {/* Stock Summary */}
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                              {stockSummary.totalProducts}
                            </Typography>
                            <Typography variant="caption" sx={{ opacity: 0.8 }}>
                              Products
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                              {stockSummary.totalStock}
                            </Typography>
                            <Typography variant="caption" sx={{ opacity: 0.8 }}>
                              Total Stock
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5, color: stockSummary.lowStockItems > 0 ? '#ff9800' : 'inherit' }}>
                              {stockSummary.lowStockItems}
                            </Typography>
                            <Typography variant="caption" sx={{ opacity: 0.8 }}>
                              Low Stock
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                              {stockSummary.utilizationPercent.toFixed(0)}%
                            </Typography>
                            <Typography variant="caption" sx={{ opacity: 0.8 }}>
                              Capacity
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>

                      {/* Capacity Bar */}
                      <Box sx={{ mt: 2 }}>
                        <LinearProgress
                          variant="determinate"
                          value={stockSummary.utilizationPercent}
                          sx={{
                            height: 6,
                            borderRadius: 3,
                            bgcolor: isSelected ? 'rgba(255,255,255,0.2)' : 'rgba(102, 126, 234, 0.1)',
                            '& .MuiLinearProgress-bar': {
                              borderRadius: 3,
                              bgcolor: stockSummary.utilizationPercent > 80 ? '#ff5722' : stockSummary.utilizationPercent > 50 ? '#ff9800' : '#4caf50'
                            }
                          }}
                        />
                        <Typography variant="caption" sx={{ opacity: 0.8, mt: 0.5, display: 'block' }}>
                          {stockSummary.totalStock} / {stockSummary.capacity} units
                        </Typography>
                      </Box>
                    </CardContent>
                  </WarehouseCard>
                </Grid>
              );
            })}
          </Grid>
        </CardContent>
      </HeaderCard>

      {/* Quick Actions */}
      <Paper sx={{ p: 3, mb: 4, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', background: 'rgba(255, 255, 255, 0.98)', backdropFilter: 'blur(20px)' }}>
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: '#2c3e50' }}>Quick Actions</Typography>
        <Grid container spacing={2} justifyContent="center">
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <QuickActionButton fullWidth startIcon={<AddIcon />} onClick={() => setAddWarehouseDialog(true)}>
              Add Warehouse
            </QuickActionButton>
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <QuickActionButton fullWidth startIcon={<InventoryIcon />} onClick={() => setAddStockDialog(true)}>
              Add Stock to Main Warehouse
            </QuickActionButton>
          </Grid>
        </Grid>
      </Paper>

      {/* Enhanced Warehouse Overview with Smart Analytics */}
      {selectedWarehouse && (
        <>
          {/* Advanced Performance Metrics */}
          <Fade in={true} timeout={1000}>
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={3}>
                <MetricCard variant="success">
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <Box>
                        <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>
                          {stockMovements.filter(m => m.movement_type === 'in').length}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                          📈 Stock In
                        </Typography>
                      </Box>
                      <TrendingUpIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                    </Box>
                  </CardContent>
                </MetricCard>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <MetricCard variant="warning">
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <Box>
                        <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>
                          {stockMovements.filter(m => m.movement_type === 'out').length}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                          📦 Stock Out
                        </Typography>
                      </Box>
                      <LocalShippingIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                    </Box>
                  </CardContent>
                </MetricCard>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <MetricCard variant="info">
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <Box>
                        <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>
                          {warehouseSales.length}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                          💰 Sales Orders
                        </Typography>
                      </Box>
                      <AssessmentIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                    </Box>
                  </CardContent>
                </MetricCard>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <MetricCard variant="primary">
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <Box>
                        <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>
                          {locations.length}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                          📍 Locations
                        </Typography>
                      </Box>
                      <LocationOnIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                    </Box>
                  </CardContent>
                </MetricCard>
              </Grid>
            </Grid>
          </Fade>

          {/* Tabs */}
          <Paper sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
            <StyledTabs value={tabValue} onChange={(e, v) => setTabValue(v)} variant="fullWidth">
              <StyledTab icon={<TrendingUpIcon />} label="Overview" />
              <StyledTab icon={<InventoryIcon />} label="Inventory" />
              <StyledTab icon={<LocationOnIcon />} label="Locations" />
              <StyledTab icon={<AssessmentIcon />} label="Analytics" />
            </StyledTabs>

            <TabPanel value={tabValue} index={0}>
              <Typography variant="h6" sx={{ mb: 2 }}>Warehouse Overview</Typography>
              <Typography>Selected warehouse: {selectedWarehouse.name}</Typography>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <Typography variant="h6" sx={{ mb: 2 }}>Stock Movements</Typography>
              <Typography>Total movements: {stockMovements.length}</Typography>
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
              <Typography variant="h6" sx={{ mb: 2 }}>Warehouse Locations</Typography>
              <Typography>Total locations: {locations.length}</Typography>
            </TabPanel>

            <TabPanel value={tabValue} index={3}>
              <Typography variant="h6" sx={{ mb: 2 }}>Analytics</Typography>
              <Typography>Warehouse performance metrics for {selectedWarehouse.name}</Typography>
            </TabPanel>
          </Paper>
        </>
      )}

      {/* Dialogs */}
      <Dialog open={stockTransferDialog} onClose={() => setStockTransferDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Transfer Stock Between Warehouses</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>From Warehouse</InputLabel>
                <Select
                  value={transferForm.fromWarehouse}
                  onChange={(e) => setTransferForm({ ...transferForm, fromWarehouse: e.target.value })}
                  label="From Warehouse"
                >
                  {warehouses.map((warehouse) => (
                    <MenuItem key={warehouse.id} value={warehouse.id}>{warehouse.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>To Warehouse</InputLabel>
                <Select
                  value={transferForm.toWarehouse}
                  onChange={(e) => setTransferForm({ ...transferForm, toWarehouse: e.target.value })}
                  label="To Warehouse"
                >
                  {warehouses.map((warehouse) => (
                    <MenuItem key={warehouse.id} value={warehouse.id}>{warehouse.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Quantity"
                type="number"
                value={transferForm.quantity}
                onChange={(e) => setTransferForm({ ...transferForm, quantity: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={3}
                value={transferForm.notes}
                onChange={(e) => setTransferForm({ ...transferForm, notes: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStockTransferDialog(false)}>Cancel</Button>
          <Button onClick={handleStockTransfer} variant="contained">Transfer</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={newLocationDialog} onClose={() => setNewLocationDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Location</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Location Name"
                value={locationForm.name}
                onChange={(e) => setLocationForm({ ...locationForm, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Location Code"
                value={locationForm.code}
                onChange={(e) => setLocationForm({ ...locationForm, code: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Aisle"
                value={locationForm.aisle}
                onChange={(e) => setLocationForm({ ...locationForm, aisle: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Shelf"
                value={locationForm.shelf}
                onChange={(e) => setLocationForm({ ...locationForm, shelf: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Bin"
                value={locationForm.bin}
                onChange={(e) => setLocationForm({ ...locationForm, bin: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewLocationDialog(false)}>Cancel</Button>
          <Button onClick={handleAddLocation} variant="contained">Add Location</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={addWarehouseDialog} onClose={() => setAddWarehouseDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Warehouse</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Warehouse Name"
                value={warehouseForm.name}
                onChange={(e) => setWarehouseForm({ ...warehouseForm, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Warehouse Code"
                value={warehouseForm.code}
                onChange={(e) => setWarehouseForm({ ...warehouseForm, code: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Address"
                value={warehouseForm.address}
                onChange={(e) => setWarehouseForm({ ...warehouseForm, address: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Capacity"
                type="number"
                value={warehouseForm.capacity}
                onChange={(e) => setWarehouseForm({ ...warehouseForm, capacity: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Manager</InputLabel>
                <Select
                  value={warehouseForm.manager}
                  onChange={(e) => setWarehouseForm({ ...warehouseForm, manager: e.target.value })}
                  label="Manager"
                >
                  {salesUsers.map((user) => (
                    <MenuItem key={user.id} value={user.id}>{user.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddWarehouseDialog(false)}>Cancel</Button>
          <Button onClick={handleAddWarehouse} variant="contained">Add Warehouse</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={addStockDialog} onClose={() => setAddStockDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Stock to Main Warehouse</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Autocomplete
                options={getGlobalProducts() || products}
                getOptionLabel={(option) => `${option.sku || option.id} - ${option.name} - Stock: ${option.quantity || 0}`}
                value={stockForm.product ? (getGlobalProducts() || products).find(p => p.id === stockForm.product) || null : null}
                onChange={(event, newValue) => setStockForm({ ...stockForm, product: newValue?.id || '' })}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Product"
                    placeholder="Select a product"
                    fullWidth
                  />
                )}
                renderOption={(props, option) => (
                  <Box component="li" {...props}>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {option.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        SKU: {option.sku || option.id} | Current Stock: {option.quantity || 0} | Price: ${option.unit_price || 'N/A'}
                      </Typography>
                    </Box>
                  </Box>
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Warehouse</InputLabel>
                <Select
                  value={stockForm.warehouse}
                  onChange={(e) => setStockForm({ ...stockForm, warehouse: e.target.value })}
                  label="Warehouse"
                >
                  {warehouses.map((warehouse) => (
                    <MenuItem key={warehouse.id} value={warehouse.id}>{warehouse.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Quantity"
                type="number"
                value={stockForm.quantity}
                onChange={(e) => setStockForm({ ...stockForm, quantity: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={3}
                value={stockForm.notes}
                onChange={(e) => setStockForm({ ...stockForm, notes: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddStockDialog(false)}>Cancel</Button>
          <Button onClick={handleAddStock} variant="contained">Add Stock</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={quickActionOpen} onClose={() => setQuickActionOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Warehouse Quick Actions
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => handleQuickAction('add_stock')}
                sx={{ 
                  p: 2, 
                  borderRadius: 2,
                  '&:hover': { bgcolor: 'rgba(102, 126, 234, 0.1)' }
                }}
              >
                Add Stock
              </Button>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<LocalShippingIcon />}
                onClick={() => handleQuickAction('transfer')}
                sx={{ 
                  p: 2, 
                  borderRadius: 2,
                  '&:hover': { bgcolor: 'rgba(102, 126, 234, 0.1)' }
                }}
              >
                Transfer Stock
              </Button>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<AssessmentIcon />}
                onClick={() => handleQuickAction('reports')}
                sx={{ 
                  p: 2, 
                  borderRadius: 2,
                  '&:hover': { bgcolor: 'rgba(102, 126, 234, 0.1)' }
                }}
              >
                View Reports
              </Button>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<InventoryIcon />}
                onClick={() => setQuickActionOpen(false)}
                sx={{ 
                  p: 2, 
                  borderRadius: 2,
                  '&:hover': { bgcolor: 'rgba(102, 126, 234, 0.1)' }
                }}
              >
                Inventory Audit
              </Button>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setQuickActionOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={warehouseDetailsOpen} onClose={() => setWarehouseDetailsOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: '#667eea' }}>
              <WarehouseIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {selectedWarehouse?.name} - Stock Details
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedWarehouse?.location || selectedWarehouse?.address}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedWarehouse && (
            <Box>
              {/* Warehouse Summary Cards */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={3}>
                  <Card sx={{ p: 2, textAlign: 'center', bgcolor: '#e3f2fd' }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#1976d2' }}>
                      {Array.isArray(products) ? products.length : 0}
                    </Typography>
                    <Typography variant="caption">Total Products</Typography>
                  </Card>
                </Grid>
                <Grid item xs={3}>
                  <Card sx={{ p: 2, textAlign: 'center', bgcolor: '#e8f5e8' }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#388e3c' }}>
                      {Array.isArray(products) ? products.reduce((sum, p) => sum + (p.quantity || 0), 0) : 0}
                    </Typography>
                    <Typography variant="caption">Total Stock</Typography>
                  </Card>
                </Grid>
                <Grid item xs={3}>
                  <Card sx={{ p: 2, textAlign: 'center', bgcolor: '#fff3e0' }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#f57c00' }}>
                      {Array.isArray(products) ? products.filter(p => (p.quantity || 0) <= (p.reorder_level || 10)).length : 0}
                    </Typography>
                    <Typography variant="caption">Low Stock</Typography>
                  </Card>
                </Grid>
                <Grid item xs={3}>
                  <Card sx={{ p: 2, textAlign: 'center', bgcolor: '#fce4ec' }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#c2185b' }}>
                      GHS {Array.isArray(products) ? products.reduce((sum, p) => sum + ((p.quantity || 0) * (p.unit_price || 0)), 0).toLocaleString() : '0'}
                    </Typography>
                    <Typography variant="caption">Stock Value</Typography>
                  </Card>
                </Grid>
              </Grid>

              {/* Enhanced Stock Management Section */}
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Avatar sx={{ bgcolor: '#2196F3', width: 40, height: 40 }}>
                    <InventoryIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#333' }}>
                      Stock Management - {selectedWarehouse?.name}
                    </Typography>
                    <Typography variant="h6" sx={{ color: '#666', fontWeight: 500 }}>
                      Warehouse Inventory Overview & Control
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap', mb: 2 }}>
                  <TextField
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <Box sx={{ mr: 1 }}>
                          <SearchIcon />
                        </Box>
                      ),
                    }}
                    sx={{ minWidth: 300 }}
                    size="small"
                  />
                </Box>
              </Box>

              {/* Enhanced Product Stock Table */}
              <TableContainer component={Paper} sx={{ maxHeight: 500, borderRadius: 2 }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Product</TableCell>
                      <TableCell>SKU</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell align="right">Current Stock</TableCell>
                      <TableCell align="right">Min Stock</TableCell>
                      <TableCell align="right">Max Stock</TableCell>
                      <TableCell align="right">Unit Price</TableCell>
                      <TableCell align="right">Stock Value</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Last Updated</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Array.isArray(inventory) ? inventory
                      .filter(item => 
                        (item.product?.name || item.product_name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                        (item.product?.sku || item.product_sku || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                        (item.product?.category_name || item.product?.category || '').toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map((item) => {
                        const product = item.product || {};
                        const productName = item.product_name || product.name || 'Unknown Product';
                        const productSku = item.product_sku || product.sku || 'N/A';
                        const productCategory = product.category_name || product.category || 'Uncategorized';
                        const currentStock = item.quantity || 0;
                        const minStock = item.min_stock || item.reorder_level || product.min_stock || 0;
                        const unitPrice = item.unit_price || product.unit_price || 0;
                        
                        const stockStatus = currentStock <= minStock ? 'low' : 
                                          currentStock === 0 ? 'out' : 'good';
                        const statusColor = stockStatus === 'out' ? 'error' : 
                                          stockStatus === 'low' ? 'warning' : 'success';
                        
                        return (
                          <TableRow key={item.id || `${item.product_id}-${item.warehouse}`}>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar sx={{ bgcolor: '#2196F3', width: 32, height: 32 }}>
                                  <InventoryIcon sx={{ fontSize: 16 }} />
                                </Avatar>
                                <Box>
                                  <Typography variant="subtitle2">{productName}</Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {product.description || 'No description'}
                                  </Typography>
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell>{productSku}</TableCell>
                            <TableCell>
                              <Chip label={productCategory} size="small" />
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="h6" color={statusColor === 'error' ? 'error' : statusColor === 'warning' ? 'warning.main' : 'success.main'}>
                                {currentStock}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">{minStock}</TableCell>
                            <TableCell align="right">{item.max_stock || product.max_stock || 'No limit'}</TableCell>
                            <TableCell align="right">GHS {unitPrice.toLocaleString()}</TableCell>
                            <TableCell align="right">GHS {(currentStock * unitPrice).toLocaleString()}</TableCell>
                            <TableCell>
                              <Chip 
                                label={stockStatus === 'out' ? 'Out of Stock' : stockStatus === 'low' ? 'Low Stock' : 'In Stock'} 
                                color={statusColor}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="caption">
                                {new Date(item.updated_at || item.created_at || product.updated_at || product.created_at).toLocaleDateString()}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        );
                      }) : []}
                    {(!Array.isArray(inventory) || inventory.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={10} align="center">
                          <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>
                            No stock data available for this warehouse
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setWarehouseDetailsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
      />
    </DashboardContainer>
  );
}

export default WarehouseDashboard;

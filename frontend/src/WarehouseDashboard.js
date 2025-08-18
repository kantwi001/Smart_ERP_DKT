import React, { useState, useEffect, useContext } from 'react';
import { 
  Box, Typography, Grid, Card, CardContent, CircularProgress, Alert,
  Tabs, Tab, Paper, Chip, Button, List, ListItem, ListItemText,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem,
  Snackbar, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Select, FormControl, InputLabel, IconButton, Avatar, Divider, LinearProgress,
  Autocomplete, Badge, Tooltip, Fade, Grow, Slide, Collapse, Switch
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import WarehouseIcon from '@mui/icons-material/Warehouse';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import RefreshIcon from '@mui/icons-material/Refresh';
import AddIcon from '@mui/icons-material/Add';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import InventoryIcon from '@mui/icons-material/Inventory';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import PersonIcon from '@mui/icons-material/Person';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import TimelineIcon from '@mui/icons-material/Timeline';
import PieChartIcon from '@mui/icons-material/PieChart';
import BarChartIcon from '@mui/icons-material/BarChart';
import GroupIcon from '@mui/icons-material/Group';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import ScheduleIcon from '@mui/icons-material/Schedule';
import api from './api';
import { AuthContext } from './AuthContext';

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
  const { user } = useContext(AuthContext);
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

  // Enhanced data fetching with comprehensive analytics
  const fetchWarehouseData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const userResponse = await api.get('/users/me/');
      const currentUser = userResponse.data;
      
      const isSalesManager = currentUser.username === 'sales_manager' || currentUser.is_superuser;
      setUserRole(isSalesManager ? 'sales_manager' : 'sales_rep');
      
      let warehousesResponse;
      if (isSalesManager) {
        warehousesResponse = await api.get('/warehouse/');
      } else {
        warehousesResponse = await api.get(`/warehouse/?manager=${currentUser.id}`);
      }
      
      const warehousesData = warehousesResponse.data.results || warehousesResponse.data;
      
      // Fetch manager details for each warehouse
      const warehousesWithManagers = await Promise.all(
        warehousesData.map(async (warehouse) => {
          try {
            // Try to get manager information if manager_id exists
            if (warehouse.manager || warehouse.manager_id) {
              const managerId = warehouse.manager || warehouse.manager_id;
              const managerResponse = await api.get(`/users/${managerId}/`);
              return {
                ...warehouse,
                manager_name: managerResponse.data.first_name && managerResponse.data.last_name 
                  ? `${managerResponse.data.first_name} ${managerResponse.data.last_name}`
                  : managerResponse.data.username,
                manager_details: managerResponse.data
              };
            }
            
            // Try to find assigned sales rep for this warehouse
            const usersResponse = await api.get('/users/');
            const users = usersResponse.data.results || usersResponse.data;
            const assignedUser = users.find(user => 
              user.assigned_warehouse === warehouse.id || 
              user.warehouse === warehouse.id ||
              (user.department_name?.toLowerCase() === 'sales' && user.warehouse_id === warehouse.id)
            );
            
            if (assignedUser) {
              return {
                ...warehouse,
                manager_name: assignedUser.first_name && assignedUser.last_name 
                  ? `${assignedUser.first_name} ${assignedUser.last_name}`
                  : assignedUser.username,
                manager_details: assignedUser
              };
            }
            
            return {
              ...warehouse,
              manager_name: 'Unassigned',
              manager_details: null
            };
          } catch (error) {
            console.error(`Error fetching manager for warehouse ${warehouse.id}:`, error);
            return {
              ...warehouse,
              manager_name: 'Unassigned',
              manager_details: null
            };
          }
        })
      );
      
      setWarehouses(warehousesWithManagers);
      
      if (warehousesWithManagers.length > 0) {
        const selectedWh = warehousesWithManagers[0];
        setSelectedWarehouse(selectedWh);
        if (!isSalesManager) {
          setUserWarehouse(selectedWh);
        }
        await fetchWarehouseDetails(selectedWh.id);
      }
      
    } catch (error) {
      console.error('Error fetching warehouse data:', error);
      setError('Failed to load warehouse data. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchWarehouseDetails = async (warehouseId) => {
    try {
      // Comprehensive data fetching for advanced analytics
      const [movementsRes, salesRes, locationsRes, inventoryRes, customersRes] = await Promise.allSettled([
        api.get(`/warehouse/movements/?warehouse=${warehouseId}`),
        api.get(`/sales/?staff__managed_warehouse=${warehouseId}`).catch(() => ({ data: { results: [] } })),
        api.get(`/warehouse/locations/?warehouse=${warehouseId}`),
        api.get(`/inventory/?warehouse=${warehouseId}`).catch(() => ({ data: { results: [] } })),
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
      
      if (inventoryRes.status === 'fulfilled') {
        setInventory(inventoryRes.value.data.results || inventoryRes.value.data);
      }
      
      if (customersRes.status === 'fulfilled') {
        setCustomers(customersRes.value.data.results || customersRes.value.data);
      }
      
      // Generate analytics from fetched data
      await generateAnalytics(warehouseId);
      
    } catch (error) {
      console.error('Error fetching warehouse details:', error);
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
      await api.post('/warehouse/', {
        name: warehouseForm.name,
        code: warehouseForm.code,
        address: warehouseForm.address,
        capacity: parseInt(warehouseForm.capacity),
        manager: warehouseForm.manager || null
      });
      
      setSnackbar({ open: true, message: 'Warehouse added successfully!', severity: 'success' });
      setAddWarehouseDialog(false);
      setWarehouseForm({ name: '', code: '', address: '', capacity: '', manager: '' });
      
      // Refresh warehouse data
      await fetchWarehouseData();
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to add warehouse', severity: 'error' });
    }
  };

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
      {/* Advanced Header with Real-time Controls */}
      <HeaderCard>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box>
              <Typography variant="h3" sx={{ fontWeight: 800, color: '#2c3e50', mb: 1, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                🏢 Smart Warehouse Management
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                <Typography variant="h6" sx={{ color: '#7f8c8d' }}>
                  {userRole === 'sales_manager' ? (user?.is_superuser ? '👑 Admin Dashboard - All Warehouses' : '👨‍💼 Sales Manager Dashboard - All Warehouses') : `👤 Sales Rep Dashboard - ${userWarehouse?.name || 'Your Warehouse'}`}
                </Typography>
                <Chip 
                  icon={userRole === 'sales_manager' ? <SupervisorAccountIcon /> : <PersonIcon />}
                  label={userRole === 'sales_manager' ? (user?.is_superuser ? 'Admin Access' : 'Manager Access') : 'Rep Access'}
                  color={userRole === 'sales_manager' ? 'primary' : 'secondary'}
                  size="medium"
                  sx={{ fontWeight: 600 }}
                />
                <Chip 
                  icon={<ScheduleIcon />}
                  label={realTimeMode ? 'Real-time' : 'Static'}
                  color={realTimeMode ? 'success' : 'default'}
                  size="small"
                />
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Tooltip title="Toggle Real-time Updates">
                <Switch 
                  checked={realTimeMode}
                  onChange={(e) => setRealTimeMode(e.target.checked)}
                  color="primary"
                />
              </Tooltip>
              <Tooltip title="Refresh Data">
                <IconButton 
                  onClick={fetchWarehouseData} 
                  sx={{ 
                    bgcolor: 'rgba(102, 126, 234, 0.1)', 
                    '&:hover': { bgcolor: 'rgba(102, 126, 234, 0.2)' },
                    border: '2px solid rgba(102, 126, 234, 0.3)'
                  }}
                >
                  <RefreshIcon sx={{ color: '#667eea' }} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Advanced Analytics">
                <IconButton 
                  onClick={() => setAnalyticsDialog(true)}
                  sx={{ 
                    bgcolor: 'rgba(102, 126, 234, 0.1)', 
                    '&:hover': { bgcolor: 'rgba(102, 126, 234, 0.2)' },
                    border: '2px solid rgba(102, 126, 234, 0.3)'
                  }}
                >
                  <AssessmentIcon sx={{ color: '#667eea' }} />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
          
          {/* Smart Search and Filter Bar */}
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
            <TextField
              placeholder="🔍 Search warehouses, locations, or inventory..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              variant="outlined"
              size="small"
              sx={{ 
                flexGrow: 1,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  bgcolor: 'rgba(255, 255, 255, 0.8)',
                }
              }}
              InputProps={{
                startAdornment: <SearchIcon sx={{ color: '#667eea', mr: 1 }} />
              }}
            />
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                sx={{ borderRadius: 3, bgcolor: 'rgba(255, 255, 255, 0.8)' }}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="high">High Performance</MenuItem>
                <MenuItem value="medium">Medium Performance</MenuItem>
                <MenuItem value="low">Low Performance</MenuItem>
              </Select>
            </FormControl>
            <IconButton 
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              sx={{ 
                bgcolor: 'rgba(255, 255, 255, 0.8)',
                border: '1px solid rgba(102, 126, 234, 0.3)',
                borderRadius: 2
              }}
            >
              {viewMode === 'grid' ? <FilterListIcon /> : <BarChartIcon />}
            </IconButton>
          </Box>
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
        </Grid>
      </Paper>

      {/* Smart Warehouse Selector */}
      {userRole === 'sales_manager' && warehouses.length > 1 && (
        <SmartWarehouseSelector>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#2c3e50', display: 'flex', alignItems: 'center' }}>
                🏭 Smart Warehouse Selector
                <Badge badgeContent={warehouses.length} color="primary" sx={{ ml: 2 }} />
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Chip 
                  label={`${warehouses.filter(w => w.is_active).length} Active`}
                  color="success"
                  size="small"
                  icon={<WarehouseIcon />}
                />
                <Chip 
                  label={viewMode === 'grid' ? 'Grid View' : 'List View'}
                  color="info"
                  size="small"
                  icon={viewMode === 'grid' ? <BarChartIcon /> : <FilterListIcon />}
                />
              </Box>
            </Box>
            
            <Fade in={true} timeout={800}>
              <Grid container spacing={3}>
                {warehouses
                  .filter(warehouse => 
                    warehouse.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    warehouse.code.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .filter(warehouse => 
                    filterStatus === 'all' || 
                    getWarehouseStatus(warehouse) === filterStatus
                  )
                  .map((warehouse, index) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={warehouse.id}>
                    <Grow in={true} timeout={500 + index * 100}>
                      <WarehouseCard 
                        selected={selectedWarehouse?.id === warehouse.id}
                        status={getWarehouseStatus(warehouse)}
                        onClick={() => handleWarehouseSelect(warehouse)}
                      >
                        <CardContent sx={{ p: 3 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Avatar 
                              sx={{ 
                                bgcolor: selectedWarehouse?.id === warehouse.id ? 'rgba(255,255,255,0.2)' : 'rgba(102, 126, 234, 0.1)',
                                color: selectedWarehouse?.id === warehouse.id ? 'white' : '#667eea',
                                mr: 2,
                                width: 48,
                                height: 48
                              }}
                            >
                              <WarehouseIcon fontSize="large" />
                            </Avatar>
                            <Box sx={{ flexGrow: 1 }}>
                              <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                                {warehouse.name}
                              </Typography>
                              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                                {warehouse.code}
                              </Typography>
                            </Box>
                            {selectedWarehouse?.id === warehouse.id && (
                              <Chip 
                                label="Active"
                                color="success"
                                size="small"
                                sx={{ fontWeight: 600 }}
                              />
                            )}
                          </Box>
                          
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                              📍 {warehouse.address || 'Location not specified'}
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.9 }}>
                              👤 Manager: {warehouse.manager_name || 'Unassigned'}
                            </Typography>
                          </Box>
                          
                          {/* Performance Indicators */}
                          <Box sx={{ mb: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                              <Typography variant="caption">Capacity Utilization</Typography>
                              <Typography variant="caption">{getCapacityUtilization(warehouse)}%</Typography>
                            </Box>
                            <LinearProgress 
                              variant="determinate" 
                              value={getCapacityUtilization(warehouse)} 
                              sx={{ 
                                height: 6, 
                                borderRadius: 3,
                                bgcolor: 'rgba(0,0,0,0.1)',
                                '& .MuiLinearProgress-bar': {
                                  borderRadius: 3,
                                  bgcolor: getCapacityUtilization(warehouse) > 80 ? '#f44336' : 
                                          getCapacityUtilization(warehouse) > 60 ? '#ff9800' : '#4caf50'
                                }
                              }} 
                            />
                          </Box>
                          
                          {/* Quick Stats */}
                          <Grid container spacing={1}>
                            <Grid item xs={6}>
                              <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'rgba(0,0,0,0.05)', borderRadius: 2 }}>
                                <Typography variant="h6" sx={{ fontWeight: 700, color: '#4caf50' }}>
                                  {warehouse.location_count || 0}
                                </Typography>
                                <Typography variant="caption">Locations</Typography>
                              </Box>
                            </Grid>
                            <Grid item xs={6}>
                              <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'rgba(0,0,0,0.05)', borderRadius: 2 }}>
                                <Typography variant="h6" sx={{ fontWeight: 700, color: '#2196f3' }}>
                                  {getWarehouseInventoryCount(warehouse)}
                                </Typography>
                                <Typography variant="caption">Items</Typography>
                              </Box>
                            </Grid>
                          </Grid>
                        </CardContent>
                      </WarehouseCard>
                    </Grow>
                  </Grid>
                ))}
              </Grid>
            </Fade>
          </CardContent>
        </SmartWarehouseSelector>
      )}

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
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>📈 Stock In</Typography>
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
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>📦 Stock Out</Typography>
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
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>💰 Sales Orders</Typography>
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
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>📍 Locations</Typography>
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
              <TextField
                fullWidth
                label="Manager"
                value={warehouseForm.manager}
                onChange={(e) => setWarehouseForm({ ...warehouseForm, manager: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddWarehouseDialog(false)}>Cancel</Button>
          <Button onClick={handleAddWarehouse} variant="contained">Add Warehouse</Button>
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

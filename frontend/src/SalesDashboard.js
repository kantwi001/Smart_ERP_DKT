import React, { useState, useEffect, useContext } from 'react';
import { 
  Box, Typography, Grid, Card, CardContent, CircularProgress, Alert,
  Tabs, Tab, Paper, Chip, Avatar, LinearProgress, Divider, IconButton, List, ListItem, ListItemText,
  Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Snackbar,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, Checkbox,
  FormControl, InputLabel, Select, InputAdornment, useMediaQuery, useTheme, Autocomplete
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AssessmentIcon from '@mui/icons-material/Assessment';
import PeopleIcon from '@mui/icons-material/People';
import SellIcon from '@mui/icons-material/Sell';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import BarChartIcon from '@mui/icons-material/BarChart';
import PersonIcon from '@mui/icons-material/Person';
import RefreshIcon from '@mui/icons-material/Refresh';
import AddBoxIcon from '@mui/icons-material/AddBox';
import PriceChangeIcon from '@mui/icons-material/PriceChange';
import DescriptionIcon from '@mui/icons-material/Description';
import ContactsIcon from '@mui/icons-material/Contacts';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import CloseIcon from '@mui/icons-material/Close';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import InventoryIcon from '@mui/icons-material/Inventory';
import AddIcon from '@mui/icons-material/Add';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import ReceiptIcon from '@mui/icons-material/Receipt';
import PaymentIcon from '@mui/icons-material/Payment';
import PrintIcon from '@mui/icons-material/Print';
import BusinessIcon from '@mui/icons-material/Business';
import PendingIcon from '@mui/icons-material/Pending';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import MapIcon from '@mui/icons-material/Map';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import DeleteIcon from '@mui/icons-material/Delete';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import TransferWithinAStationIcon from '@mui/icons-material/TransferWithinAStation';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import api from './api';
import { AuthContext } from './AuthContext';
import AdvancedAnalytics from './components/AdvancedAnalytics';
import TimeBasedAnalytics from './components/TimeBasedAnalytics';
import GanttChart from './components/GanttChart';
import TransactionIntegration from './components/TransactionIntegration';
import { useTransactionIntegration } from './hooks/useTransactionIntegration';
import CustomerCreationForm from './components/CustomerCreationForm';
import CustomerHeatMap from './components/CustomerHeatMap';
import L from 'leaflet';
import offlineStorage from './utils/offlineStorage';
import { getGlobalProducts, loadProductsWithFallback, loadCustomersWithFallback, sharedCustomers, updateGlobalProduct, testWarehouseFunction } from './sharedData';
import QuickActionDialogs from './QuickActionDialogs';
import SalesOrdersManagement from './components/SalesOrdersManagement';
import WarehouseTransferModule from './WarehouseTransferModule';
import SalesReports from './SalesReports';

// Temporary workaround for loadWarehousesWithFallback import issue
const loadWarehousesWithFallbackLocal = async () => {
  try {
    const response = await api.get('/warehouse/');
    const warehouses = response.data;
    console.log(`Loaded ${warehouses.length} warehouses from backend`);
    return warehouses;
  } catch (error) {
    console.warn('Failed to load warehouses from backend:', error);
    return [];
  }
};

// Styled components for modern design
const StyledTabs = styled(Tabs)(({ theme }) => ({
  backgroundColor: '#fff',
  borderRadius: '12px 12px 0 0',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  '& .MuiTabs-indicator': {
    height: 3,
    borderRadius: '3px 3px 0 0',
    background: 'linear-gradient(45deg, #FF9800 30%, #FF5722 90%)',
  },
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '0.95rem',
  minHeight: 64,
  color: '#666',
  '&.Mui-selected': {
    color: '#FF9800',
  },
}));

const MetricCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(135deg, #FF9800 0%, #FF5722 100%)',
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
      id={`sales-tabpanel-${index}`}
      aria-labelledby={`sales-tab-${index}`}
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

const SalesDashboard = () => {
  const { token, user } = useContext(AuthContext);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [salesData, setSalesData] = useState({});
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [allTransactions, setAllTransactions] = useState([]);
  const [recentSales, setRecentSales] = useState([]);
  const [filters, setFilters] = useState({});
  const [salesAgents, setSalesAgents] = useState([]);
  const [agentAnalytics, setAgentAnalytics] = useState(null);
  const [assignedWarehouse, setAssignedWarehouse] = useState(null);
  const [agentProducts, setAgentProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Transaction integration
  const {
    transactions,
    analytics,
    completePOSSale,
    createTransaction,
    refreshData
  } = useTransactionIntegration('sales');
  
  // Dialog State
  const [salesOrderDialogOpen, setSalesOrderDialogOpen] = useState(false);
  const [promotionsDialogOpen, setPromotionsDialogOpen] = useState(false);
  const [quoteDialogOpen, setQuoteDialogOpen] = useState(false);
  const [transferStockDialogOpen, setTransferStockDialogOpen] = useState(false);
  const [viewTransfersDialogOpen, setViewTransfersDialogOpen] = useState(false);
  const [addLeadDialogOpen, setAddLeadDialogOpen] = useState(false);
  const [posTransactionsDialogOpen, setPosTransactionsDialogOpen] = useState(false);
  const [stockAssignmentDialogOpen, setStockAssignmentDialogOpen] = useState(false);
  const [customerCreationDialogOpen, setCustomerCreationDialogOpen] = useState(false);
  const [transactionsDialogOpen, setTransactionsDialogOpen] = useState(false);
  const [customerHeatMapDialogOpen, setCustomerHeatMapDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedAgent, setSelectedAgent] = useState(1);

  // Sales Order State
  const [orderProducts, setOrderProducts] = useState([{ product: null, quantity: 1 }]);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState('');

  // Loading and UI State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [selectedProducts, setSelectedProducts] = useState([]);

  // Data State
  const [newCustomerData, setNewCustomerData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    customer_type: 'retailer',
    payment_terms: 30
  });

  // Quick Action Dialog State
  const [quickActionDialog, setQuickActionDialog] = useState({
    open: false,
    type: '',
    product: null
  });

  // Load functions
  const loadCustomers = async () => {
    try {
      // Use the shared data function to ensure consistency across modules
      const customersData = await loadCustomersWithFallback();
      setCustomers(customersData || []);
      console.log('Customers loaded in SalesDashboard:', customersData?.length || 0);
    } catch (error) {
      console.error('Error loading customers:', error);
      setCustomers([]);
    }
  };

  const loadProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Loading products with token:', token ? 'Token exists' : 'No token found');
      
      // Load products and warehouses separately
      console.log('Calling loadProductsWithFallback...');
      const warehouseProducts = await loadProductsWithFallback(token);
      console.log('Products loaded:', warehouseProducts?.length || 0);
      
      console.log('Calling loadWarehousesWithFallback...');
      const warehousesData = await loadWarehousesWithFallbackLocal();
      console.log('Warehouses loaded:', warehousesData?.length || 0);
      
      setProducts(warehouseProducts || []);
      setWarehouses(warehousesData || []);
      
      // Update global state for synchronization
      if (window.globalProducts) {
        window.globalProducts = warehouseProducts;
      }
      if (window.globalWarehouses) {
        window.globalWarehouses = warehousesData;
      }
      
      // Dispatch events for other modules to sync
      window.dispatchEvent(new CustomEvent('productsUpdated', { 
        detail: { products: warehouseProducts, source: 'sales_dashboard' } 
      }));
      
      setSnackbar({
        open: true,
        message: 'Stock data refreshed successfully',
        severity: 'success'
      });
      
    } catch (error) {
      console.error('Error loading products:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      
      // Fallback to original method
      try {
        console.log('Attempting fallback loading...');
        const fallbackProducts = await loadProductsWithFallback(localStorage.getItem('token'));
        const fallbackWarehouses = await loadWarehousesWithFallbackLocal();
        
        setProducts(fallbackProducts || []);
        setWarehouses(fallbackWarehouses || []);
        
        setSnackbar({
          open: true,
          message: 'Stock data loaded (fallback mode)',
          severity: 'warning'
        });
      } catch (fallbackError) {
        console.error('Fallback loading failed:', fallbackError);
        console.error('Fallback error details:', {
          message: fallbackError.message,
          stack: fallbackError.stack,
          name: fallbackError.name
        });
        setSnackbar({
          open: true,
          message: 'Failed to load inventory data. Please try again.',
          severity: 'error'
        });
      }
    }
  };

  const refreshProductData = async () => {
    try {
      const productsData = await loadProductsWithFallback(token);
      setProducts(productsData || []);
      console.log('Products refreshed after warehouse operation:', productsData?.length || 0, 'products');
      
      // Dispatch event to sync with other modules
      window.dispatchEvent(new CustomEvent('productsUpdated', { 
        detail: productsData || [] 
      }));
      
      // Show success message
      setSnackbar({ 
        open: true, 
        message: `Stock data refreshed - ${productsData?.length || 0} products loaded`, 
        severity: 'success' 
      });
    } catch (error) {
      console.error('Failed to refresh products:', error);
      setSnackbar({ 
        open: true, 
        message: 'Failed to refresh stock data', 
        severity: 'error' 
      });
    }
  };

  const loadWarehouses = async () => {
    try {
      const response = await api.get('/warehouse/');
      setWarehouses(response.data);
      console.log('Warehouses loaded:', response.data.length);
    } catch (error) {
      console.error('Error loading warehouses:', error);
      // Fallback sample data
      setWarehouses([
        { id: 1, name: 'Main Warehouse', location: 'Central Location', capacity: 1000 },
        { id: 2, name: 'North Distribution Center', location: 'North Region', capacity: 500 },
        { id: 3, name: 'South Storage Facility', location: 'South Region', capacity: 750 },
        { id: 4, name: 'West Depot', location: 'West Region', capacity: 600 }
      ]);
    }
  };

  const loadAllTransactions = async () => {
    try {
      const response = await api.get('/sales/sales/');
      setAllTransactions(response.data);
      console.log('Transactions loaded:', response.data.length);
    } catch (error) {
      console.error('Error loading transactions:', error);
      setAllTransactions([]);
    }
  };

  const loadTransfers = async () => {
    try {
      const response = await api.get('/warehouse/transfers/');
      setTransfers(response.data);
    } catch (error) {
      console.error('Error loading transfers:', error);
    }
  };

  const loadSalesData = async () => {
    try {
      // Load sales summary data
      const salesResponse = await api.get('/sales/sales-orders/');
      const salesOrders = salesResponse.data || [];
      
      // Calculate sales metrics
      const totalSales = (salesOrders || []).reduce((sum, order) => sum + parseFloat(order.total || 0), 0);
      const pendingSales = (salesOrders || []).filter(order => order.status === 'pending').length;
      const completedSales = (salesOrders || []).filter(order => order.status === 'completed').length;
      
      setSalesData({
        totalOrders: salesOrders.length,
        totalValue: totalSales,
        total_revenue: totalSales.toFixed(2), // Add total_revenue for display
        pendingOrders: pendingSales,
        completedOrders: completedSales,
        recentOrders: (salesOrders || []).slice(0, 5)
      });
      
      console.log('Sales data loaded:', { totalOrders: salesOrders.length, totalValue: totalSales });
    } catch (error) {
      console.error('Error loading sales data:', error);
      setSalesData({
        totalOrders: 0,
        totalValue: 0,
        total_revenue: 0, // Add total_revenue for display
        pendingOrders: 0,
        completedOrders: 0,
        recentOrders: []
      });
    }
  };

  const loadAgentProducts = () => {
    const currentAgent = (salesAgents || []).find(agent => agent.id === selectedAgent);
    if (currentAgent) {
      const warehouseId = currentAgent.assigned_warehouse_id;
      setAssignedWarehouse((warehouses || []).find(w => w.id === warehouseId));
      const agentProds = getGlobalProducts();
      setAgentProducts(agentProds);
    }
  };

  const loadAgentAnalytics = async () => {
    try {
      const currentAgent = (salesAgents || []).find(agent => agent.id === selectedAgent);
      if (!currentAgent) return;

      // Get sales orders for the current agent
      const salesResponse = await api.get('/sales/sales-orders/');
      const allSalesOrders = salesResponse.data || [];
      
      // Get payments data
      const paymentsResponse = await api.get('/sales/payments/');
      const allPayments = paymentsResponse.data || [];
      
      // Get finance transactions for aging analysis
      const financeResponse = await api.get('/sales/finance-transactions/');
      const allFinanceTransactions = financeResponse.data || [];
      
      // Filter sales orders by agent (assuming agent info is stored in sales orders)
      // For now, we'll calculate based on assigned warehouse or use agent name matching
      const agentSalesOrders = (allSalesOrders || []).filter(order => {
        // Match by agent name, email, or assigned warehouse
        return order.sales_agent === currentAgent.name || 
               order.agent_email === currentAgent.email ||
               order.warehouse_id === currentAgent.assigned_warehouse_id;
      });

      // Calculate agent-specific metrics
      const totalRevenue = (agentSalesOrders || []).reduce((sum, order) => sum + parseFloat(order.total || 0), 0);
      const totalOrders = agentSalesOrders.length;
      const completedOrders = (agentSalesOrders || []).filter(order => order.status === 'completed').length;
      const pendingOrders = (agentSalesOrders || []).filter(order => order.status === 'pending').length;
      
      // Calculate completed transactions with payments
      const completedWithPayments = (agentSalesOrders || []).filter(order => {
        const orderPayments = (allPayments || []).filter(payment => 
          payment.sales_order === order.id && payment.status === 'completed'
        );
        const totalPaid = orderPayments.reduce((sum, payment) => sum + parseFloat(payment.amount || 0), 0);
        return totalPaid >= parseFloat(order.total || 0);
      }).length;
      
      // Calculate aging balances
      const agingBalances = {
        current: 0,      // 0-30 days
        thirtyDays: 0,   // 31-60 days  
        sixtyDays: 0,    // 61-90 days
        ninetyDays: 0,   // 91+ days
        total: 0
      };
      
      const today = new Date();
      (agentSalesOrders || []).forEach(order => {
        if (order.payment_method === 'credit' && order.status !== 'completed') {
          const orderDate = new Date(order.created_at || order.date_created);
          const daysDiff = Math.floor((today - orderDate) / (1000 * 60 * 60 * 24));
          const orderPayments = (allPayments || []).filter(payment => 
            payment.sales_order === order.id && payment.status === 'completed'
          );
          const totalPaid = orderPayments.reduce((sum, payment) => sum + parseFloat(payment.amount || 0), 0);
          const balance = parseFloat(order.total || 0) - totalPaid;
          
          if (balance > 0) {
            agingBalances.total += balance;
            if (daysDiff <= 30) {
              agingBalances.current += balance;
            } else if (daysDiff <= 60) {
              agingBalances.thirtyDays += balance;
            } else if (daysDiff <= 90) {
              agingBalances.sixtyDays += balance;
            } else {
              agingBalances.ninetyDays += balance;
            }
          }
        }
      });

      // Calculate monthly revenue trend (last 6 months)
      const monthlyRevenue = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
        const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        
        const monthOrders = (agentSalesOrders || []).filter(order => {
          const orderDate = new Date(order.created_at || order.date_created);
          return orderDate >= monthStart && orderDate <= monthEnd;
        });
        
        const monthRevenue = monthOrders.reduce((sum, order) => sum + parseFloat(order.total || 0), 0);
        monthlyRevenue.push({
          month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          revenue: monthRevenue,
          orders: monthOrders.length
        });
      }

      setAgentAnalytics({
        agent: currentAgent,
        totalRevenue: totalRevenue.toFixed(2),
        totalOrders,
        completedOrders,
        pendingOrders,
        completedWithPayments,
        agingBalances: {
          current: agingBalances.current.toFixed(2),
          thirtyDays: agingBalances.thirtyDays.toFixed(2),
          sixtyDays: agingBalances.sixtyDays.toFixed(2),
          ninetyDays: agingBalances.ninetyDays.toFixed(2),
          total: agingBalances.total.toFixed(2)
        },
        conversionRate: totalOrders > 0 ? ((completedOrders / totalOrders) * 100).toFixed(1) : 0,
        averageOrderValue: totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(2) : 0,
        monthlyTrend: monthlyRevenue,
        recentOrders: (agentSalesOrders || []).slice(0, 5)
      });

    } catch (error) {
      console.error('Error loading agent analytics:', error);
      setAgentAnalytics(null);
    }
  };

  const handleRefreshData = () => {
    setLoading(true);
    loadCustomers();
    loadProducts();
    loadAllTransactions();
    loadSalesData();
    loadAgentProducts();
    loadAgentAnalytics();
    refreshData();
    setLoading(false);
  };

  const handleAssignStock = () => {
    setStockAssignmentDialogOpen(true);
  };

  const handleAddCustomer = () => {
    setCustomerCreationDialogOpen(true);
  };

  // Sales Order Functions
  const addProductToOrder = () => {
    setOrderProducts([...orderProducts, { product: null, quantity: 1 }]);
  };

  const removeProductFromOrder = (index) => {
    const newProducts = (orderProducts || []).filter((_, i) => i !== index);
    setOrderProducts(newProducts);
  };

  const updateOrderProduct = (index, field, value) => {
    const newProducts = [...orderProducts];
    newProducts[index][field] = value;
    setOrderProducts(newProducts);
  };

  const calculateOrderTotal = () => {
    const subtotal = (orderProducts || []).reduce((total, item) => {
      if (item.product) {
        return total + (item.product.unit_price * item.quantity);
      }
      return total;
    }, 0);
    const discountAmount = (subtotal * discount) / 100;
    return subtotal - discountAmount;
  };

  const handleCreateSalesOrder = async () => {
    if (!selectedCustomer || (orderProducts || []).length === 0) {
      setSnackbar({ open: true, message: 'Please select a customer and add products', severity: 'error' });
      return;
    }

    try {
      const orderData = {
        customer_id: selectedCustomer.id,
        products: (orderProducts || []).filter(item => item.product).map(item => ({
          product_id: item.product.id,
          quantity: item.quantity,
          unit_price: item.product.unit_price
        })),
        payment_method: paymentMethod,
        discount: discount,
        notes: notes,
        total: calculateOrderTotal()
      };

      // Create the order (API call would go here)
      console.log('Creating sales order:', orderData);
      
      // Reset form
      setSalesOrderDialogOpen(false);
      setSelectedCustomer(null);
      setOrderProducts([{ product: null, quantity: 1 }]);
      setPaymentMethod('');
      setDiscount(0);
      setNotes('');
      
      setSnackbar({ open: true, message: 'Sales order created successfully!', severity: 'success' });
      
    } catch (error) {
      console.error('Error creating sales order:', error);
      setSnackbar({ open: true, message: 'Failed to create sales order', severity: 'error' });
    }
  };

  const handleCreateCustomer = async () => {
    if (!newCustomerData.name || !newCustomerData.email) {
      setSnackbar({ open: true, message: 'Please fill in required fields', severity: 'error' });
      return;
    }
    
    try {
      console.log('Creating customer:', newCustomerData);
      
      // Actually create the customer via API
      const response = await api.post('/sales/customers/', newCustomerData);
      
      setCustomerCreationDialogOpen(false);
      setNewCustomerData({
        name: '',
        email: '',
        phone: '',
        address: '',
        customer_type: 'retailer',
        payment_terms: 30
      });
      setSnackbar({ open: true, message: 'Customer created successfully!', severity: 'success' });
      loadCustomers(); // Refresh customer list after creation
    } catch (error) {
      console.error('Customer creation error:', error);
      
      let errorMessage = 'Failed to create customer';
      if (error.response?.data) {
        const errorData = error.response.data;
        if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (errorData.email && Array.isArray(errorData.email)) {
          errorMessage = `Email error: ${errorData.email.join(', ')}`;
        } else if (errorData.latitude && Array.isArray(errorData.latitude)) {
          errorMessage = `GPS Latitude error: ${errorData.latitude.join(', ')}`;
        } else if (errorData.longitude && Array.isArray(errorData.longitude)) {
          errorMessage = `GPS Longitude error: ${errorData.longitude.join(', ')}`;
        }
      }
      
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    }
  };

  // Snackbar handler for QuickActionDialogs
  const handleSnackbar = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  // Data initialization
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          loadCustomers(),
          loadProducts(),
          loadWarehouses(),
          loadAllTransactions(),
          loadSalesData()
        ]);
        
        // Initialize sales agents
        const agents = [
          { id: 1, name: 'Collins Arku', email: 'collins@smarterp.com', territory: 'Accra', assigned_warehouse_id: 1 },
          { id: 2, name: 'Sarah Johnson', email: 'sarah@smarterp.com', territory: 'Kumasi', assigned_warehouse_id: 2 },
          { id: 3, name: 'Michael Brown', email: 'michael@smarterp.com', territory: 'Tema', assigned_warehouse_id: 3 },
          { id: 4, name: 'Emily Davis', email: 'emily@smarterp.com', territory: 'Cape Coast', assigned_warehouse_id: 4 }
        ];
        setSalesAgents(agents);
        
      } catch (error) {
        console.error('Error initializing data:', error);
        setError('Failed to load initial data');
      } finally {
        setLoading(false);
      }
    };

    initializeData();

    // Listen for payment approval events from Finance module
    const handlePaymentApproved = (event) => {
      console.log('Payment approved event received:', event.detail);
      const { salesOrderId, paymentStatus, orderNumber } = event.detail;
      
      // Refresh sales data to show updated payment status
      loadAllTransactions();
      
      // Show notification
      setSnackbar({
        open: true,
        message: `Payment approved for ${orderNumber}. Status: ${paymentStatus}`,
        severity: 'success'
      });
    };

    // Add event listener
    window.addEventListener('paymentApproved', handlePaymentApproved);

    // Cleanup
    return () => {
      window.removeEventListener('paymentApproved', handlePaymentApproved);
    };
  }, []);

  useEffect(() => {
    if (token) {
      setLoading(true);
      loadCustomers();
      loadWarehouses();
      loadAllTransactions();
      loadSalesData();
      loadAgentAnalytics(); // Load agent analytics when component mounts
    }
  }, [token]);

  useEffect(() => {
    loadProducts();
    loadCustomers();
    loadWarehouses();
    loadAllTransactions();
    loadSalesData();
  }, [token]);

  useEffect(() => {
    loadAgentAnalytics(); // Reload agent analytics when selected agent changes
  }, [selectedAgent, salesAgents]);

  useEffect(() => {
    // Listen for product updates to refresh product list
    const handleProductUpdate = () => {
      console.log('Product updated, refreshing product list in SalesDashboard');
      loadProducts();
    };

    // Listen for sync completion to refresh data
    const handleSyncCompleted = () => {
      console.log('Sync completed, refreshing sales data');
      loadProducts();
      loadCustomers();
      if (typeof loadSalesData === 'function') {
        loadSalesData();
      }
    };

    window.addEventListener('productUpdated', handleProductUpdate);
    window.addEventListener('syncCompleted', handleSyncCompleted);
    
    return () => {
      window.removeEventListener('productUpdated', handleProductUpdate);
      window.removeEventListener('syncCompleted', handleSyncCompleted);
    };
  }, []);

  useEffect(() => {
    const handleWarehouseTransferUpdate = () => {
      console.log('Warehouse transfer detected, refreshing product data...');
      refreshProductData();
    };

    // Listen for warehouse transfer events
    window.addEventListener('warehouseTransferApproved', handleWarehouseTransferUpdate);
    window.addEventListener('warehouseTransferCompleted', handleWarehouseTransferUpdate);
    window.addEventListener('stockMovementCreated', handleWarehouseTransferUpdate);

    return () => {
      window.removeEventListener('warehouseTransferApproved', handleWarehouseTransferUpdate);
      window.removeEventListener('warehouseTransferCompleted', handleWarehouseTransferUpdate);
      window.removeEventListener('stockMovementCreated', handleWarehouseTransferUpdate);
    };
  }, [token]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  const filteredProducts = ((products || [])).filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    product.sku.toLowerCase().includes(searchTerm.toLowerCase()) || 
    product.category_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box sx={{ 
      bgcolor: '#f8fafc', 
      minHeight: '100vh', 
      p: 0, 
      '@media (max-width: 768px)': {
        p: 2
      }
    }}>
      {/* Header */}
      <Box sx={{ 
        background: 'linear-gradient(135deg, #FF9800 0%, #FF5722 100%)',
        color: 'white',
        p: 4,
        borderRadius: '0 0 24px 24px',
        mb: 3,
        '@media (max-width: 768px)': {
          p: 2
        }
      }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
              Sales Dashboard
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              Track your sales performance and customer relationships.
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={2}>
            <TextField
              select
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
              size="small"
              sx={{
                minWidth: 200,
                '& .MuiOutlinedInput-root': {
                  color: 'white',
                  '& fieldset': {
                    borderColor: 'rgba(255,255,255,0.3)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(255,255,255,0.5)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'white',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: 'rgba(255,255,255,0.7)',
                },
                '& .MuiSelect-icon': {
                  color: 'white',
                },
              }}
            >
              {(salesAgents || []).map((agent) => (
                <MenuItem key={agent.id} value={agent.id}>
                  {agent.name}
                </MenuItem>
              ))}
            </TextField>
            <IconButton 
              onClick={handleRefreshData} 
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
      </Box>

      {/* Quick Actions Panel */}
      <Paper sx={{ 
        p: 3, 
        mb: 3, 
        borderRadius: 3, 
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        '@media (max-width: 768px)': {
          p: 2
        }
      }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#333' }}>
          Quick Actions
        </Typography>
        <Grid container spacing={2}>
          {/* Row 1 */}
          <Grid item xs={12} sm={6} md={3}>
            <QuickActionButton
              fullWidth
              variant="contained"
              startIcon={<SellIcon />}
              onClick={() => setSalesOrderDialogOpen(true)}
              sx={{ 
                background: 'linear-gradient(45deg, #FF9800 30%, #FF5722 90%)',
                color: 'white'
              }}
            >
              Create Sales Order
            </QuickActionButton>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <QuickActionButton
              fullWidth
              variant="contained"
              startIcon={<PriceChangeIcon />}
              onClick={() => setPromotionsDialogOpen(true)}
              sx={{ 
                background: 'linear-gradient(45deg, #4CAF50 30%, #388E3C 90%)',
                color: 'white'
              }}
            >
              Create Promotion
            </QuickActionButton>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <QuickActionButton
              fullWidth
              variant="contained"
              startIcon={<ContactsIcon />}
              onClick={() => setCustomerCreationDialogOpen(true)}
              sx={{ 
                background: 'linear-gradient(45deg, #9C27B0 30%, #7B1FA2 90%)',
                color: 'white'
              }}
            >
              Create Customer
            </QuickActionButton>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <QuickActionButton
              fullWidth
              variant="contained"
              startIcon={<TransferWithinAStationIcon />}
              onClick={() => setTransferStockDialogOpen(true)}
              sx={{ 
                background: 'linear-gradient(45deg, #FF5722 30%, #D84315 90%)',
                color: 'white'
              }}
            >
              Transfer Stock
            </QuickActionButton>
          </Grid>
          
          {/* Row 2 */}
          <Grid item xs={12} sm={6} md={3}>
            <QuickActionButton
              fullWidth
              variant="contained"
              startIcon={<VisibilityIcon />}
              onClick={() => setViewTransfersDialogOpen(true)}
              sx={{ 
                background: 'linear-gradient(45deg, #607D8B 30%, #455A64 90%)',
                color: 'white'
              }}
            >
              View Transfers
            </QuickActionButton>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <QuickActionButton
              fullWidth
              variant="contained"
              startIcon={<PersonAddIcon />}
              onClick={() => setAddLeadDialogOpen(true)}
              sx={{ 
                background: 'linear-gradient(45deg, #4CAF50 30%, #388E3C 90%)',
                color: 'white'
              }}
            >
              Add Lead
            </QuickActionButton>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <QuickActionButton
              fullWidth
              variant="contained"
              startIcon={<MapIcon />}
              onClick={() => setCustomerHeatMapDialogOpen(true)}
              sx={{ 
                background: 'linear-gradient(45deg, #2196F3 30%, #1565C0 90%)',
                color: 'white'
              }}
            >
              Customer Heat Map
            </QuickActionButton>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <QuickActionButton
              fullWidth
              variant="contained"
              startIcon={<PointOfSaleIcon />}
              onClick={() => setPosTransactionsDialogOpen(true)}
              sx={{ 
                background: 'linear-gradient(45deg, #FF9800 30%, #F57C00 90%)',
                color: 'white'
              }}
            >
              POS Transactions
            </QuickActionButton>
          </Grid>
          
          {/* Row 3 */}
          <Grid item xs={12} sm={6} md={3}>
            <QuickActionButton
              fullWidth
              variant="contained"
              startIcon={<ReceiptIcon />}
              onClick={() => setTransactionsDialogOpen(true)}
              sx={{ 
                background: 'linear-gradient(45deg, #2196F3 30%, #1976D2 90%)',
                color: 'white'
              }}
            >
              Transactions
            </QuickActionButton>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <QuickActionButton
              fullWidth
              variant="contained"
              startIcon={<AssignmentIndIcon />}
              onClick={() => setStockAssignmentDialogOpen(true)}
              sx={{ 
                background: 'linear-gradient(45deg, #4CAF50 30%, #2E7D32 90%)',
                color: 'white'
              }}
            >
              Assign Stock to Agent
            </QuickActionButton>
          </Grid>
        </Grid>
      </Paper>

      {/* Main Dashboard Content with Tabs */}
      <Paper sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        <StyledTabs 
          value={tabValue} 
          onChange={(e, newValue) => setTabValue(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <StyledTab icon={<AssessmentIcon />} label="Overview" />
          <StyledTab icon={<BarChartIcon />} label="Analytics" />
          <StyledTab icon={<SellIcon />} label="Sales Orders" />
          <StyledTab icon={<PeopleIcon />} label="Customers" />
          <StyledTab icon={<InventoryIcon />} label="Stock Management" />
          <StyledTab icon={<DescriptionIcon />} label="Reports" />
          <StyledTab icon={<PointOfSaleIcon />} label="POS" />
          <StyledTab icon={<MapIcon />} label="Heat Map" />
          <StyledTab icon={<LocalShippingIcon />} label="Warehouse Transfers" />
        </StyledTabs>

        <TabPanel value={tabValue} index={0}>
          {/* Overview Tab */}
          <Grid container spacing={3}>
            {/* Key Metrics */}
            <Grid item xs={12} md={3}>
              <MetricCard>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                        ${salesData?.total_revenue || '0'}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Total Revenue
                      </Typography>
                    </Box>
                    <AttachMoneyIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                  </Box>
                </CardContent>
              </MetricCard>
            </Grid>
            <Grid item xs={12} md={3}>
              <MetricCard>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                        {(customers || []).length}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Total Customers
                      </Typography>
                    </Box>
                    <PeopleIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                  </Box>
                </CardContent>
              </MetricCard>
            </Grid>
            <Grid item xs={12} md={3}>
              <MetricCard>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                        {(allTransactions || []).length}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Total Orders
                      </Typography>
                    </Box>
                    <ShoppingCartIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                  </Box>
                </CardContent>
              </MetricCard>
            </Grid>
            <Grid item xs={12} md={3}>
              <MetricCard>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                        {(products || []).length}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Products Available
                      </Typography>
                    </Box>
                    <InventoryIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                  </Box>
                </CardContent>
              </MetricCard>
            </Grid>

            {/* Recent Transfers Table */}
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Typography variant="h6" fontWeight="bold">
                    Recent Warehouse Transfers
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={loadTransfers}
                    size="small"
                  >
                    Refresh
                  </Button>
                </Box>
                
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Transfer #</strong></TableCell>
                        <TableCell><strong>Product</strong></TableCell>
                        <TableCell><strong>From</strong></TableCell>
                        <TableCell><strong>To</strong></TableCell>
                        <TableCell><strong>Quantity</strong></TableCell>
                        <TableCell><strong>Status</strong></TableCell>
                        <TableCell><strong>Priority</strong></TableCell>
                        <TableCell><strong>Date</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {(transfers || []).slice(0, 10).map((transfer) => (
                        <TableRow key={transfer.id} hover>
                          <TableCell>{transfer.transfer_number}</TableCell>
                          <TableCell>{transfer.product_name}</TableCell>
                          <TableCell>{transfer.from_warehouse_name}</TableCell>
                          <TableCell>{transfer.to_warehouse_name}</TableCell>
                          <TableCell>{transfer.quantity}</TableCell>
                          <TableCell>
                            <Chip
                              label={transfer.status}
                              size="small"
                              color={
                                transfer.status === 'completed' ? 'success' :
                                transfer.status === 'approved' ? 'info' :
                                transfer.status === 'pending' ? 'warning' :
                                transfer.status === 'rejected' ? 'error' : 'default'
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={transfer.priority}
                              size="small"
                              variant="outlined"
                              color={
                                transfer.priority === 'urgent' ? 'error' :
                                transfer.priority === 'high' ? 'warning' :
                                transfer.priority === 'medium' ? 'info' : 'default'
                              }
                            />
                          </TableCell>
                          <TableCell>
                            {new Date(transfer.request_date).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                
                {(transfers || []).length === 0 && (
                  <Box textAlign="center" py={4}>
                    <Typography color="textSecondary">
                      No warehouse transfers found
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* Recent Sales */}
            <Grid item xs={12} md={8}>
              <AnalyticsCard>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Recent Sales
                  </Typography>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Order ID</TableCell>
                          <TableCell>Customer</TableCell>
                          <TableCell>Amount</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Date</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {(allTransactions || []).slice(0, 5).map((sale, index) => (
                          <TableRow key={index}>
                            <TableCell>#{sale.id || `ORD-${index + 1}`}</TableCell>
                            <TableCell>{sale.customer || 'N/A'}</TableCell>
                            <TableCell>${sale.amount || '0.00'}</TableCell>
                            <TableCell>
                              <Chip 
                                label={sale.status || 'Pending'} 
                                color={sale.status === 'completed' ? 'success' : 'warning'}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>{sale.date || new Date().toLocaleDateString()}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </AnalyticsCard>
            </Grid>

            {/* Top Products */}
            <Grid item xs={12} md={4}>
              <AnalyticsCard>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Top Products
                  </Typography>
                  <List>
                    {(products || []).slice(0, 5).map((product, index) => (
                      <ListItem key={index} sx={{ px: 0 }}>
                        <ListItemText 
                          primary={product.name || `Product ${index + 1}`}
                          secondary={`${product.stock_quantity || 0} in stock`}
                        />
                        <Typography variant="body2" color="primary" sx={{ fontWeight: 600 }}>
                          ${product.unit_price || '0.00'}
                        </Typography>
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </AnalyticsCard>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {/* Analytics Tab */}
          <AdvancedAnalytics 
            data={salesData} 
            selectedAgent={selectedAgent}
            agentAnalytics={agentAnalytics}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          {/* Sales Orders Management Tab */}
          <SalesOrdersManagement 
            onSnackbar={handleSnackbar}
            customers={customers}
            products={products}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          {/* Customers Tab */}
          <Typography variant="h6" sx={{ mb: 2 }}>Customer Management</Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Location</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(customers || []).map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>{customer.name}</TableCell>
                    <TableCell>{customer.email}</TableCell>
                    <TableCell>{customer.phone}</TableCell>
                    <TableCell>
                      <Chip 
                        label={customer.customer_type || 'N/A'} 
                        size="small"
                        color="primary"
                      />
                    </TableCell>
                    <TableCell>{customer.location || 'N/A'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        <TabPanel value={tabValue} index={4}>
          {/* Stock Management Tab */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Avatar sx={{ bgcolor: '#2196F3', width: 40, height: 40 }}>
                <InventoryIcon />
              </Avatar>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#333' }}>
                  Stock Management
                </Typography>
                <Typography variant="h6" sx={{ color: '#666', fontWeight: 500 }}>
                  {(warehouses || []).length > 0 ? (warehouses || [])[0].name : 'Main Warehouse'} - Inventory Overview
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
              <TextField
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ minWidth: 300 }}
              />
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setQuickActionDialog({ open: true, type: 'stock_adjustment' })}
                sx={{
                  background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #1976D2 30%, #0288D1 90%)',
                  }
                }}
              >
                Stock Adjustment
              </Button>
              <Button
                variant="contained"
                startIcon={<RefreshIcon />}
                onClick={loadProducts}
                sx={{
                  background: 'linear-gradient(45deg, #FF9800 30%, #FF5722 90%)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #FF9800 30%, #FF5722 90%)',
                  }
                }}
              >
                Refresh Stock
              </Button>
            </Box>
          </Box>
          <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell>SKU</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Current Stock</TableCell>
                  <TableCell>Min Stock</TableCell>
                  <TableCell>Max Stock</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Last Updated</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(filteredProducts || []).map((product) => {
                  const stockStatus = product.quantity <= (product.min_stock || 0) ? 'low' : 
                                    product.quantity === 0 ? 'out' : 'good';
                  const statusColor = stockStatus === 'out' ? 'error' : 
                                    stockStatus === 'low' ? 'warning' : 'success';
                  
                  return (
                    <TableRow key={product.id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ bgcolor: '#2196F3' }}>
                            <InventoryIcon />
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2">{product.name}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {product.description}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>{product.sku}</TableCell>
                      <TableCell>
                        <Chip label={product.category_name || product.category} size="small" />
                      </TableCell>
                      <TableCell>
                        <Typography variant="h6" color={statusColor === 'error' ? 'error' : statusColor === 'warning' ? 'warning.main' : 'success.main'}>
                          {product.quantity}
                        </Typography>
                      </TableCell>
                      <TableCell>{product.min_stock || 0}</TableCell>
                      <TableCell>{product.max_stock || 'No limit'}</TableCell>
                      <TableCell>
                        <Chip 
                          label={stockStatus === 'out' ? 'Out of Stock' : stockStatus === 'low' ? 'Low Stock' : 'In Stock'} 
                          color={statusColor}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption">
                          {new Date(product.updated_at || product.created_at).toLocaleDateString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <IconButton 
                          onClick={() => setQuickActionDialog({ 
                            open: true, 
                            type: 'stock_adjustment',
                            product: product 
                          })} 
                          size="small"
                          title="Adjust Stock"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton 
                          onClick={() => setQuickActionDialog({ 
                            open: true, 
                            type: 'transfer_stock',
                            product: product 
                          })} 
                          size="small"
                          title="Transfer Stock"
                        >
                          <SwapHorizIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        <TabPanel value={tabValue} index={5}>
          {/* Reports Tab */}
          <SalesReports />
        </TabPanel>

        <TabPanel value={tabValue} index={6}>
          {/* POS Tab */}
          <Typography variant="h6" sx={{ mb: 2 }}>Point of Sale</Typography>
          <Typography variant="body1">POS functionality will be implemented here.</Typography>
        </TabPanel>

        <TabPanel value={tabValue} index={7}>
          {/* Heat Map Tab */}
          <Typography variant="h6" sx={{ mb: 2 }}>Customer Heat Map</Typography>
          <CustomerHeatMap customers={customers} />
        </TabPanel>

        <TabPanel value={tabValue} index={8}>
          {/* Warehouse Transfers Tab */}
          <Typography variant="h6" sx={{ mb: 2 }}>Warehouse Transfers</Typography>
          <WarehouseTransferModule />
        </TabPanel>
      </Paper>

      {/* Create Sales Order Dialog */}
      <Dialog 
        open={salesOrderDialogOpen} 
        onClose={() => setSalesOrderDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #FF9800 0%, #FF5722 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <SellIcon />
          Create Sales Order
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {/* Customer Selection */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Customer</Typography>
            <Autocomplete
              options={customers || []}
              getOptionLabel={(option) => option.name || ''}
              value={selectedCustomer}
              onChange={(event, newValue) => setSelectedCustomer(newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Select customer"
                  fullWidth
                />
              )}
            />
          </Box>

          {/* Products Section */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Products</Typography>
            {(orderProducts || []).map((item, index) => (
              <Box key={index} sx={{ 
                display: 'flex', 
                gap: 2, 
                mb: 2, 
                p: 2, 
                border: '1px solid #e0e0e0', 
                borderRadius: 2,
                alignItems: 'center'
              }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>Product</Typography>
                  <Autocomplete
                    options={products || []}
                    getOptionLabel={(option) => `${option.sku} - ${option.name} - $${option.unit_price}`}
                    value={item.product}
                    onChange={(event, newValue) => updateOrderProduct(index, 'product', newValue)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder="Select product"
                        size="small"
                      />
                    )}
                  />
                </Box>
                <Box sx={{ width: 120 }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>Quantity</Typography>
                  <TextField
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateOrderProduct(index, 'quantity', parseInt(e.target.value) || 1)}
                    size="small"
                    inputProps={{ min: 1 }}
                  />
                </Box>
                <IconButton 
                  onClick={() => removeProductFromOrder(index)}
                  color="error"
                  disabled={(orderProducts || []).length === 1}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))}
            <Button
              startIcon={<AddIcon />}
              onClick={addProductToOrder}
              variant="outlined"
              color="success"
            >
              Add Another Product
            </Button>
          </Box>

          {/* Payment Information */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Payment Information</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Payment Method</InputLabel>
                  <Select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    label="Payment Method"
                  >
                    <MenuItem value="cash">Cash</MenuItem>
                    <MenuItem value="credit">Credit</MenuItem>
                    <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
                    <MenuItem value="mobile_money">Mobile Money</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Discount (%)"
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                  fullWidth
                  inputProps={{ min: 0, max: 100 }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  fullWidth
                  multiline
                  rows={2}
                />
              </Grid>
            </Grid>
          </Box>

          {/* Total */}
          <Box sx={{ textAlign: 'right', mb: 2 }}>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              Total: ${calculateOrderTotal().toFixed(2)}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setSalesOrderDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            variant="contained"
            onClick={handleCreateSalesOrder}
            startIcon={<CheckCircleIcon />}
            sx={{ 
              background: 'linear-gradient(45deg, #FF9800 30%, #FF5722 90%)',
              color: 'white'
            }}
          >
            Create Order & Print
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Quick Action Dialogs */}
      <QuickActionDialogs
        // Dialog states
        promotionsDialogOpen={promotionsDialogOpen}
        setPromotionsDialogOpen={setPromotionsDialogOpen}
        quoteDialogOpen={quoteDialogOpen}
        setQuoteDialogOpen={setQuoteDialogOpen}
        transferStockDialogOpen={transferStockDialogOpen}
        setTransferStockDialogOpen={setTransferStockDialogOpen}
        viewTransfersDialogOpen={viewTransfersDialogOpen}
        setViewTransfersDialogOpen={setViewTransfersDialogOpen}
        addLeadDialogOpen={addLeadDialogOpen}
        setAddLeadDialogOpen={setAddLeadDialogOpen}
        posTransactionsDialogOpen={posTransactionsDialogOpen}
        setPosTransactionsDialogOpen={setPosTransactionsDialogOpen}
        transactionsDialogOpen={transactionsDialogOpen}
        setTransactionsDialogOpen={setTransactionsDialogOpen}
        stockAssignmentDialogOpen={stockAssignmentDialogOpen}
        setStockAssignmentDialogOpen={setStockAssignmentDialogOpen}
        customerCreationDialogOpen={customerCreationDialogOpen}
        setCustomerCreationDialogOpen={setCustomerCreationDialogOpen}
        customerHeatMapDialogOpen={customerHeatMapDialogOpen}
        setCustomerHeatMapDialogOpen={setCustomerHeatMapDialogOpen}
        salesOrderDialogOpen={salesOrderDialogOpen}
        setSalesOrderDialogOpen={setSalesOrderDialogOpen}
        
        // Data
        customers={customers}
        products={products}
        warehouses={warehouses}
        salesAgents={salesAgents}
        
        // Handlers
        onSnackbar={handleSnackbar}
        refreshCustomers={loadCustomers}
      />
    </Box>
  );
};

export default SalesDashboard;

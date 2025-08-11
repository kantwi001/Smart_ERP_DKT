import React, { useState, useEffect, useContext } from 'react';
import { 
  Box, Typography, Grid, Card, CardContent, CircularProgress, Alert,
  Tabs, Tab, Paper, Chip, Avatar, LinearProgress, Divider, IconButton, List, ListItem, ListItemText,
  Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Snackbar
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AssessmentIcon from '@mui/icons-material/Assessment';
import PeopleIcon from '@mui/icons-material/People';
import InventoryIcon from '@mui/icons-material/Inventory';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import BarChartIcon from '@mui/icons-material/BarChart';
import RefreshIcon from '@mui/icons-material/Refresh';
import SellIcon from '@mui/icons-material/Sell';
import AddIcon from '@mui/icons-material/Add';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import DescriptionIcon from '@mui/icons-material/Description';
import ContactsIcon from '@mui/icons-material/Contacts';
import AddBoxIcon from '@mui/icons-material/AddBox';
import PriceChangeIcon from '@mui/icons-material/PriceChange';
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

const periods = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: 'custom', label: 'Custom' },
];

const mockSummary = [
  { title: 'Total Sales', value: 320, icon: <AssessmentIcon />, color: 'primary' },
  { title: 'Revenue', value: '₵25,000', icon: <SwapHorizIcon />, color: 'success' },
  { title: 'Customers', value: 110, icon: <PeopleIcon />, color: 'secondary' },
  { title: 'Products Sold', value: 75, icon: <InventoryIcon />, color: 'info' },
];

const mockLineData = [
  { date: 'Jul 14', Sales: 22, Revenue: 2000 },
  { date: 'Jul 15', Sales: 28, Revenue: 2500 },
  { date: 'Jul 16', Sales: 30, Revenue: 2800 },
  { date: 'Jul 17', Sales: 35, Revenue: 3200 },
  { date: 'Jul 18', Sales: 40, Revenue: 3500 },
  { date: 'Jul 19', Sales: 38, Revenue: 3400 },
  { date: 'Jul 20', Sales: 35, Revenue: 3600 },
];

const mockPieData1 = [
  { name: 'Retail', value: 60 },
  { name: 'Wholesale', value: 40 },
];
const mockPieData2 = [
  { name: 'Accra', value: 70 },
  { name: 'Kumasi', value: 20 },
  { name: 'Takoradi', value: 10 },
];
const mockPieData3 = [
  { name: 'Cash', value: 50 },
  { name: 'Card', value: 30 },
  { name: 'Mobile Money', value: 20 },
];

const SalesDashboard = () => {
  const { token, user } = useContext(AuthContext);
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [salesData, setSalesData] = useState([]);
  
  // Transaction integration
  const {
    transactions,
    analytics,
    createSalesOrder,
    completePOSSale,
    refreshData
  } = useTransactionIntegration('sales');
  
  // Quick Actions State
  const [quoteDialogOpen, setQuoteDialogOpen] = useState(false);
  const [leadDialogOpen, setLeadDialogOpen] = useState(false);
  const [salesOrderDialogOpen, setSalesOrderDialogOpen] = useState(false);
  const [addCustomerDialogOpen, setAddCustomerDialogOpen] = useState(false);
  const [addProductDialogOpen, setAddProductDialogOpen] = useState(false);
  const [priceManagementDialogOpen, setPriceManagementDialogOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  
  // Form State
  const [quoteForm, setQuoteForm] = useState({
    customer: '',
    product: '',
    quantity: '',
    notes: ''
  });
  
  const [leadForm, setLeadForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    source: 'website'
  });
  
  const [salesOrderForm, setSalesOrderForm] = useState({
    customer: '',
    products: [{ product: '', quantity: 1, price: '' }],
    notes: '',
    discount: 0
  });

  const [customerForm, setCustomerForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    customer_type: 'retailer',
    warehouse: '',
    contact_person: '',
    tax_number: '',
    credit_limit: '',
    payment_terms: 'cash'
  });

  const [productForm, setProductForm] = useState({
    name: '',
    sku: '',
    price: '',
    description: ''
  });

  const [priceForm, setPriceForm] = useState({
    product: '',
    price: ''
  });

  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [recentSales, setRecentSales] = useState([]);
  const [filters, setFilters] = useState({});
  const [salesAgents, setSalesAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState('all');
  const [agentAnalytics, setAgentAnalytics] = useState(null);

  // Role-based access control for product management
  const canManageProducts = () => {
    if (!user) return false;
    
    // Check if user is superadmin or has specific roles
    const allowedRoles = ['sales_manager', 'superadmin', 'sales_supervisor', 'logistics'];
    const allowedDepartments = ['logistics'];
    
    return (
      user.is_superuser ||
      user.role === 'superadmin' ||
      allowedRoles.includes(user.role?.toLowerCase()) ||
      allowedDepartments.includes(user.department_name?.toLowerCase()) ||
      user.role?.toLowerCase().includes('manager') ||
      user.role?.toLowerCase().includes('supervisor')
    );
  };

  // Separate access control for Add Product (more restrictive)
  const canAddProducts = () => {
    if (!user) return false;
    
    // Exclude regular sales department users, but allow specific roles
    const allowedRoles = ['sales_manager', 'superadmin', 'sales_supervisor', 'logistics'];
    
    return (
      user.is_superuser ||
      user.role === 'superadmin' ||
      allowedRoles.includes(user.role?.toLowerCase()) ||
      user.department_name?.toLowerCase() === 'logistics' ||
      (user.role?.toLowerCase().includes('manager') && user.department_name?.toLowerCase() !== 'sales') ||
      (user.role?.toLowerCase().includes('supervisor') && user.department_name?.toLowerCase() !== 'sales') ||
      (user.role?.toLowerCase() === 'sales_manager') ||
      (user.role?.toLowerCase() === 'sales_supervisor')
    );
  };

  // Mock data for demonstration
  const recentActivity = [
    { action: 'New sale completed - Order #1234', timestamp: '2 minutes ago', type: 'success' },
    { action: 'Customer payment received', timestamp: '15 minutes ago', type: 'success' },
    { action: 'Quote sent to customer', timestamp: '1 hour ago', type: 'info' },
    { action: 'Follow-up call scheduled', timestamp: '2 hours ago', type: 'warning' },
    { action: 'Product demo completed', timestamp: '3 hours ago', type: 'info' },
  ];

  useEffect(() => {
    loadDashboardData();
    loadCustomers();
    loadProducts();
    loadWarehouses();
    loadSalesAgents();
  }, [token]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/sales/dashboard/');
      setSalesData(response.data);
    } catch (error) {
      setError('Failed to load dashboard data');
      console.error('Dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCustomers = async () => {
    try {
      const response = await api.get('/sales/customers/');
      setCustomers(response.data.results || response.data);
    } catch (error) {
      console.error('Failed to load customers:', error);
    }
  };

  const loadProducts = async () => {
    try {
      const response = await api.get('/inventory/products/');
      setProducts(response.data.results || response.data);
    } catch (error) {
      console.error('Failed to load products:', error);
    }
  };

  const loadWarehouses = async () => {
    try {
      const response = await api.get('/warehouse/');
      setWarehouses(response.data.results || response.data);
    } catch (error) {
      console.error('Failed to load warehouses:', error);
    }
  };

  const loadSalesAgents = async () => {
    try {
      const response = await api.get('/sales/agents/');
      setSalesAgents(response.data.results || response.data);
    } catch (error) {
      console.error('Failed to load sales agents:', error);
    }
  };

  // Quick Action Handlers
  const handleCreateSalesOrder = () => {
    // Open sales order creation dialog
    setSalesOrderDialogOpen(true);
  };
  
  const handleCreateSalesOrderSubmit = async () => {
    try {
      if (!salesOrderForm.customer || salesOrderForm.products.length === 0) {
        setSnackbarMessage('Please select a customer and add at least one product');
        setSnackbarOpen(true);
        return;
      }

      // Validate products
      const invalidProducts = salesOrderForm.products.filter(p => !p.product || !p.quantity || p.quantity <= 0);
      if (invalidProducts.length > 0) {
        setSnackbarMessage('Please fill in all product details with valid quantities');
        setSnackbarOpen(true);
        return;
      }

      // Create sales order via backend API
      const orderData = {
        customer: salesOrderForm.customer,
        products: salesOrderForm.products.map(p => ({
          product: p.product,
          quantity: parseInt(p.quantity),
          unit_price: parseFloat(p.price) || 0
        })),
        notes: salesOrderForm.notes,
        discount: parseFloat(salesOrderForm.discount) || 0,
        status: 'pending'
      };

      const response = await api.post('/sales/', orderData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('Sales order created:', response.data);
      setSnackbarMessage('Sales order created successfully!');
      setSnackbarOpen(true);
      setSalesOrderDialogOpen(false);
      setSalesOrderForm({
        customer: '',
        products: [{ product: '', quantity: 1, price: '' }],
        notes: '',
        discount: 0
      });
      
      // Refresh sales data to show new order
      loadDashboardData();
    } catch (error) {
      console.error('Failed to create sales order:', error);
      setSnackbarMessage('Failed to create sales order');
      setSnackbarOpen(true);
    }
  };
  
  const handleAddCustomer = async () => {
    try {
      if (!customerForm.name || !customerForm.email) {
        setSnackbarMessage('Please fill in name and email fields');
        setSnackbarOpen(true);
        return;
      }

      // Create customer via backend API
      const customerData = {
        name: customerForm.name,
        email: customerForm.email,
        phone: customerForm.phone,
        address: customerForm.address,
        customer_type: customerForm.customer_type,
        warehouse: customerForm.warehouse,
        contact_person: customerForm.contact_person,
        tax_number: customerForm.tax_number,
        credit_limit: customerForm.credit_limit,
        payment_terms: customerForm.payment_terms,
        status: 'active'
      };

      const response = await api.post('/sales/customers/', customerData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('Customer created:', response.data);
      setSnackbarMessage('Customer added successfully!');
      setSnackbarOpen(true);
      setAddCustomerDialogOpen(false);
      setCustomerForm({
        name: '',
        email: '',
        phone: '',
        address: '',
        customer_type: 'retailer',
        warehouse: '',
        contact_person: '',
        tax_number: '',
        credit_limit: '',
        payment_terms: 'cash'
      });
      
      // Refresh customers data to show new customer
      loadCustomers();
    } catch (error) {
      console.error('Failed to add customer:', error);
      setSnackbarMessage('Failed to add customer');
      setSnackbarOpen(true);
    }
  };
  
  const handleGenerateQuote = async () => {
    try {
      if (!quoteForm.customer || !quoteForm.product || !quoteForm.quantity) {
        setSnackbarMessage('Please fill in all required fields');
        setSnackbarOpen(true);
        return;
      }

      // Create quote via backend API
      const quoteData = {
        customer: quoteForm.customer,
        product: quoteForm.product,
        quantity: parseInt(quoteForm.quantity),
        notes: quoteForm.notes,
        status: 'draft'
      };

      const response = await api.post('/sales/quotes/', quoteData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('Quote created:', response.data);
      setSnackbarMessage('Quote generated successfully!');
      setSnackbarOpen(true);
      setQuoteDialogOpen(false);
      setQuoteForm({ customer: '', product: '', quantity: '', notes: '' });
      
      // Refresh sales data to show new quote
      loadDashboardData();
    } catch (error) {
      console.error('Failed to generate quote:', error);
      setSnackbarMessage('Failed to generate quote');
      setSnackbarOpen(true);
    }
  };
  
  const handleAddLead = async () => {
    try {
      if (!leadForm.name || !leadForm.email) {
        setSnackbarMessage('Please fill in name and email fields');
        setSnackbarOpen(true);
        return;
      }

      // Create lead via backend API
      const leadData = {
        name: leadForm.name,
        email: leadForm.email,
        phone: leadForm.phone,
        company: leadForm.company,
        source: leadForm.source,
        status: 'new'
      };

      const response = await api.post('/sales/leads/', leadData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('Lead created:', response.data);
      setSnackbarMessage('Lead added successfully!');
      setSnackbarOpen(true);
      setLeadDialogOpen(false);
      setLeadForm({ name: '', email: '', phone: '', company: '', source: 'website' });
      
      // Refresh sales data to show new lead
      loadDashboardData();
    } catch (error) {
      console.error('Failed to add lead:', error);
      setSnackbarMessage('Failed to add lead');
      setSnackbarOpen(true);
    }
  };
  
  const handleAddProduct = async () => {
    try {
      if (!productForm.name || !productForm.sku || !productForm.price) {
        setSnackbarMessage('Please fill in all required fields');
        setSnackbarOpen(true);
        return;
      }

      // Create product via backend API
      const productData = {
        name: productForm.name,
        sku: productForm.sku,
        price: parseFloat(productForm.price),
        description: productForm.description
      };

      const response = await api.post('/inventory/products/', productData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('Product created:', response.data);
      setSnackbarMessage('Product added successfully!');
      setSnackbarOpen(true);
      setAddProductDialogOpen(false);
      setProductForm({
        name: '',
        sku: '',
        price: '',
        description: ''
      });
      
      // Refresh products data to show new product
      loadProducts();
    } catch (error) {
      console.error('Failed to add product:', error);
      setSnackbarMessage('Failed to add product');
      setSnackbarOpen(true);
    }
  };
  
  const handlePriceManagement = async () => {
    try {
      if (!priceForm.product || !priceForm.price) {
        setSnackbarMessage('Please select a product and enter a price');
        setSnackbarOpen(true);
        return;
      }

      // Update price via backend API
      const priceData = {
        product: priceForm.product,
        price: parseFloat(priceForm.price)
      };

      const response = await api.put('/inventory/products/price/', priceData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('Price updated:', response.data);
      setSnackbarMessage('Price updated successfully!');
      setSnackbarOpen(true);
      setPriceManagementDialogOpen(false);
      setPriceForm({
        product: '',
        price: ''
      });
      
      // Refresh products data to show updated price
      loadProducts();
    } catch (error) {
      console.error('Failed to update price:', error);
      setSnackbarMessage('Failed to update price');
      setSnackbarOpen(true);
    }
  };
  
  const handleRefreshData = () => {
    setLoading(true);
    loadDashboardData();
  };
  
  const fetchSalesData = async () => {
    setLoading(true);
    try {
      // Fetch sales data with error handling
      try {
        const salesRes = await api.get('/sales/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSalesData(salesRes.data || []);
      } catch (err) {
        console.warn('Failed to load sales data:', err);
      }

      // Fetch customers data with error handling
      try {
        const customersRes = await api.get('/sales/customers/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCustomers(customersRes.data || []);
      } catch (err) {
        console.warn('Failed to load customers data:', err);
      }

      // Fetch products data with error handling
      try {
        const productsRes = await api.get('/inventory/products/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProducts(productsRes.data || []);
      } catch (err) {
        console.warn('Failed to load products data:', err);
      }

      // Fetch sales agents data with error handling
      try {
        const agentsRes = await api.get('/users/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        // Filter for sales agents/reps
        const agents = (agentsRes.data || []).filter(user => 
          user.role === 'sales_rep' || user.role === 'sales_manager' || 
          (user.department && user.department.name && user.department.name.toLowerCase().includes('sales'))
        );
        setSalesAgents(agents);
      } catch (err) {
        console.warn('Failed to load sales agents data:', err);
      }

      // Fetch recent sales with error handling
      try {
        const recentSalesRes = await api.get('/sales/recent/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setRecentSales(recentSalesRes.data || []);
      } catch (err) {
        console.warn('Failed to load recent sales data:', err);
      }

    } catch (error) {
      console.error('Error fetching sales data:', error);
      setError('Failed to load sales data');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchAgentAnalytics = async (agentId) => {
    try {
      const analyticsRes = await api.get(`/sales/agent-analytics/${agentId}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAgentAnalytics(analyticsRes.data);
    } catch (error) {
      console.warn('Failed to load agent analytics:', error);
      // Fallback: calculate basic analytics from existing data
      const agentSales = recentSales.filter(sale => sale.staff === agentId);
      const agentCustomers = customers.filter(customer => customer.assigned_to === agentId);
      
      setAgentAnalytics({
        total_sales: agentSales.reduce((sum, sale) => sum + parseFloat(sale.total || 0), 0),
        total_orders: agentSales.length,
        total_customers: agentCustomers.length,
        revenue: agentSales.reduce((sum, sale) => sum + parseFloat(sale.total || 0), 0),
        products_sold: agentSales.reduce((sum, sale) => sum + (sale.items?.length || 1), 0)
      });
    }
  };
  
  const handleAgentChange = (agentId) => {
    setSelectedAgent(agentId);
    if (agentId !== 'all') {
      fetchAgentAnalytics(agentId);
    } else {
      setAgentAnalytics(null);
    }
  };
  
  useEffect(() => {
    if (token) {
      loadDashboardData();
    }
  }, [token]);

  return (
    <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh', p: 0 }}>
      {/* Header */}
      <Box sx={{ 
        background: 'linear-gradient(135deg, #FF9800 0%, #FF5722 100%)',
        color: 'white',
        p: 4,
        borderRadius: '0 0 24px 24px',
        mb: 3
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
              label="Sales Agent"
              value={selectedAgent}
              onChange={(e) => handleAgentChange(e.target.value)}
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
              <MenuItem value="all">All Sales Agents</MenuItem>
              {salesAgents.map((agent) => (
                <MenuItem key={agent.id} value={agent.id}>
                  {agent.first_name} {agent.last_name} ({agent.email})
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
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
      }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#333' }}>
          Quick Actions
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <QuickActionButton
              fullWidth
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateSalesOrder}
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
              startIcon={<PersonAddIcon />}
              onClick={() => setAddCustomerDialogOpen(true)}
              sx={{ 
                background: 'linear-gradient(45deg, #4CAF50 30%, #2E7D32 90%)',
                color: 'white'
              }}
            >
              Add Customer
            </QuickActionButton>
          </Grid>
          {canAddProducts() && (
            <>
              <Grid item xs={12} sm={6} md={3}>
                <QuickActionButton
                  fullWidth
                  variant="contained"
                  startIcon={<AddBoxIcon />}
                  onClick={() => setAddProductDialogOpen(true)}
                  sx={{ 
                    background: 'linear-gradient(45deg, #2196F3 30%, #1976D2 90%)',
                    color: 'white'
                  }}
                >
                  Add Product
                </QuickActionButton>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <QuickActionButton
                  fullWidth
                  variant="contained"
                  startIcon={<PriceChangeIcon />}
                  onClick={() => setPriceManagementDialogOpen(true)}
                  sx={{ 
                    background: 'linear-gradient(45deg, #9C27B0 30%, #7B1FA2 90%)',
                    color: 'white'
                  }}
                >
                  Price Management
                </QuickActionButton>
              </Grid>
            </>
          )}
          <Grid item xs={12} sm={6} md={3}>
            <QuickActionButton
              fullWidth
              variant="contained"
              startIcon={<DescriptionIcon />}
              onClick={() => setQuoteDialogOpen(true)}
              sx={{ 
                background: 'linear-gradient(45deg, #2196F3 30%, #1976D2 90%)',
                color: 'white'
              }}
            >
              Generate Quote
            </QuickActionButton>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <QuickActionButton
              fullWidth
              variant="contained"
              startIcon={<ContactsIcon />}
              onClick={() => setLeadDialogOpen(true)}
              sx={{ 
                background: 'linear-gradient(45deg, #9C27B0 30%, #7B1FA2 90%)',
                color: 'white'
              }}
            >
              Add Lead
            </QuickActionButton>
          </Grid>
        </Grid>
      </Paper>

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
          <StyledTab icon={<SellIcon />} label="Sales" />
          <StyledTab icon={<PeopleIcon />} label="Customers" />
          <StyledTab icon={<BarChartIcon />} label="Analytics" />
        </StyledTabs>

        {/* Overview Tab */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            {/* Key Metrics */}
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="body2" sx={{ opacity: 0.8, mb: 1 }}>Total Sales</Typography>
                      <Typography variant="h3" sx={{ fontWeight: 700 }}>
                        {salesData.length || 320}
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                      <AssessmentIcon sx={{ fontSize: 28 }} />
                    </Avatar>
                  </Box>
                </CardContent>
              </MetricCard>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <MetricCard sx={{ background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="body2" sx={{ opacity: 0.8, mb: 1 }}>Revenue</Typography>
                      <Typography variant="h3" sx={{ fontWeight: 700 }}>
                        ₵25,000
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                      <AttachMoneyIcon sx={{ fontSize: 28 }} />
                    </Avatar>
                  </Box>
                </CardContent>
              </MetricCard>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <MetricCard sx={{ background: 'linear-gradient(135deg, #2196F3 0%, #1565C0 100%)' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="body2" sx={{ opacity: 0.8, mb: 1 }}>Customers</Typography>
                      <Typography variant="h3" sx={{ fontWeight: 700 }}>
                        {customers.length || 110}
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                      <PeopleIcon sx={{ fontSize: 28 }} />
                    </Avatar>
                  </Box>
                </CardContent>
              </MetricCard>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <MetricCard sx={{ background: 'linear-gradient(135deg, #9C27B0 0%, #6A1B9A 100%)' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="body2" sx={{ opacity: 0.8, mb: 1 }}>Products Sold</Typography>
                      <Typography variant="h3" sx={{ fontWeight: 700 }}>
                        75
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                      <ShoppingCartIcon sx={{ fontSize: 28 }} />
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
                    <SellIcon sx={{ mr: 1, color: '#FF9800' }} />
                    Recent Sales Activity
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
                          label={item.type === 'success' ? 'Completed' : item.type === 'warning' ? 'Pending' : 'Info'}
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

            {/* Sales Performance */}
            <Grid item xs={12} md={4}>
              <AnalyticsCard>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Sales Performance</Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Box sx={{ space: 2 }}>
                    <Box sx={{ mb: 2 }}>
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="body2">Monthly Target</Typography>
                        <Typography variant="body2" color="success.main">85%</Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={85} color="success" sx={{ borderRadius: 1, height: 8 }} />
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="body2">Conversion Rate</Typography>
                        <Typography variant="body2" color="primary">72%</Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={72} sx={{ borderRadius: 1, height: 8 }} />
                    </Box>
                    <Box>
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="body2">Customer Satisfaction</Typography>
                        <Typography variant="body2" color="warning.main">94%</Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={94} color="warning" sx={{ borderRadius: 1, height: 8 }} />
                    </Box>
                  </Box>
                </CardContent>
              </AnalyticsCard>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Sales Tab */}
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <AnalyticsCard>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Recent Sales</Typography>
                  <Divider sx={{ mb: 2 }} />
                  {recentSales.length > 0 ? (
                    <List sx={{ py: 0 }}>
                      {recentSales.slice(0, 10).map((sale, idx) => (
                        <ListItem key={idx} sx={{ px: 0, py: 1 }}>
                          <ListItemText 
                            primary={`Sale #${sale.id || (1000 + idx)} - ${sale.customer?.name || 'Customer'}`}
                            secondary={`Amount: ₵${sale.total_amount || (Math.random() * 1000).toFixed(2)} | Date: ${sale.date || 'Today'}`}
                            primaryTypographyProps={{ fontWeight: 500 }}
                          />
                          <Chip 
                            label={sale.status || 'Completed'}
                            size="small" 
                            color="success"
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Alert severity="info" sx={{ borderRadius: 2 }}>No sales data available</Alert>
                  )}
                </CardContent>
              </AnalyticsCard>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Customers Tab */}
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <AnalyticsCard>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Customer Overview</Typography>
                  <Divider sx={{ mb: 2 }} />
                  {customers.length > 0 ? (
                    <List sx={{ py: 0 }}>
                      {customers.slice(0, 10).map((customer, idx) => (
                        <ListItem key={idx} sx={{ px: 0, py: 1 }}>
                          <ListItemText 
                            primary={customer.name || `Customer ${idx + 1}`}
                            secondary={`Email: ${customer.email || 'N/A'} | Phone: ${customer.phone || 'N/A'}`}
                            primaryTypographyProps={{ fontWeight: 500 }}
                          />
                          <Chip 
                            label={customer.status || 'Active'}
                            size="small" 
                            color={customer.status === 'Active' ? 'success' : 'default'}
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Alert severity="info" sx={{ borderRadius: 2 }}>No customer data available</Alert>
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
                moduleId="sales" 
                title="Sales Transaction Flow"
              />
            </Grid>
            
            {/* Time-Based Analytics */}
            <Grid item xs={12} md={6}>
              <TimeBasedAnalytics 
                moduleId="sales" 
                title="Sales Trends Analysis"
              />
            </Grid>
            
            {/* Advanced Analytics with Charts */}
            <Grid item xs={12}>
              <AdvancedAnalytics 
                moduleId="sales" 
                title="Sales Performance Analytics"
                data={{
                  revenue: 125000,
                  customers: 45,
                  orders: 320,
                  conversion_rate: 72
                }}
              />
            </Grid>
            
            {/* Gantt Chart for Sales Projects */}
            <Grid item xs={12}>
              <GanttChart 
                title="Sales Project Timeline"
                projects={[
                  {
                    id: 1,
                    name: 'Q1 Sales Campaign',
                    type: 'sales',
                    manager: 'Sales Manager',
                    status: 'in-progress',
                    priority: 'high',
                    startDate: new Date('2024-01-01'),
                    endDate: new Date('2024-03-31'),
                    progress: 65,
                    budget: 50000,
                    team: ['Sales Rep 1', 'Sales Rep 2', 'Marketing Lead'],
                    tasks: [
                      {
                        id: 101,
                        name: 'Lead Generation',
                        startDate: new Date('2024-01-01'),
                        endDate: new Date('2024-01-31'),
                        progress: 100,
                        status: 'completed',
                        assignee: 'Sales Rep 1',
                        dependencies: []
                      },
                      {
                        id: 102,
                        name: 'Proposal Development',
                        startDate: new Date('2024-01-15'),
                        endDate: new Date('2024-02-15'),
                        progress: 80,
                        status: 'in-progress',
                        assignee: 'Sales Rep 2',
                        dependencies: [101]
                      },
                      {
                        id: 103,
                        name: 'Client Meetings',
                        startDate: new Date('2024-02-01'),
                        endDate: new Date('2024-03-15'),
                        progress: 40,
                        status: 'in-progress',
                        assignee: 'Marketing Lead',
                        dependencies: [102]
                      },
                      {
                        id: 104,
                        name: 'Contract Finalization',
                        startDate: new Date('2024-03-01'),
                        endDate: new Date('2024-03-31'),
                        progress: 10,
                        status: 'pending',
                        assignee: 'Sales Manager',
                        dependencies: [103]
                      }
                    ]
                  }
                ]}
              />
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>
      
      {/* Quote Generation Dialog */}
      <Dialog open={quoteDialogOpen} onClose={() => setQuoteDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Generate Quote</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            select
            label="Customer"
            value={quoteForm.customer}
            onChange={(e) => setQuoteForm({...quoteForm, customer: e.target.value})}
            margin="normal"
            helperText="Select a customer for the quote"
          >
            {customers.map((customer) => (
              <MenuItem key={customer.id} value={customer.id}>
                {customer.name} - {customer.email}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth
            select
            label="Product/Service"
            value={quoteForm.product}
            onChange={(e) => setQuoteForm({...quoteForm, product: e.target.value})}
            margin="normal"
            helperText="Select a product for the quote"
          >
            {products.map((product) => (
              <MenuItem key={product.id} value={product.id}>
                {product.name} - {product.sku}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth
            label="Quantity"
            type="number"
            value={quoteForm.quantity}
            onChange={(e) => setQuoteForm({...quoteForm, quantity: e.target.value})}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Notes"
            multiline
            rows={3}
            value={quoteForm.notes}
            onChange={(e) => setQuoteForm({...quoteForm, notes: e.target.value})}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setQuoteDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleGenerateQuote} 
            variant="contained"
            sx={{ background: 'linear-gradient(45deg, #2196F3 30%, #1976D2 90%)' }}
          >
            Generate Quote
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Add Lead Dialog */}
      <Dialog open={leadDialogOpen} onClose={() => setLeadDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Lead</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Full Name"
            value={leadForm.name}
            onChange={(e) => setLeadForm({...leadForm, name: e.target.value})}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={leadForm.email}
            onChange={(e) => setLeadForm({...leadForm, email: e.target.value})}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Phone Number"
            value={leadForm.phone}
            onChange={(e) => setLeadForm({...leadForm, phone: e.target.value})}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Company"
            value={leadForm.company}
            onChange={(e) => setLeadForm({...leadForm, company: e.target.value})}
            margin="normal"
          />
          <TextField
            fullWidth
            select
            label="Lead Source"
            value={leadForm.source}
            onChange={(e) => setLeadForm({...leadForm, source: e.target.value})}
            margin="normal"
          >
            <MenuItem value="website">Website</MenuItem>
            <MenuItem value="referral">Referral</MenuItem>
            <MenuItem value="social_media">Social Media</MenuItem>
            <MenuItem value="cold_call">Cold Call</MenuItem>
            <MenuItem value="trade_show">Trade Show</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLeadDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleAddLead} 
            variant="contained"
            sx={{ background: 'linear-gradient(45deg, #9C27B0 30%, #7B1FA2 90%)' }}
          >
            Add Lead
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Create Sales Order Dialog */}
      <Dialog open={salesOrderDialogOpen} onClose={() => setSalesOrderDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create Sales Order</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            select
            label="Customer"
            value={salesOrderForm.customer}
            onChange={(e) => setSalesOrderForm({...salesOrderForm, customer: e.target.value})}
            margin="normal"
            helperText="Select a customer for the order"
          >
            {customers.map((customer) => (
              <MenuItem key={customer.id} value={customer.id}>
                {customer.name} - {customer.email}
              </MenuItem>
            ))}
          </TextField>
          
          <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Products</Typography>
          {salesOrderForm.products.map((product, index) => (
            <Box key={index} sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
              <TextField
                select
                label="Product"
                value={product.product}
                onChange={(e) => {
                  const newProducts = [...salesOrderForm.products];
                  newProducts[index].product = e.target.value;
                  setSalesOrderForm({...salesOrderForm, products: newProducts});
                }}
                sx={{ flex: 2 }}
              >
                {products.map((prod) => (
                  <MenuItem key={prod.id} value={prod.id}>
                    {prod.name} - {prod.sku}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                type="number"
                label="Quantity"
                value={product.quantity}
                onChange={(e) => {
                  const newProducts = [...salesOrderForm.products];
                  newProducts[index].quantity = e.target.value;
                  setSalesOrderForm({...salesOrderForm, products: newProducts});
                }}
                sx={{ flex: 1 }}
                inputProps={{ min: 1 }}
              />
              <TextField
                type="number"
                label="Unit Price"
                value={product.price}
                onChange={(e) => {
                  const newProducts = [...salesOrderForm.products];
                  newProducts[index].price = e.target.value;
                  setSalesOrderForm({...salesOrderForm, products: newProducts});
                }}
                sx={{ flex: 1 }}
                inputProps={{ min: 0, step: 0.01 }}
              />
              <Button
                onClick={() => {
                  const newProducts = salesOrderForm.products.filter((_, i) => i !== index);
                  setSalesOrderForm({...salesOrderForm, products: newProducts});
                }}
                color="error"
                disabled={salesOrderForm.products.length === 1}
              >
                Remove
              </Button>
            </Box>
          ))}
          
          <Button
            onClick={() => {
              setSalesOrderForm({
                ...salesOrderForm,
                products: [...salesOrderForm.products, { product: '', quantity: 1, price: '' }]
              });
            }}
            variant="outlined"
            sx={{ mb: 2 }}
          >
            Add Product
          </Button>
          
          <TextField
            fullWidth
            type="number"
            label="Discount (%)"
            value={salesOrderForm.discount}
            onChange={(e) => setSalesOrderForm({...salesOrderForm, discount: e.target.value})}
            margin="normal"
            inputProps={{ min: 0, max: 100, step: 0.01 }}
          />
          
          <TextField
            fullWidth
            label="Notes"
            multiline
            rows={3}
            value={salesOrderForm.notes}
            onChange={(e) => setSalesOrderForm({...salesOrderForm, notes: e.target.value})}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSalesOrderDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleCreateSalesOrderSubmit} 
            variant="contained"
            sx={{ background: 'linear-gradient(45deg, #FF9800 30%, #FF5722 90%)' }}
          >
            Create Order
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Add Customer Dialog */}
      <Dialog open={addCustomerDialogOpen} onClose={() => setAddCustomerDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add New Customer</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Name"
            value={customerForm.name}
            onChange={(e) => setCustomerForm({...customerForm, name: e.target.value})}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={customerForm.email}
            onChange={(e) => setCustomerForm({...customerForm, email: e.target.value})}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Phone Number"
            value={customerForm.phone}
            onChange={(e) => setCustomerForm({...customerForm, phone: e.target.value})}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Address"
            value={customerForm.address}
            onChange={(e) => setCustomerForm({...customerForm, address: e.target.value})}
            margin="normal"
          />
          <TextField
            fullWidth
            select
            label="Customer Type"
            value={customerForm.customer_type}
            onChange={(e) => setCustomerForm({...customerForm, customer_type: e.target.value})}
            margin="normal"
          >
            <MenuItem value="retailer">Retailer</MenuItem>
            <MenuItem value="wholesaler">Wholesaler</MenuItem>
            <MenuItem value="distributor">Distributor</MenuItem>
          </TextField>
          <TextField
            fullWidth
            select
            label="Warehouse"
            value={customerForm.warehouse}
            onChange={(e) => setCustomerForm({...customerForm, warehouse: e.target.value})}
            margin="normal"
          >
            {warehouses.map((warehouse) => (
              <MenuItem key={warehouse.id} value={warehouse.id}>
                {warehouse.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth
            label="Contact Person"
            value={customerForm.contact_person}
            onChange={(e) => setCustomerForm({...customerForm, contact_person: e.target.value})}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Tax Number"
            value={customerForm.tax_number}
            onChange={(e) => setCustomerForm({...customerForm, tax_number: e.target.value})}
            margin="normal"
          />
          <TextField
            fullWidth
            type="number"
            label="Credit Limit"
            value={customerForm.credit_limit}
            onChange={(e) => setCustomerForm({...customerForm, credit_limit: e.target.value})}
            margin="normal"
          />
          <TextField
            fullWidth
            select
            label="Payment Terms"
            value={customerForm.payment_terms}
            onChange={(e) => setCustomerForm({...customerForm, payment_terms: e.target.value})}
            margin="normal"
          >
            <MenuItem value="cash">Cash</MenuItem>
            <MenuItem value="credit">Credit</MenuItem>
            <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddCustomerDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleAddCustomer} 
            variant="contained"
            sx={{ background: 'linear-gradient(45deg, #4CAF50 30%, #2E7D32 90%)' }}
          >
            Add Customer
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Add Product Dialog */}
      <Dialog open={addProductDialogOpen} onClose={() => setAddProductDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add New Product</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Name"
            value={productForm.name}
            onChange={(e) => setProductForm({...productForm, name: e.target.value})}
            margin="normal"
          />
          <TextField
            fullWidth
            label="SKU"
            value={productForm.sku}
            onChange={(e) => setProductForm({...productForm, sku: e.target.value})}
            margin="normal"
          />
          <TextField
            fullWidth
            type="number"
            label="Price"
            value={productForm.price}
            onChange={(e) => setProductForm({...productForm, price: e.target.value})}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Description"
            value={productForm.description}
            onChange={(e) => setProductForm({...productForm, description: e.target.value})}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddProductDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleAddProduct} 
            variant="contained"
            sx={{ background: 'linear-gradient(45deg, #2196F3 30%, #1976D2 90%)' }}
          >
            Add Product
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Price Management Dialog */}
      <Dialog open={priceManagementDialogOpen} onClose={() => setPriceManagementDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Price Management</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            select
            label="Product"
            value={priceForm.product}
            onChange={(e) => setPriceForm({...priceForm, product: e.target.value})}
            margin="normal"
          >
            {products.map((product) => (
              <MenuItem key={product.id} value={product.id}>
                {product.name} - {product.sku}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth
            type="number"
            label="Price"
            value={priceForm.price}
            onChange={(e) => setPriceForm({...priceForm, price: e.target.value})}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPriceManagementDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handlePriceManagement} 
            variant="contained"
            sx={{ background: 'linear-gradient(45deg, #9C27B0 30%, #7B1FA2 90%)' }}
          >
            Update Price
          </Button>
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

export default SalesDashboard;

import React, { useState, useEffect, useContext } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Button, Tabs, Tab,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem,
  Chip, IconButton, Snackbar, Alert, Paper, Avatar, Divider,
  InputAdornment, FormControl, InputLabel, Select, Switch, FormControlLabel
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Add, Edit, Delete, Search, Visibility, AttachMoney,
  Inventory, Category, LocalOffer, TrendingUp, ShoppingCart,
  PriceChange, Assessment, FilterList
} from '@mui/icons-material';
import api from '../api';
import { AuthContext } from '../AuthContext';

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
  minHeight: 48,
  '&.Mui-selected': {
    color: '#FF9800',
  },
}));

const ProductCard = styled(Card)(({ theme }) => ({
  borderRadius: 12,
  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
  },
}));

const ProductsModule = () => {
  const { token } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState(0);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Dialog states
  const [productDialog, setProductDialog] = useState(false);
  const [priceDialog, setPriceDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  // Form states
  const [productForm, setProductForm] = useState({
    name: '',
    sku: '',
    description: '',
    category: '',
    price: '',
    cost: '',
    quantity: '',
    min_stock: '',
    max_stock: '',
    unit: '',
    status: 'active',
    image_url: ''
  });

  const [priceForm, setPriceForm] = useState({
    product_id: '',
    price_type: 'regular',
    price: '',
    min_quantity: 1,
    max_quantity: null,
    start_date: '',
    end_date: '',
    is_active: true
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Sample data - replace with API calls
  const [sampleProducts] = useState([
    {
      id: 1,
      name: 'Laptop Computer',
      sku: 'LAP-001',
      description: 'High-performance laptop for business use',
      category: 'Electronics',
      price: 1200.00,
      cost: 800.00,
      quantity: 25,
      min_stock: 5,
      max_stock: 50,
      unit: 'piece',
      status: 'active',
      image_url: '',
      created_at: '2025-01-15',
      profit_margin: 33.33
    },
    {
      id: 2,
      name: 'Office Chair',
      sku: 'CHR-002',
      description: 'Ergonomic office chair with lumbar support',
      category: 'Furniture',
      price: 350.00,
      cost: 200.00,
      quantity: 15,
      min_stock: 3,
      max_stock: 30,
      unit: 'piece',
      status: 'active',
      image_url: '',
      created_at: '2025-01-10',
      profit_margin: 42.86
    },
    {
      id: 3,
      name: 'Wireless Mouse',
      sku: 'MOU-003',
      description: 'Bluetooth wireless mouse with precision tracking',
      category: 'Electronics',
      price: 45.00,
      cost: 25.00,
      quantity: 100,
      min_stock: 20,
      max_stock: 200,
      unit: 'piece',
      status: 'active',
      image_url: '',
      created_at: '2025-01-12',
      profit_margin: 44.44
    },
    {
      id: 4,
      name: 'Desk Lamp',
      sku: 'LAM-004',
      description: 'LED desk lamp with adjustable brightness',
      category: 'Office Supplies',
      price: 75.00,
      cost: 40.00,
      quantity: 8,
      min_stock: 10,
      max_stock: 50,
      unit: 'piece',
      status: 'low_stock',
      image_url: '',
      created_at: '2025-01-08',
      profit_margin: 46.67
    },
    {
      id: 5,
      name: 'Notebook Set',
      sku: 'NOT-005',
      description: 'Premium notebook set with pen',
      category: 'Stationery',
      price: 25.00,
      cost: 12.00,
      quantity: 0,
      min_stock: 5,
      max_stock: 100,
      unit: 'set',
      status: 'out_of_stock',
      image_url: '',
      created_at: '2025-01-05',
      profit_margin: 52.00
    }
  ]);

  const [priceTiers, setPriceTiers] = useState([]);

  useEffect(() => {
    loadProducts();
    loadPriceTiers();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      // Load products from backend API
      const response = await api.get('/inventory/products/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(response.data);
    } catch (error) {
      console.error('Failed to load products:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load products',
        severity: 'error'
      });
      // Fallback to sample data if API fails
      setProducts(sampleProducts);
    } finally {
      setLoading(false);
    }
  };

  const loadPriceTiers = async () => {
    try {
      // Load all price tiers from backend API
      const response = await api.get('/inventory/product-prices/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Transform the price data to match the expected format
      const transformedPrices = response.data.map(price => ({
        id: price.id,
        product_id: price.product,
        price_type: price.currency === 'USD' ? 'regular' : 
                   price.currency === 'GHS' ? 'bulk' : 
                   price.currency === 'SLL' ? 'wholesale' : 'regular',
        price: parseFloat(price.price),
        currency: price.currency,
        min_quantity: 1,
        max_quantity: price.currency === 'USD' ? 4 : 
                     price.currency === 'GHS' ? 9 : null,
        is_active: true
      }));
      
      setPriceTiers(transformedPrices);
      console.log('Price tiers loaded:', transformedPrices);
    } catch (error) {
      console.error('Failed to load price tiers:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load price tiers',
        severity: 'error'
      });
      // Keep empty array if API fails
      setPriceTiers([]);
    }
  };

  const handleCreateProduct = async () => {
    try {
      // Validate required fields
      if (!productForm.name?.trim()) {
        setSnackbar({
          open: true,
          message: 'Product name is required',
          severity: 'error'
        });
        return;
      }
      
      if (!productForm.sku?.trim()) {
        setSnackbar({
          open: true,
          message: 'SKU is required',
          severity: 'error'
        });
        return;
      }

      // First, create or get the category
      let categoryId;
      if (productForm.category) {
        // If editing an existing product and category is a number (ID), use it directly
        if (selectedProduct && typeof productForm.category === 'number') {
          categoryId = productForm.category;
        } else if (selectedProduct && typeof productForm.category === 'string' && !isNaN(productForm.category)) {
          // If category is a string number, convert it
          categoryId = parseInt(productForm.category);
        } else if (typeof productForm.category === 'string' && productForm.category.trim()) {
          // Handle category name string - find or create category
          try {
            // Try to create the category (will fail if it already exists)
            const categoryResponse = await api.post('/inventory/categories/', {
              name: productForm.category.trim(),
              description: `Category for ${productForm.category.trim()}`
            }, {
              headers: { Authorization: `Bearer ${token}` }
            });
            categoryId = categoryResponse.data.id;
          } catch (categoryError) {
            // If category creation fails, try to find existing category
            try {
              const categoriesResponse = await api.get('/inventory/categories/', {
                headers: { Authorization: `Bearer ${token}` }
              });
              const existingCategory = categoriesResponse.data.find(cat => 
                cat.name.toLowerCase() === productForm.category.trim().toLowerCase()
              );
              if (existingCategory) {
                categoryId = existingCategory.id;
              } else {
                throw new Error('Category not found and could not be created');
              }
            } catch (findError) {
              console.error('Category error:', findError);
              setSnackbar({
                open: true,
                message: 'Failed to create or find category',
                severity: 'error'
              });
              return;
            }
          }
        } else {
          setSnackbar({
            open: true,
            message: 'Invalid category value',
            severity: 'error'
          });
          return;
        }
      } else {
        setSnackbar({
          open: true,
          message: 'Category is required',
          severity: 'error'
        });
        return;
      }

      // Prepare product payload matching Django model
      const productPayload = {
        name: productForm.name.trim(),
        sku: productForm.sku.trim(),
        description: productForm.description?.trim() || '',
        category: categoryId,
        quantity: parseInt(productForm.quantity) || 0,
        cost: parseFloat(productForm.cost) || 0.00,
        min_stock: parseInt(productForm.min_stock) || 0,
        max_stock: productForm.max_stock ? parseInt(productForm.max_stock) : null,
        unit: productForm.unit?.trim() || 'piece'
      };

      console.log('Creating product with payload:', productPayload);

      let productResponse;
      if (selectedProduct) {
        // Update existing product
        productResponse = await api.put(`/inventory/products/${selectedProduct.id}/`, productPayload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        // Create new product
        productResponse = await api.post('/inventory/products/', productPayload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      console.log('Product saved successfully:', productResponse.data);

      // Handle price creation/update
      if (productForm.price && parseFloat(productForm.price) > 0) {
        try {
          const pricePayload = {
            product: productResponse.data.id,
            currency: 'USD',
            price: parseFloat(productForm.price)
          };

          if (selectedProduct) {
            // Try to update existing price first
            try {
              await api.put(`/inventory/product-prices/${selectedProduct.id}/`, pricePayload, {
                headers: { Authorization: `Bearer ${token}` }
              });
            } catch (updateError) {
              // If update fails, try to create new price
              await api.post('/inventory/product-prices/', pricePayload, {
                headers: { Authorization: `Bearer ${token}` }
              });
            }
          } else {
            // Create new price for new product
            await api.post('/inventory/product-prices/', pricePayload, {
              headers: { Authorization: `Bearer ${token}` }
            });
          }
          console.log('Product price saved successfully');
        } catch (priceError) {
          console.warn('Failed to save product price:', priceError);
          // Don't fail product creation if price creation fails, but show warning
          setSnackbar({
            open: true,
            message: 'Product saved but price update failed. Please update price manually.',
            severity: 'warning'
          });
        }
      }

      setSnackbar({
        open: true,
        message: selectedProduct ? 'Product updated successfully!' : 'Product created successfully!',
        severity: 'success'
      });
      setProductDialog(false);
      setSelectedProduct(null);
      setProductForm({
        name: '',
        sku: '',
        description: '',
        category: '',
        price: '',
        cost: '',
        quantity: '',
        min_stock: '',
        max_stock: '',
        unit: '',
        status: 'active',
        image_url: ''
      });
      loadProducts();
      loadPriceTiers(); // Refresh price tiers after product save

      // Emit event to notify other components to refresh their product lists
      window.dispatchEvent(new CustomEvent('productUpdated', {
        detail: { 
          product: productResponse.data,
          action: selectedProduct ? 'updated' : 'created',
          timestamp: new Date().toISOString()
        }
      }));
    } catch (error) {
      console.error('Failed to save product:', error);
      console.error('Error response:', error.response?.data);
      
      let errorMessage = selectedProduct ? 'Failed to update product' : 'Failed to create product';
      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.detail) {
          errorMessage = error.response.data.detail;
        } else if (error.response.data.sku) {
          errorMessage = `SKU error: ${error.response.data.sku[0]}`;
        } else {
          errorMessage = JSON.stringify(error.response.data);
        }
      }
      
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    }
  };

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    
    // Properly populate form with existing product data
    setProductForm({
      name: product.name || '',
      sku: product.sku || '',
      description: product.description || '',
      category: product.category || '', // This should be the category ID
      price: product.price || '',
      cost: product.cost || '',
      quantity: product.quantity || '',
      min_stock: product.min_stock || '',
      max_stock: product.max_stock || '',
      unit: product.unit || 'piece',
      status: product.status || 'active',
      image_url: product.image_url || ''
    });
    
    console.log('Editing product:', product);
    console.log('Form populated with:', {
      name: product.name,
      sku: product.sku,
      category: product.category,
      cost: product.cost,
      quantity: product.quantity
    });
    
    setProductDialog(true);
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        // Delete product via backend API
        await api.delete(`/inventory/products/${productId}/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSnackbar({
          open: true,
          message: 'Product deleted successfully!',
          severity: 'success'
        });
        loadProducts();
        loadPriceTiers(); // Refresh price tiers after product deletion
      } catch (error) {
        console.error('Failed to delete product:', error);
        setSnackbar({
          open: true,
          message: 'Failed to delete product',
          severity: 'error'
        });
      }
    }
  };

  const handleCreatePriceTier = async () => {
    try {
      // Validate required fields
      if (!priceForm.product_id) {
        setSnackbar({
          open: true,
          message: 'Please select a product',
          severity: 'error'
        });
        return;
      }

      if (!priceForm.price || parseFloat(priceForm.price) <= 0) {
        setSnackbar({
          open: true,
          message: 'Please enter a valid price',
          severity: 'error'
        });
        return;
      }

      // Map price_type to currency for backend
      let currency = 'USD';
      if (priceForm.price_type === 'bulk') currency = 'GHS';
      else if (priceForm.price_type === 'wholesale') currency = 'SLL';

      const pricePayload = {
        product: parseInt(priceForm.product_id),
        currency: currency,
        price: parseFloat(priceForm.price)
      };

      await api.post('/inventory/product-prices/', pricePayload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSnackbar({
        open: true,
        message: 'Price tier created successfully!',
        severity: 'success'
      });

      setPriceDialog(false);
      setPriceForm({
        product_id: '',
        price_type: 'regular',
        price: '',
        min_quantity: 1,
        max_quantity: null,
        start_date: '',
        end_date: '',
        is_active: true
      });
      loadPriceTiers();
    } catch (error) {
      console.error('Failed to create price tier:', error);
      setSnackbar({
        open: true,
        message: 'Failed to create price tier',
        severity: 'error'
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'low_stock': return 'warning';
      case 'out_of_stock': return 'error';
      case 'discontinued': return 'default';
      default: return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'active': return 'Active';
      case 'low_stock': return 'Low Stock';
      case 'out_of_stock': return 'Out of Stock';
      case 'discontinued': return 'Discontinued';
      default: return status;
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || product.category === categoryFilter;
    const matchesStatus = !statusFilter || product.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const categories = [...new Set(products.map(p => p.category))];

  const renderProductsTab = () => (
    <Box>
      {/* Header with Search and Filters */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <TextField
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          sx={{ minWidth: 300 }}
        />
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Category</InputLabel>
          <Select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            label="Category"
          >
            <MenuItem value="">All Categories</MenuItem>
            {categories.map(category => (
              <MenuItem key={category} value={category}>{category}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            label="Status"
          >
            <MenuItem value="">All Status</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="low_stock">Low Stock</MenuItem>
            <MenuItem value="out_of_stock">Out of Stock</MenuItem>
            <MenuItem value="discontinued">Discontinued</MenuItem>
          </Select>
        </FormControl>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setProductDialog(true)}
          sx={{
            background: 'linear-gradient(45deg, #FF9800 30%, #FF5722 90%)',
            '&:hover': {
              background: 'linear-gradient(45deg, #F57C00 30%, #E64A19 90%)',
            }
          }}
        >
          Add Product
        </Button>
      </Box>

      {/* Products Table */}
      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Product</TableCell>
              <TableCell>SKU</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Cost</TableCell>
              <TableCell>Margin</TableCell>
              <TableCell>Stock</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredProducts.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: '#FF9800' }}>
                      <Inventory />
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
                  <Chip label={product.category} size="small" />
                </TableCell>
                <TableCell>${product.price?.toFixed(2) || '0.00'}</TableCell>
                <TableCell>${(product.cost && typeof product.cost === 'number') ? product.cost.toFixed(2) : '0.00'}</TableCell>
                <TableCell>{(product.profit_margin && typeof product.profit_margin === 'number') ? product.profit_margin.toFixed(1) : '0.0'}%</TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2">{product.quantity} {product.unit}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Min: {product.min_stock} | Max: {product.max_stock}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={getStatusLabel(product.status)} 
                    color={getStatusColor(product.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEditProduct(product)} size="small">
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => setPriceDialog(true)} size="small">
                    <PriceChange />
                  </IconButton>
                  <IconButton onClick={() => handleDeleteProduct(product.id)} size="small" color="error">
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  const renderPriceTab = () => (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Price Management</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setPriceDialog(true)}
          sx={{
            background: 'linear-gradient(45deg, #4CAF50 30%, #8BC34A 90%)',
            '&:hover': {
              background: 'linear-gradient(45deg, #388E3C 30%, #689F38 90%)',
            }
          }}
        >
          Add Price Tier
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Product</TableCell>
              <TableCell>Price Type</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Min Quantity</TableCell>
              <TableCell>Max Quantity</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {priceTiers.map((tier) => {
              const product = products.find(p => p.id === tier.product_id);
              return (
                <TableRow key={tier.id}>
                  <TableCell>{product?.name || 'Unknown Product'}</TableCell>
                  <TableCell>
                    <Chip 
                      label={tier.price_type.charAt(0).toUpperCase() + tier.price_type.slice(1)} 
                      color={tier.price_type === 'regular' ? 'primary' : tier.price_type === 'bulk' ? 'secondary' : 'success'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>${tier.price.toFixed(2)}</TableCell>
                  <TableCell>{tier.min_quantity}</TableCell>
                  <TableCell>{tier.max_quantity || 'No limit'}</TableCell>
                  <TableCell>
                    <Chip 
                      label={tier.is_active ? 'Active' : 'Inactive'} 
                      color={tier.is_active ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton size="small">
                      <Edit />
                    </IconButton>
                    <IconButton size="small" color="error">
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 600, color: '#333' }}>
        Products Management
      </Typography>

      <StyledTabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
        <StyledTab label="Products" icon={<Inventory />} />
        <StyledTab label="Price Management" icon={<AttachMoney />} />
        <StyledTab label="Analytics" icon={<Assessment />} />
      </StyledTabs>

      <Paper sx={{ mt: 0, borderRadius: '0 0 12px 12px', p: 3 }}>
        {activeTab === 0 && renderProductsTab()}
        {activeTab === 1 && renderPriceTab()}
        {activeTab === 2 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="text.secondary">
              Product Analytics Coming Soon
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Product Dialog */}
      <Dialog open={productDialog} onClose={() => setProductDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>{selectedProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Product Name"
                value={productForm.name}
                onChange={(e) => setProductForm({...productForm, name: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="SKU"
                value={productForm.sku}
                onChange={(e) => setProductForm({...productForm, sku: e.target.value})}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={productForm.description}
                onChange={(e) => setProductForm({...productForm, description: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Category"
                value={productForm.category}
                onChange={(e) => setProductForm({...productForm, category: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Unit"
                value={productForm.unit}
                onChange={(e) => setProductForm({...productForm, unit: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Price"
                type="number"
                value={productForm.price}
                onChange={(e) => setProductForm({...productForm, price: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Cost"
                type="number"
                value={productForm.cost}
                onChange={(e) => setProductForm({...productForm, cost: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Quantity"
                type="number"
                value={productForm.quantity}
                onChange={(e) => setProductForm({...productForm, quantity: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Min Stock"
                type="number"
                value={productForm.min_stock}
                onChange={(e) => setProductForm({...productForm, min_stock: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Max Stock"
                type="number"
                value={productForm.max_stock}
                onChange={(e) => setProductForm({...productForm, max_stock: e.target.value})}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                label="Status"
                value={productForm.status}
                onChange={(e) => setProductForm({...productForm, status: e.target.value})}
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="discontinued">Discontinued</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProductDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateProduct} variant="contained">
            {selectedProduct ? 'Update Product' : 'Create Product'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Price Dialog */}
      <Dialog open={priceDialog} onClose={() => setPriceDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Price Tier</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                label="Product"
                value={priceForm.product_id}
                onChange={(e) => setPriceForm({...priceForm, product_id: e.target.value})}
              >
                {products.map((product) => (
                  <MenuItem key={product.id} value={product.id}>
                    {product.name} ({product.sku})
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Price Type"
                value={priceForm.price_type}
                onChange={(e) => setPriceForm({...priceForm, price_type: e.target.value})}
              >
                <MenuItem value="regular">Regular</MenuItem>
                <MenuItem value="bulk">Bulk</MenuItem>
                <MenuItem value="wholesale">Wholesale</MenuItem>
                <MenuItem value="promotional">Promotional</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Price"
                type="number"
                value={priceForm.price}
                onChange={(e) => setPriceForm({...priceForm, price: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Min Quantity"
                type="number"
                value={priceForm.min_quantity}
                onChange={(e) => setPriceForm({...priceForm, min_quantity: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Max Quantity"
                type="number"
                value={priceForm.max_quantity}
                onChange={(e) => setPriceForm({...priceForm, max_quantity: e.target.value})}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={priceForm.is_active}
                    onChange={(e) => setPriceForm({...priceForm, is_active: e.target.checked})}
                  />
                }
                label="Active"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPriceDialog(false)}>Cancel</Button>
          <Button onClick={handleCreatePriceTier} variant="contained">
            Add Price Tier
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({...snackbar, open: false})}
      >
        <Alert
          onClose={() => setSnackbar({...snackbar, open: false})}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProductsModule;

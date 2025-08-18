import React, { useState, useEffect, useContext } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Button, Tabs, Tab,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem,
  FormControl, InputLabel, Select, CircularProgress, Alert, Chip, IconButton,
  List, ListItem, ListItemText, Divider, Avatar, LinearProgress, Tooltip,
  Switch, FormControlLabel, Rating, Stepper, Step, StepLabel
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Assignment as OrderIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Print as PrintIcon,
  Download as DownloadIcon,
  Business as VendorIcon,
  LocalShipping as ShippingIcon,
  Payment as PaymentIcon,
  Description as DescriptionIcon,
  CheckCircle,
  Cancel
} from '@mui/icons-material';
import { AuthContext } from '../AuthContext';
import api from '../api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const PurchaseOrderManagement = () => {
  const { user } = useContext(AuthContext);
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // State for different modules
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [products, setProducts] = useState([]);
  
  // Dialog states
  const [createPODialog, setCreatePODialog] = useState(false);
  const [viewPODialog, setViewPODialog] = useState(false);
  const [selectedPO, setSelectedPO] = useState(null);
  
  // Form states
  const [poForm, setPOForm] = useState({
    vendor_id: '',
    items: [{ product_id: '', quantity: 1, unit_price: 0, description: '' }],
    delivery_date: '',
    notes: '',
    priority: 'medium'
  });

  // Mock data for demonstration
  const mockVendors = [
    {
      id: 1,
      name: 'TechCorp Solutions',
      contact_person: 'Sarah Wilson',
      email: 'sarah@techcorp.com',
      phone: '+233-20-123-4567',
      category: 'IT Equipment'
    },
    {
      id: 2,
      name: 'Office Plus Ltd',
      contact_person: 'David Brown',
      email: 'david@officeplus.com',
      phone: '+233-24-987-6543',
      category: 'Office Supplies'
    }
  ];

  const mockProducts = [
    { id: 1, name: 'Laptop Computer', category: 'IT Equipment', unit_price: 2500 },
    { id: 2, name: 'Office Chair', category: 'Office Supplies', unit_price: 150 },
    { id: 3, name: 'Printer', category: 'IT Equipment', unit_price: 800 },
    { id: 4, name: 'Desk', category: 'Office Supplies', unit_price: 300 }
  ];

  const mockPurchaseOrders = [
    {
      id: 1,
      po_number: 'PO-2024-001',
      vendor_name: 'TechCorp Solutions',
      vendor_id: 1,
      total_amount: 7500,
      status: 'pending_approval',
      priority: 'high',
      created_date: '2024-01-10',
      delivery_date: '2024-01-25',
      created_by: 'John Doe',
      items: [
        { product_name: 'Laptop Computer', quantity: 3, unit_price: 2500, total: 7500 }
      ],
      approval_workflow: [
        { step: 'Department Head', status: 'approved', date: '2024-01-10', approver: 'Jane Smith' },
        { step: 'Finance Manager', status: 'pending', date: null, approver: 'Mike Johnson' },
        { step: 'General Manager', status: 'pending', date: null, approver: 'Sarah Davis' }
      ]
    },
    {
      id: 2,
      po_number: 'PO-2024-002',
      vendor_name: 'Office Plus Ltd',
      vendor_id: 2,
      total_amount: 1200,
      status: 'approved',
      priority: 'medium',
      created_date: '2024-01-08',
      delivery_date: '2024-01-20',
      created_by: 'Alice Brown',
      items: [
        { product_name: 'Office Chair', quantity: 4, unit_price: 150, total: 600 },
        { product_name: 'Desk', quantity: 2, unit_price: 300, total: 600 }
      ],
      approval_workflow: [
        { step: 'Department Head', status: 'approved', date: '2024-01-08', approver: 'Jane Smith' },
        { step: 'Finance Manager', status: 'approved', date: '2024-01-09', approver: 'Mike Johnson' },
        { step: 'General Manager', status: 'approved', date: '2024-01-10', approver: 'Sarah Davis' }
      ]
    }
  ];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Load mock data
        setPurchaseOrders(mockPurchaseOrders);
        setVendors(mockVendors);
        setProducts(mockProducts);
        
        console.log('Purchase Order data loaded successfully:', {
          purchaseOrders: mockPurchaseOrders.length,
          vendors: mockVendors.length,
          products: mockProducts.length
        });
      } catch (err) {
        console.error('Error loading purchase order data:', err);
        setError('Failed to load purchase order data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCreatePO = () => {
    console.log('Creating new purchase order:', poForm);
    
    const newPO = {
      id: purchaseOrders.length + 1,
      po_number: `PO-2024-${String(purchaseOrders.length + 1).padStart(3, '0')}`,
      vendor_name: vendors.find(v => v.id === parseInt(poForm.vendor_id))?.name || '',
      vendor_id: parseInt(poForm.vendor_id),
      total_amount: poForm.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0),
      status: 'pending_approval',
      priority: poForm.priority,
      created_date: new Date().toISOString().split('T')[0],
      delivery_date: poForm.delivery_date,
      created_by: user?.first_name + ' ' + user?.last_name || 'Current User',
      items: poForm.items.map(item => ({
        product_name: products.find(p => p.id === parseInt(item.product_id))?.name || item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total: item.quantity * item.unit_price
      })),
      approval_workflow: [
        { step: 'Department Head', status: 'pending', date: null, approver: 'Jane Smith' },
        { step: 'Finance Manager', status: 'pending', date: null, approver: 'Mike Johnson' },
        { step: 'General Manager', status: 'pending', date: null, approver: 'Sarah Davis' }
      ]
    };

    setPurchaseOrders(prev => [...prev, newPO]);
    setCreatePODialog(false);
    setPOForm({
      vendor_id: '',
      items: [{ product_id: '', quantity: 1, unit_price: 0, description: '' }],
      delivery_date: '',
      notes: '',
      priority: 'medium'
    });
    alert('Purchase Order created successfully!');
  };

  const handleApprovePO = (poId) => {
    console.log('Approving purchase order:', poId);
    setPurchaseOrders(prev => 
      prev.map(po => 
        po.id === poId ? { ...po, status: 'approved' } : po
      )
    );
    alert('Purchase Order approved successfully!');
  };

  const handleViewPO = (po) => {
    setSelectedPO(po);
    setViewPODialog(true);
  };

  const handlePrintPO = (po) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.text('PURCHASE ORDER', 20, 20);
    
    doc.setFontSize(12);
    doc.text(`PO Number: ${po.po_number}`, 20, 35);
    doc.text(`Date: ${po.created_date}`, 20, 45);
    doc.text(`Vendor: ${po.vendor_name}`, 20, 55);
    doc.text(`Delivery Date: ${po.delivery_date}`, 20, 65);
    doc.text(`Total Amount: GHS ${po.total_amount.toLocaleString()}`, 20, 75);

    // Items table
    const tableData = po.items.map(item => [
      item.product_name,
      item.quantity.toString(),
      `GHS ${item.unit_price.toLocaleString()}`,
      `GHS ${item.total.toLocaleString()}`
    ]);

    autoTable(doc, {
      head: [['Product', 'Quantity', 'Unit Price', 'Total']],
      body: tableData,
      startY: 85,
      theme: 'striped',
      headStyles: { fillColor: [121, 85, 72] }
    });

    doc.save(`${po.po_number}.pdf`);
  };

  const addPOItem = () => {
    setPOForm(prev => ({
      ...prev,
      items: [...prev.items, { product_id: '', quantity: 1, unit_price: 0, description: '' }]
    }));
  };

  const removePOItem = (index) => {
    setPOForm(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const updatePOItem = (index, field, value) => {
    setPOForm(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const formatCurrency = (amount) => {
    return `GHS ${amount?.toLocaleString() || '0'}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'pending_approval': return 'warning';
      case 'delivered': return 'info';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ ml: 2 }}>Loading purchase order data...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Alert severity="error" sx={{ maxWidth: 500 }}>
          <Typography variant="h6">Error Loading Data</Typography>
          <Typography>{error}</Typography>
          <Button 
            variant="contained" 
            onClick={() => window.location.reload()} 
            sx={{ mt: 2 }}
          >
            Retry
          </Button>
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh', p: 0 }}>
      {/* Header */}
      <Box sx={{ 
        background: 'linear-gradient(135deg, #795548 0%, #5D4037 100%)',
        color: 'white',
        p: 4,
        borderRadius: '0 0 24px 24px',
        mb: 3
      }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
              Purchase Order Management
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              Create, track, and manage purchase orders
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreatePODialog(true)}
            sx={{ 
              bgcolor: 'rgba(255,255,255,0.2)', 
              color: 'white',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
            }}
          >
            Create Purchase Order
          </Button>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #2196F3 0%, #1565C0 100%)', color: 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.8, mb: 1 }}>Total Orders</Typography>
                  <Typography variant="h3" sx={{ fontWeight: 700 }}>
                    {purchaseOrders.length}
                  </Typography>
                </Box>
                <OrderIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)', color: 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.8, mb: 1 }}>Pending Approval</Typography>
                  <Typography variant="h3" sx={{ fontWeight: 700 }}>
                    {purchaseOrders.filter(po => po.status === 'pending_approval').length}
                  </Typography>
                </Box>
                <ApproveIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)', color: 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.8, mb: 1 }}>Approved Orders</Typography>
                  <Typography variant="h3" sx={{ fontWeight: 700 }}>
                    {purchaseOrders.filter(po => po.status === 'approved').length}
                  </Typography>
                </Box>
                <CheckCircle sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%)', color: 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.8, mb: 1 }}>Total Value</Typography>
                  <Typography variant="h3" sx={{ fontWeight: 700 }}>
                    {formatCurrency(purchaseOrders.reduce((sum, po) => sum + po.total_amount, 0))}
                  </Typography>
                </Box>
                <PaymentIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Purchase Orders Table */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 3 }}>Purchase Orders</Typography>
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>PO Number</TableCell>
                <TableCell>Vendor</TableCell>
                <TableCell>Total Amount</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Delivery Date</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {purchaseOrders.map((po) => (
                <TableRow key={po.id}>
                  <TableCell sx={{ fontWeight: 600 }}>{po.po_number}</TableCell>
                  <TableCell>{po.vendor_name}</TableCell>
                  <TableCell>{formatCurrency(po.total_amount)}</TableCell>
                  <TableCell>
                    <Chip 
                      label={po.status.replace('_', ' ')} 
                      color={getStatusColor(po.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={po.priority} 
                      color={getPriorityColor(po.priority)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{po.delivery_date}</TableCell>
                  <TableCell>
                    <Tooltip title="View Details">
                      <IconButton size="small" onClick={() => handleViewPO(po)}>
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Print PO">
                      <IconButton size="small" color="primary" onClick={() => handlePrintPO(po)}>
                        <PrintIcon />
                      </IconButton>
                    </Tooltip>
                    {po.status === 'pending_approval' && (
                      <Tooltip title="Approve">
                        <IconButton 
                          size="small" 
                          color="success"
                          onClick={() => handleApprovePO(po.id)}
                        >
                          <ApproveIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Create PO Dialog */}
      <Dialog open={createPODialog} onClose={() => setCreatePODialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create New Purchase Order</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Vendor</InputLabel>
                <Select
                  value={poForm.vendor_id}
                  onChange={(e) => setPOForm(prev => ({ ...prev, vendor_id: e.target.value }))}
                >
                  {vendors.map(vendor => (
                    <MenuItem key={vendor.id} value={vendor.id}>
                      {vendor.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Delivery Date"
                type="date"
                value={poForm.delivery_date}
                onChange={(e) => setPOForm(prev => ({ ...prev, delivery_date: e.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={poForm.priority}
                  onChange={(e) => setPOForm(prev => ({ ...prev, priority: e.target.value }))}
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            {/* Items Section */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2 }}>Items</Typography>
              {poForm.items.map((item, index) => (
                <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth>
                      <InputLabel>Product</InputLabel>
                      <Select
                        value={item.product_id}
                        onChange={(e) => {
                          const product = products.find(p => p.id === parseInt(e.target.value));
                          updatePOItem(index, 'product_id', e.target.value);
                          if (product) {
                            updatePOItem(index, 'unit_price', product.unit_price);
                          }
                        }}
                      >
                        {products.map(product => (
                          <MenuItem key={product.id} value={product.id}>
                            {product.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <TextField
                      fullWidth
                      label="Quantity"
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updatePOItem(index, 'quantity', parseInt(e.target.value) || 1)}
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      label="Unit Price"
                      type="number"
                      value={item.unit_price}
                      onChange={(e) => updatePOItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                    />
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <TextField
                      fullWidth
                      label="Total"
                      value={formatCurrency(item.quantity * item.unit_price)}
                      disabled
                    />
                  </Grid>
                  <Grid item xs={12} md={1}>
                    <IconButton 
                      color="error" 
                      onClick={() => removePOItem(index)}
                      disabled={poForm.items.length === 1}
                    >
                      <Cancel />
                    </IconButton>
                  </Grid>
                </Grid>
              ))}
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={addPOItem}
                sx={{ mt: 1 }}
              >
                Add Item
              </Button>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={3}
                value={poForm.notes}
                onChange={(e) => setPOForm(prev => ({ ...prev, notes: e.target.value }))}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ textAlign: 'right' }}>
                Total: {formatCurrency(poForm.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0))}
              </Typography>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreatePODialog(false)}>Cancel</Button>
          <Button 
            onClick={handleCreatePO} 
            variant="contained"
            disabled={!poForm.vendor_id || poForm.items.some(item => !item.product_id)}
          >
            Create Purchase Order
          </Button>
        </DialogActions>
      </Dialog>

      {/* View PO Dialog */}
      <Dialog open={viewPODialog} onClose={() => setViewPODialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Purchase Order Details - {selectedPO?.po_number}</DialogTitle>
        <DialogContent>
          {selectedPO && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">Vendor</Typography>
                <Typography variant="body1">{selectedPO.vendor_name}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">Total Amount</Typography>
                <Typography variant="body1">{formatCurrency(selectedPO.total_amount)}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                <Chip 
                  label={selectedPO.status.replace('_', ' ')} 
                  color={getStatusColor(selectedPO.status)}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">Delivery Date</Typography>
                <Typography variant="body1">{selectedPO.delivery_date}</Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Items</Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Product</TableCell>
                        <TableCell>Quantity</TableCell>
                        <TableCell>Unit Price</TableCell>
                        <TableCell>Total</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedPO.items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.product_name}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>{formatCurrency(item.unit_price)}</TableCell>
                          <TableCell>{formatCurrency(item.total)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Approval Workflow</Typography>
                <Stepper orientation="vertical">
                  {selectedPO.approval_workflow.map((step, index) => (
                    <Step key={index} active={step.status !== 'pending'} completed={step.status === 'approved'}>
                      <StepLabel>
                        <Box>
                          <Typography variant="body1">{step.step}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {step.approver} {step.date && `- ${step.date}`}
                          </Typography>
                        </Box>
                      </StepLabel>
                    </Step>
                  ))}
                </Stepper>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewPODialog(false)}>Close</Button>
          {selectedPO && (
            <Button 
              onClick={() => handlePrintPO(selectedPO)} 
              variant="contained"
              startIcon={<PrintIcon />}
            >
              Print PO
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PurchaseOrderManagement;

import React, { useState, useEffect, useContext } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Select, MenuItem, FormControl, InputLabel, Chip, IconButton, Tooltip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Tabs, Tab, Alert, Snackbar, CircularProgress, Badge, Divider, Avatar,
  Accordion, AccordionSummary, AccordionDetails, Stepper, Step, StepLabel, StepContent
} from '@mui/material';
import {
  Add as AddIcon, Visibility as ViewIcon, Print as PrintIcon, Check as ApproveIcon,
  Close as RejectIcon, LocalShipping as ShippingIcon, Assignment as AssignmentIcon,
  ExpandMore as ExpandMoreIcon, Timeline as TimelineIcon, Receipt as ReceiptIcon,
  Warehouse as WarehouseIcon, Inventory as InventoryIcon, Schedule as ScheduleIcon,
  Person as PersonIcon, Priority as PriorityIcon, Notes as NotesIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { AuthContext } from './AuthContext';
import api from './api';

const StyledCard = styled(Card)(({ theme, status }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'pending': return '#ff9800';
      case 'approved': return '#2196f3';
      case 'completed': return '#4caf50';
      case 'rejected': return '#f44336';
      case 'cancelled': return '#9e9e9e';
      default: return '#667eea';
    }
  };
  
  return {
    borderLeft: `4px solid ${getStatusColor()}`,
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: theme.shadows[8],
    },
  };
});

const StatusChip = styled(Chip)(({ status }) => {
  const getStatusStyle = () => {
    switch (status) {
      case 'pending': return { backgroundColor: '#fff3e0', color: '#f57c00' };
      case 'approved': return { backgroundColor: '#e3f2fd', color: '#1976d2' };
      case 'completed': return { backgroundColor: '#e8f5e8', color: '#388e3c' };
      case 'rejected': return { backgroundColor: '#ffebee', color: '#d32f2f' };
      case 'cancelled': return { backgroundColor: '#f5f5f5', color: '#616161' };
      default: return { backgroundColor: '#f3e5f5', color: '#7b1fa2' };
    }
  };
  
  return {
    ...getStatusStyle(),
    fontWeight: 600,
    textTransform: 'uppercase',
    fontSize: '0.75rem',
  };
});

function WarehouseTransferModule() {
  const { user, token } = useContext(AuthContext);
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [transfers, setTransfers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Dialog states
  const [createTransferDialog, setCreateTransferDialog] = useState(false);
  const [transferDetailsDialog, setTransferDetailsDialog] = useState(false);
  const [waybillDialog, setWaybillDialog] = useState(false);
  const [selectedTransfer, setSelectedTransfer] = useState(null);
  const [waybillData, setWaybillData] = useState(null);

  // Form states
  const [transferForm, setTransferForm] = useState({
    from_warehouse: '',
    to_warehouse: '',
    product: '',
    quantity: '',
    priority: 'medium',
    request_notes: '',
    expected_delivery_date: ''
  });

  const [approvalForm, setApprovalForm] = useState({
    approval_notes: '',
    waybill_number: ''
  });

  const [completionForm, setCompletionForm] = useState({
    actual_quantity_received: '',
    tracking_notes: ''
  });

  // Load initial data
  useEffect(() => {
    loadTransfers();
    loadWarehouses();
    loadProducts();
  }, []);

  const loadTransfers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/warehouse/transfers/');
      setTransfers(response.data || []);
    } catch (error) {
      console.error('Error loading transfers:', error);
      setSnackbar({ open: true, message: 'Failed to load transfers', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const loadWarehouses = async () => {
    try {
      const response = await api.get('/warehouse/');
      setWarehouses(response.data || []);
    } catch (error) {
      console.error('Error loading warehouses:', error);
    }
  };

  const loadProducts = async () => {
    try {
      const response = await api.get('/inventory/products/');
      setProducts(response.data || []);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const handleCreateTransfer = async () => {
    try {
      const response = await api.post('/warehouse/transfers/create/', transferForm);
      setSnackbar({ open: true, message: 'Transfer request created successfully!', severity: 'success' });
      setCreateTransferDialog(false);
      setTransferForm({
        from_warehouse: '', to_warehouse: '', product: '', quantity: '',
        priority: 'medium', request_notes: '', expected_delivery_date: ''
      });
      loadTransfers();
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to create transfer request';
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    }
  };

  const handleApproveTransfer = async (transferId) => {
    try {
      await api.post(`/warehouse/transfers/${transferId}/approve/`, approvalForm);
      setSnackbar({ open: true, message: 'Transfer approved successfully!', severity: 'success' });
      setTransferDetailsDialog(false);
      setApprovalForm({ approval_notes: '', waybill_number: '' });
      loadTransfers();
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to approve transfer';
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    }
  };

  const handleRejectTransfer = async (transferId) => {
    try {
      await api.post(`/warehouse/transfers/${transferId}/reject/`, {
        rejection_notes: approvalForm.approval_notes
      });
      setSnackbar({ open: true, message: 'Transfer rejected', severity: 'warning' });
      setTransferDetailsDialog(false);
      setApprovalForm({ approval_notes: '', waybill_number: '' });
      loadTransfers();
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to reject transfer';
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    }
  };

  const handleCompleteTransfer = async (transferId) => {
    try {
      await api.post(`/warehouse/transfers/${transferId}/complete/`, completionForm);
      setSnackbar({ open: true, message: 'Transfer completed successfully!', severity: 'success' });
      setTransferDetailsDialog(false);
      setCompletionForm({ actual_quantity_received: '', tracking_notes: '' });
      loadTransfers();
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to complete transfer';
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    }
  };

  const handleGenerateWaybill = async (transferId) => {
    try {
      const response = await api.get(`/warehouse/transfers/${transferId}/waybill/`);
      setWaybillData(response.data);
      setWaybillDialog(true);
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to generate waybill', severity: 'error' });
    }
  };

  const handlePrintWaybill = () => {
    window.print();
  };

  const getTransfersByStatus = (status) => {
    return transfers.filter(transfer => transfer.status === status);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return '#f44336';
      case 'high': return '#ff9800';
      case 'medium': return '#2196f3';
      case 'low': return '#4caf50';
      default: return '#9e9e9e';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, color: '#2c3e50' }}>
          🚚 Warehouse Transfer Management
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            Manage warehouse transfers with approval workflow
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateTransferDialog(true)}
            sx={{ 
              background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
              borderRadius: 3 
            }}
          >
            Create Transfer Request
          </Button>
        </Box>
      </Box>

      {/* Status Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { status: 'pending', label: 'Pending Approval', icon: <ScheduleIcon />, color: '#ff9800' },
          { status: 'approved', label: 'Approved', icon: <ApproveIcon />, color: '#2196f3' },
          { status: 'completed', label: 'Completed', icon: <ShippingIcon />, color: '#4caf50' },
          { status: 'rejected', label: 'Rejected', icon: <RejectIcon />, color: '#f44336' }
        ].map((item) => (
          <Grid item xs={12} sm={6} md={3} key={item.status}>
            <Card sx={{ 
              background: `linear-gradient(135deg, ${item.color}15 0%, ${item.color}25 100%)`,
              border: `1px solid ${item.color}30`
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: item.color }}>
                      {getTransfersByStatus(item.status).length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {item.label}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: item.color, width: 56, height: 56 }}>
                    {item.icon}
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Tabs for different views */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="All Transfers" />
          <Tab label="Pending Approval" />
          <Tab label="In Progress" />
          <Tab label="Completed" />
        </Tabs>
      </Paper>

      {/* Transfer List */}
      <Grid container spacing={3}>
        {(tabValue === 0 ? transfers :
          tabValue === 1 ? getTransfersByStatus('pending') :
          tabValue === 2 ? [...getTransfersByStatus('approved')] :
          getTransfersByStatus('completed')
        ).map((transfer) => (
          <Grid item xs={12} md={6} lg={4} key={transfer.id}>
            <StyledCard status={transfer.status}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {transfer.transfer_number}
                  </Typography>
                  <StatusChip 
                    label={transfer.status_display} 
                    status={transfer.status}
                    size="small"
                  />
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    <WarehouseIcon sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
                    {transfer.from_warehouse_name} → {transfer.to_warehouse_name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    <InventoryIcon sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
                    {transfer.product_name} ({transfer.quantity} units)
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <PersonIcon sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
                    Requested by: {transfer.requested_by_name}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Chip
                    label={transfer.priority_display}
                    size="small"
                    sx={{
                      backgroundColor: `${getPriorityColor(transfer.priority)}20`,
                      color: getPriorityColor(transfer.priority),
                      fontWeight: 600
                    }}
                  />
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Button
                    size="small"
                    startIcon={<ViewIcon />}
                    onClick={() => {
                      setSelectedTransfer(transfer);
                      setTransferDetailsDialog(true);
                    }}
                  >
                    View Details
                  </Button>
                  
                  {transfer.status === 'approved' && (
                    <Button
                      size="small"
                      startIcon={<PrintIcon />}
                      onClick={() => handleGenerateWaybill(transfer.id)}
                    >
                      Waybill
                    </Button>
                  )}
                </Box>
              </CardContent>
            </StyledCard>
          </Grid>
        ))}
      </Grid>

      {/* Create Transfer Dialog */}
      <Dialog open={createTransferDialog} onClose={() => setCreateTransferDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create Transfer Request</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>From Warehouse</InputLabel>
                <Select
                  value={transferForm.from_warehouse}
                  onChange={(e) => setTransferForm({ ...transferForm, from_warehouse: e.target.value })}
                >
                  {warehouses.filter((warehouse, index, self) => 
                    index === self.findIndex(w => w.id === warehouse.id)
                  ).map((warehouse) => (
                    <MenuItem key={`from-${warehouse.id}`} value={warehouse.id}>
                      {warehouse.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>To Warehouse</InputLabel>
                <Select
                  value={transferForm.to_warehouse}
                  onChange={(e) => setTransferForm({ ...transferForm, to_warehouse: e.target.value })}
                >
                  {warehouses.map((warehouse) => (
                    <MenuItem key={warehouse.id} value={warehouse.id}>
                      {warehouse.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Product</InputLabel>
                <Select
                  value={transferForm.product}
                  onChange={(e) => setTransferForm({ ...transferForm, product: e.target.value })}
                >
                  {products.map((product) => (
                    <MenuItem key={product.id} value={product.id}>
                      {product.name} (Stock: {product.quantity})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Quantity"
                type="number"
                value={transferForm.quantity}
                onChange={(e) => setTransferForm({ ...transferForm, quantity: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={transferForm.priority}
                  onChange={(e) => setTransferForm({ ...transferForm, priority: e.target.value })}
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="urgent">Urgent</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Expected Delivery Date"
                type="datetime-local"
                value={transferForm.expected_delivery_date}
                onChange={(e) => setTransferForm({ ...transferForm, expected_delivery_date: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Request Notes"
                multiline
                rows={3}
                value={transferForm.request_notes}
                onChange={(e) => setTransferForm({ ...transferForm, request_notes: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateTransferDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateTransfer} variant="contained">Create Request</Button>
        </DialogActions>
      </Dialog>

      {/* Transfer Details Dialog */}
      <Dialog open={transferDetailsDialog} onClose={() => setTransferDetailsDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          Transfer Details - {selectedTransfer?.transfer_number}
        </DialogTitle>
        <DialogContent>
          {selectedTransfer && (
            <Box sx={{ mt: 2 }}>
              {/* Transfer Timeline */}
              <Stepper orientation="vertical" sx={{ mb: 4 }}>
                <Step completed={true}>
                  <StepLabel>Request Created</StepLabel>
                  <StepContent>
                    <Typography variant="body2">
                      Created by {selectedTransfer.requested_by_name} on{' '}
                      {new Date(selectedTransfer.request_date).toLocaleString()}
                    </Typography>
                  </StepContent>
                </Step>
                <Step completed={selectedTransfer.status !== 'pending'}>
                  <StepLabel>
                    {selectedTransfer.status === 'rejected' ? 'Rejected' : 'Approved'}
                  </StepLabel>
                  <StepContent>
                    {selectedTransfer.approved_by_name && (
                      <Typography variant="body2">
                        {selectedTransfer.status === 'rejected' ? 'Rejected' : 'Approved'} by{' '}
                        {selectedTransfer.approved_by_name} on{' '}
                        {new Date(selectedTransfer.approval_date).toLocaleString()}
                      </Typography>
                    )}
                  </StepContent>
                </Step>
                <Step completed={selectedTransfer.status === 'completed'}>
                  <StepLabel>Completed</StepLabel>
                  <StepContent>
                    {selectedTransfer.completed_by_name && (
                      <Typography variant="body2">
                        Completed by {selectedTransfer.completed_by_name} on{' '}
                        {new Date(selectedTransfer.completion_date).toLocaleString()}
                      </Typography>
                    )}
                  </StepContent>
                </Step>
              </Stepper>

              {/* Action Forms */}
              {selectedTransfer.status === 'pending' && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" gutterBottom>Approval Actions</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Waybill Number (Optional)"
                        value={approvalForm.waybill_number}
                        onChange={(e) => setApprovalForm({ ...approvalForm, waybill_number: e.target.value })}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Approval/Rejection Notes"
                        multiline
                        rows={3}
                        value={approvalForm.approval_notes}
                        onChange={(e) => setApprovalForm({ ...approvalForm, approval_notes: e.target.value })}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button
                          variant="contained"
                          color="success"
                          startIcon={<ApproveIcon />}
                          onClick={() => handleApproveTransfer(selectedTransfer.id)}
                        >
                          Approve Transfer
                        </Button>
                        <Button
                          variant="contained"
                          color="error"
                          startIcon={<RejectIcon />}
                          onClick={() => handleRejectTransfer(selectedTransfer.id)}
                        >
                          Reject Transfer
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              )}

              {selectedTransfer.status === 'approved' && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" gutterBottom>Complete Transfer</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Actual Quantity Received"
                        type="number"
                        value={completionForm.actual_quantity_received}
                        onChange={(e) => setCompletionForm({ ...completionForm, actual_quantity_received: e.target.value })}
                        placeholder={selectedTransfer.quantity.toString()}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Tracking Notes"
                        multiline
                        rows={3}
                        value={completionForm.tracking_notes}
                        onChange={(e) => setCompletionForm({ ...completionForm, tracking_notes: e.target.value })}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<ShippingIcon />}
                        onClick={() => handleCompleteTransfer(selectedTransfer.id)}
                      >
                        Complete Transfer
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTransferDetailsDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Waybill Dialog */}
      <Dialog open={waybillDialog} onClose={() => setWaybillDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Waybill - {waybillData?.waybill_number}
          <IconButton
            onClick={handlePrintWaybill}
            sx={{ float: 'right' }}
          >
            <PrintIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {waybillData && (
            <Box sx={{ p: 2, fontFamily: 'monospace' }}>
              <Typography variant="h5" align="center" gutterBottom>
                WAREHOUSE TRANSFER WAYBILL
              </Typography>
              <Divider sx={{ my: 2 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={6}>
                  <Typography variant="h6">From:</Typography>
                  <Typography>{waybillData.from_warehouse.name}</Typography>
                  <Typography>{waybillData.from_warehouse.address}</Typography>
                  <Typography>Code: {waybillData.from_warehouse.code}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="h6">To:</Typography>
                  <Typography>{waybillData.to_warehouse.name}</Typography>
                  <Typography>{waybillData.to_warehouse.address}</Typography>
                  <Typography>Code: {waybillData.to_warehouse.code}</Typography>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6">Product Details:</Typography>
              <Typography>Product: {waybillData.product.name}</Typography>
              <Typography>SKU: {waybillData.product.sku}</Typography>
              <Typography>Quantity: {waybillData.product.quantity}</Typography>

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6">Transfer Information:</Typography>
              <Typography>Transfer Number: {waybillData.transfer_number}</Typography>
              <Typography>Waybill Number: {waybillData.waybill_number}</Typography>
              <Typography>Status: {waybillData.status}</Typography>
              <Typography>Priority: {waybillData.priority}</Typography>
              
              {waybillData.notes && (
                <>
                  <Typography variant="h6" sx={{ mt: 2 }}>Notes:</Typography>
                  <Typography>{waybillData.notes}</Typography>
                </>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setWaybillDialog(false)}>Close</Button>
          <Button onClick={handlePrintWaybill} startIcon={<PrintIcon />}>Print</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default WarehouseTransferModule;

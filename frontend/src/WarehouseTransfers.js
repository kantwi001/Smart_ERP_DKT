import React, { useEffect, useState, useContext } from 'react';
import api from './api';
import { AuthContext } from './AuthContext';
import { 
  getGlobalTransferHistory,
  addTransferToHistory,
  getGlobalProducts,
} from './sharedData';
import { 
  Typography, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, CircularProgress, Alert, Box, Button, Dialog, 
  DialogTitle, DialogContent, DialogActions, TextField, MenuItem, 
  Chip, FormControl, InputLabel, Select, IconButton, Tooltip,
  Grid, Card, CardContent
} from '@mui/material';
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  LocalShipping as CompleteIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  AttachFile as AttachFileIcon,
  CloudUpload as CloudUploadIcon,
  Download as DownloadIcon
} from '@mui/icons-material';

const WarehouseTransfers = () => {
  const { token } = useContext(AuthContext);
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ product: '', quantity: '', fromWarehouse: '', toWarehouse: '', notes: '' });
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [user, setUser] = useState({});
  const [statusFilter, setStatusFilter] = useState('all');
  const [actionLoading, setActionLoading] = useState(null);
  const [statusCounts, setStatusCounts] = useState({ pending: 0, approved: 0, completed: 0, rejected: 0 });
  const [waybillDialog, setWaybillDialog] = useState(false);
  const [selectedTransferForWaybill, setSelectedTransferForWaybill] = useState(null);
  const [waybillFile, setWaybillFile] = useState(null);
  const [waybillUploading, setWaybillUploading] = useState(false);

  useEffect(() => {
    fetchTransfers();
    fetchProducts();
    fetchWarehouses();
    fetchUser();
    // eslint-disable-next-line
  }, [token]);

  const fetchTransfers = async () => {
    setLoading(true);
    setError(null);
    try {
      // Load transfers from warehouse API
      const response = await api.get('/warehouse/transfers/');
      
      if (response.data && Array.isArray(response.data)) {
        setTransfers(response.data);
        console.log('[Warehouse Transfers] Loaded transfers:', response.data.length);
        
        // Calculate status counts
        const counts = response.data.reduce((acc, transfer) => {
          acc[transfer.status] = (acc[transfer.status] || 0) + 1;
          return acc;
        }, { pending: 0, approved: 0, completed: 0, rejected: 0 });
        setStatusCounts(counts);
        
      } else {
        console.warn('[Warehouse Transfers] Invalid response format:', response.data);
        setTransfers([]);
        setError('Invalid data format received from server');
      }
      
    } catch (err) {
      console.error('[Warehouse Transfers] Error loading transfers:', err);
      console.error('Error details:', {
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        message: err.message
      });
      
      if (err.response?.status === 401) {
        setError('Authentication failed. Please log in again.');
      } else if (err.response?.status === 403) {
        setError('You do not have permission to view transfers.');
      } else if (err.response?.status === 404) {
        setError('Transfer endpoint not found. Please check server configuration.');
      } else {
        setError(`Failed to load transfers: ${err.response?.data?.error || err.message}`);
      }
      
      setTransfers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const products = await getGlobalProducts();
      setProducts(products);
    } catch (err) {
      console.error('Failed to load products:', err);
    }
  };

  const fetchWarehouses = async () => {
    try {
      // Direct API call instead of loadWarehousesWithFallback
      const response = await fetch(`${api.defaults.baseURL}/warehouse/`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const warehouses = await response.json();
        setWarehouses(warehouses);
      } else {
        console.warn('Failed to load warehouses from API');
        setWarehouses([]);
      }
    } catch (err) {
      console.error('Failed to load warehouses:', err);
      setWarehouses([]);
    }
  };

  const fetchUser = async () => {
    try {
      const user = await api.get('/users/me/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(user.data);
    } catch (err) {
      console.error('Failed to load user:', err);
    }
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setForm({ product: '', quantity: '', fromWarehouse: '', toWarehouse: '', notes: '' });
  };

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      if (!form.product || !form.quantity || !form.fromWarehouse || !form.toWarehouse) {
        setError('Please fill in all required fields');
        return;
      }

      if (form.fromWarehouse === form.toWarehouse) {
        setError('Source and destination warehouses must be different');
        return;
      }

      // Find selected product and warehouses
      const selectedProduct = products.find(p => p.name === form.product || p.id === parseInt(form.product));
      const fromWarehouse = warehouses.find(w => w.name === form.fromWarehouse || w.id === parseInt(form.fromWarehouse));
      const toWarehouse = warehouses.find(w => w.name === form.toWarehouse || w.id === parseInt(form.toWarehouse));

      if (!selectedProduct || !fromWarehouse || !toWarehouse) {
        setError('Invalid product or warehouse selection');
        return;
      }

      // Create transfer via backend API
      const transferData = {
        from_warehouse: fromWarehouse.id,
        to_warehouse: toWarehouse.id,
        product: selectedProduct.id,
        quantity: parseInt(form.quantity),
        priority: 'medium',
        request_notes: form.notes || `Transfer ${selectedProduct.name} from ${fromWarehouse.name} to ${toWarehouse.name}`
      };

      console.log('🔄 Creating transfer with data:', transferData);
      console.log('🔗 API endpoint:', '/warehouse/transfers/create/');
      console.log('🏢 From warehouse:', fromWarehouse);
      console.log('🏢 To warehouse:', toWarehouse);
      console.log('📦 Product:', selectedProduct);

      const response = await api.post('/warehouse/transfers/create/', transferData);
      
      console.log('Transfer created successfully:', response.data);
      setError(null);
      setForm({ product: '', quantity: '', fromWarehouse: '', toWarehouse: '', notes: '' });
      handleClose();
      fetchTransfers(); // Refresh the transfers list
    } catch (err) {
      console.error('Failed to create transfer:', err);
      const errorMessage = err.response?.data?.error || 'Failed to create transfer.';
      setError(errorMessage);
    }
  };

  const handleApprove = async (transferId) => {
    setActionLoading(transferId);
    try {
      await api.put(`/warehouse/transfers/${transferId}/`, {
        status: 'approved'
      });
      fetchTransfers(); // Refresh the transfers list
    } catch (err) {
      console.error('Failed to approve transfer:', err);
      setError('Failed to approve transfer');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (transferId) => {
    setActionLoading(transferId);
    try {
      await api.put(`/warehouse/transfers/${transferId}/`, {
        status: 'rejected'
      });
      fetchTransfers(); // Refresh the transfers list
    } catch (err) {
      console.error('Failed to reject transfer:', err);
      setError('Failed to reject transfer');
    } finally {
      setActionLoading(null);
    }
  };

  const handleComplete = async (transferId) => {
    setActionLoading(transferId);
    try {
      await api.post(`/warehouse/transfers/${transferId}/complete/`);
      fetchTransfers(); // Refresh the transfers list
    } catch (err) {
      console.error('Failed to complete transfer:', err);
      setError('Failed to complete transfer');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDownloadWaybill = async (transferId) => {
    console.log(`[Waybill] Attempting to download waybill for transfer ${transferId}`);
    
    try {
      const response = await api.get(`/warehouse/transfers/${transferId}/waybill/`, {
        responseType: 'blob'
      });
      
      console.log('[Waybill] Response received:', {
        status: response.status,
        contentType: response.headers['content-type'],
        dataSize: response.data.size
      });
      
      // Check if response is PDF or HTML
      const contentType = response.headers['content-type'];
      
      if (contentType === 'application/pdf') {
        // Handle PDF download
        console.log('[Waybill] Processing PDF download');
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `waybill_${transferId}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        console.log('[Waybill] PDF download triggered successfully');
      } else if (contentType && contentType.includes('text/html')) {
        // Handle HTML response (fallback)
        console.log('[Waybill] Processing HTML fallback');
        const blob = new Blob([response.data], { type: 'text/html' });
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
        setTimeout(() => window.URL.revokeObjectURL(url), 1000);
        console.log('[Waybill] HTML waybill opened in new tab');
      } else {
        // Handle JSON error response
        console.log('[Waybill] Unexpected content type, checking for JSON error');
        const text = await response.data.text();
        try {
          const errorData = JSON.parse(text);
          throw new Error(errorData.error || 'Unknown server error');
        } catch (parseError) {
          throw new Error(`Unexpected response format: ${contentType}`);
        }
      }
      
    } catch (error) {
      console.error('[Waybill] Download error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url
      });
      
      if (error.response?.status === 404) {
        setError('Transfer not found. Please refresh and try again.');
      } else if (error.response?.status === 403) {
        setError('You do not have permission to download this waybill.');
      } else if (error.response?.status === 500) {
        setError('Server error generating waybill. Please try again or contact support.');
      } else if (error.message.includes('Network Error')) {
        setError('Cannot connect to server. Please check if the backend is running.');
      } else {
        setError(error.response?.data?.error || error.message || 'Failed to download waybill');
      }
    }
  };

  const openWaybillUploadDialog = (transfer) => {
    setSelectedTransferForWaybill(transfer);
    setWaybillDialog(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'approved':
        return 'success';
      case 'completed':
        return 'primary';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const filteredTransfers = transfers.filter(tr => {
    if (statusFilter === 'all') return true;
    return tr.status === statusFilter;
  });

  useEffect(() => {
    const counts = { pending: 0, approved: 0, completed: 0, rejected: 0 };
    transfers.forEach(tr => {
      counts[tr.status]++;
    });
    setStatusCounts(counts);
  }, [transfers]);

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">🚚 Warehouse Transfer Management</Typography>
        <Box display="flex" gap={2}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Status Filter</InputLabel>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              label="Status Filter"
            >
              <MenuItem value="all">All Transfers</MenuItem>
              <MenuItem value="pending">Pending Approval</MenuItem>
              <MenuItem value="approved">Approved</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem>
            </Select>
          </FormControl>
          <Button 
            variant="outlined" 
            startIcon={<RefreshIcon />}
            onClick={fetchTransfers}
          >
            Refresh
          </Button>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={handleOpen}
          >
            Create Transfer Request
          </Button>
        </Box>
      </Box>
      
      <Typography variant="body2" color="text.secondary" mb={2}>
        Manage warehouse transfers with approval workflow
      </Typography>

      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#FFF3E0', borderLeft: '4px solid #FF9800' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" color="#FF9800">{statusCounts.pending}</Typography>
                  <Typography variant="body2">Pending Approval</Typography>
                </Box>
                <Box sx={{ color: '#FF9800', fontSize: '2rem' }}>⏳</Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#E3F2FD', borderLeft: '4px solid #2196F3' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" color="#2196F3">{statusCounts.approved}</Typography>
                  <Typography variant="body2">Approved</Typography>
                </Box>
                <Box sx={{ color: '#2196F3', fontSize: '2rem' }}>✓</Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#E8F5E8', borderLeft: '4px solid #4CAF50' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" color="#4CAF50">{statusCounts.completed}</Typography>
                  <Typography variant="body2">Completed</Typography>
                </Box>
                <Box sx={{ color: '#4CAF50', fontSize: '2rem' }}>🚚</Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#FFEBEE', borderLeft: '4px solid #F44336' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" color="#F44336">{statusCounts.rejected}</Typography>
                  <Typography variant="body2">Rejected</Typography>
                </Box>
                <Box sx={{ color: '#F44336', fontSize: '2rem' }}>✗</Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Transfer #</TableCell>
                <TableCell>Product</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>From Warehouse</TableCell>
                <TableCell>To Warehouse</TableCell>
                <TableCell>Requested Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTransfers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Box py={4}>
                      <Typography variant="body1" color="text.secondary">
                        {statusFilter === 'all' ? 'No transfers found.' : `No ${statusFilter} transfers found.`}
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                filteredTransfers.map(tr => (
                  <TableRow key={tr.id}>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        {tr.transfer_number || `TRF-${tr.id}`}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {tr.product?.name || tr.product_name || 'Unknown Product'}
                      </Typography>
                    </TableCell>
                    <TableCell>{tr.quantity}</TableCell>
                    <TableCell>
                      {tr.from_warehouse?.name || tr.from_location || 'Unknown'}
                    </TableCell>
                    <TableCell>
                      {tr.to_warehouse?.name || tr.to_location || 'Unknown'}
                    </TableCell>
                    <TableCell>
                      {tr.request_date ? new Date(tr.request_date).toLocaleDateString() : 
                       tr.created_at ? new Date(tr.created_at).toLocaleDateString() : '-'}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={tr.status?.toUpperCase() || 'UNKNOWN'} 
                        color={getStatusColor(tr.status)} 
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box display="flex" gap={1}>
                        {tr.status === 'pending' && (
                          <>
                            <Tooltip title="Approve Transfer">
                              <IconButton 
                                size="small" 
                                color="success"
                                onClick={() => handleApprove(tr.id)}
                                disabled={actionLoading === tr.id}
                              >
                                <ApproveIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Reject Transfer">
                              <IconButton 
                                size="small" 
                                color="error"
                                onClick={() => handleReject(tr.id)}
                                disabled={actionLoading === tr.id}
                              >
                                <RejectIcon />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                        {tr.status === 'approved' && (
                          <Tooltip title="Mark as Completed">
                            <IconButton 
                              size="small" 
                              color="primary"
                              onClick={() => handleComplete(tr.id)}
                              disabled={actionLoading === tr.id}
                            >
                              <CompleteIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Download Waybill">
                          <IconButton
                            onClick={() => handleDownloadWaybill(tr.id)}
                            color="primary"
                            size="small"
                          >
                            <DownloadIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>New Warehouse Transfer</DialogTitle>
        <DialogContent>
          <form id="transfer-form" onSubmit={handleSubmit}>
            <FormControl fullWidth margin="normal">
              <InputLabel id="product-label">Product</InputLabel>
              <Select
                labelId="product-label"
                id="product"
                name="product"
                value={form.product}
                label="Product"
                onChange={handleChange}
              >
                {products.map(p => (
                  <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField label="Quantity" name="quantity" value={form.quantity} onChange={handleChange} fullWidth margin="normal" type="number" required />
            <FormControl fullWidth margin="normal">
              <InputLabel id="from-warehouse-label">From Warehouse</InputLabel>
              <Select
                labelId="from-warehouse-label"
                id="fromWarehouse"
                name="fromWarehouse"
                value={form.fromWarehouse}
                label="From Warehouse"
                onChange={handleChange}
              >
                {warehouses.map(w => (
                  <MenuItem key={w.id} value={w.id}>{w.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal">
              <InputLabel id="to-warehouse-label">To Warehouse</InputLabel>
              <Select
                labelId="to-warehouse-label"
                id="toWarehouse"
                name="toWarehouse"
                value={form.toWarehouse}
                label="To Warehouse"
                onChange={handleChange}
              >
                {warehouses.map(w => (
                  <MenuItem key={w.id} value={w.id}>{w.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="submit" form="transfer-form" variant="contained">Create</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WarehouseTransfers;

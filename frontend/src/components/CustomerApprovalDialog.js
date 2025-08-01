import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Business as BusinessIcon,
  CalendarToday as CalendarIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import CustomerApprovalService from '../services/CustomerApprovalService';

const CustomerApprovalDialog = ({ open, onClose, onApprovalComplete }) => {
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [selectedApproval, setSelectedApproval] = useState(null);
  const [approvalAction, setApprovalAction] = useState('');
  const [customerType, setCustomerType] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const customerTypeOptions = [
    { value: 'retailer', label: 'Retailer' },
    { value: 'wholesaler', label: 'Wholesaler' },
    { value: 'distributor', label: 'Distributor' }
  ];

  useEffect(() => {
    if (open) {
      fetchPendingApprovals();
    }
  }, [open]);

  const fetchPendingApprovals = async () => {
    try {
      setLoading(true);
      const approvals = await CustomerApprovalService.getPendingApprovals();
      setPendingApprovals(approvals);
      setError('');
    } catch (err) {
      setError('Failed to load pending approvals');
      console.error('Error fetching pending approvals:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewApproval = (approval) => {
    setSelectedApproval(approval);
    setCustomerType(approval.customer_type || 'retailer');
    setApprovalAction('');
    setRejectionReason('');
    setError('');
    setSuccess('');
  };

  const handleApprove = async () => {
    if (!customerType) {
      setError('Please select a customer type');
      return;
    }

    try {
      setLoading(true);
      await CustomerApprovalService.approveCustomer(selectedApproval.id, customerType);
      setSuccess(`Customer "${selectedApproval.name}" approved as ${customerType}`);
      
      // Refresh the list
      await fetchPendingApprovals();
      
      // Reset form
      setSelectedApproval(null);
      setApprovalAction('');
      setCustomerType('');
      
      // Notify parent component
      if (onApprovalComplete) {
        onApprovalComplete();
      }
    } catch (err) {
      setError('Failed to approve customer');
      console.error('Error approving customer:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      setError('Please provide a rejection reason');
      return;
    }

    try {
      setLoading(true);
      await CustomerApprovalService.rejectCustomer(selectedApproval.id, rejectionReason);
      setSuccess(`Customer "${selectedApproval.name}" request rejected`);
      
      // Refresh the list
      await fetchPendingApprovals();
      
      // Reset form
      setSelectedApproval(null);
      setApprovalAction('');
      setRejectionReason('');
      
      // Notify parent component
      if (onApprovalComplete) {
        onApprovalComplete();
      }
    } catch (err) {
      setError('Failed to reject customer');
      console.error('Error rejecting customer:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedApproval(null);
    setApprovalAction('');
    setCustomerType('');
    setRejectionReason('');
    setError('');
    setSuccess('');
    onClose();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'approved': return 'success';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">Customer Approval Center</Typography>
          <Chip 
            label={`${pendingApprovals.length} Pending`} 
            color="warning" 
            size="small" 
          />
        </Box>
      </DialogTitle>
      
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        {!selectedApproval ? (
          // List of pending approvals
          <Box>
            <Typography variant="h6" gutterBottom>
              Pending Customer Approvals
            </Typography>
            
            {loading ? (
              <Typography>Loading pending approvals...</Typography>
            ) : pendingApprovals.length === 0 ? (
              <Alert severity="info">
                No pending customer approvals at this time.
              </Alert>
            ) : (
              <List>
                {pendingApprovals.map((approval) => (
                  <Card key={approval.id} sx={{ mb: 2 }}>
                    <CardContent>
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={8}>
                          <Box display="flex" alignItems="center" mb={1}>
                            <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
                            <Typography variant="h6">{approval.name}</Typography>
                            <Chip 
                              label={approval.customer_type} 
                              size="small" 
                              sx={{ ml: 2 }}
                            />
                          </Box>
                          
                          <Box display="flex" alignItems="center" mb={0.5}>
                            <EmailIcon sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                              {approval.email}
                            </Typography>
                          </Box>
                          
                          <Box display="flex" alignItems="center" mb={0.5}>
                            <CalendarIcon sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                              Requested: {new Date(approval.created_at).toLocaleDateString()}
                            </Typography>
                          </Box>
                          
                          <Typography variant="body2" color="text.secondary">
                            By: {approval.requested_by_name}
                          </Typography>
                        </Grid>
                        
                        <Grid item xs={12} md={4}>
                          <Box display="flex" justifyContent="flex-end" gap={1}>
                            <Tooltip title="View Details">
                              <IconButton 
                                onClick={() => handleViewApproval(approval)}
                                color="primary"
                              >
                                <ViewIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                ))}
              </List>
            )}
          </Box>
        ) : (
          // Approval details and action form
          <Box>
            <Box display="flex" alignItems="center" mb={2}>
              <Button 
                onClick={() => setSelectedApproval(null)}
                size="small"
              >
                ← Back to List
              </Button>
            </Box>
            
            <Typography variant="h6" gutterBottom>
              Customer Approval Details
            </Typography>
            
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Box display="flex" alignItems="center" mb={2}>
                      <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="h6">{selectedApproval.name}</Typography>
                    </Box>
                    
                    <Box display="flex" alignItems="center" mb={1}>
                      <EmailIcon sx={{ mr: 1, fontSize: 16 }} />
                      <Typography>{selectedApproval.email}</Typography>
                    </Box>
                    
                    {selectedApproval.phone && (
                      <Box display="flex" alignItems="center" mb={1}>
                        <PhoneIcon sx={{ mr: 1, fontSize: 16 }} />
                        <Typography>{selectedApproval.phone}</Typography>
                      </Box>
                    )}
                    
                    {selectedApproval.address && (
                      <Box display="flex" alignItems="center" mb={1}>
                        <LocationIcon sx={{ mr: 1, fontSize: 16 }} />
                        <Typography>{selectedApproval.address}</Typography>
                      </Box>
                    )}
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Box display="flex" alignItems="center" mb={1}>
                      <BusinessIcon sx={{ mr: 1, fontSize: 16 }} />
                      <Typography>Requested Type: </Typography>
                      <Chip 
                        label={selectedApproval.customer_type} 
                        size="small" 
                        sx={{ ml: 1 }}
                      />
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" mb={1}>
                      Payment Terms: {selectedApproval.payment_terms} days
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" mb={1}>
                      Requested by: {selectedApproval.requested_by_name}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary">
                      Date: {new Date(selectedApproval.created_at).toLocaleString()}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="h6" gutterBottom>
              Approval Action
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Action</InputLabel>
                  <Select
                    value={approvalAction}
                    onChange={(e) => setApprovalAction(e.target.value)}
                    label="Action"
                  >
                    <MenuItem value="approve">Approve Customer</MenuItem>
                    <MenuItem value="reject">Reject Customer</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              {approvalAction === 'approve' && (
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Customer Type</InputLabel>
                    <Select
                      value={customerType}
                      onChange={(e) => setCustomerType(e.target.value)}
                      label="Customer Type"
                    >
                      {customerTypeOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              )}
              
              {approvalAction === 'reject' && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Rejection Reason"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Please provide a reason for rejecting this customer request..."
                  />
                </Grid>
              )}
            </Grid>
          </Box>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={handleClose}>
          Close
        </Button>
        
        {selectedApproval && approvalAction && (
          <>
            {approvalAction === 'approve' && (
              <Button
                onClick={handleApprove}
                variant="contained"
                color="success"
                startIcon={<ApproveIcon />}
                disabled={loading || !customerType}
              >
                Approve Customer
              </Button>
            )}
            
            {approvalAction === 'reject' && (
              <Button
                onClick={handleReject}
                variant="contained"
                color="error"
                startIcon={<RejectIcon />}
                disabled={loading || !rejectionReason.trim()}
              >
                Reject Customer
              </Button>
            )}
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default CustomerApprovalDialog;

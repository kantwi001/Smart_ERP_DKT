import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Typography,
  Box,
  IconButton,
  LinearProgress,
  Alert,
  Card,
  CardContent,
  Chip,
  Stepper,
  Step,
  StepLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider
} from '@mui/material';
import {
  Close as CloseIcon,
  Business as BusinessIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineDot,
  TimelineConnector,
  TimelineContent
} from '@mui/lab';
import api from '../api';

const APPROVAL_STAGES = [
  { key: 'requester', label: 'Requester', description: 'Request submitted' },
  { key: 'hod', label: 'HOD', description: 'Head of Department approval' },
  { key: 'country_director', label: 'Country Director', description: 'Country Director approval' },
  { key: 'procurement_manager', label: 'Procurement Manager', description: 'Procurement Manager review' },
  { key: 'procurement_officer', label: 'Procurement Officer', description: 'Procurement Officer assignment' },
  { key: 'finance_manager', label: 'Finance Manager', description: 'Finance Manager approval' },
  { key: 'finance_officer', label: 'Finance Officer', description: 'Finance Officer processing' },
  { key: 'final_approval', label: 'Final Approval', description: 'Final approval and completion' }
];

const URGENCY_LEVELS = [
  { value: 'low', label: 'Low', color: 'success' },
  { value: 'medium', label: 'Medium', color: 'warning' },
  { value: 'high', label: 'High', color: 'error' }
];

const ProcurementRequestDialog = ({ open, onClose, onSubmit, editData = null }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    item: '',
    quantity: 1,
    estimated_cost: '',
    urgency: 'medium',
    reason: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (editData) {
      setFormData({
        title: editData.title || '',
        description: editData.description || '',
        item: editData.item || '',
        quantity: editData.quantity || 1,
        estimated_cost: editData.estimated_cost || '',
        urgency: editData.urgency || 'medium',
        reason: editData.reason || ''
      });
    } else {
      setFormData({
        title: '',
        description: '',
        item: '',
        quantity: 1,
        estimated_cost: '',
        urgency: 'medium',
        reason: ''
      });
    }
  }, [editData, open]);

  const handleChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.description || !formData.item || !formData.quantity) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.post('/procurement/requests/', formData);
      setSuccess('Procurement request submitted successfully!');
      
      setTimeout(() => {
        onSubmit(response.data);
        onClose();
        setSuccess('');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit procurement request');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentStageIndex = (stage) => {
    return APPROVAL_STAGES.findIndex(s => s.key === stage);
  };

  const getUrgencyColor = (urgency) => {
    const level = URGENCY_LEVELS.find(l => l.value === urgency);
    return level ? level.color : 'default';
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2, maxHeight: '90vh' }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        bgcolor: 'primary.main',
        color: 'white',
        py: 2
      }}>
        <Box display="flex" alignItems="center" gap={1}>
          <BusinessIcon />
          <Typography variant="h6">
            {editData ? 'View Procurement Request' : 'New Procurement Request'}
          </Typography>
        </Box>
        <IconButton onClick={onClose} sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {loading && <LinearProgress sx={{ mb: 2 }} />}
        
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

        {editData && (
          <Card sx={{ mb: 3, bgcolor: 'grey.50' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary">
                Request Status & Progress
              </Typography>
              
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <Chip 
                  label={editData.status?.toUpperCase()} 
                  color={editData.status === 'completed' ? 'success' : editData.status === 'rejected' ? 'error' : 'primary'}
                  variant="filled"
                />
                <Chip 
                  label={editData.urgency?.toUpperCase()} 
                  color={getUrgencyColor(editData.urgency)}
                  size="small"
                />
                {editData.current_approver_name && (
                  <Chip 
                    icon={<PersonIcon />}
                    label={`Pending: ${editData.current_approver_name}`}
                    color="warning"
                    variant="outlined"
                    size="small"
                  />
                )}
              </Box>

              <Stepper 
                activeStep={getCurrentStageIndex(editData.current_stage)} 
                alternativeLabel
                sx={{ mt: 2 }}
              >
                {APPROVAL_STAGES.map((stage, index) => (
                  <Step key={stage.key}>
                    <StepLabel>
                      <Typography variant="caption" display="block">
                        {stage.label}
                      </Typography>
                      <Typography variant="caption" color="textSecondary" display="block">
                        {stage.description}
                      </Typography>
                    </StepLabel>
                  </Step>
                ))}
              </Stepper>

              {editData.po_number && (
                <Box mt={2}>
                  <Typography variant="body2" color="primary">
                    <strong>PO Number:</strong> {editData.po_number}
                  </Typography>
                </Box>
              )}

              {editData.selected_vendor_name && (
                <Box mt={1}>
                  <Typography variant="body2" color="primary">
                    <strong>Selected Vendor:</strong> {editData.selected_vendor_name}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        )}

        {/* Request Details Section */}
        <Box sx={{ mb: 4 }}>
          <Typography 
            variant="h4" 
            gutterBottom 
            sx={{ 
              fontWeight: 700, 
              color: 'primary.main',
              borderBottom: '3px solid',
              borderColor: 'primary.main',
              pb: 1.5,
              mb: 3,
              fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' }
            }}
          >
            📋 Request Details
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Request Title"
                value={formData.title}
                onChange={handleChange('title')}
                required
                disabled={!!editData}
                variant="outlined"
                sx={{ 
                  '& .MuiInputLabel-root': { 
                    fontSize: { xs: '1rem', sm: '1.1rem' }, 
                    fontWeight: 600 
                  },
                  '& .MuiOutlinedInput-root': {
                    fontSize: { xs: '0.9rem', sm: '1rem' }
                  }
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={handleChange('description')}
                multiline
                rows={3}
                required
                disabled={!!editData}
                variant="outlined"
                sx={{ 
                  '& .MuiInputLabel-root': { 
                    fontSize: { xs: '1rem', sm: '1.1rem' }, 
                    fontWeight: 600 
                  },
                  '& .MuiOutlinedInput-root': {
                    fontSize: { xs: '0.9rem', sm: '1rem' }
                  }
                }}
              />
            </Grid>
          </Grid>
        </Box>

        {/* Item & Quantity Section */}
        <Box sx={{ mb: 4 }}>
          <Typography 
            variant="h4" 
            gutterBottom 
            sx={{ 
              fontWeight: 700, 
              color: 'secondary.main',
              borderBottom: '3px solid',
              borderColor: 'secondary.main',
              pb: 1.5,
              mb: 3,
              fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' }
            }}
          >
            📦 Item & Quantity Details
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Item/Service"
                value={formData.item}
                onChange={handleChange('item')}
                required
                disabled={!!editData}
                variant="outlined"
                sx={{ 
                  '& .MuiInputLabel-root': { 
                    fontSize: { xs: '1rem', sm: '1.1rem' }, 
                    fontWeight: 600 
                  },
                  '& .MuiOutlinedInput-root': {
                    fontSize: { xs: '0.9rem', sm: '1rem' }
                  }
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Quantity"
                value={formData.quantity}
                onChange={handleChange('quantity')}
                required
                disabled={!!editData}
                variant="outlined"
                inputProps={{ min: 1 }}
                sx={{ 
                  '& .MuiInputLabel-root': { 
                    fontSize: { xs: '1rem', sm: '1.1rem' }, 
                    fontWeight: 600 
                  },
                  '& .MuiOutlinedInput-root': {
                    fontSize: { xs: '0.9rem', sm: '1rem' }
                  }
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Estimated Cost (GHS)"
                value={formData.estimated_cost}
                onChange={handleChange('estimated_cost')}
                required
                disabled={!!editData}
                variant="outlined"
                inputProps={{ min: 0, step: 0.01 }}
                sx={{ 
                  '& .MuiInputLabel-root': { 
                    fontSize: { xs: '1rem', sm: '1.1rem' }, 
                    fontWeight: 600 
                  },
                  '& .MuiOutlinedInput-root': {
                    fontSize: { xs: '0.9rem', sm: '1rem' }
                  }
                }}
              />
            </Grid>
          </Grid>
        </Box>

        {/* Priority & Justification Section */}
        <Box sx={{ mb: 4 }}>
          <Typography 
            variant="h4" 
            gutterBottom 
            sx={{ 
              fontWeight: 700, 
              color: 'warning.main',
              borderBottom: '3px solid',
              borderColor: 'warning.main',
              pb: 1.5,
              mb: 3,
              fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' }
            }}
          >
            ⚡ Priority & Justification
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth variant="outlined">
                <InputLabel sx={{ 
                  fontSize: { xs: '1rem', sm: '1.1rem' }, 
                  fontWeight: 600 
                }}>Urgency Level</InputLabel>
                <Select
                  value={formData.urgency}
                  onChange={handleChange('urgency')}
                  label="Urgency Level"
                  disabled={!!editData}
                  sx={{
                    fontSize: { xs: '0.9rem', sm: '1rem' }
                  }}
                >
                  {URGENCY_LEVELS.map((level) => (
                    <MenuItem key={level.value} value={level.value}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Chip 
                          label={level.label} 
                          color={level.color} 
                          size="small" 
                          variant="outlined"
                        />
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Reason/Justification"
                value={formData.reason}
                onChange={handleChange('reason')}
                multiline
                rows={4}
                required
                disabled={!!editData}
                variant="outlined"
                placeholder="Please provide detailed justification for this procurement request..."
                sx={{ 
                  '& .MuiInputLabel-root': { 
                    fontSize: { xs: '1rem', sm: '1.1rem' }, 
                    fontWeight: 600 
                  },
                  '& .MuiOutlinedInput-root': {
                    fontSize: { xs: '0.9rem', sm: '1rem' }
                  }
                }}
              />
            </Grid>
          </Grid>
        </Box>

        {editData && editData.approvals && editData.approvals.length > 0 && (
          <Box mt={3}>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="h6" gutterBottom color="primary">
              Approval History
            </Typography>
            <Timeline>
              {editData.approvals.map((approval, index) => (
                <TimelineItem key={index}>
                  <TimelineSeparator>
                    <TimelineDot color={approval.status === 'approved' ? 'success' : 'error'}>
                      {approval.status === 'approved' ? <CheckCircleIcon /> : <CancelIcon />}
                    </TimelineDot>
                    {index < editData.approvals.length - 1 && <TimelineConnector />}
                  </TimelineSeparator>
                  <TimelineContent>
                    <Typography variant="body2" fontWeight="bold">
                      {approval.approver_name}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {approval.stage} - {new Date(approval.approved_at).toLocaleDateString()}
                    </Typography>
                    {approval.comments && (
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        {approval.comments}
                      </Typography>
                    )}
                  </TimelineContent>
                </TimelineItem>
              ))}
            </Timeline>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, bgcolor: 'grey.50' }}>
        <Button onClick={onClose} variant="outlined">
          {editData ? 'Close' : 'Cancel'}
        </Button>
        {!editData && (
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading || !formData.title || !formData.description || !formData.item || !formData.reason}
            sx={{ background: 'linear-gradient(45deg, #2196F3 30%, #1976D2 90%)' }}
          >
            {loading ? 'Submitting...' : 'Submit Request'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ProcurementRequestDialog;
                label="Urgency Level"
              >
                {URGENCY_LEVELS.map(level => (
                  <MenuItem key={level.value} value={level.value}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Chip 
                        label={level.label} 
                        color={level.color} 
                        size="small" 
                      />
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Justification/Reason"
              value={formData.reason}
              onChange={handleChange('reason')}
              multiline
              rows={3}
              disabled={!!editData}
              variant="outlined"
              placeholder="Please provide justification for this procurement request..."
            />
          </Grid>
        {editData && editData.approvals && editData.approvals.length > 0 && (
          <Box mt={3}>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="h6" gutterBottom color="primary">
              Approval History
            </Typography>
            {editData.approvals.map((approval, index) => (
              <Card key={index} sx={{ mb: 1, bgcolor: 'grey.50' }}>
                <CardContent sx={{ py: 1.5 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="body2">
                        <strong>{approval.approver_name}</strong> - {approval.stage}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {approval.comment}
                      </Typography>
                    </Box>
                    <Box textAlign="right">
                      <Chip 
                        label={approval.action} 
                        color={approval.action === 'approve' ? 'success' : 'error'}
                        size="small"
                      />
                      <Typography variant="caption" display="block" color="textSecondary">
                        {new Date(approval.created_at).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, bgcolor: 'grey.50' }}>
        <Button onClick={onClose} disabled={loading}>
          {editData ? 'Close' : 'Cancel'}
        </Button>
        {!editData && (
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading}
            startIcon={loading ? <ScheduleIcon /> : <SendIcon />}
            sx={{ minWidth: 120 }}
          >
            {loading ? 'Submitting...' : 'Submit Request'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ProcurementRequestDialog;

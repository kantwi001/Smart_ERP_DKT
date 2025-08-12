import React, { useState, useEffect, useContext } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Avatar,
  IconButton,
  Card,
  CardContent,
  CardActions,
  Divider,
  Alert,
  LinearProgress,
  Grid
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Assignment as TaskIcon,
  AttachMoney as MoneyIcon,
  School as SchoolIcon,
  PlayArrow as PlayIcon,
  Download as DownloadIcon,
  CheckCircle as CheckIcon,
  Schedule as PendingIcon,
  Cancel as CancelIcon,
  PhotoCamera as CameraIcon
} from '@mui/icons-material';
import { AuthContext } from '../AuthContext';
import api from '../api';

// Leave Request Form
export const LeaveRequestForm = ({ open, onClose, onSubmit }) => {
  const { token } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    leaveType: '',
    startDate: '',
    endDate: '',
    reason: '',
    days: 0
  });
  const [loading, setLoading] = useState(false);

  const leaveTypes = [
    { value: 'annual', label: 'Annual Leave' },
    { value: 'sick', label: 'Sick Leave' },
    { value: 'maternity', label: 'Maternity Leave' },
    { value: 'emergency', label: 'Emergency Leave' },
    { value: 'other', label: 'Other' }
  ];

  const calculateDays = () => {
    if (formData.startDate && formData.endDate) {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      const diffTime = Math.abs(endDate - startDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      setFormData(prev => ({ ...prev, days: diffDays }));
    }
  };

  useEffect(() => {
    calculateDays();
  }, [formData.startDate, formData.endDate]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await api.post('/hr/leave-requests/', {
        leave_type: formData.leaveType,
        start_date: formData.startDate,
        end_date: formData.endDate,
        reason: formData.reason,
        days_requested: formData.days
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      onSubmit('Leave request submitted successfully!');
      onClose();
      setFormData({ leaveType: '', startDate: '', endDate: '', reason: '', days: 0 });
    } catch (error) {
      onSubmit('Failed to submit leave request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center">
          <CalendarIcon sx={{ mr: 1, color: '#4CAF50' }} />
          Request Leave
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <FormControl fullWidth>
            <InputLabel>Leave Type</InputLabel>
            <Select
              value={formData.leaveType}
              onChange={(e) => setFormData(prev => ({ ...prev, leaveType: e.target.value }))}
              label="Leave Type"
            >
              {leaveTypes.map(type => (
                <MenuItem key={type.value} value={type.value}>
                  {type.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Start Date"
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            fullWidth
            label="End Date"
            type="date"
            value={formData.endDate}
            onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
            InputLabelProps={{ shrink: true }}
          />

          {formData.days > 0 && (
            <Alert severity="info">
              Total days requested: <strong>{formData.days} days</strong>
            </Alert>
          )}

          <TextField
            fullWidth
            multiline
            rows={3}
            label="Reason for Leave"
            value={formData.reason}
            onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
            placeholder="Please provide a reason for your leave request..."
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={loading || !formData.leaveType || !formData.startDate || !formData.endDate}
          sx={{ bgcolor: '#4CAF50' }}
        >
          {loading ? 'Submitting...' : 'Submit Request'}
        </Button>
      </DialogActions>
      {loading && <LinearProgress />}
    </Dialog>
  );
};

// Profile Edit Form
export const ProfileEditForm = ({ open, onClose, onSubmit, userProfile }) => {
  const { token } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    firstName: userProfile?.first_name || '',
    lastName: userProfile?.last_name || '',
    email: userProfile?.email || '',
    phone: userProfile?.phone || '',
    address: userProfile?.address || '',
    emergencyContact: userProfile?.emergency_contact || '',
    emergencyPhone: userProfile?.emergency_phone || ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await api.patch('/users/me/profile/', {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        emergency_contact: formData.emergencyContact,
        emergency_phone: formData.emergencyPhone
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      onSubmit('Profile updated successfully!');
      onClose();
    } catch (error) {
      onSubmit('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center">
          <PersonIcon sx={{ mr: 1, color: '#FF9800' }} />
          Edit Profile
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            fullWidth
            label="First Name"
            value={formData.firstName}
            onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
          />
          <TextField
            fullWidth
            label="Last Name"
            value={formData.lastName}
            onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
          />
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          />
          <TextField
            fullWidth
            label="Phone Number"
            value={formData.phone}
            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
          />
          <TextField
            fullWidth
            multiline
            rows={2}
            label="Address"
            value={formData.address}
            onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
          />
          <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1 }}>
            Emergency Contact Information
          </Typography>
          <TextField
            fullWidth
            label="Emergency Contact Name"
            value={formData.emergencyContact}
            onChange={(e) => setFormData(prev => ({ ...prev, emergencyContact: e.target.value }))}
          />
          <TextField
            fullWidth
            label="Emergency Contact Phone"
            value={formData.emergencyPhone}
            onChange={(e) => setFormData(prev => ({ ...prev, emergencyPhone: e.target.value }))}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={loading}
          sx={{ bgcolor: '#FF9800' }}
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </DialogActions>
      {loading && <LinearProgress />}
    </Dialog>
  );
};

// Procurement Request Form
export const ProcurementRequestForm = ({ open, onClose, onSubmit }) => {
  const { token } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    itemName: '',
    description: '',
    quantity: '',
    estimatedCost: '',
    urgency: 'normal',
    justification: '',
    category: ''
  });
  const [loading, setLoading] = useState(false);

  const urgencyLevels = [
    { value: 'low', label: 'Low Priority' },
    { value: 'normal', label: 'Normal Priority' },
    { value: 'high', label: 'High Priority' },
    { value: 'urgent', label: 'Urgent' }
  ];

  const categories = [
    { value: 'office_supplies', label: 'Office Supplies' },
    { value: 'equipment', label: 'Equipment' },
    { value: 'software', label: 'Software' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'other', label: 'Other' }
  ];

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await api.post('/procurement/requests/', {
        item_name: formData.itemName,
        description: formData.description,
        quantity: parseInt(formData.quantity),
        estimated_cost: parseFloat(formData.estimatedCost),
        urgency: formData.urgency,
        justification: formData.justification,
        category: formData.category
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      onSubmit('Procurement request submitted successfully!');
      onClose();
      setFormData({
        itemName: '', description: '', quantity: '', estimatedCost: '',
        urgency: 'normal', justification: '', category: ''
      });
    } catch (error) {
      onSubmit('Failed to submit procurement request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center">
          <BusinessIcon sx={{ mr: 1, color: '#795548' }} />
          Procurement Request
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            fullWidth
            label="Item Name"
            value={formData.itemName}
            onChange={(e) => setFormData(prev => ({ ...prev, itemName: e.target.value }))}
            placeholder="What do you need?"
          />
          
          <FormControl fullWidth>
            <InputLabel>Category</InputLabel>
            <Select
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              label="Category"
            >
              {categories.map(cat => (
                <MenuItem key={cat.value} value={cat.value}>
                  {cat.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            multiline
            rows={2}
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Provide detailed description..."
          />

          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Quantity"
              type="number"
              value={formData.quantity}
              onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
              sx={{ flex: 1 }}
            />
            <TextField
              label="Estimated Cost (₵)"
              type="number"
              value={formData.estimatedCost}
              onChange={(e) => setFormData(prev => ({ ...prev, estimatedCost: e.target.value }))}
              sx={{ flex: 1 }}
            />
          </Box>

          <FormControl fullWidth>
            <InputLabel>Priority Level</InputLabel>
            <Select
              value={formData.urgency}
              onChange={(e) => setFormData(prev => ({ ...prev, urgency: e.target.value }))}
              label="Priority Level"
            >
              {urgencyLevels.map(level => (
                <MenuItem key={level.value} value={level.value}>
                  {level.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            multiline
            rows={3}
            label="Justification"
            value={formData.justification}
            onChange={(e) => setFormData(prev => ({ ...prev, justification: e.target.value }))}
            placeholder="Why is this item needed?"
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={loading || !formData.itemName || !formData.category}
          sx={{ bgcolor: '#795548' }}
        >
          {loading ? 'Submitting...' : 'Submit Request'}
        </Button>
      </DialogActions>
      {loading && <LinearProgress />}
    </Dialog>
  );
};

// Tasks List View
export const TasksListView = ({ open, onClose, tasks = [] }) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckIcon color="success" />;
      case 'pending': return <PendingIcon color="warning" />;
      case 'cancelled': return <CancelIcon color="error" />;
      default: return <TaskIcon color="info" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'cancelled': return 'error';
      default: return 'info';
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center">
          <TaskIcon sx={{ mr: 1, color: '#2196F3' }} />
          My Tasks
        </Box>
      </DialogTitle>
      <DialogContent>
        {tasks.length === 0 ? (
          <Alert severity="info">No tasks assigned to you at the moment.</Alert>
        ) : (
          <List>
            {tasks.map((task, index) => (
              <React.Fragment key={task.id || index}>
                <ListItem>
                  <ListItemIcon>
                    {getStatusIcon(task.status)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Typography variant="subtitle1" fontWeight="bold">
                          {task.title || 'Task'}
                        </Typography>
                        <Chip 
                          label={task.status || 'pending'} 
                          size="small"
                          color={getStatusColor(task.status)}
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {task.description || 'No description available'}
                        </Typography>
                        {task.due_date && (
                          <Typography variant="caption" color="text.secondary">
                            Due: {new Date(task.due_date).toLocaleDateString()}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                </ListItem>
                {index < tasks.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

// Payslips View
export const PayslipsView = ({ open, onClose, payslips = [] }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center">
          <MoneyIcon sx={{ mr: 1, color: '#9C27B0' }} />
          My Payslips
        </Box>
      </DialogTitle>
      <DialogContent>
        {payslips.length === 0 ? (
          <Alert severity="info">No payslips available.</Alert>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {payslips.map((payslip, index) => (
              <Card key={payslip.id || index} variant="outlined">
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="h6" fontWeight="bold">
                      {payslip.period || 'Month'}
                    </Typography>
                    <Chip label={`₵${payslip.net_pay || '0'}`} color="primary" />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Gross Pay: ₵{payslip.gross_pay || '0'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Deductions: ₵{payslip.deductions || '0'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Generated: {payslip.created_at ? new Date(payslip.created_at).toLocaleDateString() : 'N/A'}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

// Training Materials View
export const TrainingView = ({ open, onClose, trainings = [] }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center">
          <SchoolIcon sx={{ mr: 1, color: '#607D8B' }} />
          Training Materials
        </Box>
      </DialogTitle>
      <DialogContent>
        {trainings.length === 0 ? (
          <Alert severity="info">No training materials available.</Alert>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {trainings.map((training, index) => (
              <Card key={training.id || index} variant="outlined">
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    {training.title || 'Training Material'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {training.description || 'No description available'}
                  </Typography>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Chip 
                      label={training.type || 'Document'} 
                      size="small" 
                      color="primary" 
                    />
                    <Button size="small" variant="outlined">
                      View
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

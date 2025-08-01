import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Paper,
  Tabs,
  Tab,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Alert,
  LinearProgress,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Badge
} from '@mui/material';
import ProfileEditDialog from './components/ProfileEditDialog';
import { getProfilePictureUrl, getUserInitials } from './utils/imageUtils';
import { styled } from '@mui/material/styles';
import {
  Dashboard as DashboardIcon,
  CalendarToday as LeaveIcon,
  Assignment as TaskIcon,
  Person as ProfileIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
  Notifications as NotificationIcon,
  Add as AddIcon,
  Visibility as ViewIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationOnIcon,
  Badge as BadgeIcon,
  CalendarToday as CalendarTodayIcon,
  Cake as CakeIcon,
  ContactPhone as ContactPhoneIcon,
  Edit as EditIcon,
  CheckCircle as ApprovedIcon,
  Cancel as RejectedIcon,
  Schedule as PendingIcon,
  Timeline as TimelineIcon,
  Work as WorkIcon
} from '@mui/icons-material';
import { AuthContext } from './AuthContext';
import api from './api';
import WorkflowService from './services/WorkflowService';
import ProcurementRequestDialog from './components/ProcurementRequestDialog';

// Styled components
const StyledTabs = styled(Tabs)(({ theme }) => ({
  backgroundColor: '#fff',
  borderRadius: '12px 12px 0 0',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  '& .MuiTabs-indicator': {
    height: 3,
    borderRadius: '3px 3px 0 0',
    background: 'linear-gradient(45deg, #2196F3 30%, #1976D2 90%)',
  },
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '0.95rem',
  minHeight: 64,
  color: '#666',
  '&.Mui-selected': {
    color: '#2196F3',
  },
}));

const SummaryCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
  color: 'white',
  borderRadius: 16,
  boxShadow: '0 8px 32px rgba(33, 150, 243, 0.3)',
  transition: 'transform 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
  },
}));

const QuickActionButton = styled(Button)(({ theme }) => ({
  borderRadius: 12,
  textTransform: 'none',
  fontWeight: 600,
  padding: '12px 24px',
  boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
  },
}));

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`employee-tabpanel-${index}`}
      aria-labelledby={`employee-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const EmployeeDashboard = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Employee data
  const [employeeData, setEmployeeData] = useState({
    profile: {},
    leaveBalance: {},
    pendingRequests: [],
    recentActivity: [],
    notifications: []
  });

  // Dialog states
  const [leaveDialog, setLeaveDialog] = useState({ open: false, type: '' });
  const [procurementDialog, setProcurementDialog] = useState({ open: false, editData: null });
  const [viewRequestDialog, setViewRequestDialog] = useState({ open: false, request: null });
  const [profileEditDialog, setProfileEditDialog] = useState(false);
  const [procurementRequests, setProcurementRequests] = useState([]);
  const [success, setSuccess] = useState('');
  const [leaveFormData, setLeaveFormData] = useState({
    leave_type: '',
    start_date: '',
    end_date: '',
    reason: '',
    emergency_contact: '',
    handover_notes: ''
  });

  useEffect(() => {
    loadEmployeeData();
  }, []);

  const loadEmployeeData = async () => {
    setLoading(true);
    try {
      // Load employee profile and leave data
      const [profileRes, leaveRes] = await Promise.all([
        api.get('/users/me/'),
        api.get('/hr/leave-balance/').catch(() => ({ data: null }))
      ]);

      // Load workflow instances and procurement requests separately with error handling
      let workflowInstances = [];
      let procurementData = [];
      try {
        const workflowRes = await WorkflowService.getWorkflowInstances({ requester: user.id });
        workflowInstances = Array.isArray(workflowRes) ? workflowRes : (workflowRes.results || []);
      } catch (err) {
        console.warn('Failed to load workflow instances:', err);
        workflowInstances = [];
      }
      
      try {
        const procurementRes = await api.get('/procurement/requests/my_requests/');
        procurementData = Array.isArray(procurementRes.data) ? procurementRes.data : (procurementRes.data.results || []);
        setProcurementRequests(procurementData);
      } catch (err) {
        console.warn('Failed to load procurement requests:', err);
        setProcurementRequests([]);
      }

      setEmployeeData({
        profile: profileRes.data,
        leaveBalance: leaveRes.data || {
          annual_leave: 21,
          sick_leave: 10,
          personal_leave: 5,
          used_annual: 5,
          used_sick: 2,
          used_personal: 1
        },
        pendingRequests: workflowInstances.filter(w => w.status === 'in_progress'),
        recentActivity: workflowInstances.slice(0, 5),
        notifications: []
      });
    } catch (err) {
      setError('Failed to load employee data');
      console.error('Error loading employee data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Procurement request handlers
  const handleProcurementRequestSubmit = async (requestData) => {
    try {
      setLoading(true);
      
      // Submit procurement request
      const response = await api.post('/procurement/requests/', requestData);
      
      // Refresh procurement requests data
      const updatedRequests = await api.get('/procurement/requests/my_requests/');
      setProcurementRequests(Array.isArray(updatedRequests.data) ? updatedRequests.data : (updatedRequests.data.results || []));
      
      // Refresh employee data to update pending requests
      await loadEmployeeData();
      
      setSuccess('Procurement request submitted successfully!');
      setTimeout(() => setSuccess(''), 3000);
      
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit procurement request');
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleViewProcurementRequest = (request) => {
    setProcurementDialog({ open: true, editData: request });
  };

  const handleCloseProcurementDialog = () => {
    setProcurementDialog({ open: false, editData: null });
  };

  const handleLeaveRequestSubmit = async () => {
    try {
      setLoading(true);
      
      // Calculate days if not already calculated
      if (leaveFormData.start_date && leaveFormData.end_date) {
        const startDate = new Date(leaveFormData.start_date);
        const endDate = new Date(leaveFormData.end_date);
        const timeDiff = endDate.getTime() - startDate.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
        leaveFormData.days_requested = daysDiff;
      }

      // Create leave request (this would integrate with HR module)
      const leaveRequestData = {
        ...leaveFormData,
        employee: user.id,
        status: 'pending',
        submitted_date: new Date().toISOString()
      };

      // In a real implementation, this would create a leave request record
      // and then initiate the workflow
      await api.post('/hr/leave-requests/', leaveRequestData);

      // Get the leave request workflow template
      const templates = await WorkflowService.getWorkflowTemplatesByType('leave_request');
      const leaveTemplate = templates.find(t => t.is_default);

      if (leaveTemplate) {
        // This would be handled by the backend when creating the leave request
        // For now, we'll simulate the workflow initiation
        console.log('Leave request submitted with workflow template:', leaveTemplate.name);
      }

      setLeaveDialog({ open: false, type: '' });
      setLeaveFormData({
        leave_type: '',
        start_date: '',
        end_date: '',
        days_requested: 0,
        reason: '',
        emergency_contact: '',
        handover_notes: ''
      });
      
      loadEmployeeData();
      alert('Leave request submitted successfully!');
    } catch (err) {
      setError('Failed to submit leave request');
      console.error('Error submitting leave request:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderOverviewTab = () => (
    <Grid container spacing={3}>
      {/* Employee Profile Summary */}
      <Grid item xs={12} md={4}>
        <SummaryCard>
          <CardContent sx={{ textAlign: 'center', p: 3 }}>
            <Avatar
              sx={{ 
                width: 80, 
                height: 80, 
                mx: 'auto', 
                mb: 2,
                bgcolor: 'rgba(255,255,255,0.2)'
              }}
            >
              {user?.first_name?.charAt(0) || user?.username?.charAt(0) || 'E'}
            </Avatar>
            <Typography variant="h6" gutterBottom>
              {user?.first_name} {user?.last_name}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {employeeData.profile.department?.name || 'Employee'}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              {employeeData.profile.role || 'Staff'}
            </Typography>
          </CardContent>
        </SummaryCard>
      </Grid>

      {/* Leave Balance */}
      <Grid item xs={12} md={8}>
        <Card sx={{ borderRadius: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Leave Balance
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="h4" color="primary">
                    {employeeData.leaveBalance.annual_leave - employeeData.leaveBalance.used_annual}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Annual Leave Remaining
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={(employeeData.leaveBalance.used_annual / employeeData.leaveBalance.annual_leave) * 100}
                    sx={{ mt: 1 }}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="h4" color="warning.main">
                    {employeeData.leaveBalance.sick_leave - employeeData.leaveBalance.used_sick}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Sick Leave Remaining
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={(employeeData.leaveBalance.used_sick / employeeData.leaveBalance.sick_leave) * 100}
                    color="warning"
                    sx={{ mt: 1 }}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="h4" color="success.main">
                    {employeeData.leaveBalance.personal_leave - employeeData.leaveBalance.used_personal}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Personal Leave Remaining
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={(employeeData.leaveBalance.used_personal / employeeData.leaveBalance.personal_leave) * 100}
                    color="success"
                    sx={{ mt: 1 }}
                  />
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {/* Quick Actions */}
      <Grid item xs={12}>
        <Card sx={{ borderRadius: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <QuickActionButton
                  fullWidth
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setLeaveDialog({ open: true, type: 'leave' })}
                  sx={{ background: 'linear-gradient(45deg, #2196F3 30%, #1976D2 90%)' }}
                >
                  Request Leave
                </QuickActionButton>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <QuickActionButton
                  fullWidth
                  variant="contained"
                  startIcon={<BusinessIcon />}
                  onClick={() => setProcurementDialog({ open: true, editData: null })}
                  sx={{ background: 'linear-gradient(45deg, #FF9800 30%, #F57C00 90%)' }}
                >
                  Procurement Request
                </QuickActionButton>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <QuickActionButton
                  fullWidth
                  variant="outlined"
                  startIcon={<TimelineIcon />}
                  onClick={() => setActiveTab(1)}
                >
                  View Requests
                </QuickActionButton>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <QuickActionButton
                  fullWidth
                  variant="outlined"
                  startIcon={<ProfileIcon />}
                  onClick={() => setActiveTab(2)}
                >
                  Update Profile
                </QuickActionButton>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <QuickActionButton
                  fullWidth
                  variant="outlined"
                  startIcon={<TaskIcon />}
                  onClick={() => setActiveTab(3)}
                >
                  My Tasks
                </QuickActionButton>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {/* Recent Activity */}
      <Grid item xs={12} md={6}>
        <Card sx={{ borderRadius: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            <List>
              {employeeData.recentActivity.length === 0 ? (
                <ListItem>
                  <ListItemText primary="No recent activity" />
                </ListItem>
              ) : (
                employeeData.recentActivity.map((activity, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      {activity.status === 'approved' ? <ApprovedIcon color="success" /> :
                       activity.status === 'rejected' ? <RejectedIcon color="error" /> :
                       <PendingIcon color="warning" />}
                    </ListItemIcon>
                    <ListItemText
                      primary={`${activity.template_details?.name || 'Request'} - ${activity.instance_id}`}
                      secondary={`Status: ${activity.status} | ${new Date(activity.created_at).toLocaleDateString()}`}
                    />
                  </ListItem>
                ))
              )}
            </List>
          </CardContent>
        </Card>
      </Grid>

      {/* Pending Approvals */}
      <Grid item xs={12} md={6}>
        <Card sx={{ borderRadius: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Pending Requests
            </Typography>
            <List>
              {employeeData.pendingRequests.length === 0 ? (
                <ListItem>
                  <ListItemText primary="No pending requests" />
                </ListItem>
              ) : (
                employeeData.pendingRequests.map((request) => (
                  <ListItem key={request.id}>
                    <ListItemIcon>
                      <PendingIcon color="warning" />
                    </ListItemIcon>
                    <ListItemText
                      primary={`${request.template_details?.name} - ${request.instance_id}`}
                      secondary={`Current Step: ${request.current_step_details?.name || 'Processing'}`}
                    />
                    <IconButton
                      onClick={() => setViewRequestDialog({ open: true, request })}
                    >
                      <ViewIcon />
                    </IconButton>
                  </ListItem>
                ))
              )}
            </List>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderLeaveRequestsTab = () => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h6">My Leave Requests</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setLeaveDialog({ open: true, type: 'leave' })}
          sx={{ background: 'linear-gradient(45deg, #2196F3 30%, #1976D2 90%)' }}
        >
          New Leave Request
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Request ID</TableCell>
              <TableCell>Leave Type</TableCell>
              <TableCell>Start Date</TableCell>
              <TableCell>End Date</TableCell>
              <TableCell>Days</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Current Step</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {/* Leave Requests */}
            {employeeData.recentActivity.map((request) => (
              <TableRow key={request.id}>
                <TableCell>{request.instance_id}</TableCell>
                <TableCell>Leave Request</TableCell>
                <TableCell>-</TableCell>
                <TableCell>-</TableCell>
                <TableCell>-</TableCell>
                <TableCell>
                  <Chip
                    label={request.status.toUpperCase()}
                    color={
                      request.status === 'approved' ? 'success' :
                      request.status === 'rejected' ? 'error' :
                      request.status === 'in_progress' ? 'warning' : 'default'
                    }
                    size="small"
                  />
                </TableCell>
                <TableCell>{request.current_step_details?.name || 'Completed'}</TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => setViewRequestDialog({ open: true, request })}
                  >
                    <ViewIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            
            {/* Procurement Requests */}
            {procurementRequests.map((request) => (
              <TableRow key={`proc-${request.id}`}>
                <TableCell>PR-{request.id}</TableCell>
                <TableCell>Procurement Request</TableCell>
                <TableCell>{request.title}</TableCell>
                <TableCell>{request.item}</TableCell>
                <TableCell>{request.quantity}</TableCell>
                <TableCell>
                  <Chip
                    label={request.status.toUpperCase()}
                    color={
                      request.status === 'completed' ? 'success' :
                      request.status === 'rejected' ? 'error' :
                      request.status === 'pending' || request.status === 'in_progress' ? 'warning' : 'default'
                    }
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2">
                      {request.current_stage?.replace('_', ' ').toUpperCase()}
                    </Typography>
                    {request.current_approver_name && (
                      <Typography variant="caption" color="textSecondary">
                        Pending: {request.current_approver_name}
                      </Typography>
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => handleViewProcurementRequest(request)}
                  >
                    <ViewIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            
            {employeeData.recentActivity.length === 0 && procurementRequests.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography color="textSecondary">
                    No requests found
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  const handleProfileUpdate = async (updatedUser) => {
    console.log('EmployeeDashboard handleProfileUpdate called with:', updatedUser);
    console.log('Profile picture URL in updatedUser:', updatedUser?.profile_picture_url);
    
    // Update the employee data state immediately
    setEmployeeData(prev => {
      const newData = {
        ...prev,
        profile: updatedUser
      };
      console.log('Updated employeeData:', newData);
      console.log('Profile picture URL in new data:', newData.profile?.profile_picture_url);
      return newData;
    });
    
    // Note: setUser is not available in this component scope
    // The employeeData state update above should be sufficient
    
    // Also reload the profile data from the server to ensure we have the latest data
    try {
      const profileRes = await api.get('/users/me/');
      console.log('Reloaded profile data from server:', profileRes.data);
      console.log('Server profile picture URL:', profileRes.data.profile_picture_url);
      
      setEmployeeData(prev => ({
        ...prev,
        profile: profileRes.data
      }));
      
      // Note: setUser is not available in this component scope
      // The employeeData state update above should be sufficient
    } catch (error) {
      console.error('Failed to reload profile data:', error);
    }
    
    setSuccess('Profile updated successfully!');
    setTimeout(() => setSuccess(''), 3000);
  };

  const renderProfileTab = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <Avatar
              src={getProfilePictureUrl(employeeData.profile.profile_picture_url)}
              sx={{ 
                width: 120, 
                height: 120, 
                mx: 'auto', 
                mb: 2,
                border: '4px solid',
                borderColor: 'primary.main'
              }}
              onError={(e) => {
                console.log('Avatar image failed to load:', e.target.src);
                console.log('Current profile_picture_url:', employeeData.profile.profile_picture_url);
                console.log('Constructed URL:', e.target.src);
              }}
            >
              {!employeeData.profile.profile_picture_url && (
                <PersonIcon sx={{ fontSize: 60 }} />
              )}
            </Avatar>
            <Typography variant="h6" gutterBottom>
              {`${employeeData.profile.first_name || ''} ${employeeData.profile.last_name || ''}`}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {employeeData.profile.role || 'Employee'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {employeeData.profile.department?.name || 'No Department'}
            </Typography>
            {employeeData.profile.bio && (
              <Typography variant="body2" sx={{ mb: 2, fontStyle: 'italic' }}>
                "{employeeData.profile.bio}"
              </Typography>
            )}
            <Button
              variant="contained"
              startIcon={<ProfileIcon />}
              onClick={() => setProfileEditDialog(true)}
              fullWidth
            >
              Edit Profile
            </Button>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} md={8}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Contact Information
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon><PersonIcon /></ListItemIcon>
                    <ListItemText
                      primary="Full Name"
                      secondary={`${employeeData.profile.first_name || ''} ${employeeData.profile.last_name || ''}`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><EmailIcon /></ListItemIcon>
                    <ListItemText
                      primary="Email"
                      secondary={employeeData.profile.email || 'Not provided'}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><PhoneIcon /></ListItemIcon>
                    <ListItemText
                      primary="Phone"
                      secondary={employeeData.profile.phone || 'Not provided'}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><LocationOnIcon /></ListItemIcon>
                    <ListItemText
                      primary="Address"
                      secondary={employeeData.profile.address || 'Not provided'}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Work Information
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon><WorkIcon /></ListItemIcon>
                    <ListItemText
                      primary="Department"
                      secondary={employeeData.profile.department?.name || 'Not assigned'}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><BadgeIcon /></ListItemIcon>
                    <ListItemText
                      primary="Employee ID"
                      secondary={employeeData.profile.employee_id || 'Not assigned'}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CalendarTodayIcon /></ListItemIcon>
                    <ListItemText
                      primary="Hire Date"
                      secondary={employeeData.profile.hire_date || 'Not provided'}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CakeIcon /></ListItemIcon>
                    <ListItemText
                      primary="Date of Birth"
                      secondary={employeeData.profile.date_of_birth || 'Not provided'}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Emergency Contact
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon><ContactPhoneIcon /></ListItemIcon>
                    <ListItemText
                      primary="Contact Name"
                      secondary={employeeData.profile.emergency_contact_name || 'Not provided'}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><PhoneIcon /></ListItemIcon>
                    <ListItemText
                      primary="Contact Phone"
                      secondary={employeeData.profile.emergency_contact_phone || 'Not provided'}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <Typography>Loading employee dashboard...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, color: '#2196F3' }}>
        Employee Dashboard
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ width: '100%', mt: 2 }}>
        <StyledTabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
        >
          <StyledTab label="Overview" icon={<DashboardIcon />} />
          <StyledTab label="Leave Requests" icon={<LeaveIcon />} />
          <StyledTab label="Profile" icon={<ProfileIcon />} />
          <StyledTab label="Tasks" icon={<TaskIcon />} />
        </StyledTabs>

        <TabPanel value={activeTab} index={0}>
          {renderOverviewTab()}
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          {renderLeaveRequestsTab()}
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          {renderProfileTab()}
        </TabPanel>

        <TabPanel value={activeTab} index={3}>
          <Typography variant="h6" gutterBottom>
            My Tasks
          </Typography>
          <Typography color="textSecondary">
            Task management features will be available here.
          </Typography>
        </TabPanel>
      </Paper>

      {/* Leave Request Dialog */}
      <Dialog
        open={leaveDialog.open}
        onClose={() => setLeaveDialog({ open: false, type: '' })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Submit Leave Request</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Leave Type</InputLabel>
                <Select
                  value={leaveFormData.leave_type}
                  onChange={(e) => setLeaveFormData({ ...leaveFormData, leave_type: e.target.value })}
                >
                  <MenuItem value="annual">Annual Leave</MenuItem>
                  <MenuItem value="sick">Sick Leave</MenuItem>
                  <MenuItem value="personal">Personal Leave</MenuItem>
                  <MenuItem value="emergency">Emergency Leave</MenuItem>
                  <MenuItem value="maternity">Maternity Leave</MenuItem>
                  <MenuItem value="paternity">Paternity Leave</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Days Requested"
                value={leaveFormData.days_requested}
                onChange={(e) => setLeaveFormData({ ...leaveFormData, days_requested: parseInt(e.target.value) })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="date"
                label="Start Date"
                value={leaveFormData.start_date}
                onChange={(e) => setLeaveFormData({ ...leaveFormData, start_date: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="date"
                label="End Date"
                value={leaveFormData.end_date}
                onChange={(e) => setLeaveFormData({ ...leaveFormData, end_date: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Reason for Leave"
                value={leaveFormData.reason}
                onChange={(e) => setLeaveFormData({ ...leaveFormData, reason: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Emergency Contact"
                value={leaveFormData.emergency_contact}
                onChange={(e) => setLeaveFormData({ ...leaveFormData, emergency_contact: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Handover Notes"
                value={leaveFormData.handover_notes}
                onChange={(e) => setLeaveFormData({ ...leaveFormData, handover_notes: e.target.value })}
                helperText="Brief notes about work handover during your absence"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLeaveDialog({ open: false, type: '' })}>
            Cancel
          </Button>
          <Button
            onClick={handleLeaveRequestSubmit}
            variant="contained"
            disabled={!leaveFormData.leave_type || !leaveFormData.start_date || !leaveFormData.end_date}
          >
            Submit Request
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Request Dialog */}
      <Dialog
        open={viewRequestDialog.open}
        onClose={() => setViewRequestDialog({ open: false, request: null })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Request Details</DialogTitle>
        <DialogContent>
          {viewRequestDialog.request && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="subtitle2">Request ID</Typography>
              <Typography variant="body2" gutterBottom>
                {viewRequestDialog.request.instance_id}
              </Typography>
              
              <Typography variant="subtitle2">Status</Typography>
              <Chip
                label={viewRequestDialog.request.status.toUpperCase()}
                color={
                  viewRequestDialog.request.status === 'approved' ? 'success' :
                  viewRequestDialog.request.status === 'rejected' ? 'error' :
                  viewRequestDialog.request.status === 'in_progress' ? 'warning' : 'default'
                }
                size="small"
                sx={{ mb: 2 }}
              />
              
              <Typography variant="subtitle2">Current Step</Typography>
              <Typography variant="body2" gutterBottom>
                {viewRequestDialog.request.current_step_details?.name || 'Completed'}
              </Typography>
              
              <Typography variant="subtitle2">Submitted</Typography>
              <Typography variant="body2">
                {new Date(viewRequestDialog.request.created_at).toLocaleDateString()}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewRequestDialog({ open: false, request: null })}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Procurement Request Dialog */}
      <ProcurementRequestDialog
        open={procurementDialog.open}
        onClose={handleCloseProcurementDialog}
        onSubmit={handleProcurementRequestSubmit}
        editData={procurementDialog.editData}
      />

      {/* Profile Edit Dialog */}
      <ProfileEditDialog
        open={profileEditDialog}
        onClose={() => setProfileEditDialog(false)}
        user={employeeData.profile}
        onProfileUpdate={handleProfileUpdate}
      />
    </Box>
  );
};

export default EmployeeDashboard;

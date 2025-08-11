import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Paper, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Chip, IconButton, Tabs, Tab, Alert, CircularProgress, Snackbar,
  FormControl, InputLabel, Select, Tooltip, Badge, Divider
} from '@mui/material';
import {
  Edit as EditIcon, Add as AddIcon, Refresh as RefreshIcon, 
  TrendingUp as TrendingUpIcon, People as PeopleIcon, 
  CalendarToday as CalendarIcon, Warning as WarningIcon,
  CheckCircle as CheckCircleIcon, Schedule as ScheduleIcon,
  AccessTime as AccessTimeIcon, Visibility as VisibilityIcon
} from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
         ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import api from '../api';

const LeaveManagement = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  
  // Data states
  const [leaveBalances, setLeaveBalances] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({});
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  
  // Dialog states
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [bulkCreateDialogOpen, setBulkCreateDialogOpen] = useState(false);
  const [requestDetailsDialog, setRequestDetailsDialog] = useState(false);
  const [selectedBalance, setSelectedBalance] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  
  // Form states
  const [editForm, setEditForm] = useState({
    adjustment_type: 'set',
    field: 'total_days',
    days: 0,
    reason: ''
  });
  const [bulkCreateForm, setBulkCreateForm] = useState({
    year: new Date().getFullYear(),
    leave_types: [
      { leave_type: 'annual', total_days: 21 },
      { leave_type: 'sick', total_days: 10 },
      { leave_type: 'compassionate', total_days: 3 }
    ]
  });

  // Load all data
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      console.log('🔄 Loading leave management data...');
      
      const [balancesRes, requestsRes, statsRes, employeesRes, departmentsRes] = await Promise.allSettled([
        api.get('/hr/leave-balances/'),
        api.get('/hr/leave-requests/'),
        api.get('/hr/leave-dashboard-stats/'),
        api.get('/hr/employees/'),
        api.get('/hr/departments/')
      ]);

      // Handle each response individually with detailed logging
      if (balancesRes.status === 'fulfilled') {
        setLeaveBalances(balancesRes.value.data || []);
        console.log('✅ Leave balances loaded:', balancesRes.value.data?.length || 0, 'records');
      } else {
        console.error('❌ Failed to load leave balances:', balancesRes.reason);
        setLeaveBalances([]);
      }

      if (requestsRes.status === 'fulfilled') {
        setLeaveRequests(requestsRes.value.data || []);
        console.log('✅ Leave requests loaded:', requestsRes.value.data?.length || 0, 'records');
      } else {
        console.error('❌ Failed to load leave requests:', requestsRes.reason);
        setLeaveRequests([]);
      }

      if (statsRes.status === 'fulfilled') {
        setDashboardStats(statsRes.value.data || {});
        console.log('✅ Dashboard stats loaded:', Object.keys(statsRes.value.data || {}).length, 'stats');
      } else {
        console.error('❌ Failed to load dashboard stats:', statsRes.reason);
        setDashboardStats({});
      }

      if (employeesRes.status === 'fulfilled') {
        setEmployees(employeesRes.value.data || []);
        console.log('✅ Employees loaded:', employeesRes.value.data?.length || 0, 'records');
      } else {
        console.error('❌ Failed to load employees:', employeesRes.reason);
        setEmployees([]);
      }

      if (departmentsRes.status === 'fulfilled') {
        setDepartments(departmentsRes.value.data || []);
        console.log('✅ Departments loaded:', departmentsRes.value.data?.length || 0, 'records');
      } else {
        console.error('❌ Failed to load departments:', departmentsRes.reason);
        setDepartments([]);
      }

      // Check if any critical endpoints failed
      const failedEndpoints = [];
      if (balancesRes.status === 'rejected') failedEndpoints.push('Leave Balances');
      if (requestsRes.status === 'rejected') failedEndpoints.push('Leave Requests');
      if (statsRes.status === 'rejected') failedEndpoints.push('Dashboard Stats');
      if (employeesRes.status === 'rejected') failedEndpoints.push('Employees');
      if (departmentsRes.status === 'rejected') failedEndpoints.push('Departments');

      if (failedEndpoints.length > 0) {
        const errorMessage = `Some data failed to load: ${failedEndpoints.join(', ')}. Please check the console for details.`;
        setError(errorMessage);
        console.warn('⚠️ Partial data loading - failed endpoints:', failedEndpoints);
      } else {
        setError(null);
        console.log('🎉 All leave management data loaded successfully');
      }

    } catch (err) {
      console.error('💥 Critical error loading leave management data:', err);
      setError(`Critical error loading data: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRequest = async (requestId) => {
    try {
      await api.post(`/hr/leave-requests/${requestId}/approve/`);
      setSuccess('Leave request approved successfully');
      loadAllData(); // Refresh all data to show updated balances
    } catch (err) {
      setError('Failed to approve leave request');
    }
  };

  const handleDeclineRequest = async (requestId) => {
    try {
      await api.post(`/hr/leave-requests/${requestId}/decline/`);
      setSuccess('Leave request declined successfully');
      loadAllData(); // Refresh all data to show updated balances
    } catch (err) {
      setError('Failed to decline leave request');
    }
  };

  const handleEditBalance = async () => {
    try {
      const payload = {
        adjustment_type: editForm.adjustment_type,
        field: editForm.field,
        days: parseInt(editForm.days),
        reason: editForm.reason
      };

      await api.patch(`/hr/leave-balances/${selectedBalance.id}/`, payload);
      setSuccess('Leave balance updated successfully');
      setEditDialogOpen(false);
      loadAllData(); // Refresh data
    } catch (err) {
      setError('Failed to update leave balance');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'success';
      case 'declined': return 'error';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const calculateWorkingDays = (startDate, endDate) => {
    if (!startDate || !endDate) return 0;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    let workingDays = 0;
    const currentDate = new Date(start);
    
    while (currentDate <= end) {
      const dayOfWeek = currentDate.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        workingDays++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return workingDays;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CalendarIcon color="primary" />
          Leave Management Dashboard
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadAllData}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setBulkCreateDialogOpen(true)}
          >
            Bulk Create Balances
          </Button>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Dashboard Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#e3f2fd' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" color="primary">
                    {dashboardStats.total_employees || employees.length}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Total Employees
                  </Typography>
                </Box>
                <PeopleIcon sx={{ fontSize: 40, color: 'primary.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#fff3e0' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" color="warning.main">
                    {leaveRequests.filter(req => req.status === 'pending').length}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Pending Requests
                  </Typography>
                </Box>
                <ScheduleIcon sx={{ fontSize: 40, color: 'warning.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#e8f5e8' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" color="success.main">
                    {leaveRequests.filter(req => req.status === 'approved').length}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Approved This Month
                  </Typography>
                </Box>
                <CheckCircleIcon sx={{ fontSize: 40, color: 'success.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#fce4ec' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" color="error.main">
                    {leaveBalances.filter(balance => balance.available_days < 5).length}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Low Balance Alerts
                  </Typography>
                </Box>
                <WarningIcon sx={{ fontSize: 40, color: 'error.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="Leave Balances" />
          <Tab label="Leave Requests" />
          <Tab label="Analytics" />
        </Tabs>
      </Box>

      {/* Tab Content */}
      {tabValue === 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Employee Leave Balances
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Employee</TableCell>
                    <TableCell>Department</TableCell>
                    <TableCell>Leave Type</TableCell>
                    <TableCell>Total Days</TableCell>
                    <TableCell>Used Days</TableCell>
                    <TableCell>Pending Days</TableCell>
                    <TableCell>Available Days</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {leaveBalances.map((balance) => (
                    <TableRow key={balance.id}>
                      <TableCell>{balance.employee_name}</TableCell>
                      <TableCell>{balance.department_name}</TableCell>
                      <TableCell>
                        <Chip 
                          label={balance.leave_type} 
                          size="small" 
                          color={balance.leave_type === 'annual' ? 'primary' : 'default'}
                        />
                      </TableCell>
                      <TableCell>{balance.total_days}</TableCell>
                      <TableCell>{balance.used_days}</TableCell>
                      <TableCell>{balance.pending_days}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography 
                            color={balance.available_days < 5 ? 'error' : 'success'}
                            fontWeight="bold"
                          >
                            {balance.available_days}
                          </Typography>
                          {balance.available_days < 5 && (
                            <WarningIcon color="error" fontSize="small" />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedBalance(balance);
                            setEditDialogOpen(true);
                          }}
                        >
                          <EditIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {tabValue === 1 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Leave Requests Management
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Employee</TableCell>
                    <TableCell>Leave Type</TableCell>
                    <TableCell>Dates</TableCell>
                    <TableCell>Calculated Days</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Approval Stage</TableCell>
                    <TableCell>Requested Date</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {leaveRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>{request.employee_name}</TableCell>
                      <TableCell>
                        <Chip 
                          label={request.leave_type} 
                          size="small" 
                          color={request.leave_type === 'annual' ? 'primary' : 'default'}
                        />
                      </TableCell>
                      <TableCell>
                        {formatDate(request.start_date)} - {formatDate(request.end_date)}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <AccessTimeIcon fontSize="small" color="primary" />
                          <Typography fontWeight="bold" color="primary">
                            {request.calculated_days || calculateWorkingDays(request.start_date, request.end_date)} days
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={request.status} 
                          color={getStatusColor(request.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{request.approval_stage}</TableCell>
                      <TableCell>{formatDate(request.requested_at)}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedRequest(request);
                              setRequestDetailsDialog(true);
                            }}
                          >
                            <VisibilityIcon />
                          </IconButton>
                          {request.status === 'pending' && (
                            <>
                              <Button
                                size="small"
                                variant="contained"
                                color="success"
                                onClick={() => handleApproveRequest(request.id)}
                              >
                                Approve
                              </Button>
                              <Button
                                size="small"
                                variant="outlined"
                                color="error"
                                onClick={() => handleDeclineRequest(request.id)}
                              >
                                Decline
                              </Button>
                            </>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Request Details Dialog */}
      <Dialog 
        open={requestDetailsDialog} 
        onClose={() => setRequestDetailsDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Leave Request Details</DialogTitle>
        <DialogContent>
          {selectedRequest && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary">Employee</Typography>
                <Typography variant="body1" gutterBottom>{selectedRequest.employee_name}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary">Leave Type</Typography>
                <Chip label={selectedRequest.leave_type} color="primary" size="small" />
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary">Start Date</Typography>
                <Typography variant="body1" gutterBottom>{formatDate(selectedRequest.start_date)}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary">End Date</Typography>
                <Typography variant="body1" gutterBottom>{formatDate(selectedRequest.end_date)}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary">Calculated Working Days</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AccessTimeIcon color="primary" />
                  <Typography variant="h6" color="primary">
                    {selectedRequest.calculated_days || calculateWorkingDays(selectedRequest.start_date, selectedRequest.end_date)} days
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary">Status</Typography>
                <Chip 
                  label={selectedRequest.status} 
                  color={getStatusColor(selectedRequest.status)}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="textSecondary">Reason</Typography>
                <Typography variant="body1">{selectedRequest.reason}</Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRequestDetailsDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Success/Error Snackbar */}
      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={() => setSuccess(null)}
      >
        <Alert severity="success" onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default LeaveManagement;

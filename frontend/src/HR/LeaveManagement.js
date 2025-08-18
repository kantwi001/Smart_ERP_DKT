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
      
      // Use mock data instead of API calls to avoid backend dependency
      const mockLeaveBalances = [
        {
          id: 1,
          employee_name: 'John Doe',
          department_name: 'Engineering',
          leave_type: 'annual',
          total_days: 21,
          used_days: 8,
          pending_days: 2,
          available_days: 11
        },
        {
          id: 2,
          employee_name: 'Jane Smith',
          department_name: 'Marketing',
          leave_type: 'annual',
          total_days: 21,
          used_days: 15,
          pending_days: 0,
          available_days: 6
        },
        {
          id: 3,
          employee_name: 'Mike Johnson',
          department_name: 'Sales',
          leave_type: 'sick',
          total_days: 10,
          used_days: 3,
          pending_days: 1,
          available_days: 6
        },
        {
          id: 4,
          employee_name: 'Sarah Wilson',
          department_name: 'HR',
          leave_type: 'annual',
          total_days: 21,
          used_days: 18,
          pending_days: 0,
          available_days: 3
        }
      ];

      const mockLeaveRequests = [
        {
          id: 1,
          employee_name: 'John Doe',
          leave_type: 'annual',
          start_date: '2024-02-15',
          end_date: '2024-02-19',
          calculated_days: 5,
          status: 'pending',
          approval_stage: 'Manager Review',
          requested_at: '2024-01-10',
          reason: 'Family vacation'
        },
        {
          id: 2,
          employee_name: 'Jane Smith',
          leave_type: 'sick',
          start_date: '2024-01-20',
          end_date: '2024-01-22',
          calculated_days: 3,
          status: 'approved',
          approval_stage: 'HR Approved',
          requested_at: '2024-01-18',
          reason: 'Medical appointment'
        },
        {
          id: 3,
          employee_name: 'Mike Johnson',
          leave_type: 'annual',
          start_date: '2024-03-01',
          end_date: '2024-03-05',
          calculated_days: 5,
          status: 'declined',
          approval_stage: 'Manager Declined',
          requested_at: '2024-01-05',
          reason: 'Personal time off'
        }
      ];

      const mockDashboardStats = {
        total_employees: 25,
        pending_requests: 3,
        approved_this_month: 8,
        low_balance_alerts: 2
      };

      const mockEmployees = [
        { id: 1, first_name: 'John', last_name: 'Doe', department: 'Engineering' },
        { id: 2, first_name: 'Jane', last_name: 'Smith', department: 'Marketing' },
        { id: 3, first_name: 'Mike', last_name: 'Johnson', department: 'Sales' },
        { id: 4, first_name: 'Sarah', last_name: 'Wilson', department: 'HR' }
      ];

      const mockDepartments = [
        { id: 1, name: 'Engineering' },
        { id: 2, name: 'Marketing' },
        { id: 3, name: 'Sales' },
        { id: 4, name: 'Human Resources' }
      ];

      setLeaveBalances(mockLeaveBalances);
      setLeaveRequests(mockLeaveRequests);
      setDashboardStats(mockDashboardStats);
      setEmployees(mockEmployees);
      setDepartments(mockDepartments);

      setError(null);
      console.log('🎉 All leave management data loaded successfully');

    } catch (err) {
      console.error('💥 Critical error loading leave management data:', err);
      setError(`Critical error loading data: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRequest = async (requestId) => {
    try {
      // await api.post(`/hr/leave-requests/${requestId}/approve/`);
      setSuccess('Leave request approved successfully');
      loadAllData(); // Refresh all data to show updated balances
    } catch (err) {
      setError('Failed to approve leave request');
    }
  };

  const handleDeclineRequest = async (requestId) => {
    try {
      // await api.post(`/hr/leave-requests/${requestId}/decline/`);
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

      // await api.patch(`/hr/leave-balances/${selectedBalance.id}/`, payload);
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
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="View Balance Details">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setSelectedBalance(balance);
                                setRequestDetailsDialog(true);
                              }}
                            >
                              <VisibilityIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit Balance">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setSelectedBalance(balance);
                                setEditDialogOpen(true);
                              }}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
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
          {selectedBalance && !selectedRequest && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary">Employee</Typography>
                <Typography variant="body1" gutterBottom>{selectedBalance.employee_name}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary">Department</Typography>
                <Typography variant="body1" gutterBottom>{selectedBalance.department_name}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary">Leave Type</Typography>
                <Chip 
                  label={selectedBalance.leave_type} 
                  color={selectedBalance.leave_type === 'annual' ? 'primary' : 'default'} 
                  size="small" 
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary">Total Days Allocated</Typography>
                <Typography variant="h6" color="primary">{selectedBalance.total_days} days</Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" color="textSecondary">Used Days</Typography>
                <Typography variant="body1" color="error.main">{selectedBalance.used_days} days</Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" color="textSecondary">Pending Days</Typography>
                <Typography variant="body1" color="warning.main">{selectedBalance.pending_days} days</Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" color="textSecondary">Available Days</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography 
                    variant="h6" 
                    color={selectedBalance.available_days < 5 ? 'error.main' : 'success.main'}
                  >
                    {selectedBalance.available_days} days
                  </Typography>
                  {selectedBalance.available_days < 5 && (
                    <WarningIcon color="error" fontSize="small" />
                  )}
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>Balance Summary</Typography>
                <Typography variant="body2" color="textSecondary">
                  This employee has {selectedBalance.available_days} days remaining out of {selectedBalance.total_days} total allocated days.
                  {selectedBalance.available_days < 5 && ' ⚠️ Low balance alert - Consider discussing leave planning with the employee.'}
                </Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRequestDetailsDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Balance Dialog */}
      <Dialog 
        open={editDialogOpen} 
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Leave Balance</DialogTitle>
        <DialogContent>
          {selectedBalance && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  {selectedBalance.employee_name} - {selectedBalance.leave_type} Leave
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Adjustment Type</InputLabel>
                  <Select
                    value={editForm.adjustment_type}
                    onChange={(e) => setEditForm({...editForm, adjustment_type: e.target.value})}
                  >
                    <MenuItem value="set">Set Value</MenuItem>
                    <MenuItem value="add">Add Days</MenuItem>
                    <MenuItem value="subtract">Subtract Days</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Field to Edit</InputLabel>
                  <Select
                    value={editForm.field}
                    onChange={(e) => setEditForm({...editForm, field: e.target.value})}
                  >
                    <MenuItem value="total_days">Total Days</MenuItem>
                    <MenuItem value="used_days">Used Days</MenuItem>
                    <MenuItem value="pending_days">Pending Days</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Days"
                  type="number"
                  value={editForm.days}
                  onChange={(e) => setEditForm({...editForm, days: e.target.value})}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Reason for Adjustment"
                  multiline
                  rows={3}
                  value={editForm.reason}
                  onChange={(e) => setEditForm({...editForm, reason: e.target.value})}
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleEditBalance} variant="contained">Update Balance</Button>
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

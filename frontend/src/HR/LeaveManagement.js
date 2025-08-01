import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Paper, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Chip, IconButton, Tabs, Tab, Alert, CircularProgress, Snackbar,
  FormControl, InputLabel, Select, Tooltip, Badge
} from '@mui/material';
import {
  Edit as EditIcon, Add as AddIcon, Refresh as RefreshIcon, 
  TrendingUp as TrendingUpIcon, People as PeopleIcon, 
  CalendarToday as CalendarIcon, Warning as WarningIcon,
  CheckCircle as CheckCircleIcon, Schedule as ScheduleIcon
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
  const [dashboardStats, setDashboardStats] = useState({});
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  
  // Dialog states
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [bulkCreateDialogOpen, setBulkCreateDialogOpen] = useState(false);
  const [selectedBalance, setSelectedBalance] = useState(null);
  
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

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF7300'];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [balancesRes, statsRes, employeesRes, departmentsRes] = await Promise.all([
        api.get('/hr/leave-balances/'),
        api.get('/hr/leave-balances/dashboard_stats/'),
        api.get('/hr/employees/'),
        api.get('/hr/departments/')
      ]);

      setLeaveBalances(balancesRes.data.results || balancesRes.data);
      setDashboardStats(statsRes.data);
      setEmployees(employeesRes.data.results || employeesRes.data);
      setDepartments(departmentsRes.data.results || departmentsRes.data);
    } catch (err) {
      setError('Failed to load leave management data');
      console.error('Error loading leave management data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditBalance = (balance) => {
    setSelectedBalance(balance);
    setEditForm({
      adjustment_type: 'set',
      field: 'total_days',
      days: balance.total_days,
      reason: ''
    });
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    try {
      await api.post(`/hr/leave-balances/${selectedBalance.id}/adjust_balance/`, editForm);
      setSuccess('Leave balance updated successfully');
      setEditDialogOpen(false);
      loadData();
    } catch (err) {
      setError('Failed to update leave balance');
      console.error('Error updating leave balance:', err);
    }
  };

  const handleBulkCreate = async () => {
    try {
      const response = await api.post('/hr/leave-balances/bulk_create_balances/', bulkCreateForm);
      setSuccess(response.data.message);
      setBulkCreateDialogOpen(false);
      loadData();
    } catch (err) {
      setError('Failed to create leave balances');
      console.error('Error creating leave balances:', err);
    }
  };

  const getStatusColor = (balance) => {
    const utilization = balance.utilization_percentage;
    if (utilization >= 80) return 'error';
    if (utilization >= 60) return 'warning';
    return 'success';
  };

  const getAvailabilityColor = (availableDays) => {
    if (availableDays <= 0) return 'error';
    if (availableDays <= 5) return 'warning';
    return 'success';
  };

  const renderDashboardStats = () => (
    <Grid container spacing={3} sx={{ mb: 3 }}>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center">
              <PeopleIcon color="primary" sx={{ mr: 2, fontSize: 40 }} />
              <Box>
                <Typography variant="h4" color="primary">
                  {dashboardStats.total_employees || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Employees
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center">
              <CalendarIcon color="success" sx={{ mr: 2, fontSize: 40 }} />
              <Box>
                <Typography variant="h4" color="success.main">
                  {dashboardStats.total_allocated_days || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Allocated Days
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center">
              <CheckCircleIcon color="info" sx={{ mr: 2, fontSize: 40 }} />
              <Box>
                <Typography variant="h4" color="info.main">
                  {dashboardStats.total_used_days || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Days Used
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center">
              <ScheduleIcon color="warning" sx={{ mr: 2, fontSize: 40 }} />
              <Box>
                <Typography variant="h4" color="warning.main">
                  {dashboardStats.total_pending_days || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Pending Days
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderAnalytics = () => (
    <Grid container spacing={3} sx={{ mb: 3 }}>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Leave Type Distribution</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={dashboardStats.leave_type_breakdown || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ display_name, total_allocated }) => `${display_name}: ${total_allocated}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="total_allocated"
                >
                  {(dashboardStats.leave_type_breakdown || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Department Leave Usage</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dashboardStats.department_breakdown || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="department" />
                <YAxis />
                <RechartsTooltip />
                <Bar dataKey="total_used" fill="#8884d8" />
                <Bar dataKey="total_allocated" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderLeaveBalanceTable = () => (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="between" alignItems="center" mb={2}>
          <Typography variant="h6">Employee Leave Balances</Typography>
          <Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setBulkCreateDialogOpen(true)}
              sx={{ mr: 1 }}
            >
              Bulk Create
            </Button>
            <IconButton onClick={loadData}>
              <RefreshIcon />
            </IconButton>
          </Box>
        </Box>
        
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Employee</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Leave Type</TableCell>
                <TableCell>Year</TableCell>
                <TableCell>Total Days</TableCell>
                <TableCell>Used Days</TableCell>
                <TableCell>Pending Days</TableCell>
                <TableCell>Available Days</TableCell>
                <TableCell>Utilization</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {leaveBalances.map((balance) => (
                <TableRow key={balance.id}>
                  <TableCell>{balance.employee_name}</TableCell>
                  <TableCell>{balance.department_name || 'N/A'}</TableCell>
                  <TableCell>
                    <Chip 
                      label={balance.leave_type_display} 
                      size="small" 
                      color="primary" 
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>{balance.year}</TableCell>
                  <TableCell>{balance.total_days}</TableCell>
                  <TableCell>{balance.used_days}</TableCell>
                  <TableCell>
                    {balance.pending_days > 0 && (
                      <Badge badgeContent={balance.pending_days} color="warning">
                        <Typography variant="body2">{balance.pending_days}</Typography>
                      </Badge>
                    )}
                    {balance.pending_days === 0 && balance.pending_days}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={balance.available_days}
                      size="small"
                      color={getAvailabilityColor(balance.available_days)}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={`${balance.utilization_percentage}%`}
                      size="small"
                      color={getStatusColor(balance)}
                    />
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Edit Balance">
                      <IconButton 
                        size="small" 
                        onClick={() => handleEditBalance(balance)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Leave Management Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom>
        Manage and edit employee leave balances. This dashboard is for HR management only.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ mb: 3 }}>
        <Tab label="Overview" />
        <Tab label="Analytics" />
        <Tab label="Employee Balances" />
      </Tabs>

      {tabValue === 0 && (
        <Box>
          {renderDashboardStats()}
          {renderLeaveBalanceTable()}
        </Box>
      )}

      {tabValue === 1 && (
        <Box>
          {renderDashboardStats()}
          {renderAnalytics()}
        </Box>
      )}

      {tabValue === 2 && renderLeaveBalanceTable()}

      {/* Edit Balance Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Leave Balance</DialogTitle>
        <DialogContent>
          {selectedBalance && (
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                {selectedBalance.employee_name} - {selectedBalance.leave_type_display} ({selectedBalance.year})
              </Typography>
              
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Field to Edit</InputLabel>
                    <Select
                      value={editForm.field}
                      onChange={(e) => setEditForm({...editForm, field: e.target.value})}
                    >
                      <MenuItem value="total_days">Total Days</MenuItem>
                      <MenuItem value="used_days">Used Days</MenuItem>
                      <MenuItem value="carry_over_days">Carry Over Days</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Action</InputLabel>
                    <Select
                      value={editForm.adjustment_type}
                      onChange={(e) => setEditForm({...editForm, adjustment_type: e.target.value})}
                    >
                      <MenuItem value="set">Set To</MenuItem>
                      <MenuItem value="add">Add</MenuItem>
                      <MenuItem value="subtract">Subtract</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Days"
                    type="number"
                    value={editForm.days}
                    onChange={(e) => setEditForm({...editForm, days: parseInt(e.target.value) || 0})}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Reason (Optional)"
                    multiline
                    rows={3}
                    value={editForm.reason}
                    onChange={(e) => setEditForm({...editForm, reason: e.target.value})}
                  />
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveEdit} variant="contained">Save Changes</Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Create Dialog */}
      <Dialog open={bulkCreateDialogOpen} onClose={() => setBulkCreateDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Bulk Create Leave Balances</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Create leave balances for all active employees for the specified year.
          </Typography>
          
          <TextField
            fullWidth
            label="Year"
            type="number"
            value={bulkCreateForm.year}
            onChange={(e) => setBulkCreateForm({...bulkCreateForm, year: parseInt(e.target.value)})}
            sx={{ mt: 2, mb: 2 }}
          />
          
          <Typography variant="subtitle1" gutterBottom>
            Leave Types & Allocations:
          </Typography>
          
          {bulkCreateForm.leave_types.map((leaveType, index) => (
            <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Leave Type</InputLabel>
                  <Select
                    value={leaveType.leave_type}
                    onChange={(e) => {
                      const newLeaveTypes = [...bulkCreateForm.leave_types];
                      newLeaveTypes[index].leave_type = e.target.value;
                      setBulkCreateForm({...bulkCreateForm, leave_types: newLeaveTypes});
                    }}
                  >
                    <MenuItem value="annual">Annual Leave</MenuItem>
                    <MenuItem value="sick">Sick Leave</MenuItem>
                    <MenuItem value="maternity">Maternity Leave</MenuItem>
                    <MenuItem value="paternity">Paternity Leave</MenuItem>
                    <MenuItem value="compassionate">Compassionate Leave</MenuItem>
                    <MenuItem value="study">Study Leave</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label="Days"
                  type="number"
                  value={leaveType.total_days}
                  onChange={(e) => {
                    const newLeaveTypes = [...bulkCreateForm.leave_types];
                    newLeaveTypes[index].total_days = parseInt(e.target.value) || 0;
                    setBulkCreateForm({...bulkCreateForm, leave_types: newLeaveTypes});
                  }}
                />
              </Grid>
              <Grid item xs={2}>
                <Button
                  color="error"
                  onClick={() => {
                    const newLeaveTypes = bulkCreateForm.leave_types.filter((_, i) => i !== index);
                    setBulkCreateForm({...bulkCreateForm, leave_types: newLeaveTypes});
                  }}
                >
                  Remove
                </Button>
              </Grid>
            </Grid>
          ))}
          
          <Button
            onClick={() => {
              setBulkCreateForm({
                ...bulkCreateForm,
                leave_types: [...bulkCreateForm.leave_types, { leave_type: 'annual', total_days: 21 }]
              });
            }}
          >
            Add Leave Type
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkCreateDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleBulkCreate} variant="contained">Create Balances</Button>
        </DialogActions>
      </Dialog>

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

import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Alert,
  IconButton,
  Tooltip,
  Tab,
  Tabs,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material';
import {
  Add as AddIcon,
  PlayArrow as StartIcon,
  Check as CompleteIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Assignment as AssignmentIcon,
  Schedule as ScheduleIcon,
  Group as GroupIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import OnboardingService from '../services/OnboardingService';
import api from '../api';

const OnboardingDashboard = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [dashboardStats, setDashboardStats] = useState({});
  const [processes, setProcesses] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [mySteps, setMySteps] = useState([]);
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Dialog states
  const [createProcessOpen, setCreateProcessOpen] = useState(false);
  const [processForm, setProcessForm] = useState({
    new_employee: '',
    template: '',
    hr_coordinator: '',
    direct_supervisor: '',
    start_date: '',
    expected_completion_date: '',
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsRes, processesRes, templatesRes, usersRes, departmentsRes] = await Promise.all([
        OnboardingService.getDashboardStats(),
        OnboardingService.getProcesses(),
        OnboardingService.getTemplates(),
        api.get('/users/'),
        api.get('/hr/departments/')
      ]);

      setDashboardStats(statsRes);
      setProcesses(processesRes.results || processesRes);
      setTemplates(templatesRes.results || templatesRes);
      setMySteps(statsRes.my_assigned_steps || []);
      setUsers(usersRes.data.results || usersRes.data);
      setDepartments(departmentsRes.data.results || departmentsRes.data);
    } catch (err) {
      setError('Failed to load onboarding data');
      console.error('Error loading onboarding data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProcess = async () => {
    try {
      await OnboardingService.createProcess(processForm);
      setSuccess('Onboarding process created successfully');
      setCreateProcessOpen(false);
      setProcessForm({
        new_employee: '',
        template: '',
        hr_coordinator: '',
        direct_supervisor: '',
        start_date: '',
        expected_completion_date: '',
        notes: ''
      });
      loadData();
    } catch (err) {
      setError('Failed to create onboarding process');
      console.error('Error creating process:', err);
    }
  };

  const handleStartProcess = async (processId) => {
    try {
      await OnboardingService.startProcess(processId);
      setSuccess('Onboarding process started successfully');
      loadData();
    } catch (err) {
      setError('Failed to start onboarding process');
      console.error('Error starting process:', err);
    }
  };

  const handleCompleteProcess = async (processId) => {
    try {
      await OnboardingService.completeProcess(processId);
      setSuccess('Onboarding process completed successfully');
      loadData();
    } catch (err) {
      setError('Failed to complete onboarding process');
      console.error('Error completing process:', err);
    }
  };

  const handleCompleteStep = async (stepId) => {
    try {
      await OnboardingService.completeStep(stepId);
      setSuccess('Step completed successfully');
      loadData();
    } catch (err) {
      setError('Failed to complete step');
      console.error('Error completing step:', err);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in_progress': return 'primary';
      case 'pending': return 'warning';
      case 'overdue': return 'error';
      case 'on_hold': return 'secondary';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const StatsCards = () => (
    <Grid container spacing={3} sx={{ mb: 3 }}>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center">
              <GroupIcon color="primary" sx={{ mr: 2 }} />
              <Box>
                <Typography variant="h4">{dashboardStats.total_processes || 0}</Typography>
                <Typography color="textSecondary">Total Processes</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center">
              <TrendingUpIcon color="primary" sx={{ mr: 2 }} />
              <Box>
                <Typography variant="h4">{dashboardStats.active_processes || 0}</Typography>
                <Typography color="textSecondary">Active Processes</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center">
              <CompleteIcon color="success" sx={{ mr: 2 }} />
              <Box>
                <Typography variant="h4">{dashboardStats.completed_processes || 0}</Typography>
                <Typography color="textSecondary">Completed</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center">
              <ScheduleIcon color="error" sx={{ mr: 2 }} />
              <Box>
                <Typography variant="h4">{dashboardStats.overdue_processes || 0}</Typography>
                <Typography color="textSecondary">Overdue</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const ProcessesTable = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Employee</TableCell>
            <TableCell>Template</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Progress</TableCell>
            <TableCell>Start Date</TableCell>
            <TableCell>Due Date</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {processes.map((process) => (
            <TableRow key={process.id}>
              <TableCell>{process.new_employee_name}</TableCell>
              <TableCell>{process.template_name}</TableCell>
              <TableCell>
                <Chip
                  label={process.status.replace('_', ' ').toUpperCase()}
                  color={getStatusColor(process.status)}
                  size="small"
                />
              </TableCell>
              <TableCell>
                <Box display="flex" alignItems="center">
                  <LinearProgress
                    variant="determinate"
                    value={process.progress_percentage || 0}
                    sx={{ width: 100, mr: 1 }}
                  />
                  <Typography variant="body2">
                    {process.progress_percentage || 0}%
                  </Typography>
                </Box>
              </TableCell>
              <TableCell>{formatDate(process.start_date)}</TableCell>
              <TableCell>{formatDate(process.expected_completion_date)}</TableCell>
              <TableCell>
                {process.status === 'not_started' && (
                  <Tooltip title="Start Process">
                    <IconButton
                      size="small"
                      onClick={() => handleStartProcess(process.id)}
                      color="primary"
                    >
                      <StartIcon />
                    </IconButton>
                  </Tooltip>
                )}
                {process.status === 'in_progress' && (
                  <Tooltip title="Complete Process">
                    <IconButton
                      size="small"
                      onClick={() => handleCompleteProcess(process.id)}
                      color="success"
                    >
                      <CompleteIcon />
                    </IconButton>
                  </Tooltip>
                )}
                <Tooltip title="View Details">
                  <IconButton size="small" color="primary">
                    <ViewIcon />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const MyStepsList = () => (
    <List>
      {mySteps.map((step) => (
        <ListItem key={step.id} divider>
          <ListItemText
            primary={step.step_title}
            secondary={
              <Box>
                <Typography variant="body2" color="textSecondary">
                  {step.step_description}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Due: {formatDate(step.due_date)}
                </Typography>
              </Box>
            }
          />
          <ListItemSecondaryAction>
            <Chip
              label={step.status.replace('_', ' ').toUpperCase()}
              color={getStatusColor(step.status)}
              size="small"
            />
            {step.status === 'pending' && (
              <IconButton
                size="small"
                onClick={() => handleCompleteStep(step.id)}
                color="success"
                sx={{ ml: 1 }}
              >
                <CompleteIcon />
              </IconButton>
            )}
          </ListItemSecondaryAction>
        </ListItem>
      ))}
    </List>
  );

  if (loading) {
    return <Box p={3}><Typography>Loading onboarding data...</Typography></Box>;
  }

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Onboarding Dashboard</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateProcessOpen(true)}
        >
          New Onboarding Process
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <StatsCards />

      <Card>
        <CardContent>
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
            <Tab label="All Processes" />
            <Tab label="My Assigned Steps" />
            <Tab label="Templates" />
          </Tabs>

          <Box mt={2}>
            {activeTab === 0 && <ProcessesTable />}
            {activeTab === 1 && (
              <Box>
                <Typography variant="h6" gutterBottom>My Assigned Steps</Typography>
                {mySteps.length === 0 ? (
                  <Typography color="textSecondary">No steps assigned to you</Typography>
                ) : (
                  <MyStepsList />
                )}
              </Box>
            )}
            {activeTab === 2 && (
              <Box>
                <Typography variant="h6" gutterBottom>Onboarding Templates</Typography>
                <Grid container spacing={2}>
                  {templates.map((template) => (
                    <Grid item xs={12} md={6} key={template.id}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="h6">{template.name}</Typography>
                          <Typography color="textSecondary" gutterBottom>
                            {template.department_name || 'All Departments'}
                          </Typography>
                          <Typography variant="body2" paragraph>
                            {template.description}
                          </Typography>
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="caption">
                              {template.total_steps} steps • {template.estimated_duration}h estimated
                            </Typography>
                            <Button size="small" variant="outlined">
                              View Details
                            </Button>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Create Process Dialog */}
      <Dialog open={createProcessOpen} onClose={() => setCreateProcessOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create New Onboarding Process</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>New Employee</InputLabel>
                <Select
                  value={processForm.new_employee}
                  onChange={(e) => setProcessForm({...processForm, new_employee: e.target.value})}
                >
                  {users.map((user) => (
                    <MenuItem key={user.id} value={user.id}>
                      {user.first_name} {user.last_name} ({user.username})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Onboarding Template</InputLabel>
                <Select
                  value={processForm.template}
                  onChange={(e) => setProcessForm({...processForm, template: e.target.value})}
                >
                  {templates.map((template) => (
                    <MenuItem key={template.id} value={template.id}>
                      {template.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>HR Coordinator</InputLabel>
                <Select
                  value={processForm.hr_coordinator}
                  onChange={(e) => setProcessForm({...processForm, hr_coordinator: e.target.value})}
                >
                  {users.map((user) => (
                    <MenuItem key={user.id} value={user.id}>
                      {user.first_name} {user.last_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Direct Supervisor</InputLabel>
                <Select
                  value={processForm.direct_supervisor}
                  onChange={(e) => setProcessForm({...processForm, direct_supervisor: e.target.value})}
                >
                  {users.map((user) => (
                    <MenuItem key={user.id} value={user.id}>
                      {user.first_name} {user.last_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Start Date"
                type="date"
                value={processForm.start_date}
                onChange={(e) => setProcessForm({...processForm, start_date: e.target.value})}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Expected Completion Date"
                type="date"
                value={processForm.expected_completion_date}
                onChange={(e) => setProcessForm({...processForm, expected_completion_date: e.target.value})}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={3}
                value={processForm.notes}
                onChange={(e) => setProcessForm({...processForm, notes: e.target.value})}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateProcessOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateProcess} variant="contained">Create Process</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OnboardingDashboard;

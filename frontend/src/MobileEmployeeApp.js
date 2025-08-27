import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
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
  IconButton,
  Alert,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Badge,
  Snackbar,
  AppBar,
  Toolbar,
  Container,
  Fab,
  SwipeableDrawer
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  CalendarToday as LeaveIcon,
  Assignment as TaskIcon,
  Person as ProfileIcon,
  Notifications as NotificationIcon,
  School as TrainingIcon,
  AttachMoney as PayslipIcon,
  Business as ProcurementIcon,
  Add as AddIcon,
  Menu as MenuIcon,
  Close as CloseIcon,
  CheckCircle as CheckIcon,
  Schedule as PendingIcon,
  Cancel as CancelIcon,
  MonetizationOn as MonetizationOnIcon
} from '@mui/icons-material';
import { AuthContext } from './AuthContext';
import NetworkStatusIndicator from './components/NetworkStatusIndicator';
import api from './api';
import {
  LeaveRequestForm,
  ProfileEditForm,
  ProcurementRequestForm,
  TasksListView,
  PayslipsView,
  TrainingView
} from './components/MobileEmployeeForms';

// Styled components for mobile-first design
const MobileCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
  margin: theme.spacing(1),
  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  '&:active': {
    transform: 'scale(0.98)',
    boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
  }
}));

const ModuleCard = styled(MobileCard)(({ theme, color }) => ({
  background: `linear-gradient(135deg, ${color}15 0%, ${color}25 100%)`,
  border: `2px solid ${color}30`,
  '&:hover': {
    border: `2px solid ${color}`,
    transform: 'translateY(-2px)',
  }
}));

const QuickActionFab = styled(Fab)(({ theme }) => ({
  position: 'fixed',
  bottom: theme.spacing(2),
  right: theme.spacing(2),
  background: 'linear-gradient(45deg, #FF6B6B 30%, #4ECDC4 90%)',
  color: 'white',
  '&:hover': {
    background: 'linear-gradient(45deg, #FF5252 30%, #26C6DA 90%)',
  }
}));

const MobileEmployeeApp = () => {
  const { user, token } = useContext(AuthContext);
  const [selectedModule, setSelectedModule] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [leaveBalance, setLeaveBalance] = useState(0);
  const [pendingRequests, setPendingRequests] = useState(0);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Dialog states for each module
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [procurementDialogOpen, setProcurementDialogOpen] = useState(false);
  const [tasksDialogOpen, setTasksDialogOpen] = useState(false);
  const [payslipsDialogOpen, setPayslipsDialogOpen] = useState(false);
  const [trainingDialogOpen, setTrainingDialogOpen] = useState(false);

  // Data states
  const [userProfile, setUserProfile] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [payslips, setPayslips] = useState([]);
  const [trainings, setTrainings] = useState([]);

  // Employee modules configuration
  const employeeModules = [
    {
      id: 'leave',
      title: 'Leave Request',
      description: 'Request time off and check leave balance',
      icon: <LeaveIcon />,
      color: '#4CAF50',
      badge: leaveBalance,
      badgeLabel: 'days left'
    },
    {
      id: 'tasks',
      title: 'My Tasks',
      description: 'View and manage assigned tasks',
      icon: <TaskIcon />,
      color: '#2196F3',
      badge: pendingRequests,
      badgeLabel: 'pending'
    },
    {
      id: 'profile',
      title: 'My Profile',
      description: 'Update personal information',
      icon: <ProfileIcon />,
      color: '#FF9800',
      badge: null
    },
    {
      id: 'payslips',
      title: 'Payslips',
      description: 'View salary and payment history',
      icon: <PayslipIcon />,
      color: '#9C27B0',
      badge: null
    },
    {
      id: 'training',
      title: 'Training',
      description: 'Access training materials and courses',
      icon: <TrainingIcon />,
      color: '#607D8B',
      badge: null
    },
    {
      id: 'procurement',
      title: 'Procurement',
      description: 'Submit procurement requests',
      icon: <ProcurementIcon />,
      color: '#795548',
      badge: null
    },
    {
      id: 'sales',
      title: 'Sales & POS',
      description: 'Access sales dashboard and POS system',
      icon: <MonetizationOnIcon />,
      color: '#E91E63',
      badge: null
    }
  ];

  useEffect(() => {
    loadEmployeeData();
  }, [token]);

  const loadEmployeeData = async () => {
    try {
      // Load employee-specific data
      const [leaveRes, requestsRes, notificationsRes, profileRes, tasksRes, payslipsRes, trainingsRes] = await Promise.all([
        api.get('/hr/leave-balance/', { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: { balance: 0 } })),
        api.get('/hr/my-requests/', { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: [] })),
        api.get('/notifications/my/', { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: [] })),
        api.get('/users/me/', { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: {} })),
        api.get('/tasks/my/', { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: [] })),
        api.get('/hr/payslips/my/', { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: [] })),
        api.get('/hr/training/', { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: [] }))
      ]);

      setLeaveBalance(leaveRes.data.balance || 0);
      setPendingRequests(requestsRes.data.filter(r => r.status === 'pending').length || 0);
      setNotifications(notificationsRes.data.slice(0, 5) || []);
      setUserProfile(profileRes.data);
      setTasks(tasksRes.data || []);
      setPayslips(payslipsRes.data || []);
      setTrainings(trainingsRes.data || []);
    } catch (error) {
      console.error('Failed to load employee data:', error);
    }
  };

  const handleModuleClick = (moduleId) => {
    setSelectedModule(moduleId);
    // Handle module-specific navigation or actions
    switch (moduleId) {
      case 'leave':
        setLeaveDialogOpen(true);
        break;
      case 'tasks':
        setTasksDialogOpen(true);
        break;
      case 'profile':
        setProfileDialogOpen(true);
        break;
      case 'payslips':
        setPayslipsDialogOpen(true);
        break;
      case 'training':
        setTrainingDialogOpen(true);
        break;
      case 'procurement':
        setProcurementDialogOpen(true);
        break;
      case 'sales':
        // Handle sales module click
        break;
      default:
        setSnackbarMessage(`Opening ${moduleId} module...`);
        setSnackbarOpen(true);
    }
  };

  const handleFormSubmit = (message) => {
    setSnackbarMessage(message);
    setSnackbarOpen(true);
    // Refresh data after form submission
    loadEmployeeData();
  };

  const renderModuleCards = () => (
    <Grid container spacing={2} sx={{ p: 2 }}>
      {employeeModules.map((module) => (
        <Grid item xs={12} sm={6} key={module.id}>
          <ModuleCard 
            color={module.color}
            onClick={() => handleModuleClick(module.id)}
          >
            <CardContent sx={{ pb: 1 }}>
              <Box display="flex" alignItems="center" mb={2}>
                <Avatar sx={{ bgcolor: module.color, mr: 2 }}>
                  {module.icon}
                </Avatar>
                <Box flex={1}>
                  <Typography variant="h6" component="h2" fontWeight="bold">
                    {module.title}
                  </Typography>
                  {module.badge !== null && (
                    <Chip
                      label={`${module.badge} ${module.badgeLabel}`}
                      size="small"
                      sx={{ 
                        bgcolor: module.color,
                        color: 'white',
                        fontWeight: 'bold'
                      }}
                    />
                  )}
                </Box>
              </Box>
              <Typography variant="body2" color="text.secondary">
                {module.description}
              </Typography>
            </CardContent>
            <CardActions>
              <Button 
                size="small" 
                sx={{ 
                  color: module.color,
                  fontWeight: 'bold',
                  '&:hover': { bgcolor: `${module.color}15` }
                }}
              >
                Open
              </Button>
            </CardActions>
          </ModuleCard>
        </Grid>
      ))}
    </Grid>
  );

  const renderNotifications = () => (
    <MobileCard sx={{ m: 2, mb: 1 }}>
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          <NotificationIcon sx={{ mr: 1, color: '#FF6B6B' }} />
          <Typography variant="h6" fontWeight="bold">
            Recent Notifications
          </Typography>
          <Badge badgeContent={notifications.length} color="error" sx={{ ml: 'auto' }} />
        </Box>
        {notifications.length === 0 ? (
          <Typography variant="body2" color="text.secondary" textAlign="center">
            No new notifications
          </Typography>
        ) : (
          <List dense>
            {notifications.map((notification, index) => (
              <React.Fragment key={notification.id || index}>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon>
                    {notification.type === 'success' ? (
                      <CheckIcon color="success" />
                    ) : notification.type === 'pending' ? (
                      <PendingIcon color="warning" />
                    ) : (
                      <NotificationIcon color="info" />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={notification.title || 'Notification'}
                    secondary={notification.message || 'No details available'}
                  />
                </ListItem>
                {index < notifications.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}
      </CardContent>
    </MobileCard>
  );

  return (
    <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      {/* Mobile App Bar */}
      <AppBar position="sticky" sx={{ bgcolor: 'white', color: 'black', boxShadow: 1 }}>
        <Toolbar>
          <IconButton
            edge="start"
            onClick={() => setDrawerOpen(true)}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>
            ERP Mobile
          </Typography>
          
          {/* Network Status Indicator */}
          <NetworkStatusIndicator size="small" />
          
          <Avatar sx={{ ml: 1, bgcolor: '#4CAF50' }}>
            {user?.first_name?.[0] || user?.username?.[0] || 'E'}
          </Avatar>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container maxWidth="sm" sx={{ pb: 10 }}>
        {/* Welcome Section */}
        <MobileCard sx={{ m: 2, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          <CardContent>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Welcome back, {user?.first_name || user?.username || 'Employee'}!
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Access your employee services and manage your work activities
            </Typography>
          </CardContent>
        </MobileCard>

        {/* Notifications */}
        {renderNotifications()}

        {/* Module Cards */}
        {renderModuleCards()}
      </Container>

      {/* Quick Action FAB */}
      <QuickActionFab onClick={() => handleModuleClick('leave')}>
        <AddIcon />
      </QuickActionFab>

      {/* Navigation Drawer */}
      <SwipeableDrawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onOpen={() => setDrawerOpen(true)}
      >
        <Box sx={{ width: 280, p: 2 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Typography variant="h6" fontWeight="bold">
              Menu
            </Typography>
            <IconButton onClick={() => setDrawerOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Divider sx={{ mb: 2 }} />
          <List>
            {employeeModules.map((module) => (
              <ListItem
                button
                key={module.id}
                onClick={() => {
                  handleModuleClick(module.id);
                  setDrawerOpen(false);
                }}
              >
                <ListItemIcon>
                  <Avatar sx={{ bgcolor: module.color, width: 32, height: 32 }}>
                    {module.icon}
                  </Avatar>
                </ListItemIcon>
                <ListItemText
                  primary={module.title}
                  secondary={module.description}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      </SwipeableDrawer>

      {/* Module Forms and Views */}
      <LeaveRequestForm
        open={leaveDialogOpen}
        onClose={() => setLeaveDialogOpen(false)}
        onSubmit={handleFormSubmit}
      />

      <ProfileEditForm
        open={profileDialogOpen}
        onClose={() => setProfileDialogOpen(false)}
        onSubmit={handleFormSubmit}
        userProfile={userProfile}
      />

      <ProcurementRequestForm
        open={procurementDialogOpen}
        onClose={() => setProcurementDialogOpen(false)}
        onSubmit={handleFormSubmit}
      />

      <TasksListView
        open={tasksDialogOpen}
        onClose={() => setTasksDialogOpen(false)}
        tasks={tasks}
      />

      <PayslipsView
        open={payslipsDialogOpen}
        onClose={() => setPayslipsDialogOpen(false)}
        payslips={payslips}
      />

      <TrainingView
        open={trainingDialogOpen}
        onClose={() => setTrainingDialogOpen(false)}
        trainings={trainings}
      />

      {/* Snackbar for feedback */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
    </Box>
  );
};

export default MobileEmployeeApp;

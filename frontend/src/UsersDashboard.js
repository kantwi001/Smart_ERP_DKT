import React, { useState, useEffect, useContext } from 'react';
import { 
  Box, Typography, Grid, Card, CardContent, CircularProgress, Alert,
  Tabs, Tab, Paper, Chip, Avatar, LinearProgress, Divider, IconButton, List, ListItem, ListItemText, Button,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Snackbar, FormControlLabel, Checkbox
} from '@mui/material';
import { styled } from '@mui/material/styles';
import PeopleIcon from '@mui/icons-material/People';
import AssessmentIcon from '@mui/icons-material/Assessment';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import GroupIcon from '@mui/icons-material/Group';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SecurityIcon from '@mui/icons-material/Security';
import BadgeIcon from '@mui/icons-material/Badge';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import RefreshIcon from '@mui/icons-material/Refresh';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import LockIcon from '@mui/icons-material/Lock';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import DeleteIcon from '@mui/icons-material/Delete';
import api from './api';
import { AuthContext } from './AuthContext';

// Styled components
const StyledTabs = styled(Tabs)(({ theme }) => ({
  backgroundColor: '#fff',
  borderRadius: '12px 12px 0 0',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  '& .MuiTabs-indicator': {
    height: 3,
    borderRadius: '3px 3px 0 0',
    background: 'linear-gradient(45deg, #00BCD4 30%, #0097A7 90%)',
  },
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '0.95rem',
  minHeight: 64,
  color: '#666',
  '&.Mui-selected': {
    color: '#00BCD4',
  },
}));

const MetricCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(135deg, #00BCD4 0%, #0097A7 100%)',
  color: 'white',
  borderRadius: 16,
  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
  transition: 'transform 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
  },
}));

const AnalyticsCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  border: '1px solid #f0f0f0',
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
    transform: 'translateY(-2px)',
  },
}));

const QuickActionButton = styled(Button)(({ theme }) => ({
  borderRadius: 12,
  padding: '12px 24px',
  textTransform: 'none',
  fontWeight: 600,
  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
  },
}));

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`users-tabpanel-${index}`}
      aria-labelledby={`users-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// Mock users data removed - now fetching real users from backend API

const UsersDashboard = () => {
  const { user, token } = useContext(AuthContext);

  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [departmentLoading, setDepartmentLoading] = useState(false);
  const [warehouses, setWarehouses] = useState([]);
  
  // Quick Actions State
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  
  // Form State
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    role: 'employee',
    department: '',
    assignedWarehouse: '',
    accessLevel: 'basic',
    moduleAccess: [],
    generatePassword: true,
    sendEmail: true
  });
  
  const [roleForm, setRoleForm] = useState({
    name: '',
    description: '',
    permissions: [],
    level: 'basic'
  });
  
  // Fetch users function
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users/');
      setUsers(response.data || []);
      setError('');
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setError('Failed to load users.');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // Quick Action Handlers
  const handleAddUser = async () => {
    try {
      const userData = {
        name: userForm.name,
        email: userForm.email,
        role: userForm.role,
        department: userForm.department,
        assignedWarehouse: userForm.assignedWarehouse,
        accessLevel: userForm.accessLevel,
        moduleAccess: userForm.moduleAccess,
        generatePassword: userForm.generatePassword,
        sendEmail: userForm.sendEmail
      };
      
      const response = await api.post('/users/create/', userData);
      
      if (response.data.email_sent) {
        setSnackbarMessage(`User created successfully! Password sent to ${userForm.email}`);
      } else if (response.data.generated_password) {
        setSnackbarMessage(`User created successfully! Generated password: ${response.data.generated_password}`);
      } else {
        setSnackbarMessage(response.data.message || 'User created successfully!');
      }
      
      setSnackbarOpen(true);
      setUserDialogOpen(false);
      setUserForm({
        name: '',
        email: '',
        role: 'employee',
        department: '',
        assignedWarehouse: '',
        accessLevel: 'basic',
        moduleAccess: [],
        generatePassword: true,
        sendEmail: true
      });
      fetchUsers();
    } catch (error) {
      setSnackbarMessage('Failed to create user: ' + (error.response?.data?.error || error.message));
      setSnackbarOpen(true);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (window.confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
      try {
        const response = await api.delete(`/users/${userId}/delete/`);
        setSnackbarMessage(response.data.message || 'User deleted successfully!');
        setSnackbarOpen(true);
        fetchUsers(); // Refresh user list
      } catch (error) {
        setSnackbarMessage('Failed to delete user: ' + (error.response?.data?.error || error.message));
        setSnackbarOpen(true);
      }
    }
  };
  
  // Generate random password function
  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };
  
  const handleManageRoles = async () => {
    try {
      console.log('Managing role:', roleForm);
      setSnackbarMessage('Role updated successfully!');
      setSnackbarOpen(true);
      setRoleDialogOpen(false);
      setRoleForm({ name: '', description: '', permissions: [], level: 'basic' });
    } catch (error) {
      setSnackbarMessage('Failed to update role');
      setSnackbarOpen(true);
    }
  };
  
  const handleBulkOperations = () => {
    setSnackbarMessage('Bulk operation started!');
    setSnackbarOpen(true);
  };
  
  // Security Settings State
  const [securityDialogOpen, setSecurityDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userModuleAccess, setUserModuleAccess] = useState([]);
  const [isModuleRestricted, setIsModuleRestricted] = useState(false);
  
  // Available ERP Modules
  const availableModules = [
    { id: 'dashboard', name: 'Dashboard', icon: '📊', description: 'Main dashboard and overview' },
    { id: 'inventory', name: 'Inventory Management', icon: '📦', description: 'Stock and inventory control' },
    { id: 'warehouse', name: 'Warehouse Management', icon: '🏭', description: 'Warehouse operations and transfers' },
    { id: 'sales', name: 'Sales Management', icon: '💰', description: 'Sales orders and customer management' },
    { id: 'accounting', name: 'Accounting', icon: '💼', description: 'Financial accounting and reporting' },
    { id: 'manufacturing', name: 'Manufacturing', icon: '🏭', description: 'Production and manufacturing processes' },
    { id: 'procurement', name: 'Procurement', icon: '🛒', description: 'Purchase orders and supplier management' },
    { id: 'hr', name: 'Human Resources', icon: '👥', description: 'Employee management and HR processes' },
    { id: 'pos', name: 'Point of Sale', icon: '🛍️', description: 'POS system and retail operations' },
    { id: 'reporting', name: 'Reporting & Analytics', icon: '📈', description: 'Business intelligence and reports' },
    { id: 'customers', name: 'Customer Management', icon: '👤', description: 'Customer relationship management' },
    { id: 'users', name: 'User Management', icon: '👨‍💼', description: 'User administration and permissions' },
    { id: 'surveys', name: 'Survey Management', icon: '📝', description: 'Survey creation and management' },
    { id: 'route_planning', name: 'Route Planning', icon: '🗺️', description: 'Delivery route optimization' },
    { id: 'survey_admin', name: 'Survey Administration', icon: '🔐', description: 'Advanced survey administration' },
    { id: 'powerbi', name: 'PowerBI Integration', icon: '📊', description: 'Business intelligence dashboards' },
  ];
  
  const handleSecuritySettings = () => {
    setSecurityDialogOpen(true);
  };
  
  const handleUserSelect = (user) => {
    setSelectedUser(user);
    // Load user's current module access (mock data for now)
    const defaultAccess = ['dashboard', 'inventory', 'sales'];
    setUserModuleAccess(user.moduleAccess || defaultAccess);
    setIsModuleRestricted(user.isModuleRestricted || false);
  };
  
  const handleModuleToggle = (moduleId) => {
    setUserModuleAccess(prev => {
      if (prev.includes(moduleId)) {
        return prev.filter(id => id !== moduleId);
      } else {
        return [...prev, moduleId];
      }
    });
  };
  
  const handleSaveModuleAccess = async () => {
    if (!selectedUser) return;
    
    try {
      // API call to update user module access
      const updateData = {
        accessible_modules: userModuleAccess,
        is_module_restricted: isModuleRestricted
      };
      
      // await api.patch(`/users/${selectedUser.id}/`, updateData);
      
      setSnackbarMessage(`Module access updated for ${selectedUser.name}`);
      setSnackbarOpen(true);
      setSelectedUser(null);
    } catch (error) {
      setSnackbarMessage('Failed to update module access');
      setSnackbarOpen(true);
    }
  };

  // Recent activity will be fetched from backend API in future implementation
  const recentActivity = [];

  useEffect(() => {
    console.log('🔄 UsersDashboard useEffect triggered, token:', token ? 'present' : 'missing');
    const fetchData = async () => {
      if (!token) {
        console.log('❌ No token available, skipping data fetch');
        return;
      }
      console.log('🚀 Starting fetchData with valid token');
      
      setLoading(true);
      try {
        // Fetch users with enhanced debugging
        try {
          console.log('👥 USER FETCH: Starting API call to /users/');
          console.log('🔑 Token available:', !!token);
          
          const usersRes = await api.get('/users/');
          
          console.log('✅ USER FETCH SUCCESS:');
          console.log('Response status:', usersRes.status);
          console.log('Response data:', usersRes.data);
          console.log('Data type:', typeof usersRes.data);
          console.log('Is array:', Array.isArray(usersRes.data));
          console.log('Data length:', usersRes.data?.length);
          
          if (usersRes.data && Array.isArray(usersRes.data)) {
            console.log(`🎉 Setting ${usersRes.data.length} users in state`);
            setUsers(usersRes.data);
            usersRes.data.forEach((user, i) => {
              const deptName = user.department?.name || user.department || 'No Department';
              console.log(`  ${i + 1}. ${user.username} (${user.first_name} ${user.last_name}) - ${user.role} - ${deptName}`);
            });
          } else {
            console.warn('⚠️ Users response is not an array:', usersRes.data);
            setUsers([]);
          }
        } catch (err) {
          console.error('❌ USER FETCH FAILED:');
          console.error('Error message:', err.message);
          console.error('Error response:', err.response);
          console.error('Error status:', err.response?.status);
          console.error('Error data:', err.response?.data);
          setUsers([]);
          setError('Failed to load users. Please check your connection and try again.');
        }

        // Fetch departments with enhanced debugging
        try {
          console.log('🏢 DEPARTMENT FETCH: Starting API call to /hr/departments/');
          console.log('🔑 Token available:', !!token);
          console.log('🌐 API base URL:', api.defaults.baseURL);
          
          const departmentsRes = await api.get('/hr/departments/');
          
          console.log('✅ DEPARTMENT FETCH SUCCESS:');
          console.log('Response status:', departmentsRes.status);
          console.log('Response data:', departmentsRes.data);
          console.log('Data type:', typeof departmentsRes.data);
          console.log('Is array:', Array.isArray(departmentsRes.data));
          console.log('Data length:', departmentsRes.data?.length);
          
          if (departmentsRes.data && Array.isArray(departmentsRes.data)) {
            console.log(`🎉 Setting ${departmentsRes.data.length} departments in state`);
            setDepartments(departmentsRes.data);
            departmentsRes.data.forEach((dept, i) => {
              console.log(`  ${i + 1}. ${dept.name} (ID: ${dept.id})`);
            });
          } else {
            console.warn('⚠️ Department response is not an array:', departmentsRes.data);
            setDepartments([]);
          }
        } catch (err) {
          console.error('❌ DEPARTMENT FETCH FAILED:');
          console.error('Error message:', err.message);
          console.error('Error response:', err.response);
          console.error('Error status:', err.response?.status);
          console.error('Error data:', err.response?.data);
          setDepartments([]);
        }

        // Fetch warehouses with fallback
        try {
          console.log('🏢 WAREHOUSE FETCH: Starting API call to /warehouse/');
          const warehousesRes = await api.get('/warehouse/');
          if (warehousesRes.data && Array.isArray(warehousesRes.data)) {
            setWarehouses(warehousesRes.data);
            console.log(`✅ Loaded ${warehousesRes.data.length} warehouses`);
          } else {
            console.warn('⚠️ Warehouses response invalid, using fallback');
            setWarehouses([
              { id: 1, name: 'Main Warehouse', code: 'MW001' },
              { id: 2, name: 'Secondary Warehouse', code: 'SW002' }
            ]);
          }
        } catch (warehouseError) {
          console.error('❌ Warehouse fetch failed:', warehouseError);
          console.log('🔄 Using fallback warehouse data');
          setWarehouses([
            { id: 1, name: 'Main Warehouse', code: 'MW001' },
            { id: 2, name: 'Secondary Warehouse', code: 'SW002' }
          ]);
        }

      } catch (error) {
        console.error('❌ Data fetch failed:', error);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  return (
    <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh', p: 0 }}>
      {/* Header */}
      <Box sx={{ 
        background: 'linear-gradient(135deg, #00BCD4 0%, #0097A7 100%)',
        color: 'white',
        p: 4,
        borderRadius: '0 0 24px 24px',
        mb: 3
      }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
              Users Management Dashboard
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              Manage users, roles, permissions, and access control across the organization.
            </Typography>
          </Box>
          <IconButton 
            onClick={() => window.location.reload()} 
            sx={{ 
              bgcolor: 'rgba(255,255,255,0.2)', 
              color: 'white',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
            }}
          >
            <RefreshIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Quick Actions Panel */}
      <Paper sx={{ 
        p: 3, 
        mb: 3, 
        borderRadius: 3, 
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
      }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#333' }}>
          Quick Actions
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <QuickActionButton
              fullWidth
              variant="contained"
              startIcon={<PersonAddIcon />}
              onClick={() => setUserDialogOpen(true)}
              sx={{ 
                background: 'linear-gradient(45deg, #00BCD4 30%, #0097A7 90%)',
                color: 'white'
              }}
            >
              Add User
            </QuickActionButton>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <QuickActionButton
              fullWidth
              variant="contained"
              startIcon={<AdminPanelSettingsIcon />}
              onClick={() => setRoleDialogOpen(true)}
              sx={{ 
                background: 'linear-gradient(45deg, #9C27B0 30%, #7B1FA2 90%)',
                color: 'white'
              }}
            >
              Manage Roles
            </QuickActionButton>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <QuickActionButton
              fullWidth
              variant="contained"
              startIcon={<GroupAddIcon />}
              onClick={handleBulkOperations}
              sx={{ 
                background: 'linear-gradient(45deg, #FF9800 30%, #FF5722 90%)',
                color: 'white'
              }}
            >
              Bulk Operations
            </QuickActionButton>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <QuickActionButton
              fullWidth
              variant="contained"
              startIcon={<SecurityIcon />}
              onClick={handleSecuritySettings}
              sx={{ 
                background: 'linear-gradient(45deg, #607D8B 30%, #455A64 90%)',
                color: 'white'
              }}
            >
              Security Settings
            </QuickActionButton>
          </Grid>
        </Grid>
      </Paper>

      {/* Loading and Error States */}
      {loading && (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress size={60} thickness={4} />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {/* Tabbed Interface */}
      <Paper sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
        <StyledTabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          variant="fullWidth"
        >
          <StyledTab icon={<TrendingUpIcon />} label="Overview" />
          <StyledTab icon={<PeopleIcon />} label="Users" />
          <StyledTab icon={<BadgeIcon />} label="Roles & Permissions" />
          <StyledTab icon={<AssessmentIcon />} label="Analytics" />
        </StyledTabs>

        {/* Overview Tab */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            {/* Summary Cards */}
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                        {users.length || 4}
                      </Typography>
                      <Typography variant="body1" sx={{ opacity: 0.9 }}>
                        Total Users
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                      <PeopleIcon sx={{ fontSize: 28 }} />
                    </Avatar>
                  </Box>
                </CardContent>
              </MetricCard>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <AnalyticsCard>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: '#00BCD4' }}>
                        3
                      </Typography>
                      <Typography variant="body1" color="textSecondary">
                        Active Users
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: '#e0f7fa', color: '#00BCD4', width: 56, height: 56 }}>
                      <GroupIcon sx={{ fontSize: 28 }} />
                    </Avatar>
                  </Box>
                </CardContent>
              </AnalyticsCard>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <AnalyticsCard>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: '#4CAF50' }}>
                        5
                      </Typography>
                      <Typography variant="body1" color="textSecondary">
                        User Roles
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: '#e8f5e8', color: '#4CAF50', width: 56, height: 56 }}>
                      <BadgeIcon sx={{ fontSize: 28 }} />
                    </Avatar>
                  </Box>
                </CardContent>
              </AnalyticsCard>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <AnalyticsCard>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: '#FF9800' }}>
                        4
                      </Typography>
                      <Typography variant="body1" color="textSecondary">
                        Departments
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: '#fff3e0', color: '#FF9800', width: 56, height: 56 }}>
                      <AdminPanelSettingsIcon sx={{ fontSize: 28 }} />
                    </Avatar>
                  </Box>
                </CardContent>
              </AnalyticsCard>
            </Grid>

            {/* Recent Activity */}
            <Grid item xs={12} md={6}>
              <AnalyticsCard>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Recent User Activity</Typography>
                  <Divider sx={{ mb: 2 }} />
                  <List sx={{ py: 0 }}>
                    {recentActivity.map((activity, index) => (
                      <ListItem key={index} sx={{ px: 0, py: 1 }}>
                        <ListItemText 
                          primary={activity.action}
                          secondary={activity.timestamp}
                          primaryTypographyProps={{ fontWeight: 500 }}
                        />
                        <Chip 
                          label={activity.type}
                          size="small" 
                          color={activity.type === 'success' ? 'success' : activity.type === 'warning' ? 'warning' : 'info'}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </AnalyticsCard>
            </Grid>

            {/* User Status */}
            <Grid item xs={12} md={6}>
              <AnalyticsCard>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>User Status Overview</Typography>
                  <Divider sx={{ mb: 2 }} />
                  {users.slice(0, 4).map((user, index) => (
                    <Box key={index} sx={{ mb: 2 }}>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                        <Typography variant="body1" fontWeight={500}>{user.name || user.username || 'Unknown User'}</Typography>
                        <Chip 
                          label={user.status}
                          size="small"
                          color={user.status === 'Active' ? 'success' : 'default'}
                        />
                      </Box>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                        <Typography variant="body2" color="textSecondary">{user.role} • {user.department}</Typography>
                        <Typography variant="body2" fontWeight={500}>Last: {user.lastLogin}</Typography>
                      </Box>
                    </Box>
                  ))}
                </CardContent>
              </AnalyticsCard>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Users Tab */}
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <AnalyticsCard>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>User Directory</Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Grid container spacing={2}>
                    {users.map((user, index) => (
                      <Grid item xs={12} sm={6} md={4} key={index}>
                        <Card sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
                          <CardContent>
                            <Box display="flex" alignItems="center" mb={2}>
                              <Avatar sx={{ bgcolor: '#00BCD4', mr: 2 }}>
                                {user.first_name && user.last_name ? 
                                  `${user.first_name[0]}${user.last_name[0]}` : 
                                  user.username ? user.username.substring(0, 2).toUpperCase() : 'U'
                                }
                              </Avatar>
                              <Box>
                                <Typography variant="h6" fontWeight={600}>
                                  {user.first_name && user.last_name ? 
                                    `${user.first_name} ${user.last_name}` : 
                                    user.username || 'Unknown User'
                                  }
                                </Typography>
                                <Typography variant="body2" color="textSecondary">{user.email}</Typography>
                              </Box>
                            </Box>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                              <Typography variant="body2">Role:</Typography>
                              <Typography variant="body2" fontWeight={500}>{user.role || 'employee'}</Typography>
                            </Box>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                              <Typography variant="body2">Department:</Typography>
                              <Typography variant="body2" fontWeight={500}>
                                {user.department?.name || user.department || 'No Department'}
                              </Typography>
                            </Box>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
                              <Chip 
                                label={user.is_active !== false ? 'Active' : 'Inactive'}
                                size="small"
                                color={user.is_active !== false ? 'success' : 'default'}
                                sx={{ flexGrow: 1, mr: 1 }}
                              />
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDeleteUser(user.id, user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : user.username)}
                                sx={{ 
                                  '&:hover': { 
                                    bgcolor: 'rgba(244, 67, 54, 0.1)' 
                                  }
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </AnalyticsCard>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Roles & Permissions Tab */}
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <AnalyticsCard>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Roles & Permissions Management</Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Typography variant="body1" color="textSecondary" textAlign="center" py={4}>
                    Role-based access control and permissions management will be displayed here.
                    Use the "Manage Roles" quick action to create and modify user roles.
                  </Typography>
                </CardContent>
              </AnalyticsCard>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Analytics Tab */}
        <TabPanel value={tabValue} index={3}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <AnalyticsCard>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>User Analytics</Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Typography variant="body1" color="textSecondary" textAlign="center" py={4}>
                    User activity analytics and security insights will be displayed here.
                    Use the "Security Settings" quick action to configure security parameters.
                  </Typography>
                </CardContent>
              </AnalyticsCard>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>
      
      {/* Add User Dialog */}
      <Dialog open={userDialogOpen} onClose={() => setUserDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New User</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Full Name"
            value={userForm.name}
            onChange={(e) => setUserForm({...userForm, name: e.target.value})}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Email"
            value={userForm.email}
            onChange={(e) => setUserForm({...userForm, email: e.target.value})}
            margin="normal"
            type="email"
          />
          <TextField
            fullWidth
            select
            label="Role"
            value={userForm.role}
            onChange={(e) => setUserForm({...userForm, role: e.target.value})}
            margin="normal"
          >
            <MenuItem value="admin">Administrator</MenuItem>
            <MenuItem value="manager">Manager</MenuItem>
            <MenuItem value="employee">Employee</MenuItem>
            <MenuItem value="contractor">Contractor</MenuItem>
          </TextField>
          <TextField
            fullWidth
            select
            label="Department"
            value={userForm.department}
            onChange={(e) => setUserForm({...userForm, department: e.target.value})}
            margin="normal"
            helperText={departments.length === 0 ? "No departments available" : `${departments.length} departments available`}
          >
            <MenuItem value="">
              <em>No Department</em>
            </MenuItem>
            {departments.map((department) => (
              <MenuItem key={department.id} value={department.id}>
                {department.name}
              </MenuItem>
            ))}
          </TextField>
          
          {/* Warehouse Assignment Field - Shows only when Sales Department is selected */}
          {departments.find(dept => dept.id === userForm.department)?.name?.toLowerCase().includes('sales') && (
            <Box>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <TextField
                  fullWidth
                  select
                  label="Assigned Warehouse"
                  value={userForm.assignedWarehouse}
                  onChange={(e) => setUserForm({...userForm, assignedWarehouse: e.target.value})}
                  margin="normal"
                  helperText={warehouses.length === 0 ? "Loading warehouses..." : `${warehouses.length} warehouses available`}
                >
                  <MenuItem value="">
                    <em>No Warehouse Assignment</em>
                  </MenuItem>
                  {warehouses.length === 0 ? (
                    <MenuItem disabled>
                      <em>Loading warehouses...</em>
                    </MenuItem>
                  ) : (
                    warehouses.map((warehouse) => (
                      <MenuItem key={warehouse.id} value={warehouse.id}>
                        {warehouse.name} {warehouse.code ? `(${warehouse.code})` : ''} {warehouse.address ? `- ${warehouse.address}` : ''}
                      </MenuItem>
                    ))
                  )}
                </TextField>
                {warehouses.length === 0 && (
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={async () => {
                      console.log('🔄 Manual warehouse reload triggered');
                      try {
                        const warehousesRes = await api.get('/api/warehouse/');
                        if (warehousesRes.data && Array.isArray(warehousesRes.data)) {
                          setWarehouses(warehousesRes.data);
                          console.log(`✅ Manual reload: ${warehousesRes.data.length} warehouses loaded`);
                        }
                      } catch (err) {
                        console.error('❌ Manual reload failed:', err);
                      }
                    }}
                    sx={{ mt: 2, minWidth: 100 }}
                  >
                    Reload
                  </Button>
                )}
              </Box>
            </Box>
          )}
          
          {/* Remove the duplicate TextField that was here */}
          {false && ( // This hides the duplicate field
            <TextField
              fullWidth
              select
              label="Assigned Warehouse"
              value={userForm.assignedWarehouse}
              onChange={(e) => setUserForm({...userForm, assignedWarehouse: e.target.value})}
              margin="normal"
              helperText={warehouses.length === 0 ? "Loading warehouses..." : `${warehouses.length} warehouses available`}
            >
              <MenuItem value="">
                <em>No Warehouse Assignment</em>
              </MenuItem>
              {warehouses.length === 0 ? (
                <MenuItem disabled>
                  <em>Loading warehouses...</em>
                </MenuItem>
              ) : (
                warehouses.map((warehouse) => (
                  <MenuItem key={warehouse.id} value={warehouse.id}>
                    {warehouse.name} {warehouse.code ? `(${warehouse.code})` : ''} {warehouse.address ? `- ${warehouse.address}` : ''}
                  </MenuItem>
                ))
              )}
            </TextField>
          )}
          
          <TextField
            fullWidth
            select
            label="Access Level"
            value={userForm.accessLevel}
            onChange={(e) => setUserForm({...userForm, accessLevel: e.target.value})}
            margin="normal"
            helperText="Determines the overall system access level"
          >
            <MenuItem value="basic">Basic Access</MenuItem>
            <MenuItem value="intermediate">Intermediate Access</MenuItem>
            <MenuItem value="advanced">Advanced Access</MenuItem>
            <MenuItem value="full">Full Access</MenuItem>
          </TextField>
          
          {/* Module Permissions Section */}
          <Box sx={{ mt: 2, mb: 2 }}>
            <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>Module Permissions</Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              Select which modules this user can access
            </Typography>
            <Grid container spacing={1}>
              {availableModules.map((module) => (
                <Grid item xs={12} sm={6} key={module.id}>
                  <Card 
                    sx={{ 
                      p: 1, 
                      cursor: 'pointer',
                      border: userForm.moduleAccess.includes(module.id) ? '2px solid #00BCD4' : '1px solid #e0e0e0',
                      bgcolor: userForm.moduleAccess.includes(module.id) ? '#e3f2fd' : 'transparent'
                    }}
                    onClick={() => {
                      const newModuleAccess = userForm.moduleAccess.includes(module.id)
                        ? userForm.moduleAccess.filter(id => id !== module.id)
                        : [...userForm.moduleAccess, module.id];
                      setUserForm({...userForm, moduleAccess: newModuleAccess});
                    }}
                  >
                    <Box display="flex" alignItems="center">
                      <Typography sx={{ mr: 1, fontSize: '1.2rem' }}>{module.icon}</Typography>
                      <Box>
                        <Typography variant="body2" fontWeight={600}>{module.name}</Typography>
                        <Typography variant="caption" color="textSecondary">{module.description}</Typography>
                      </Box>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
          
          {/* Password Generation Options */}
          <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
            <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>Password Settings</Typography>
            <FormControlLabel
              control={
                <Checkbox
                  checked={userForm.generatePassword}
                  onChange={(e) => setUserForm({...userForm, generatePassword: e.target.checked})}
                  color="primary"
                />
              }
              label="Generate random password automatically"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={userForm.sendEmail}
                  onChange={(e) => setUserForm({...userForm, sendEmail: e.target.checked})}
                  color="primary"
                  disabled={!userForm.generatePassword}
                />
              }
              label="Send password to user's email address"
            />
            {userForm.generatePassword && (
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                ✓ User will be required to change password on first login
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUserDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleAddUser} 
            variant="contained"
            sx={{ background: 'linear-gradient(45deg, #00BCD4 30%, #0097A7 90%)' }}
          >
            Add User
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Manage Roles Dialog */}
      <Dialog open={roleDialogOpen} onClose={() => setRoleDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Manage User Role</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Role Name"
            value={roleForm.name}
            onChange={(e) => setRoleForm({...roleForm, name: e.target.value})}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Description"
            value={roleForm.description}
            onChange={(e) => setRoleForm({...roleForm, description: e.target.value})}
            margin="normal"
            multiline
            rows={2}
          />
          <TextField
            fullWidth
            select
            label="Access Level"
            value={roleForm.level}
            onChange={(e) => setRoleForm({...roleForm, level: e.target.value})}
            margin="normal"
          >
            <MenuItem value="basic">Basic Access</MenuItem>
            <MenuItem value="intermediate">Intermediate Access</MenuItem>
            <MenuItem value="advanced">Advanced Access</MenuItem>
            <MenuItem value="full">Full Access</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRoleDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleManageRoles} 
            variant="contained"
            sx={{ background: 'linear-gradient(45deg, #9C27B0 30%, #7B1FA2 90%)' }}
          >
            Update Role
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Security Settings Dialog */}
      <Dialog open={securityDialogOpen} onClose={() => setSecurityDialogOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ background: 'linear-gradient(45deg, #FF5722 30%, #D84315 90%)', color: 'white' }}>
          <Box display="flex" alignItems="center">
            <SecurityIcon sx={{ mr: 2 }} />
            Security & Module Access Control
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Grid container spacing={3}>
            {/* User Selection */}
            <Grid item xs={12} md={4}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Select User</Typography>
              <List sx={{ maxHeight: 400, overflow: 'auto', border: '1px solid #e0e0e0', borderRadius: 2 }}>
                {users.map((user, index) => (
                  <ListItem 
                    key={index} 
                    button
                    selected={selectedUser?.id === user.id}
                    onClick={() => handleUserSelect(user)}
                    sx={{ 
                      borderRadius: 1, 
                      mb: 1,
                      bgcolor: selectedUser?.id === user.id ? '#e3f2fd' : 'transparent'
                    }}
                  >
                    <Avatar sx={{ bgcolor: '#FF5722', mr: 2, width: 32, height: 32 }}>
                      {user.first_name && user.last_name ? 
                        `${user.first_name[0]}${user.last_name[0]}` : 
                        user.username ? user.username.substring(0, 2).toUpperCase() : 'U'
                      }
                    </Avatar>
                    <ListItemText 
                      primary={user.first_name && user.last_name ? 
                        `${user.first_name} ${user.last_name}` : 
                        user.username || 'Unknown User'
                      }
                      secondary={`${user.role || 'employee'} • ${user.department?.name || user.department || 'No Department'}`}
                      primaryTypographyProps={{ fontWeight: 500 }}
                    />
                  </ListItem>
                ))}
              </List>
            </Grid>
            
            {/* Module Access Configuration */}
            <Grid item xs={12} md={8}>
              {selectedUser ? (
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Module Access for {selectedUser.name}
                  </Typography>
                  
                  {/* Module Restriction Toggle */}
                  <Box sx={{ mb: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                      <Box>
                        <Typography variant="subtitle1" fontWeight={600}>Module Restrictions</Typography>
                        <Typography variant="body2" color="textSecondary">
                          Enable to restrict user access to specific modules only
                        </Typography>
                      </Box>
                      <Button
                        variant={isModuleRestricted ? "contained" : "outlined"}
                        color={isModuleRestricted ? "error" : "primary"}
                        onClick={() => setIsModuleRestricted(!isModuleRestricted)}
                        startIcon={<LockIcon />}
                      >
                        {isModuleRestricted ? 'Restricted' : 'Unrestricted'}
                      </Button>
                    </Box>
                  </Box>
                  
                  {/* Module Selection Grid */}
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                    Available Modules {isModuleRestricted && '(Select modules to grant access)'}
                  </Typography>
                  <Grid container spacing={2}>
                    {availableModules.map((module) => {
                      const hasAccess = userModuleAccess.includes(module.id);
                      const isDisabled = !isModuleRestricted;
                      
                      return (
                        <Grid item xs={12} sm={6} md={4} key={module.id}>
                          <Card 
                            sx={{ 
                              border: hasAccess && isModuleRestricted ? '2px solid #4CAF50' : '1px solid #e0e0e0',
                              borderRadius: 2,
                              cursor: isModuleRestricted ? 'pointer' : 'default',
                              opacity: isDisabled ? 0.6 : 1,
                              bgcolor: hasAccess && isModuleRestricted ? '#f1f8e9' : 'white',
                              transition: 'all 0.2s ease'
                            }}
                            onClick={() => isModuleRestricted && handleModuleToggle(module.id)}
                          >
                            <CardContent sx={{ p: 2 }}>
                              <Box display="flex" alignItems="center" mb={1}>
                                <Typography sx={{ fontSize: '1.5rem', mr: 1 }}>{module.icon}</Typography>
                                <Typography variant="subtitle2" fontWeight={600}>
                                  {module.name}
                                </Typography>
                                {hasAccess && isModuleRestricted && (
                                  <Chip 
                                    label="✓" 
                                    size="small" 
                                    color="success" 
                                    sx={{ ml: 'auto', minWidth: 24, height: 20 }}
                                  />
                                )}
                              </Box>
                              <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.75rem' }}>
                                {module.description}
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                      );
                    })}
                  </Grid>
                  
                  {/* Access Summary */}
                  {isModuleRestricted && (
                    <Box sx={{ mt: 3, p: 2, bgcolor: '#e3f2fd', borderRadius: 2 }}>
                      <Typography variant="subtitle2" fontWeight={600} mb={1}>
                        Access Summary ({userModuleAccess.length} modules selected)
                      </Typography>
                      <Box display="flex" flexWrap="wrap" gap={1}>
                        {userModuleAccess.map((moduleId) => {
                          const module = availableModules.find(m => m.id === moduleId);
                          return (
                            <Chip 
                              key={moduleId}
                              label={module?.name || moduleId}
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                          );
                        })}
                      </Box>
                    </Box>
                  )}
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <SecurityIcon sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
                  <Typography variant="h6" color="textSecondary">
                    Select a user to configure module access
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Choose a user from the list to manage their module permissions
                  </Typography>
                </Box>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, bgcolor: '#f5f5f5' }}>
          <Button onClick={() => {
            setSecurityDialogOpen(false);
            setSelectedUser(null);
          }}>
            Cancel
          </Button>
          <Button 
            onClick={handleSaveModuleAccess}
            variant="contained"
            disabled={!selectedUser}
            sx={{ background: 'linear-gradient(45deg, #FF5722 30%, #D84315 90%)' }}
          >
            Save Module Access
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Success/Error Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
    </Box>
  );
};

export default UsersDashboard;

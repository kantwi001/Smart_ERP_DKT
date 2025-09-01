      import React, { useState, useEffect, useContext } from 'react';
import { 
  Box, Typography, Grid, Card, CardContent, CircularProgress, Alert,
  Tabs, Tab, Paper, Chip, Avatar, LinearProgress, Divider, IconButton, List, ListItem, ListItemText, Button,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Snackbar, FormControlLabel, Checkbox,
  TableContainer, Table, TableHead, TableRow, TableCell, TableBody
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
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import api from './api';
import { AuthContext } from './AuthContext';
import { getApiBaseUrl } from './api';

// Sample users data
const sampleUsers = [
  {
    id: 1,
    username: 'arkucollins',
    email: 'arkucollins@gmail.com',
    first_name: 'Collins',
    last_name: 'Arku',
    role: 'admin',
    department: 'Management',
    is_active: true,
    status: 'Active',
    lastLogin: '2 hours ago'
  },
  {
    id: 2,
    username: 'johndoe',
    email: 'john.doe@company.com',
    first_name: 'John',
    last_name: 'Doe',
    role: 'user',
    department: 'Sales',
    is_active: true,
    status: 'Active',
    lastLogin: '1 day ago'
  },
  {
    id: 3,
    username: 'janesmith',
    email: 'jane.smith@company.com',
    first_name: 'Jane',
    last_name: 'Smith',
    role: 'user',
    department: 'HR',
    is_active: true,
    status: 'Active',
    lastLogin: '3 hours ago'
  },
  {
    id: 4,
    username: 'mikejohnson',
    email: 'mike.johnson@company.com',
    first_name: 'Mike',
    last_name: 'Johnson',
    role: 'user',
    department: 'Inventory',
    is_active: true,
    status: 'Active',
    lastLogin: '5 hours ago'
  },
  {
    id: 5,
    username: 'sarahwilson',
    email: 'sarah.wilson@company.com',
    first_name: 'Sarah',
    last_name: 'Wilson',
    role: 'user',
    department: 'Finance',
    is_active: true,
    status: 'Active',
    lastLogin: '1 hour ago'
  }
];

const sampleDepartments = [
  { id: 1, name: 'Management' },
  { id: 2, name: 'Sales' },
  { id: 3, name: 'HR' },
  { id: 4, name: 'Finance' },
  { id: 5, name: 'Inventory' },
  { id: 6, name: 'Procurement' },
  { id: 7, name: 'Operations' },
  { id: 8, name: 'IT Support' }
];

const sampleWarehouses = [
  { id: 1, name: 'Main Warehouse - Accra Central', code: 'MW001' },
  { id: 2, name: 'Branch A - Kumasi', code: 'BK002' },
  { id: 3, name: 'Branch B - Tamale', code: 'BT003' },
  { id: 4, name: 'Branch C - Cape Coast', code: 'BC004' },
  { id: 5, name: 'Supplier Warehouse - Tema Port', code: 'SW005' }
];

const sampleRecentActivity = [
  { action: 'New user John Doe created', timestamp: '2 hours ago', type: 'success' },
  { action: 'User permissions updated for Jane Smith', timestamp: '4 hours ago', type: 'info' },
  { action: 'Password reset requested by Mike Johnson', timestamp: '6 hours ago', type: 'warning' },
  { action: 'User Sarah Wilson logged in', timestamp: '1 hour ago', type: 'success' }
];

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

const UsersDashboard = () => {
  const { user, token } = useContext(AuthContext);

  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState(sampleDepartments);
  const [departmentLoading, setDepartmentLoading] = useState(false);
  const [warehouses, setWarehouses] = useState(sampleWarehouses);
  
  // Quick Actions State
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [editUserDialogOpen, setEditUserDialogOpen] = useState(false);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [editDepartmentDialogOpen, setEditDepartmentDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
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
    password: '',
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
      console.log('🔍 Fetching users from backend API...');
      console.log('🔑 Token available:', token ? 'YES' : 'NO');
      console.log('🔑 Token value:', token ? token.substring(0, 20) + '...' : 'null');
      
      const response = await fetch(`${getApiBaseUrl()}/users/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('📡 API Response status:', response.status);
      console.log('📡 API Response headers:', response.headers);
      console.log('📡 API Response ok:', response.ok);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Received users from API:', data.length, 'users');
        console.log('👥 User data:', data);
        console.log('🔍 First user raw data:', data[0]);
        console.log('🔍 Department data available:', data[0]?.department_name, data[0]?.department_id);
        console.log('🔍 Warehouse data available:', data[0]?.assigned_warehouse_name, data[0]?.assigned_warehouse_id);
        
        // Debug all users' department data
        data.forEach((user, index) => {
          console.log(`🏢 User ${index + 1} (${user.email}) department data:`, {
            department_id: user.department_id,
            department_name: user.department_name,
            department_field: user.department,
            raw_department: JSON.stringify(user.department)
          });
        });
        
        // Transform backend data to match frontend format
        const transformedUsers = data.map(user => {
          console.log('🔄 Transforming user:', user.email, {
            department_name: user.department_name,
            department_id: user.department_id,
            assigned_warehouse_name: user.assigned_warehouse_name,
            assigned_warehouse_id: user.assigned_warehouse_id
          });
          
          return {
            id: user.id,
            username: user.username,
            email: user.email,
            first_name: user.first_name || '',
            last_name: user.last_name || '',
            role: user.role || 'employee',
            department: user.department_name || 'Unassigned',
            department_id: user.department_id,
            assigned_warehouse: user.assigned_warehouse_name || 'Unassigned',
            assigned_warehouse_id: user.assigned_warehouse_id,
            is_active: user.is_active,
            is_superuser: user.is_superuser,
            is_staff: user.is_staff,
            status: user.is_active ? 'Active' : 'Inactive',
            lastLogin: user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never',
            dateJoined: user.date_joined ? new Date(user.date_joined).toLocaleDateString() : 'Unknown'
          };
        });
        
        console.log('🎯 Transformed users:', transformedUsers);
        console.log('🔍 First transformed user:', transformedUsers[0]);
        setUsers(transformedUsers);
        setError('');
        console.log('🎯 Successfully loaded', transformedUsers.length, 'users from database');
      } else {
        const errorText = await response.text();
        console.error('❌ API Error:', response.status, errorText);
        console.error('❌ Response headers:', Object.fromEntries(response.headers.entries()));
        
        // Check for specific error types
        if (response.status === 401) {
          console.error('🔐 Authentication failed - token may be invalid or expired');
          setError('Authentication failed - please log in again');
        } else if (response.status === 403) {
          console.error('🚫 Access forbidden - insufficient permissions');
          setError('Access forbidden - insufficient permissions');
        } else if (response.status === 404) {
          console.error('🔍 API endpoint not found');
          setError('API endpoint not found - check backend server');
        } else if (response.status >= 500) {
          console.error('🔥 Server error - backend may be down');
          setError('Server error - backend may be down');
        } else {
          console.error('❓ Unknown error:', response.status);
          setError(`API Error: ${response.status} - ${errorText}`);
        }
        
        console.warn('Using sample data as fallback');
        setUsers(sampleUsers);
      }
    } catch (error) {
      console.error('💥 Network error fetching users:', error);
      console.error('💥 Error type:', error.name);
      console.error('💥 Error message:', error.message);
      console.error('💥 Error stack:', error.stack);
      
      // Check for specific network errors
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        console.error('🌐 Network connectivity issue - backend server may be down');
        setError(`Network error - backend server may be down (check ${getApiBaseUrl().replace('/api', '')})`);
      } else if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        console.error('🔌 CORS or connection issue');
        setError('Connection failed - check CORS settings and backend server');
      } else {
        console.error('❓ Unknown network error');
        setError(`Network error: ${error.message}`);
      }
      
      console.warn('Using sample data as fallback');
      setUsers(sampleUsers);
    } finally {
      setLoading(false);
    }
  };

  // Fetch warehouses from API
  const fetchWarehouses = async () => {
    try {
      console.log('🏭 Fetching warehouses from API...');
      const response = await api.get('/warehouse/');
      
      if (response.status === 200) {
        const data = response.data.results || response.data || [];
        console.log('🏭 Warehouse data:', data);
        
        // Transform backend data to match frontend format
        const transformedWarehouses = data.map(warehouse => ({
          id: warehouse.id,
          name: warehouse.name,
          code: warehouse.code || `WH${warehouse.id.toString().padStart(3, '0')}`,
          location: warehouse.location || '',
          description: warehouse.description || ''
        }));
        
        setWarehouses(transformedWarehouses);
        console.log('🎯 Successfully loaded', transformedWarehouses.length, 'warehouses from API');
        return transformedWarehouses;
      } else {
        console.warn('⚠️ Warehouse API returned non-200 status:', response.status);
        console.warn('Using sample warehouses as fallback');
        setWarehouses(sampleWarehouses);
        return sampleWarehouses;
      }
    } catch (error) {
      console.error('❌ Failed to fetch warehouses:', error);
      console.warn('Using sample warehouses as fallback');
      setWarehouses(sampleWarehouses);
      return sampleWarehouses;
    }
  };

  const handleAddUser = async () => {
    try {
      console.log('🔄 Creating user with form data:', userForm);
      console.log('📋 Department value being sent:', userForm.department);
      console.log('🏭 Warehouse value being sent:', userForm.assignedWarehouse);
      console.log('🏷️ Department condition check:', departments.find(d => d.id == userForm.department)?.name === 'Sales');
      
      const payload = {
        username: userForm.email.split('@')[0], // Generate username from email
        name: userForm.name, // Backend expects 'name' field
        email: userForm.email,
        role: userForm.role,
        department: userForm.department,
        assignedWarehouse: userForm.department === 2 ? userForm.assignedWarehouse : null,
        moduleAccess: userForm.moduleAccess,
        password: userForm.password,
        generatePassword: userForm.generatePassword,
        sendEmail: userForm.sendEmail
      };
      
      console.log('📤 Complete payload being sent:', payload);
      
      const response = await fetch(`${getApiBaseUrl()}/users/create/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      console.log('📤 Backend response:', data);
      
      if (response.ok) {
        console.log('✅ User creation successful, refreshing user list...');
        
        // Refresh users list
        await fetchUsers();
        
        let message = data.message || 'User created successfully';
        if (data.email_sent) {
          message += ' and email sent with login credentials!';
        } else if (data.generated_password && !data.email_sent) {
          message += ` Generated password: ${data.generated_password}`;
        }
        
        console.log('✅ User creation message:', message);
        setSnackbarMessage(message);
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
          password: '',
          sendEmail: true
        });
        console.log('✅ User form reset');
      } else {
        console.log('❌ User creation failed, response status:', response.status);
        console.log('❌ User creation failed, response data:', data);
        setSnackbarMessage(data.error || 'Failed to create user');
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error('User creation error:', error);
      
      let errorMessage = 'Failed to create user. Please try again.';
      if (error.message.includes('fetch')) {
        errorMessage = 'Network error. Please check if backend server is running.';
      }
      
      setSnackbarMessage(errorMessage);
      setSnackbarOpen(true);
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      const response = await api.delete(`/users/${userId}/delete/`);
      const data = response.data;
      
      if (response.status === 200) {
        await fetchUsers();
        setSnackbarMessage(data.message || 'User deleted successfully');
        setSnackbarOpen(true);
      } else {
        setSnackbarMessage(data.error || 'Failed to delete user');
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error('User deletion error:', error);
      if (error.response) {
        const errorMessage = error.response.data?.error || error.response.data?.message || 'Failed to delete user';
        setSnackbarMessage(errorMessage);
      } else {
        setSnackbarMessage('Error deleting user. Please try again.');
      }
      setSnackbarOpen(true);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await fetchUsers();
        await fetchWarehouses();
        setDepartments(sampleDepartments);
        setError('');
      } catch (error) {
        console.error('❌ Data fetch failed:', error);
        setUsers(sampleUsers);
        setDepartments(sampleDepartments);
        setWarehouses(sampleWarehouses);
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
              onClick={() => setSnackbarMessage('Bulk operations coming soon!')}
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
              onClick={() => setSnackbarMessage('Security settings coming soon!')}
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
                  <Box display="flex" alignItems="center" mb={2}>
                    <SecurityIcon sx={{ color: '#2196F3', mr: 1 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>Role Overview</Typography>
                  </Box>
                  <Box display="flex" flexDirection="column" gap={2}>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2">Total Roles</Typography>
                      <Typography variant="h6" sx={{ color: '#2196F3', fontWeight: 700 }}>5</Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2">Active Users</Typography>
                      <Typography variant="h6" sx={{ color: '#4CAF50', fontWeight: 700 }}>
                        {users.filter(u => u.is_active).length}
                      </Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2">Admin Users</Typography>
                      <Typography variant="h6" sx={{ color: '#FF9800', fontWeight: 700 }}>
                        {users.filter(u => u.role === 'admin' || u.is_superuser).length}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </AnalyticsCard>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <AnalyticsCard>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <BadgeIcon sx={{ color: '#4CAF50', mr: 1 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>Department Overview</Typography>
                  </Box>
                  <Box display="flex" flexDirection="column" gap={2}>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2">Total Departments</Typography>
                      <Typography variant="h6" sx={{ color: '#4CAF50', fontWeight: 700 }}>
                        {departments.length}
                      </Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2">Active Departments</Typography>
                      <Typography variant="h6" sx={{ color: '#4CAF50', fontWeight: 700 }}>
                        {departments.filter(d => d.name !== 'Unassigned').length}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </AnalyticsCard>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <AnalyticsCard>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <AdminPanelSettingsIcon sx={{ color: '#FF9800', mr: 1 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>Warehouse Overview</Typography>
                  </Box>
                  <Box display="flex" flexDirection="column" gap={2}>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2">Total Warehouses</Typography>
                      <Typography variant="h6" sx={{ color: '#FF9800', fontWeight: 700 }}>
                        {warehouses.length}
                      </Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2">Active Warehouses</Typography>
                      <Typography variant="h6" sx={{ color: '#FF9800', fontWeight: 700 }}>
                        {warehouses.filter(w => w.name !== 'Unassigned').length}
                      </Typography>
                    </Box>
                  </Box>
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
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>User Directory</Typography>
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
                              <Chip 
                                label={user.role || 'employee'} 
                                size="small" 
                                color={user.is_superuser ? 'error' : user.is_staff ? 'warning' : 'primary'}
                                variant="outlined"
                              />
                            </Box>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                              <Typography variant="body2">Department:</Typography>
                              <Typography variant="body2" fontWeight={500}>
                                {user.department || 'Unassigned'}
                              </Typography>
                            </Box>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                              <Typography variant="body2">Warehouse:</Typography>
                              <Typography variant="body2" fontWeight={500} fontSize="0.8rem">
                                {user.assigned_warehouse || 'Unassigned'}
                              </Typography>
                            </Box>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                              <Typography variant="body2">Last Login:</Typography>
                              <Typography variant="body2" color="textSecondary" fontSize="0.8rem">
                                {user.lastLogin}
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
                                onClick={() => handleDeleteUser(user.id)}
                                sx={{ 
                                  '&:hover': { 
                                    bgcolor: 'rgba(244, 67, 54, 0.1)' 
                                  }
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => {
                                  setEditingUser(user);
                                  setEditUserDialogOpen(true);
                                }}
                                sx={{ 
                                  '&:hover': { 
                                    bgcolor: 'rgba(33, 150, 243, 0.1)' 
                                  }
                                }}
                              >
                                <EditIcon fontSize="small" />
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
            {/* Role Statistics */}
            <Grid item xs={12} md={4}>
              <AnalyticsCard>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <SecurityIcon sx={{ color: '#2196F3', mr: 1 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>Role Overview</Typography>
                  </Box>
                  <Box display="flex" flexDirection="column" gap={2}>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2">Total Roles</Typography>
                      <Typography variant="h6" sx={{ color: '#2196F3', fontWeight: 700 }}>5</Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2">Active Users</Typography>
                      <Typography variant="h6" sx={{ color: '#4CAF50', fontWeight: 700 }}>
                        {users.filter(u => u.is_active).length}
                      </Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2">Admin Users</Typography>
                      <Typography variant="h6" sx={{ color: '#FF9800', fontWeight: 700 }}>
                        {users.filter(u => u.role === 'admin' || u.is_superuser).length}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </AnalyticsCard>
            </Grid>

            {/* Role Distribution Chart */}
            <Grid item xs={12} md={8}>
              <AnalyticsCard>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>Role Distribution</Typography>
                  <Box display="flex" flexWrap="wrap" gap={2}>
                    {['admin', 'manager', 'employee', 'viewer'].map((role) => {
                      const roleCount = users.filter(u => u.role === role).length;
                      const percentage = users.length > 0 ? Math.round((roleCount / users.length) * 100) : 0;
                      const colors = {
                        admin: '#F44336',
                        manager: '#FF9800', 
                        employee: '#4CAF50',
                        viewer: '#2196F3'
                      };
                      
                      return (
                        <Box key={role} sx={{ 
                          bgcolor: colors[role] + '20', 
                          p: 2, 
                          borderRadius: 2, 
                          minWidth: 120,
                          textAlign: 'center'
                        }}>
                          <Typography variant="h4" sx={{ color: colors[role], fontWeight: 700 }}>
                            {roleCount}
                          </Typography>
                          <Typography variant="body2" sx={{ textTransform: 'capitalize', fontWeight: 600 }}>
                            {role}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {percentage}%
                          </Typography>
                        </Box>
                      );
                    })}
                  </Box>
                </CardContent>
              </AnalyticsCard>
            </Grid>

            {/* Role Management Table */}
            <Grid item xs={12}>
              <AnalyticsCard>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>Role Management</Typography>
                    <Button 
                      variant="contained" 
                      startIcon={<AddIcon />}
                      sx={{ 
                        bgcolor: '#00BCD4',
                        '&:hover': { bgcolor: '#0097A7' }
                      }}
                    >
                      Create Role
                    </Button>
                  </Box>
                  
                  <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid #e0e0e0' }}>
                    <Table>
                      <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600 }}>Role Name</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Users</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Permissions</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {[
                          { 
                            name: 'Super Admin', 
                            description: 'Full system access and control',
                            users: users.filter(u => u.is_superuser).length,
                            permissions: 'All Modules',
                            color: '#F44336'
                          },
                          { 
                            name: 'Admin', 
                            description: 'Administrative access to most modules',
                            users: users.filter(u => u.role === 'admin' && !u.is_superuser).length,
                            permissions: 'Most Modules',
                            color: '#FF5722'
                          },
                          { 
                            name: 'Manager', 
                            description: 'Department management and oversight',
                            users: users.filter(u => u.role === 'manager').length,
                            permissions: 'Department Modules',
                            color: '#FF9800'
                          },
                          { 
                            name: 'Employee', 
                            description: 'Standard employee access',
                            users: users.filter(u => u.role === 'employee').length,
                            permissions: 'Basic Modules',
                            color: '#4CAF50'
                          },
                          { 
                            name: 'Viewer', 
                            description: 'Read-only access to assigned modules',
                            users: users.filter(u => u.role === 'viewer').length,
                            permissions: 'View Only',
                            color: '#2196F3'
                          }
                        ].map((role) => (
                          <TableRow key={role.name} hover>
                            <TableCell>
                              <Box display="flex" alignItems="center">
                                <Box 
                                  sx={{ 
                                    width: 12, 
                                    height: 12, 
                                    borderRadius: '50%', 
                                    bgcolor: role.color,
                                    mr: 2 
                                  }} 
                                />
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                  {role.name}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" color="textSecondary">
                                {role.description}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={`${role.users} users`}
                                size="small"
                                sx={{ 
                                  bgcolor: role.color + '20',
                                  color: role.color,
                                  fontWeight: 600
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {role.permissions}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Box display="flex" gap={1}>
                                <IconButton size="small" sx={{ color: '#2196F3' }}>
                                  <EditIcon fontSize="small" />
                                </IconButton>
                                <IconButton size="small" sx={{ color: '#4CAF50' }}>
                                  <SecurityIcon fontSize="small" />
                                </IconButton>
                                {role.name !== 'Super Admin' && (
                                  <IconButton size="small" sx={{ color: '#F44336' }}>
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                )}
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </AnalyticsCard>
            </Grid>

            {/* Permission Matrix */}
            <Grid item xs={12}>
              <AnalyticsCard>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>Permission Matrix</Typography>
                  <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid #e0e0e0' }}>
                    <Table size="small">
                      <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600 }}>Module</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 600 }}>Super Admin</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 600 }}>Admin</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 600 }}>Manager</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 600 }}>Employee</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 600 }}>Viewer</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {[
                          { module: 'Users Management', permissions: [true, true, false, false, false] },
                          { module: 'HR Management', permissions: [true, true, true, false, false] },
                          { module: 'Finance', permissions: [true, true, true, false, true] },
                          { module: 'Inventory', permissions: [true, true, true, true, true] },
                          { module: 'Sales', permissions: [true, true, true, true, true] },
                          { module: 'Procurement', permissions: [true, true, true, false, true] },
                          { module: 'Warehouse', permissions: [true, true, true, true, true] },
                          { module: 'Reporting', permissions: [true, true, true, false, true] }
                        ].map((item) => (
                          <TableRow key={item.module} hover>
                            <TableCell sx={{ fontWeight: 600 }}>
                              {item.module}
                            </TableCell>
                            {item.permissions.map((hasPermission, index) => (
                              <TableCell key={index} align="center">
                                {hasPermission ? (
                                  <CheckCircleIcon sx={{ color: '#4CAF50', fontSize: 20 }} />
                                ) : (
                                  <CancelIcon sx={{ color: '#F44336', fontSize: 20 }} />
                                )}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </AnalyticsCard>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Analytics Tab */}
        <TabPanel value={tabValue} index={3}>
          <Grid container spacing={3}>
            {/* User Activity Overview */}
            <Grid item xs={12} md={6}>
              <AnalyticsCard>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <TrendingUpIcon sx={{ color: '#4CAF50', mr: 1 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>User Activity</Typography>
                  </Box>
                  <Box display="flex" flexDirection="column" gap={2}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2">Active Sessions</Typography>
                      <Typography variant="h6" sx={{ color: '#4CAF50', fontWeight: 700 }}>
                        {users.filter(u => u.is_active).length}
                      </Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2">Recent Logins (24h)</Typography>
                      <Typography variant="h6" sx={{ color: '#2196F3', fontWeight: 700 }}>
                        {users.filter(u => u.lastLogin !== 'Never').length}
                      </Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2">Failed Login Attempts</Typography>
                      <Typography variant="h6" sx={{ color: '#FF5722', fontWeight: 700 }}>0</Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2">Password Resets (7d)</Typography>
                      <Typography variant="h6" sx={{ color: '#FF9800', fontWeight: 700 }}>2</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </AnalyticsCard>
            </Grid>

            {/* Security Metrics */}
            <Grid item xs={12} md={6}>
              <AnalyticsCard>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <SecurityIcon sx={{ color: '#F44336', mr: 1 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>Security Metrics</Typography>
                  </Box>
                  <Box display="flex" flexDirection="column" gap={2}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2">2FA Enabled Users</Typography>
                      <Typography variant="h6" sx={{ color: '#4CAF50', fontWeight: 700 }}>
                        {Math.floor(users.length * 0.6)}
                      </Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2">Strong Passwords</Typography>
                      <Typography variant="h6" sx={{ color: '#4CAF50', fontWeight: 700 }}>
                        {Math.floor(users.length * 0.8)}
                      </Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2">Inactive Accounts</Typography>
                      <Typography variant="h6" sx={{ color: '#FF9800', fontWeight: 700 }}>
                        {users.filter(u => !u.is_active).length}
                      </Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2">Privileged Users</Typography>
                      <Typography variant="h6" sx={{ color: '#FF5722', fontWeight: 700 }}>
                        {users.filter(u => u.role === 'admin' || u.is_superuser).length}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </AnalyticsCard>
            </Grid>

            {/* Department Analytics */}
            <Grid item xs={12} md={8}>
              <AnalyticsCard>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>Department Distribution</Typography>
                  <Box display="flex" flexDirection="column" gap={2}>
                    {['SALES', 'FINANCE', 'HR', 'OPERATIONS', 'LOGISTICS/PROCUREMENT/SUPPLY CHAIN'].map((dept) => {
                      const deptUsers = users.filter(u => u.department === dept || (dept === 'SALES' && u.department === 'Sales'));
                      const percentage = users.length > 0 ? Math.round((deptUsers.length / users.length) * 100) : 0;
                      const colors = {
                        'SALES': '#4CAF50',
                        'FINANCE': '#2196F3',
                        'HR': '#FF9800',
                        'OPERATIONS': '#9C27B0',
                        'LOGISTICS/PROCUREMENT/SUPPLY CHAIN': '#607D8B'
                      };
                      
                      return (
                        <Box key={dept}>
                          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {dept}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              {deptUsers.length} users ({percentage}%)
                            </Typography>
                          </Box>
                          <LinearProgress 
                            variant="determinate" 
                            value={percentage} 
                            sx={{ 
                              height: 8, 
                              borderRadius: 4,
                              bgcolor: colors[dept] + '20',
                              '& .MuiLinearProgress-bar': {
                                bgcolor: colors[dept],
                                borderRadius: 4
                              }
                            }}
                          />
                        </Box>
                      );
                    })}
                  </Box>
                </CardContent>
              </AnalyticsCard>
            </Grid>

            {/* Recent Activity */}
            <Grid item xs={12} md={4}>
              <AnalyticsCard>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Recent Activity</Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText 
                        primary="User Created"
                        secondary="edmondsekyere@gmail.com - 2 hours ago"
                        primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                        secondaryTypographyProps={{ variant: 'caption' }}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Role Updated"
                        secondary="arkucollins@gmail.com - 4 hours ago"
                        primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                        secondaryTypographyProps={{ variant: 'caption' }}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Password Reset"
                        secondary="admin@smarterp.com - 1 day ago"
                        primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                        secondaryTypographyProps={{ variant: 'caption' }}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Department Assigned"
                        secondary="edmondsekyere@gmail.com - 1 day ago"
                        primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                        secondaryTypographyProps={{ variant: 'caption' }}
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </AnalyticsCard>
            </Grid>

            {/* Login Analytics Chart */}
            <Grid item xs={12}>
              <AnalyticsCard>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>Login Activity (Last 7 Days)</Typography>
                  <Box display="flex" alignItems="end" gap={1} height={200}>
                    {[45, 52, 38, 61, 42, 55, 48].map((value, index) => (
                      <Box key={index} display="flex" flexDirection="column" alignItems="center" flex={1}>
                        <Box 
                          sx={{ 
                            width: '100%',
                            height: `${(value / 70) * 160}px`,
                            bgcolor: '#00BCD4',
                            borderRadius: '4px 4px 0 0',
                            mb: 1,
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              bgcolor: '#0097A7',
                              transform: 'scaleY(1.1)'
                            }
                          }}
                        />
                        <Typography variant="caption" color="textSecondary">
                          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index]}
                        </Typography>
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>
                          {value}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
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
          >
            <MenuItem value="">Select Department</MenuItem>
            {departments.map((department) => (
              <MenuItem key={department.id} value={department.id}>
                {department.name}
              </MenuItem>
            ))}
          </TextField>
          {(userForm.department == 2 || (departments.find(d => d.id == userForm.department)?.name === 'Sales')) && (
            <TextField
              fullWidth
              select
              label="Assigned Warehouse"
              value={userForm.assignedWarehouse}
              onChange={(e) => setUserForm({...userForm, assignedWarehouse: e.target.value})}
              margin="normal"
            >
              <MenuItem value="">No Warehouse Assignment</MenuItem>
              {warehouses.map((warehouse) => (
                <MenuItem key={warehouse.id} value={warehouse.id}>
                  {warehouse.name}
                </MenuItem>
              ))}
            </TextField>
          )}
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
          {!userForm.generatePassword && (
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={userForm.password}
              onChange={(e) => setUserForm({...userForm, password: e.target.value})}
              margin="normal"
              required
              helperText="Enter a secure password for the user"
            />
          )}
          <FormControlLabel
            control={
              <Checkbox
                checked={userForm.sendEmail}
                onChange={(e) => setUserForm({...userForm, sendEmail: e.target.checked})}
                color="primary"
              />
            }
            label="Send password to user's email address"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUserDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddUser} variant="contained">Add User</Button>
        </DialogActions>
      </Dialog>
      
      {/* Edit User Dialog */}
      <Dialog open={editUserDialogOpen} onClose={() => setEditUserDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Full Name"
            value={editingUser?.first_name + ' ' + editingUser?.last_name}
            onChange={(e) => {
              const [firstName, lastName] = e.target.value.split(' ');
              setEditingUser({...editingUser, first_name: firstName, last_name: lastName});
            }}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Email"
            value={editingUser?.email}
            onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
            margin="normal"
            type="email"
          />
          <TextField
            fullWidth
            select
            label="Role"
            value={editingUser?.role}
            onChange={(e) => setEditingUser({...editingUser, role: e.target.value})}
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
            value={editingUser?.department_id}
            onChange={(e) => setEditingUser({...editingUser, department_id: e.target.value})}
            margin="normal"
          >
            <MenuItem value="">Select Department</MenuItem>
            {departments.map((department) => (
              <MenuItem key={department.id} value={department.id}>
                {department.name}
              </MenuItem>
            ))}
          </TextField>
          {editingUser?.department_id === 2 && (
            <TextField
              fullWidth
              select
              label="Assigned Warehouse"
              value={editingUser?.assigned_warehouse_id}
              onChange={(e) => setEditingUser({...editingUser, assigned_warehouse_id: e.target.value})}
              margin="normal"
            >
              <MenuItem value="">No Warehouse Assignment</MenuItem>
              {warehouses.map((warehouse) => (
                <MenuItem key={warehouse.id} value={warehouse.id}>
                  {warehouse.name}
                </MenuItem>
              ))}
            </TextField>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditUserDialogOpen(false)}>Cancel</Button>
          <Button onClick={async () => {
            try {
              const response = await api.put(`/users/${editingUser.id}/update/`, {
                first_name: editingUser.first_name,
                last_name: editingUser.last_name,
                email: editingUser.email,
                role: editingUser.role,
                department_id: editingUser.department_id,
                assigned_warehouse_id: editingUser.department_id === 2 ? editingUser.assigned_warehouse_id : null
              });
              const data = response.data;
              if (response.status === 200) {
                await fetchUsers();
                setSnackbarMessage(data.message || 'User updated successfully');
                setSnackbarOpen(true);
              } else {
                setSnackbarMessage(data.error || 'Failed to update user');
                setSnackbarOpen(true);
              }
            } catch (error) {
              console.error('User update error:', error);
              setSnackbarMessage('Error updating user. Please try again.');
              setSnackbarOpen(true);
            } finally {
              setEditUserDialogOpen(false);
            }
          }} variant="contained">Update User</Button>
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
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRoleDialogOpen(false)}>Cancel</Button>
          <Button onClick={() => {
            setSnackbarMessage('Role management coming soon!');
            setSnackbarOpen(true);
            setRoleDialogOpen(false);
          }} variant="contained">
            Update Role
          </Button>
        </DialogActions>
      </Dialog>
      
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

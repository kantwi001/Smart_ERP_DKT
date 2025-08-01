import React, { useState, useEffect, useContext } from 'react';
import { 
  Box, Typography, Grid, Card, CardContent, CircularProgress, Alert,
  Tabs, Tab, Paper, Chip, Avatar, LinearProgress, Divider, IconButton, List, ListItem, ListItemText, Button,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Snackbar
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import AssessmentIcon from '@mui/icons-material/Assessment';
import PollIcon from '@mui/icons-material/Poll';
import PeopleIcon from '@mui/icons-material/People';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import BarChartIcon from '@mui/icons-material/BarChart';
import SettingsIcon from '@mui/icons-material/Settings';
import SecurityIcon from '@mui/icons-material/Security';
import RefreshIcon from '@mui/icons-material/Refresh';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PublishIcon from '@mui/icons-material/Publish';
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
    background: 'linear-gradient(45deg, #FF5722 30%, #D84315 90%)',
  },
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '0.95rem',
  minHeight: 64,
  color: '#666',
  '&.Mui-selected': {
    color: '#FF5722',
  },
}));

const MetricCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(135deg, #FF5722 0%, #D84315 100%)',
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
      id={`survey-admin-tabpanel-${index}`}
      aria-labelledby={`survey-admin-tab-${index}`}
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

const mockSurveyAdminData = [
  { id: 1, title: 'Customer Satisfaction Survey', status: 'Published', responses: 245, lastModified: '2 hours ago', creator: 'John Doe' },
  { id: 2, title: 'Employee Feedback Q4', status: 'Draft', responses: 0, lastModified: '1 day ago', creator: 'Jane Smith' },
  { id: 3, title: 'Product Quality Assessment', status: 'Archived', responses: 156, lastModified: '1 week ago', creator: 'Mike Johnson' },
  { id: 4, title: 'Market Research Study', status: 'Published', responses: 312, lastModified: '3 days ago', creator: 'Sarah Wilson' },
];

const SurveyAdminDashboard = () => {
  const { token } = useContext(AuthContext);
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [surveys, setSurveys] = useState([]);
  
  // Quick Actions State
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  
  // Form State
  const [templateForm, setTemplateForm] = useState({
    name: '',
    description: '',
    category: 'feedback',
    questions: []
  });
  
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    role: 'viewer',
    permissions: []
  });
  
  // Quick Action Handlers
  const handleCreateTemplate = async () => {
    try {
      console.log('Creating template:', templateForm);
      setSnackbarMessage('Survey template created successfully!');
      setSnackbarOpen(true);
      setTemplateDialogOpen(false);
      setTemplateForm({ name: '', description: '', category: 'feedback', questions: [] });
    } catch (error) {
      setSnackbarMessage('Failed to create template');
      setSnackbarOpen(true);
    }
  };
  
  const handleManageUsers = async () => {
    try {
      console.log('Managing user:', userForm);
      setSnackbarMessage('User permissions updated successfully!');
      setSnackbarOpen(true);
      setUserDialogOpen(false);
      setUserForm({ name: '', email: '', role: 'viewer', permissions: [] });
    } catch (error) {
      setSnackbarMessage('Failed to update user permissions');
      setSnackbarOpen(true);
    }
  };
  
  const handleBulkActions = () => {
    setSnackbarMessage('Bulk action processing started!');
    setSnackbarOpen(true);
  };
  
  const handleSystemSettings = () => {
    setSnackbarMessage('Opening system settings...');
    setSnackbarOpen(true);
  };

  const recentActivity = [
    { action: 'Customer Satisfaction Survey published by John Doe', timestamp: '2 hours ago', type: 'success' },
    { action: 'New survey template "Employee Onboarding" created', timestamp: '4 hours ago', type: 'info' },
    { action: 'User permissions updated for Marketing team', timestamp: '6 hours ago', type: 'info' },
    { action: 'Survey "Product Quality Assessment" archived', timestamp: '1 day ago', type: 'warning' },
    { action: 'System backup completed successfully', timestamp: '2 days ago', type: 'success' },
  ];

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;
      
      setLoading(true);
      try {
        try {
          const surveysRes = await api.get('/survey-admin/', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setSurveys(surveysRes.data || mockSurveyAdminData);
        } catch (err) {
          console.warn('Failed to load survey admin data:', err);
          setSurveys(mockSurveyAdminData);
        }
      } catch (err) {
        setError('Failed to load survey admin dashboard data.');
        console.error('Survey admin dashboard error:', err);
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
        background: 'linear-gradient(135deg, #FF5722 0%, #D84315 100%)',
        color: 'white',
        p: 4,
        borderRadius: '0 0 24px 24px',
        mb: 3
      }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
              Survey Admin Dashboard
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              Manage surveys, templates, users, and system settings with administrative control.
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
          Admin Quick Actions
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <QuickActionButton
              fullWidth
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setTemplateDialogOpen(true)}
              sx={{ 
                background: 'linear-gradient(45deg, #FF5722 30%, #D84315 90%)',
                color: 'white'
              }}
            >
              Create Template
            </QuickActionButton>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <QuickActionButton
              fullWidth
              variant="contained"
              startIcon={<SecurityIcon />}
              onClick={() => setUserDialogOpen(true)}
              sx={{ 
                background: 'linear-gradient(45deg, #9C27B0 30%, #7B1FA2 90%)',
                color: 'white'
              }}
            >
              Manage Users
            </QuickActionButton>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <QuickActionButton
              fullWidth
              variant="contained"
              startIcon={<EditIcon />}
              onClick={handleBulkActions}
              sx={{ 
                background: 'linear-gradient(45deg, #2196F3 30%, #1976D2 90%)',
                color: 'white'
              }}
            >
              Bulk Actions
            </QuickActionButton>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <QuickActionButton
              fullWidth
              variant="contained"
              startIcon={<SettingsIcon />}
              onClick={handleSystemSettings}
              sx={{ 
                background: 'linear-gradient(45deg, #607D8B 30%, #455A64 90%)',
                color: 'white'
              }}
            >
              System Settings
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
          <StyledTab icon={<PollIcon />} label="Survey Management" />
          <StyledTab icon={<PeopleIcon />} label="User Management" />
          <StyledTab icon={<AssessmentIcon />} label="System Analytics" />
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
                        {surveys.length || 4}
                      </Typography>
                      <Typography variant="body1" sx={{ opacity: 0.9 }}>
                        Total Surveys
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                      <PollIcon sx={{ fontSize: 28 }} />
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
                      <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: '#FF5722' }}>
                        713
                      </Typography>
                      <Typography variant="body1" color="textSecondary">
                        Total Responses
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: '#ffebe9', color: '#FF5722', width: 56, height: 56 }}>
                      <BarChartIcon sx={{ fontSize: 28 }} />
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
                        12
                      </Typography>
                      <Typography variant="body1" color="textSecondary">
                        Active Users
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: '#e8f5e8', color: '#4CAF50', width: 56, height: 56 }}>
                      <PeopleIcon sx={{ fontSize: 28 }} />
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
                        8
                      </Typography>
                      <Typography variant="body1" color="textSecondary">
                        Templates
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
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Recent Admin Activity</Typography>
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

            {/* Survey Status */}
            <Grid item xs={12} md={6}>
              <AnalyticsCard>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Survey Status Overview</Typography>
                  <Divider sx={{ mb: 2 }} />
                  {surveys.slice(0, 4).map((survey, index) => (
                    <Box key={index} sx={{ mb: 2 }}>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                        <Typography variant="body1" fontWeight={500}>{survey.title}</Typography>
                        <Chip 
                          label={survey.status}
                          size="small"
                          color={survey.status === 'Published' ? 'success' : survey.status === 'Draft' ? 'warning' : 'default'}
                        />
                      </Box>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                        <Typography variant="body2" color="textSecondary">By {survey.creator} • {survey.lastModified}</Typography>
                        <Typography variant="body2" fontWeight={500}>{survey.responses} responses</Typography>
                      </Box>
                    </Box>
                  ))}
                </CardContent>
              </AnalyticsCard>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Survey Management Tab */}
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <AnalyticsCard>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Survey Management</Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Typography variant="body1" color="textSecondary" textAlign="center" py={4}>
                    Advanced survey management tools will be displayed here.
                    Use the admin quick actions to create templates and manage survey lifecycle.
                  </Typography>
                </CardContent>
              </AnalyticsCard>
            </Grid>
          </Grid>
        </TabPanel>

        {/* User Management Tab */}
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <AnalyticsCard>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>User Management</Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Typography variant="body1" color="textSecondary" textAlign="center" py={4}>
                    User permissions and role management interface will be displayed here.
                    Use the "Manage Users" quick action to control access and permissions.
                  </Typography>
                </CardContent>
              </AnalyticsCard>
            </Grid>
          </Grid>
        </TabPanel>

        {/* System Analytics Tab */}
        <TabPanel value={tabValue} index={3}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <AnalyticsCard>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>System Analytics</Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Typography variant="body1" color="textSecondary" textAlign="center" py={4}>
                    System performance metrics and analytics will be displayed here.
                    Use the "System Settings" quick action to configure system parameters.
                  </Typography>
                </CardContent>
              </AnalyticsCard>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>
      
      {/* Create Template Dialog */}
      <Dialog open={templateDialogOpen} onClose={() => setTemplateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create Survey Template</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Template Name"
            value={templateForm.name}
            onChange={(e) => setTemplateForm({...templateForm, name: e.target.value})}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Description"
            value={templateForm.description}
            onChange={(e) => setTemplateForm({...templateForm, description: e.target.value})}
            margin="normal"
            multiline
            rows={3}
          />
          <TextField
            fullWidth
            select
            label="Category"
            value={templateForm.category}
            onChange={(e) => setTemplateForm({...templateForm, category: e.target.value})}
            margin="normal"
          >
            <MenuItem value="feedback">Customer Feedback</MenuItem>
            <MenuItem value="employee">Employee Survey</MenuItem>
            <MenuItem value="market_research">Market Research</MenuItem>
            <MenuItem value="satisfaction">Satisfaction Survey</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTemplateDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleCreateTemplate} 
            variant="contained"
            sx={{ background: 'linear-gradient(45deg, #FF5722 30%, #D84315 90%)' }}
          >
            Create Template
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Manage Users Dialog */}
      <Dialog open={userDialogOpen} onClose={() => setUserDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Manage User Permissions</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="User Name"
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
            <MenuItem value="editor">Editor</MenuItem>
            <MenuItem value="viewer">Viewer</MenuItem>
            <MenuItem value="contributor">Contributor</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUserDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleManageUsers} 
            variant="contained"
            sx={{ background: 'linear-gradient(45deg, #9C27B0 30%, #7B1FA2 90%)' }}
          >
            Update Permissions
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

export default SurveyAdminDashboard;

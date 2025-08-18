                      import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Avatar,
  Chip,
  IconButton,
  Collapse,
  Divider,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar
} from '@mui/material';
import {
  EmojiEvents,
  Campaign,
  CalendarMonth,
  ExpandMore,
  ExpandLess,
  AttachMoney,
  Person,
  Business,
  Add,
  TrendingUp,
  Assignment,
  AccountCircle,
  ListAlt
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';

const WelcomeCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  borderRadius: 16,
  minHeight: 120,
}));

const PayslipsCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  color: 'white',
  borderRadius: 16,
  minHeight: 120,
}));

const FeatureCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  minHeight: 140,
  transition: 'transform 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
  },
}));

const AwardsCard = styled(FeatureCard)(({ theme }) => ({
  background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  color: 'white',
}));

const AnnouncementsCard = styled(FeatureCard)(({ theme }) => ({
  background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
  color: '#333',
}));

const HolidaysCard = styled(FeatureCard)(({ theme }) => ({
  background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
  color: '#333',
}));

const QuickActionsCard = styled(Card)(({ theme }) => ({
  backgroundColor: 'white',
  borderRadius: 16,
  boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
  marginTop: theme.spacing(3),
}));

const ActionButton = styled(Button)(({ theme, variant }) => ({
  borderRadius: 12,
  textTransform: 'none',
  fontWeight: 600,
  padding: '12px 24px',
  ...(variant === 'primary' && {
    background: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
    color: 'white',
    '&:hover': {
      background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
    }
  }),
  ...(variant === 'secondary' && {
    background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
    color: 'white',
    '&:hover': {
      background: 'linear-gradient(135deg, #f57c00 0%, #ef6c00 100%)',
    }
  }),
  ...(variant === 'outline' && {
    border: '2px solid #2196f3',
    color: '#2196f3',
    backgroundColor: 'transparent',
    '&:hover': {
      backgroundColor: 'rgba(33, 150, 243, 0.1)',
    }
  })
}));

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [viewRequestsOpen, setViewRequestsOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [employeeData, setEmployeeData] = useState({
    user: {
      first_name: '',
      last_name: '',
      email: '',
      employee_id: '',
      role: '',
      department: null,
      department_name: '',
      phone: '',
      profile_picture_url: null
    },
    stats: {
      awards: 0,
      announcements: 0,
      holidays: 0,
      payslips: 0
    },
    leaveBalance: {
      total: 0,
      used: 0,
      remaining: 0
    },
    recentActivity: [],
    pendingRequests: [],
    allRequests: []
  });

  useEffect(() => {
    fetchEmployeeData();
  }, []);

  const fetchEmployeeData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.log('No token found, redirecting to login');
        navigate('/login');
        return;
      }

      console.log('Starting API calls...');
      console.log('Token exists:', !!token);
      console.log('Token preview:', token.substring(0, 20) + '...');

      // Check if we can reach the backend first
      const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:2025';
      console.log('Using API base URL:', baseURL);

      // Test basic connectivity first
      console.log('Testing basic connectivity...');
      try {
        const testResponse = await fetch(`${baseURL}/`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        console.log('Basic connectivity test status:', testResponse.status);
        console.log('Basic connectivity test headers:', Object.fromEntries(testResponse.headers.entries()));
        
        if (testResponse.ok) {
          const testData = await testResponse.json();
          console.log('Backend is responding:', testData.message);
        }
      } catch (testError) {
        console.error('Basic connectivity test failed:', testError);
        throw new Error(`Cannot reach backend server at ${baseURL}. Error: ${testError.message}`);
      }

      // Fetch user profile data
      console.log('Attempting to fetch user profile...');
      const userResponse = await fetch(`${baseURL}/api/users/me/`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('User API status:', userResponse.status);
      console.log('User API headers:', Object.fromEntries(userResponse.headers.entries()));
      console.log('User API content-type:', userResponse.headers.get('content-type'));
      
      if (userResponse.ok) {
        const contentType = userResponse.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const userData = await userResponse.json();
          console.log('User data received:', userData);
          setEmployeeData(prev => ({
            ...prev,
            user: userData
          }));
        } else {
          console.error('User API returned non-JSON response');
          const responseText = await userResponse.text();
          console.error('Response content:', responseText.substring(0, 200));
          throw new Error('Server returned HTML instead of JSON - check if backend is running');
        }
      } else if (userResponse.status === 401) {
        console.log('Token appears to be invalid or expired');
        localStorage.removeItem('token');
        navigate('/login');
        return;
      } else {
        console.error('User API failed:', userResponse.status);
        const responseText = await userResponse.text();
        console.error('Error response:', responseText.substring(0, 200));
        
        if (responseText.includes('<!DOCTYPE')) {
          throw new Error('Backend server not responding - check if Django server is running on port 2025');
        }
        
        throw new Error(`API request failed with status ${userResponse.status}: ${responseText.substring(0, 100)}`);
      }

      // Try other APIs but don't fail if they're not available
      let allRequests = [];
      let recentActivity = [];
      let pendingRequests = [];
      let leaveBalance = { total: 0, used: 0, remaining: 0 };
      let announcements = [];
      let payslips = [];

      // Helper function to safely fetch and parse JSON
      const safeFetch = async (url, options) => {
        try {
          const response = await fetch(url, options);
          if (response.ok) {
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
              return await response.json();
            } else {
              console.log(`${url} returned non-JSON response`);
              return null;
            }
          } else {
            console.log(`${url} failed with status:`, response.status);
            return null;
          }
        } catch (error) {
          console.log(`${url} error:`, error.message);
          return null;
        }
      };

      // Fetch leave requests
      const leaveData = await safeFetch(`${baseURL}/api/hr/leave-requests/`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (leaveData && leaveData.results) {
        const leaveRequests = leaveData.results;
        allRequests = [...allRequests, ...leaveRequests.map(req => ({ ...req, type: 'leave' }))];
        recentActivity = [...recentActivity, ...leaveRequests.slice(0, 2).map(req => ({ ...req, type: 'leave' }))];
        pendingRequests = [...pendingRequests, ...leaveRequests.filter(req => req.status === 'pending').map(req => ({ ...req, type: 'leave' }))];
      }

      // Fetch leave balance
      const balanceData = await safeFetch(`${baseURL}/api/hr/leave-balance/`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (balanceData) {
        leaveBalance = balanceData;
      }

      // Fetch procurement requests
      const procurementData = await safeFetch(`${baseURL}/api/procurement/requests/`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (procurementData && procurementData.results) {
        const procRequests = procurementData.results;
        allRequests = [...allRequests, ...procRequests.map(req => ({ ...req, type: 'procurement' }))];
        recentActivity = [...recentActivity, ...procRequests.slice(0, 1).map(req => ({ ...req, type: 'procurement' }))];
        pendingRequests = [...pendingRequests, ...procRequests.filter(req => req.status === 'pending').map(req => ({ ...req, type: 'procurement' }))];
      }

      // Fetch announcements
      const announcementData = await safeFetch(`${baseURL}/api/hr/announcements/`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (announcementData && announcementData.results) {
        announcements = announcementData.results;
      }

      // Fetch payslips
      const payslipData = await safeFetch(`${baseURL}/api/hr/payslips/`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (payslipData && payslipData.results) {
        payslips = payslipData.results;
      }

      setEmployeeData(prev => ({
        ...prev,
        leaveBalance,
        recentActivity: recentActivity.slice(0, 3),
        pendingRequests: pendingRequests.slice(0, 3),
        allRequests,
        stats: {
          awards: 0,
          announcements: announcements.length,
          holidays: 0,
          payslips: payslips.length
        }
      }));

      console.log('Dashboard data loaded successfully');

    } catch (error) {
      console.error('Critical error:', error);
      
      if (error.message.includes('HTML instead of JSON') || error.message.includes('Backend server not responding')) {
        setSnackbar({
          open: true,
          message: 'Backend server is not running. Please start the Django server on port 2025.',
          severity: 'error'
        });
      } else if (error instanceof TypeError && error.message.includes('fetch')) {
        setSnackbar({
          open: true,
          message: 'Cannot connect to server. Please check your network connection.',
          severity: 'error'
        });
      } else {
        setSnackbar({
          open: true,
          message: `Error loading dashboard: ${error.message}`,
          severity: 'error'
        });
      }
      
      // Set fallback data on critical error
      setEmployeeData(prev => ({
        ...prev,
        user: {
          first_name: 'User',
          last_name: '',
          email: 'user@company.com',
          employee_id: 'EMP-001',
          role: 'Employee',
          department: null,
          department_name: 'General',
          phone: '',
          profile_picture_url: null
        }
      }));
    } finally {
      setLoading(false);
    }
  };

  const getCurrentDate = () => {
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date().toLocaleDateString('en-US', options);
  };

  const handleClockIn = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/hr/attendance/clock-in/', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setSnackbar({
          open: true,
          message: 'Successfully clocked in!',
          severity: 'success'
        });
      } else {
        const errorData = await response.json();
        setSnackbar({
          open: true,
          message: errorData.message || 'Failed to clock in',
          severity: 'error'
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error clocking in. Please try again.',
        severity: 'error'
      });
    }
  };

  const handleRequestLeave = () => {
    navigate('/leave-request');
  };

  const handleProcurementRequest = () => {
    navigate('/procurement-request');
  };

  const handleViewRequests = () => {
    setViewRequestsOpen(true);
  };

  const handleUpdateProfile = () => {
    navigate('/profile');
  };

  const handleMyTasks = () => {
    navigate('/tasks');
  };

  const handleViewPayslips = () => {
    navigate('/payslips');
  };

  const handleViewAwards = () => {
    navigate('/awards');
  };

  const handleViewAnnouncements = () => {
    navigate('/announcements');
  };

  const handleViewHolidays = () => {
    navigate('/holidays');
  };

  const formatRequestDisplay = (request) => {
    if (request.type === 'leave') {
      return {
        title: `${request.leave_type} Request`,
        subtitle: `${request.start_date} - ${request.end_date}`,
        status: request.status
      };
    } else if (request.type === 'procurement') {
      return {
        title: `Procurement Request`,
        subtitle: `${request.item_description || 'N/A'} - $${request.estimated_cost || '0'}`,
        status: request.status
      };
    }
    return { title: 'Request', subtitle: '', status: 'pending' };
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 2, mb: 4 }}>
      {/* Profile Header */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        mb: 3,
        p: 2,
        backgroundColor: 'white',
        borderRadius: 2,
        boxShadow: 1
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar 
            sx={{ 
              width: 80, 
              height: 80, 
              mr: 2,
              backgroundColor: '#2196f3'
            }}
          >
            <Person sx={{ fontSize: 40 }} />
          </Avatar>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#333' }}>
              {employeeData.user.first_name && employeeData.user.last_name 
                ? `${employeeData.user.first_name.toUpperCase()} ${employeeData.user.last_name.toUpperCase()}` 
                : 'USER'} ({employeeData.user.email || 'user@company.com'})
            </Typography>
            <Typography variant="body1" sx={{ color: '#666', mb: 1 }}>
              {employeeData.user.role || 'Employee'}, {employeeData.user.department_name || 'General'}
            </Typography>
            <Typography variant="body2" sx={{ color: '#999' }}>
              Last Login: {new Date().toLocaleDateString()} - {new Date().toLocaleTimeString()}
            </Typography>
            <Typography variant="body2" sx={{ color: '#999' }}>
              My Office Shift: 08:30AM To 05:30PM (General Shift)
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Business sx={{ mr: 1, color: '#666' }} />
          <Typography variant="body2" sx={{ color: '#666' }}>Company Logo</Typography>
        </Box>
        <Box>
          <Button 
            variant="outlined" 
            color="error" 
            size="small"
            sx={{ mr: 1 }}
            onClick={handleUpdateProfile}
          >
            PROFILE
          </Button>
          <Button 
            variant="contained" 
            color="success" 
            size="small"
            onClick={handleClockIn}
          >
            CLOCK IN
          </Button>
        </Box>
      </Box>

      {/* Main Content Grid */}
      <Grid container spacing={3}>
        {/* Welcome Card */}
        <Grid item xs={12} md={8}>
          <WelcomeCard>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Welcome back, {employeeData.user.first_name || 'User'}! 👋
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9 }}>
                    {getCurrentDate()}
                  </Typography>
                </Box>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  borderRadius: '50px',
                  p: 2
                }}>
                  <Person sx={{ mr: 1 }} />
                  <Box>
                    <Typography variant="caption" sx={{ opacity: 0.8 }}>
                      Employee
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      ID: {employeeData.user.employee_id || 'EMP-001'}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </WelcomeCard>
        </Grid>

        {/* Payslips Card */}
        <Grid item xs={12} md={4}>
          <PayslipsCard sx={{ cursor: 'pointer' }} onClick={handleViewPayslips}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AttachMoney sx={{ fontSize: 40, mr: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {employeeData.stats.payslips}
                </Typography>
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                Payslips
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, mb: 2 }}>
                View your salary details and download payslips
              </Typography>
              <Button 
                variant="outlined" 
                size="small"
                sx={{ 
                  color: 'white', 
                  borderColor: 'white',
                  '&:hover': { 
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    borderColor: 'white'
                  }
                }}
              >
                View Details →
              </Button>
            </CardContent>
          </PayslipsCard>
        </Grid>

        {/* Feature Cards Row */}
        <Grid item xs={12} md={4}>
          <AwardsCard sx={{ cursor: 'pointer' }} onClick={handleViewAwards}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <EmojiEvents sx={{ fontSize: 40, mr: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {employeeData.stats.awards}
                </Typography>
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                Awards
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, mb: 2 }}>
                Your achievements and recognition
              </Typography>
              <Button 
                variant="outlined" 
                size="small"
                sx={{ 
                  color: 'white', 
                  borderColor: 'white',
                  '&:hover': { 
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    borderColor: 'white'
                  }
                }}
              >
                View Details →
              </Button>
            </CardContent>
          </AwardsCard>
        </Grid>

        <Grid item xs={12} md={4}>
          <AnnouncementsCard sx={{ cursor: 'pointer' }} onClick={handleViewAnnouncements}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Campaign sx={{ fontSize: 40, mr: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {employeeData.stats.announcements}
                </Typography>
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                Announcements
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8, mb: 2 }}>
                Latest updates from HR team
              </Typography>
              <Button 
                variant="outlined" 
                size="small"
                sx={{ 
                  color: '#333', 
                  borderColor: '#333',
                  '&:hover': { 
                    backgroundColor: 'rgba(0,0,0,0.1)',
                    borderColor: '#333'
                  }
                }}
              >
                View Details →
              </Button>
            </CardContent>
          </AnnouncementsCard>
        </Grid>

        <Grid item xs={12} md={4}>
          <HolidaysCard sx={{ cursor: 'pointer' }} onClick={handleViewHolidays}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CalendarMonth sx={{ fontSize: 40, mr: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {employeeData.stats.holidays}
                </Typography>
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                Holidays
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8, mb: 2 }}>
                Upcoming holidays and events
              </Typography>
              <Button 
                variant="outlined" 
                size="small"
                sx={{ 
                  color: '#333', 
                  borderColor: '#333',
                  '&:hover': { 
                    backgroundColor: 'rgba(0,0,0,0.1)',
                    borderColor: '#333'
                  }
                }}
              >
                View Details →
              </Button>
            </CardContent>
          </HolidaysCard>
        </Grid>
      </Grid>

      {/* Personal Leave Remaining */}
      <Card sx={{ mt: 3, borderRadius: 2, boxShadow: 1 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#666' }}>
            Personal Leave Remaining
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2196f3', mr: 2 }}>
              {employeeData.leaveBalance.remaining}
            </Typography>
            <Typography variant="body1" sx={{ color: '#666' }}>
              days remaining out of {employeeData.leaveBalance.total} total days
            </Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={employeeData.leaveBalance.total > 0 ? (employeeData.leaveBalance.used / employeeData.leaveBalance.total) * 100 : 0}
            sx={{ 
              height: 8, 
              borderRadius: 4,
              backgroundColor: '#e3f2fd',
              '& .MuiLinearProgress-bar': {
                backgroundColor: '#2196f3'
              }
            }}
          />
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <QuickActionsCard sx={{ mt: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3, color: '#333' }}>
            Quick Actions
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <ActionButton variant="primary" fullWidth startIcon={<Add />} onClick={handleRequestLeave}>
                Request Leave
              </ActionButton>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <ActionButton variant="secondary" fullWidth startIcon={<Assignment />} onClick={handleProcurementRequest}>
                Procurement Request
              </ActionButton>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <ActionButton variant="outline" fullWidth startIcon={<TrendingUp />} onClick={handleViewRequests}>
                View Requests
              </ActionButton>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <ActionButton variant="outline" fullWidth startIcon={<AccountCircle />} onClick={handleUpdateProfile}>
                Update Profile
              </ActionButton>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <ActionButton variant="outline" fullWidth startIcon={<ListAlt />} onClick={handleMyTasks}>
                My Tasks
              </ActionButton>
            </Grid>
          </Grid>
        </CardContent>
      </QuickActionsCard>

      {/* Recent Activity and Pending Requests */}
      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 2, boxShadow: 1, minHeight: 200 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#333' }}>
                Recent Activity
              </Typography>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <LinearProgress sx={{ width: '100%' }} />
                </Box>
              ) : employeeData.recentActivity.length > 0 ? (
                employeeData.recentActivity.map((activity, index) => {
                  const display = formatRequestDisplay(activity);
                  return (
                    <Box key={index} sx={{ mb: 2, pb: 2, borderBottom: '1px solid #f0f0f0' }}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#333' }}>
                        {display.title}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#666' }}>
                        {display.subtitle}
                      </Typography>
                      <Chip
                        label={display.status?.toUpperCase()} 
                        color={display.status === 'approved' ? 'success' : display.status === 'pending' ? 'warning' : 'error'}
                        sx={{ ml: 1 }}
                      />
                    </Box>
                  );
                })
              ) : (
                <Typography variant="body2" sx={{ color: '#999', textAlign: 'center', py: 4 }}>
                  No recent activity
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 2, boxShadow: 1, minHeight: 200 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#333' }}>
                Pending Requests
              </Typography>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <LinearProgress sx={{ width: '100%' }} />
                </Box>
              ) : employeeData.pendingRequests.length > 0 ? (
                employeeData.pendingRequests.map((request, index) => {
                  const display = formatRequestDisplay(request);
                  return (
                    <Box key={index} sx={{ mb: 2, pb: 2, borderBottom: '1px solid #f0f0f0' }}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#333' }}>
                        {display.title}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#666' }}>
                        {display.subtitle}
                      </Typography>
                      <Chip 
                        size="small" 
                        label="PENDING" 
                        color="warning"
                        sx={{ ml: 1 }}
                      />
                    </Box>
                  );
                })
              ) : (
                <Typography variant="body2" sx={{ color: '#999', textAlign: 'center', py: 4 }}>
                  No pending requests
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* View Requests Dialog */}
      <Dialog open={viewRequestsOpen} onClose={() => setViewRequestsOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>All Requests</DialogTitle>
        <DialogContent>
          {employeeData.allRequests.length > 0 ? (
            employeeData.allRequests.map((request, index) => {
              const display = formatRequestDisplay(request);
              return (
                <Box key={index} sx={{ 
                  border: '1px solid #e0e0e0', 
                  borderRadius: 2, 
                  mb: 2, 
                  p: 2
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        {display.title}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {display.subtitle}
                      </Typography>
                    </Box>
                    <Chip
                      label={display.status?.toUpperCase()} 
                      color={
                        display.status === 'approved' ? 'success' :
                        display.status === 'pending' ? 'warning' :
                        display.status === 'declined' ? 'error' : 'default'
                      }
                    />
                  </Box>
                </Box>
              );
            })
          ) : (
            <Typography variant="body1" sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
              No requests found
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewRequestsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default EmployeeDashboard;

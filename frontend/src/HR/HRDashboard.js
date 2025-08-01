import React, { useEffect, useState } from 'react';
import api from '../api';
import { 
  Box, Typography, Grid, Card, CardContent, CircularProgress, Alert,
  Tabs, Tab, Paper, Chip, Avatar, LinearProgress, Divider, IconButton, List, ListItem, ListItemText
} from '@mui/material';
import { styled } from '@mui/material/styles';
import PeopleIcon from '@mui/icons-material/People';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import BeachAccessIcon from '@mui/icons-material/BeachAccess';
import PaymentIcon from '@mui/icons-material/Payment';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AssessmentIcon from '@mui/icons-material/Assessment';
import GroupIcon from '@mui/icons-material/Group';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import RefreshIcon from '@mui/icons-material/Refresh';
import StarIcon from '@mui/icons-material/Star';
import WorkIcon from '@mui/icons-material/Work';

// Styled components for modern design
const StyledTabs = styled(Tabs)(({ theme }) => ({
  backgroundColor: '#fff',
  borderRadius: '12px 12px 0 0',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  '& .MuiTabs-indicator': {
    height: 3,
    borderRadius: '3px 3px 0 0',
    background: 'linear-gradient(45deg, #FF6B6B 30%, #4ECDC4 90%)',
  },
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '0.95rem',
  minHeight: 64,
  color: '#666',
  '&.Mui-selected': {
    color: '#FF6B6B',
  },
}));

const MetricCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(135deg, #FF6B6B 0%, #4ECDC4 100%)',
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

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`hr-tabpanel-${index}`}
      aria-labelledby={`hr-tab-${index}`}
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

const HRDashboard = () => {
  const [tabValue, setTabValue] = useState(0);
  const [counts, setCounts] = useState({ employees: 0, attendance: 0, leave: 0, payroll: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get('/hr/employees/').catch(e => ({ data: [] })),
      api.get('/hr/attendance/').catch(e => ({ data: [] })),
      api.get('/hr/leave-requests/').catch(e => ({ data: [] })),
      api.get('/hr/payroll/').catch(e => ({ data: [] }))
    ]).then(([emp, att, leave, pay]) => {
      setCounts({
        employees: emp.data.length,
        attendance: att.data.length,
        leave: leave.data.length,
        payroll: pay.data.length
      });
      setEmployees(emp.data.slice(0, 5) || []);
      setRecentActivity([
        { action: 'New employee onboarded', timestamp: '2 hours ago', type: 'success' },
        { action: 'Leave request approved', timestamp: '4 hours ago', type: 'info' },
        { action: 'Payroll processed', timestamp: '1 day ago', type: 'success' },
        { action: 'Performance review completed', timestamp: '2 days ago', type: 'warning' }
      ]);
      setLoading(false);
    }).catch(e => {
      setError('Failed to load HR statistics.');
      setLoading(false);
    });
  }, []);

  return (
    <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh', p: 0 }}>
      {/* Header */}
      <Box sx={{ 
        background: 'linear-gradient(135deg, #FF6B6B 0%, #4ECDC4 100%)',
        color: 'white',
        p: 4,
        borderRadius: '0 0 24px 24px',
        mb: 3
      }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
              HR Dashboard
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              Manage your workforce and human resources efficiently.
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
          <StyledTab icon={<GroupIcon />} label="Employees" />
          <StyledTab icon={<StarIcon />} label="Performance" />
          <StyledTab icon={<AssessmentIcon />} label="Reports" />
        </StyledTabs>

        {/* Overview Tab */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            {/* Key Metrics */}
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="body2" sx={{ opacity: 0.8, mb: 1 }}>Total Employees</Typography>
                      <Typography variant="h3" sx={{ fontWeight: 700 }}>
                        {counts.employees}
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
              <MetricCard sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="body2" sx={{ opacity: 0.8, mb: 1 }}>Attendance Records</Typography>
                      <Typography variant="h3" sx={{ fontWeight: 700 }}>
                        {counts.attendance}
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                      <AccessTimeIcon sx={{ fontSize: 28 }} />
                    </Avatar>
                  </Box>
                </CardContent>
              </MetricCard>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <MetricCard sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="body2" sx={{ opacity: 0.8, mb: 1 }}>Leave Requests</Typography>
                      <Typography variant="h3" sx={{ fontWeight: 700 }}>
                        {counts.leave}
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                      <BeachAccessIcon sx={{ fontSize: 28 }} />
                    </Avatar>
                  </Box>
                </CardContent>
              </MetricCard>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <MetricCard sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="body2" sx={{ opacity: 0.8, mb: 1 }}>Payroll Entries</Typography>
                      <Typography variant="h3" sx={{ fontWeight: 700 }}>
                        {counts.payroll}
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                      <PaymentIcon sx={{ fontSize: 28 }} />
                    </Avatar>
                  </Box>
                </CardContent>
              </MetricCard>
            </Grid>

            {/* Recent Activity */}
            <Grid item xs={12} md={8}>
              <AnalyticsCard>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center' }}>
                    <WorkIcon sx={{ mr: 1, color: '#FF6B6B' }} />
                    Recent HR Activity
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <List sx={{ py: 0 }}>
                    {recentActivity.map((item, idx) => (
                      <ListItem key={idx} sx={{ px: 0, py: 1 }}>
                        <ListItemText 
                          primary={item.action}
                          secondary={item.timestamp}
                          primaryTypographyProps={{ fontWeight: 500 }}
                        />
                        <Chip 
                          label={item.type === 'success' ? 'Completed' : item.type === 'info' ? 'Processed' : 'Pending'}
                          size="small" 
                          color={item.type === 'success' ? 'success' : item.type === 'info' ? 'info' : 'warning'}
                          variant="outlined" 
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </AnalyticsCard>
            </Grid>

            {/* HR Metrics */}
            <Grid item xs={12} md={4}>
              <AnalyticsCard>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>HR Metrics</Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Box sx={{ space: 2 }}>
                    <Box sx={{ mb: 2 }}>
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="body2">Employee Satisfaction</Typography>
                        <Typography variant="body2" color="success.main">85%</Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={85} color="success" sx={{ borderRadius: 1, height: 8 }} />
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="body2">Attendance Rate</Typography>
                        <Typography variant="body2" color="primary">92%</Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={92} sx={{ borderRadius: 1, height: 8 }} />
                    </Box>
                    <Box>
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="body2">Training Completion</Typography>
                        <Typography variant="body2" color="warning.main">78%</Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={78} color="warning" sx={{ borderRadius: 1, height: 8 }} />
                    </Box>
                  </Box>
                </CardContent>
              </AnalyticsCard>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Employees Tab */}
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <AnalyticsCard>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Employee Overview</Typography>
                  <Divider sx={{ mb: 2 }} />
                  {employees.length > 0 ? (
                    <List sx={{ py: 0 }}>
                      {employees.map((emp, idx) => (
                        <ListItem key={idx} sx={{ px: 0, py: 1 }}>
                          <ListItemText 
                            primary={`${emp.user?.first_name || 'N/A'} ${emp.user?.last_name || 'N/A'}`}
                            secondary={`Department: ${emp.department?.name || 'Unassigned'} | Role: ${emp.user?.role || 'N/A'}`}
                            primaryTypographyProps={{ fontWeight: 500 }}
                          />
                          <Chip label="Active" size="small" color="success" />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Alert severity="info" sx={{ borderRadius: 2 }}>No employee data available</Alert>
                  )}
                </CardContent>
              </AnalyticsCard>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Performance Tab */}
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <AnalyticsCard>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Performance Analytics</Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} md={3}>
                      <Box textAlign="center" p={2}>
                        <Avatar sx={{ bgcolor: '#e3f2fd', color: '#1976d2', width: 64, height: 64, mx: 'auto', mb: 2 }}>
                          <StarIcon sx={{ fontSize: 32 }} />
                        </Avatar>
                        <Typography variant="h4" color="primary" fontWeight={700}>4.2</Typography>
                        <Typography variant="body2" color="textSecondary">Avg Performance</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Box textAlign="center" p={2}>
                        <Avatar sx={{ bgcolor: '#f3e5f5', color: '#7b1fa2', width: 64, height: 64, mx: 'auto', mb: 2 }}>
                          <TrendingUpIcon sx={{ fontSize: 32 }} />
                        </Avatar>
                        <Typography variant="h4" color="secondary" fontWeight={700}>15%</Typography>
                        <Typography variant="body2" color="textSecondary">Growth Rate</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Box textAlign="center" p={2}>
                        <Avatar sx={{ bgcolor: '#e8f5e8', color: '#388e3c', width: 64, height: 64, mx: 'auto', mb: 2 }}>
                          <WorkIcon sx={{ fontSize: 32 }} />
                        </Avatar>
                        <Typography variant="h4" sx={{ color: '#4caf50', fontWeight: 700 }}>95%</Typography>
                        <Typography variant="body2" color="textSecondary">Goal Achievement</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Box textAlign="center" p={2}>
                        <Avatar sx={{ bgcolor: '#fff3e0', color: '#f57c00', width: 64, height: 64, mx: 'auto', mb: 2 }}>
                          <BusinessCenterIcon sx={{ fontSize: 32 }} />
                        </Avatar>
                        <Typography variant="h4" sx={{ color: '#ff9800', fontWeight: 700 }}>12</Typography>
                        <Typography variant="body2" color="textSecondary">Reviews Pending</Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </AnalyticsCard>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Reports Tab */}
        <TabPanel value={tabValue} index={3}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <AnalyticsCard>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center' }}>
                    <AssessmentIcon sx={{ mr: 1, color: '#FF6B6B' }} />
                    HR Reports & Analytics
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Box p={2} bgcolor="#f8f9fa" borderRadius={2}>
                        <Typography variant="h6" color="primary" mb={1}>Monthly Reports</Typography>
                        <Typography variant="body2" color="textSecondary">
                          Employee performance, attendance, and payroll summaries for the current month.
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Box p={2} bgcolor="#f8f9fa" borderRadius={2}>
                        <Typography variant="h6" color="secondary" mb={1}>Compliance Reports</Typography>
                        <Typography variant="body2" color="textSecondary">
                          Regulatory compliance, training completion, and certification tracking.
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </AnalyticsCard>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default HRDashboard;

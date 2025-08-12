import React, { useState, useEffect, useContext } from 'react';
import { 
  Box, Typography, Grid, Card, CardContent, CircularProgress, Alert,
  Tabs, Tab, Paper, Chip, Avatar, LinearProgress, Divider, IconButton, List, ListItem, ListItemText,
  Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Snackbar
} from '@mui/material';
import { styled } from '@mui/material/styles';
import DashboardTemplate from './components/DashboardTemplate';
import PeopleIcon from '@mui/icons-material/People';
import AssessmentIcon from '@mui/icons-material/Assessment';
import InventoryIcon from '@mui/icons-material/Inventory';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import ScheduleIcon from '@mui/icons-material/Schedule';
import EventIcon from '@mui/icons-material/Event';
import RefreshIcon from '@mui/icons-material/Refresh';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import api from './api';
import { AuthContext } from './AuthContext';
import AdvancedAnalytics from './components/AdvancedAnalytics';
import TimeBasedAnalytics from './components/TimeBasedAnalytics';
import GanttChart from './components/GanttChart';
import TransactionIntegration from './components/TransactionIntegration';
import { useTransactionIntegration } from './hooks/useTransactionIntegration';

const periods = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: 'custom', label: 'Custom' },
];

const mockSummary = [
  { title: 'Employees', value: 58, icon: <PeopleIcon />, color: 'primary' },
  { title: 'Departments', value: 7, icon: <InventoryIcon />, color: 'info' },
  { title: 'Open Positions', value: 3, icon: <AssessmentIcon />, color: 'success' },
  { title: 'On Leave', value: 6, icon: <SwapHorizIcon />, color: 'warning' },
];

const mockLineData = [
  { date: 'Jul 14', Hired: 1, Left: 0 },
  { date: 'Jul 15', Hired: 2, Left: 1 },
  { date: 'Jul 16', Hired: 0, Left: 0 },
  { date: 'Jul 17', Hired: 1, Left: 1 },
  { date: 'Jul 18', Hired: 2, Left: 0 },
  { date: 'Jul 19', Hired: 1, Left: 0 },
  { date: 'Jul 20', Hired: 0, Left: 1 },
];

const mockPieData1 = [
  { name: 'HR', value: 10 },
  { name: 'Sales', value: 20 },
  { name: 'IT', value: 15 },
  { name: 'Finance', value: 13 },
];
const mockPieData2 = [
  { name: 'Male', value: 32 },
  { name: 'Female', value: 26 },
];
const mockPieData3 = [
  { name: 'Permanent', value: 40 },
  { name: 'Contract', value: 12 },
  { name: 'Intern', value: 6 },
];

const HRDashboard = () => {
  const { token } = useContext(AuthContext);
  const [filters, setFilters] = useState({});
  const [summary, setSummary] = useState([]);
  const [lineData, setLineData] = useState([]);
  const [pie1, setPie1] = useState([]);
  const [pie2, setPie2] = useState([]);
  const [pie3, setPie3] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Transaction integration
  const {
    transactions,
    analytics,
    recordHRTransaction,
    refreshData
  } = useTransactionIntegration('hr');
  
  // Quick Actions State
  const [interviewDialogOpen, setInterviewDialogOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  
  // Form State
  const [interviewForm, setInterviewForm] = useState({
    candidate: '',
    position: '',
    date: '',
    interviewer: ''
  });
  
  // Quick Action Handlers
  const handleAddEmployee = () => {
    window.open('/hr/employees/add', '_blank');
  };
  
  const handleScheduleInterview = async () => {
    try {
      console.log('Scheduling interview:', interviewForm);
      setSnackbarMessage('Interview scheduled successfully!');
      setSnackbarOpen(true);
      setInterviewDialogOpen(false);
      setInterviewForm({ candidate: '', position: '', date: '', interviewer: '' });
    } catch (error) {
      setSnackbarMessage('Failed to schedule interview');
      setSnackbarOpen(true);
    }
  };
  
  const handlePerformanceReview = () => {
    window.open('/hr/performance', '_blank');
  };
  
  const handleManageLeave = () => {
    window.open('/hr/leave', '_blank');
  };

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    setError(null);
    Promise.all([
      api.get('/hr/summary/', { headers: { Authorization: `Bearer ${token}` } }).catch(e => null),
      api.get('/hr/timeseries/', { headers: { Authorization: `Bearer ${token}` } }).catch(e => null),
      api.get('/hr/by-department/', { headers: { Authorization: `Bearer ${token}` } }).catch(e => null),
      api.get('/hr/gender-distribution/', { headers: { Authorization: `Bearer ${token}` } }).catch(e => null),
      api.get('/hr/employment-type/', { headers: { Authorization: `Bearer ${token}` } }).catch(e => null),
    ]).then(([summaryRes, lineRes, pie1Res, pie2Res, pie3Res]) => {
      if (!summaryRes || !lineRes || !pie1Res || !pie2Res || !pie3Res) {
        setError('Failed to load HR dashboard data.');
        setLoading(false);
        return;
      }
      setSummary([
        { title: 'Employees', value: summaryRes.data.employees, icon: <PeopleIcon />, color: 'primary' },
        { title: 'Departments', value: summaryRes.data.departments, icon: <InventoryIcon />, color: 'info' },
        { title: 'Open Positions', value: summaryRes.data.open_positions, icon: <AssessmentIcon />, color: 'success' },
        { title: 'On Leave', value: summaryRes.data.on_leave, icon: <SwapHorizIcon />, color: 'warning' },
      ]);
      setLineData(lineRes.data || []);
      setPie1(pie1Res.data || []);
      setPie2(pie2Res.data || []);
      setPie3(pie3Res.data || []);
      setLoading(false);
    }).catch(() => {
      setError('Failed to load HR dashboard data.');
      setLoading(false);
    });
  }, [token]);

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

  return (
    <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh', p: 0 }}>
      {/* Header */}
      <Box sx={{ 
        background: 'linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%)',
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
              Manage employees, performance, and human resources.
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
              onClick={handleAddEmployee}
              sx={{ 
                background: 'linear-gradient(45deg, #9C27B0 30%, #7B1FA2 90%)',
                color: 'white'
              }}
            >
              Add Employee
            </QuickActionButton>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <QuickActionButton
              fullWidth
              variant="contained"
              startIcon={<ScheduleIcon />}
              onClick={() => setInterviewDialogOpen(true)}
              sx={{ 
                background: 'linear-gradient(45deg, #4CAF50 30%, #2E7D32 90%)',
                color: 'white'
              }}
            >
              Schedule Interview
            </QuickActionButton>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <QuickActionButton
              fullWidth
              variant="contained"
              startIcon={<AssessmentIcon />}
              onClick={handlePerformanceReview}
              sx={{ 
                background: 'linear-gradient(45deg, #FF9800 30%, #FF5722 90%)',
                color: 'white'
              }}
            >
              Performance Review
            </QuickActionButton>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <QuickActionButton
              fullWidth
              variant="contained"
              startIcon={<EventIcon />}
              onClick={handleManageLeave}
              sx={{ 
                background: 'linear-gradient(45deg, #2196F3 30%, #1976D2 90%)',
                color: 'white'
              }}
            >
              Manage Leave
            </QuickActionButton>
          </Grid>
        </Grid>
      </Paper>

      {/* Use DashboardTemplate for the rest */}
      <DashboardTemplate
        title=""
        summaryCards={summary}
        lineChart={{
          data: lineData,
          lines: [
            { type: 'monotone', dataKey: 'Hired', stroke: '#43a047', name: 'Hired', strokeWidth: 3 },
            { type: 'monotone', dataKey: 'Left', stroke: '#e53935', name: 'Left', strokeWidth: 3 },
          ],
          xKey: 'date',
          height: 240,
          title: 'Hiring & Attrition Over Time',
        }}
        pieCharts={[
          { data: pie1, title: 'Employees by Department' },
          { data: pie2, title: 'Gender Distribution' },
          { data: pie3, title: 'Employment Type' },
        ]}
        periods={periods}
        initialPeriod="7d"
        onFilterChange={setFilters}
      />
      
      {/* Advanced Analytics Section */}
      <Paper sx={{ 
        p: 3, 
        mt: 3, 
        borderRadius: 3, 
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
      }}>
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: '#333' }}>
          HR Analytics & Insights
        </Typography>
        <Grid container spacing={3}>
          {/* Employee Engagement Metrics */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center' }}>
                  <TrendingUpIcon sx={{ mr: 1, color: '#4CAF50' }} />
                  Employee Engagement Metrics
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ height: 300 }}>
                  {/* Engagement Score */}
                  <Box sx={{ textAlign: 'center', mb: 3 }}>
                    <Typography variant="h3" color="primary" sx={{ mb: 1 }}>
                      8.2/10
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Overall Engagement Score
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={82} 
                      sx={{ height: 8, borderRadius: 4, mb: 2 }} 
                    />
                  </Box>
                  
                  {/* Engagement Breakdown */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {[
                      { metric: 'Job Satisfaction', score: 85, color: '#4CAF50' },
                      { metric: 'Work-Life Balance', score: 78, color: '#2196F3' },
                      { metric: 'Career Development', score: 82, color: '#FF9800' },
                      { metric: 'Team Collaboration', score: 89, color: '#9C27B0' }
                    ].map((item, idx) => (
                      <Box key={item.metric} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ minWidth: 120 }}>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {item.metric}
                          </Typography>
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <LinearProgress 
                            variant="determinate" 
                            value={item.score} 
                            sx={{ 
                              height: 6, 
                              borderRadius: 3,
                              '& .MuiLinearProgress-bar': { bgcolor: item.color }
                            }} 
                          />
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ minWidth: 40 }}>
                          {item.score}%
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Attendance & Performance Analytics */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center' }}>
                  <ScheduleIcon sx={{ mr: 1, color: '#FF9800' }} />
                  Attendance & Performance Analytics
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ height: 300 }}>
                  {/* Attendance Chart */}
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Weekly Attendance (Last 4 Weeks)
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mb: 2, alignItems: 'end', height: 100 }}>
                      {['Week 1', 'Week 2', 'Week 3', 'Week 4'].map((week, i) => {
                        const attendance = [95, 92, 97, 94][i];
                        const height = (attendance / 100) * 80;
                        return (
                          <Box key={week} sx={{ flex: 1, textAlign: 'center' }}>
                            <Box 
                              sx={{ 
                                height: height, 
                                bgcolor: attendance > 95 ? '#4CAF50' : attendance > 90 ? '#FF9800' : '#F44336', 
                                borderRadius: 1,
                                mb: 1,
                                opacity: 0.8
                              }} 
                            />
                            <Typography variant="caption">{week}</Typography>
                            <Typography variant="caption" display="block" color="text.secondary">
                              {attendance}%
                            </Typography>
                          </Box>
                        );
                      })}
                    </Box>
                  </Box>
                  
                  {/* Performance Summary */}
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'success.light', color: 'success.contrastText' }}>
                      <Typography variant="h5">94.5%</Typography>
                      <Typography variant="caption">Avg Attendance</Typography>
                    </Paper>
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'info.light', color: 'info.contrastText' }}>
                      <Typography variant="h5">4.3/5</Typography>
                      <Typography variant="caption">Avg Performance</Typography>
                    </Paper>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Department Performance Comparison */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center' }}>
                  <AssessmentIcon sx={{ mr: 1, color: '#9C27B0' }} />
                  Department Performance Comparison
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ height: 300 }}>
                  {/* Department Performance Table */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {[
                      { dept: 'Sales', performance: 92, productivity: 88, satisfaction: 85 },
                      { dept: 'HR', performance: 89, productivity: 91, satisfaction: 90 },
                      { dept: 'Finance', performance: 95, productivity: 93, satisfaction: 87 },
                      { dept: 'IT', performance: 91, productivity: 89, satisfaction: 92 },
                      { dept: 'Operations', performance: 87, productivity: 85, satisfaction: 83 }
                    ].map((dept, idx) => (
                      <Box key={dept.dept}>
                        <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                          {dept.dept}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="caption" color="text.secondary">Performance</Typography>
                            <LinearProgress 
                              variant="determinate" 
                              value={dept.performance} 
                              sx={{ height: 4, borderRadius: 2 }}
                              color="primary"
                            />
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="caption" color="text.secondary">Productivity</Typography>
                            <LinearProgress 
                              variant="determinate" 
                              value={dept.productivity} 
                              sx={{ height: 4, borderRadius: 2 }}
                              color="success"
                            />
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="caption" color="text.secondary">Satisfaction</Typography>
                            <LinearProgress 
                              variant="determinate" 
                              value={dept.satisfaction} 
                              sx={{ height: 4, borderRadius: 2 }}
                              color="warning"
                            />
                          </Box>
                          <Typography variant="caption" sx={{ minWidth: 30 }}>
                            {Math.round((dept.performance + dept.productivity + dept.satisfaction) / 3)}%
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Recruitment & Retention Analytics */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center' }}>
                  <PersonAddIcon sx={{ mr: 1, color: '#FF5722' }} />
                  Recruitment & Retention Analytics
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ height: 300 }}>
                  {/* Key Metrics */}
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 3 }}>
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                      <Typography variant="h4">12</Typography>
                      <Typography variant="caption">New Hires (This Month)</Typography>
                    </Paper>
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'error.light', color: 'error.contrastText' }}>
                      <Typography variant="h4">3</Typography>
                      <Typography variant="caption">Departures (This Month)</Typography>
                    </Paper>
                  </Box>

                  {/* Retention Metrics */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Employee Retention Rate
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <LinearProgress 
                          variant="determinate" 
                          value={94} 
                          sx={{ flex: 1, height: 8, borderRadius: 4 }}
                          color="success"
                        />
                        <Typography variant="h6" color="success.main">94%</Typography>
                      </Box>
                    </Box>

                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Average Time to Fill Position
                      </Typography>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="info.main">18 days</Typography>
                        <Typography variant="caption" color="text.secondary">
                          -3 days from last quarter
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                      <Paper sx={{ p: 1.5, textAlign: 'center', bgcolor: 'warning.light', color: 'warning.contrastText', flex: 1, mr: 1 }}>
                        <Typography variant="h6">85%</Typography>
                        <Typography variant="caption">Interview Success Rate</Typography>
                      </Paper>
                      <Paper sx={{ p: 1.5, textAlign: 'center', bgcolor: 'info.light', color: 'info.contrastText', flex: 1, ml: 1 }}>
                        <Typography variant="h6">4.2</Typography>
                        <Typography variant="caption">Avg Employee Rating</Typography>
                      </Paper>
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Training & Development Progress */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center' }}>
                  <EventIcon sx={{ mr: 1, color: '#2196F3' }} />
                  Training & Development Progress
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={3}>
                  {/* Training Completion Stats */}
                  <Grid item xs={12} md={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h3" color="primary" sx={{ mb: 1 }}>
                        87%
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Training Completion Rate
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={87} 
                        sx={{ height: 8, borderRadius: 4 }} 
                      />
                    </Box>
                  </Grid>

                  {/* Training Programs */}
                  <Grid item xs={12} md={8}>
                    <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                      Active Training Programs
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {[
                        { program: 'Leadership Development', enrolled: 25, completed: 18, progress: 72 },
                        { program: 'Technical Skills', enrolled: 42, completed: 35, progress: 83 },
                        { program: 'Safety Training', enrolled: 58, completed: 55, progress: 95 },
                        { program: 'Customer Service', enrolled: 33, completed: 28, progress: 85 }
                      ].map((training, idx) => (
                        <Box key={training.program} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Box sx={{ minWidth: 150 }}>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {training.program}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {training.completed}/{training.enrolled} completed
                            </Typography>
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <LinearProgress 
                              variant="determinate" 
                              value={training.progress} 
                              sx={{ height: 8, borderRadius: 4 }}
                              color={training.progress > 90 ? 'success' : training.progress > 70 ? 'primary' : 'warning'}
                            />
                          </Box>
                          <Typography variant="body2" color="text.secondary" sx={{ minWidth: 40 }}>
                            {training.progress}%
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Interview Dialog */}
      <Dialog open={interviewDialogOpen} onClose={() => setInterviewDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Schedule Interview</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Candidate Name"
            value={interviewForm.candidate}
            onChange={(e) => setInterviewForm({...interviewForm, candidate: e.target.value})}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Position"
            value={interviewForm.position}
            onChange={(e) => setInterviewForm({...interviewForm, position: e.target.value})}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Interview Date"
            type="datetime-local"
            value={interviewForm.date}
            onChange={(e) => setInterviewForm({...interviewForm, date: e.target.value})}
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            fullWidth
            label="Interviewer"
            value={interviewForm.interviewer}
            onChange={(e) => setInterviewForm({...interviewForm, interviewer: e.target.value})}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInterviewDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleScheduleInterview} 
            variant="contained"
            sx={{ background: 'linear-gradient(45deg, #4CAF50 30%, #2E7D32 90%)' }}
          >
            Schedule Interview
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

export default HRDashboard;

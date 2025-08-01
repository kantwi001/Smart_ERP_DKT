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
          {/* Transaction Integration */}
          <Grid item xs={12} md={6}>
            <TransactionIntegration 
              moduleId="hr" 
              title="HR Transaction Flow"
            />
          </Grid>
          
          {/* Time-Based Analytics */}
          <Grid item xs={12} md={6}>
            <TimeBasedAnalytics 
              moduleId="hr" 
              title="HR Trends Analysis"
            />
          </Grid>
          
          {/* Advanced Analytics with Charts */}
          <Grid item xs={12}>
            <AdvancedAnalytics 
              moduleId="hr" 
              title="HR Performance Analytics"
              data={{
                employees: 58,
                departments: 7,
                open_positions: 3,
                on_leave: 6
              }}
            />
          </Grid>
          
          {/* Gantt Chart for HR Projects */}
          <Grid item xs={12}>
            <GanttChart 
              title="HR Project Timeline"
              projects={[
                {
                  id: 1,
                  name: 'Employee Development Program',
                  type: 'hr',
                  manager: 'HR Manager',
                  status: 'in-progress',
                  priority: 'high',
                  startDate: new Date('2024-02-01'),
                  endDate: new Date('2024-06-30'),
                  progress: 45,
                  budget: 60000,
                  team: ['Training Coordinator', 'HR Specialist', 'Department Heads'],
                  tasks: [
                    {
                      id: 301,
                      name: 'Skills Assessment',
                      startDate: new Date('2024-02-01'),
                      endDate: new Date('2024-02-20'),
                      progress: 100,
                      status: 'completed',
                      assignee: 'HR Specialist',
                      dependencies: []
                    },
                    {
                      id: 302,
                      name: 'Training Program Design',
                      startDate: new Date('2024-02-15'),
                      endDate: new Date('2024-03-15'),
                      progress: 80,
                      status: 'in-progress',
                      assignee: 'Training Coordinator',
                      dependencies: [301]
                    },
                    {
                      id: 303,
                      name: 'Training Delivery',
                      startDate: new Date('2024-03-10'),
                      endDate: new Date('2024-05-31'),
                      progress: 25,
                      status: 'in-progress',
                      assignee: 'Department Heads',
                      dependencies: [302]
                    },
                    {
                      id: 304,
                      name: 'Performance Evaluation',
                      startDate: new Date('2024-06-01'),
                      endDate: new Date('2024-06-30'),
                      progress: 0,
                      status: 'pending',
                      assignee: 'HR Manager',
                      dependencies: [303]
                    }
                  ]
                }
              ]}
            />
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

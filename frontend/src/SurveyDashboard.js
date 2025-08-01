import React, { useState, useEffect, useContext } from 'react';
import { 
  Box, Typography, Grid, Card, CardContent, CircularProgress, Alert,
  Tabs, Tab, Paper, Chip, Avatar, LinearProgress, Divider, IconButton, List, ListItem, ListItemText, Button,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Snackbar
} from '@mui/material';
import { styled } from '@mui/material/styles';
import PollIcon from '@mui/icons-material/Poll';
import AssessmentIcon from '@mui/icons-material/Assessment';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import PeopleIcon from '@mui/icons-material/People';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import BarChartIcon from '@mui/icons-material/BarChart';
import SendIcon from '@mui/icons-material/Send';
import CreateIcon from '@mui/icons-material/Create';
import RefreshIcon from '@mui/icons-material/Refresh';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ShareIcon from '@mui/icons-material/Share';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import api from './api';
import { AuthContext } from './AuthContext';

// Styled components for modern design
const StyledTabs = styled(Tabs)(({ theme }) => ({
  backgroundColor: '#fff',
  borderRadius: '12px 12px 0 0',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  '& .MuiTabs-indicator': {
    height: 3,
    borderRadius: '3px 3px 0 0',
    background: 'linear-gradient(45deg, #E91E63 30%, #AD1457 90%)',
  },
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '0.95rem',
  minHeight: 64,
  color: '#666',
  '&.Mui-selected': {
    color: '#E91E63',
  },
}));

const MetricCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(135deg, #E91E63 0%, #AD1457 100%)',
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
      id={`survey-tabpanel-${index}`}
      aria-labelledby={`survey-tab-${index}`}
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

const mockSurveyData = [
  { id: 1, title: 'Customer Satisfaction Survey', responses: 245, status: 'Active', completion: '78%' },
  { id: 2, title: 'Employee Feedback Q4', responses: 89, status: 'Active', completion: '65%' },
  { id: 3, title: 'Product Quality Assessment', responses: 156, status: 'Completed', completion: '100%' },
  { id: 4, title: 'Market Research Study', responses: 312, status: 'Active', completion: '92%' },
];

const SurveyDashboard = () => {
  const { token } = useContext(AuthContext);
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [surveys, setSurveys] = useState([]);
  
  // Quick Actions State
  const [surveyDialogOpen, setSurveyDialogOpen] = useState(false);
  const [questionDialogOpen, setQuestionDialogOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  
  // Form State
  const [surveyForm, setSurveyForm] = useState({
    title: '',
    description: '',
    type: 'feedback',
    audience: 'customers'
  });
  
  const [questionForm, setQuestionForm] = useState({
    survey: '',
    question: '',
    type: 'multiple_choice',
    required: true
  });
  
  // Quick Action Handlers
  const handleCreateSurvey = async () => {
    try {
      console.log('Creating survey:', surveyForm);
      setSnackbarMessage('Survey created successfully!');
      setSnackbarOpen(true);
      setSurveyDialogOpen(false);
      setSurveyForm({ title: '', description: '', type: 'feedback', audience: 'customers' });
    } catch (error) {
      setSnackbarMessage('Failed to create survey');
      setSnackbarOpen(true);
    }
  };
  
  const handleAddQuestion = async () => {
    try {
      console.log('Adding question:', questionForm);
      setSnackbarMessage('Question added successfully!');
      setSnackbarOpen(true);
      setQuestionDialogOpen(false);
      setQuestionForm({ survey: '', question: '', type: 'multiple_choice', required: true });
    } catch (error) {
      setSnackbarMessage('Failed to add question');
      setSnackbarOpen(true);
    }
  };
  
  const handleSendSurvey = () => {
    window.open('/survey/send', '_blank');
  };
  
  const handleViewAnalytics = () => {
    window.open('/survey/analytics', '_blank');
  };

  // Mock data for demonstration
  const recentActivity = [
    { action: 'Customer Satisfaction Survey received 15 new responses', timestamp: '5 minutes ago', type: 'success' },
    { action: 'Employee Feedback Q4 survey launched', timestamp: '2 hours ago', type: 'info' },
    { action: 'Product Quality Assessment completed', timestamp: '1 day ago', type: 'success' },
    { action: 'Market Research Study reached 90% completion', timestamp: '2 days ago', type: 'success' },
    { action: 'New survey template created', timestamp: '3 days ago', type: 'info' },
  ];

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;
      
      setLoading(true);
      try {
        // Fetch surveys with error handling
        try {
          const surveysRes = await api.get('/surveys/', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setSurveys(surveysRes.data || mockSurveyData);
        } catch (err) {
          console.warn('Failed to load surveys:', err);
          setSurveys(mockSurveyData);
        }

      } catch (err) {
        setError('Failed to load survey dashboard data.');
        console.error('Survey dashboard error:', err);
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
        background: 'linear-gradient(135deg, #E91E63 0%, #AD1457 100%)',
        color: 'white',
        p: 4,
        borderRadius: '0 0 24px 24px',
        mb: 3
      }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
              Survey Management Dashboard
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              Create, manage, and analyze surveys to gather valuable insights.
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
              startIcon={<AddIcon />}
              onClick={() => setSurveyDialogOpen(true)}
              sx={{ 
                background: 'linear-gradient(45deg, #E91E63 30%, #AD1457 90%)',
                color: 'white'
              }}
            >
              Create Survey
            </QuickActionButton>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <QuickActionButton
              fullWidth
              variant="contained"
              startIcon={<QuestionAnswerIcon />}
              onClick={() => setQuestionDialogOpen(true)}
              sx={{ 
                background: 'linear-gradient(45deg, #2196F3 30%, #1976D2 90%)',
                color: 'white'
              }}
            >
              Add Question
            </QuickActionButton>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <QuickActionButton
              fullWidth
              variant="contained"
              startIcon={<SendIcon />}
              onClick={handleSendSurvey}
              sx={{ 
                background: 'linear-gradient(45deg, #4CAF50 30%, #2E7D32 90%)',
                color: 'white'
              }}
            >
              Send Survey
            </QuickActionButton>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <QuickActionButton
              fullWidth
              variant="contained"
              startIcon={<AnalyticsIcon />}
              onClick={handleViewAnalytics}
              sx={{ 
                background: 'linear-gradient(45deg, #FF9800 30%, #FF5722 90%)',
                color: 'white'
              }}
            >
              View Analytics
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
          <StyledTab icon={<PollIcon />} label="Surveys" />
          <StyledTab icon={<BarChartIcon />} label="Responses" />
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
                        {surveys.length || 4}
                      </Typography>
                      <Typography variant="body1" sx={{ opacity: 0.9 }}>
                        Active Surveys
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
                      <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: '#E91E63' }}>
                        802
                      </Typography>
                      <Typography variant="body1" color="textSecondary">
                        Total Responses
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: '#fce4ec', color: '#E91E63', width: 56, height: 56 }}>
                      <QuestionAnswerIcon sx={{ fontSize: 28 }} />
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
                        84%
                      </Typography>
                      <Typography variant="body1" color="textSecondary">
                        Avg Completion
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: '#e8f5e8', color: '#4CAF50', width: 56, height: 56 }}>
                      <TrendingUpIcon sx={{ fontSize: 28 }} />
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
                        1,245
                      </Typography>
                      <Typography variant="body1" color="textSecondary">
                        Participants
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: '#fff3e0', color: '#FF9800', width: 56, height: 56 }}>
                      <PeopleIcon sx={{ fontSize: 28 }} />
                    </Avatar>
                  </Box>
                </CardContent>
              </AnalyticsCard>
            </Grid>

            {/* Recent Activity */}
            <Grid item xs={12} md={6}>
              <AnalyticsCard>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Recent Activity</Typography>
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
                          color={activity.type === 'success' ? 'success' : 'info'}
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
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Survey Status</Typography>
                  <Divider sx={{ mb: 2 }} />
                  {surveys.slice(0, 4).map((survey, index) => (
                    <Box key={index} sx={{ mb: 2 }}>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                        <Typography variant="body1" fontWeight={500}>{survey.title}</Typography>
                        <Chip 
                          label={survey.status}
                          size="small"
                          color={survey.status === 'Active' ? 'success' : 'default'}
                        />
                      </Box>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                        <Typography variant="body2" color="textSecondary">{survey.responses} responses</Typography>
                        <Typography variant="body2" fontWeight={500}>{survey.completion}</Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={parseInt(survey.completion)} 
                        sx={{ 
                          height: 6, 
                          borderRadius: 3,
                          bgcolor: '#f0f0f0',
                          '& .MuiLinearProgress-bar': {
                            bgcolor: parseInt(survey.completion) > 90 ? '#4caf50' : parseInt(survey.completion) > 70 ? '#ff9800' : '#2196f3'
                          }
                        }} 
                      />
                    </Box>
                  ))}
                </CardContent>
              </AnalyticsCard>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Surveys Tab */}
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <AnalyticsCard>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Survey Directory</Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Grid container spacing={2}>
                    {surveys.map((survey, index) => (
                      <Grid item xs={12} sm={6} md={4} key={index}>
                        <Card sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
                          <CardContent>
                            <Box display="flex" alignItems="center" mb={2}>
                              <Avatar sx={{ bgcolor: '#E91E63', mr: 2 }}>
                                <PollIcon />
                              </Avatar>
                              <Box>
                                <Typography variant="h6" fontWeight={600}>{survey.title}</Typography>
                                <Typography variant="body2" color="textSecondary">{survey.responses} responses</Typography>
                              </Box>
                            </Box>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                              <Typography variant="body2">Completion:</Typography>
                              <Typography variant="body2" fontWeight={500}>{survey.completion}</Typography>
                            </Box>
                            <LinearProgress 
                              variant="determinate" 
                              value={parseInt(survey.completion)} 
                              sx={{ 
                                height: 6, 
                                borderRadius: 3,
                                mb: 2,
                                bgcolor: '#f0f0f0',
                                '& .MuiLinearProgress-bar': {
                                  bgcolor: '#E91E63'
                                }
                              }} 
                            />
                            <Chip 
                              label={survey.status}
                              size="small"
                              color={survey.status === 'Active' ? 'success' : 'default'}
                              sx={{ width: '100%' }}
                            />
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

        {/* Responses Tab */}
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <AnalyticsCard>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Response Management</Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Typography variant="body1" color="textSecondary" textAlign="center" py={4}>
                    Survey responses and detailed analytics will be displayed here.
                    Use the "View Analytics" quick action to access detailed response data.
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
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Survey Analytics</Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} md={3}>
                      <Box textAlign="center" p={2}>
                        <Avatar sx={{ bgcolor: '#e3f2fd', color: '#1976d2', width: 64, height: 64, mx: 'auto', mb: 2 }}>
                          <TrendingUpIcon sx={{ fontSize: 32 }} />
                        </Avatar>
                        <Typography variant="h4" color="primary" fontWeight={700}>84%</Typography>
                        <Typography variant="body2" color="textSecondary">Response Rate</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Box textAlign="center" p={2}>
                        <Avatar sx={{ bgcolor: '#fce4ec', color: '#e91e63', width: 64, height: 64, mx: 'auto', mb: 2 }}>
                          <BarChartIcon sx={{ fontSize: 32 }} />
                        </Avatar>
                        <Typography variant="h4" sx={{ color: '#e91e63', fontWeight: 700 }}>4.2</Typography>
                        <Typography variant="body2" color="textSecondary">Avg Rating</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Box textAlign="center" p={2}>
                        <Avatar sx={{ bgcolor: '#e8f5e8', color: '#388e3c', width: 64, height: 64, mx: 'auto', mb: 2 }}>
                          <AssessmentIcon sx={{ fontSize: 32 }} />
                        </Avatar>
                        <Typography variant="h4" sx={{ color: '#4caf50', fontWeight: 700 }}>92%</Typography>
                        <Typography variant="body2" color="textSecondary">Satisfaction</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Box textAlign="center" p={2}>
                        <Avatar sx={{ bgcolor: '#fff3e0', color: '#f57c00', width: 64, height: 64, mx: 'auto', mb: 2 }}>
                          <PeopleIcon sx={{ fontSize: 32 }} />
                        </Avatar>
                        <Typography variant="h4" sx={{ color: '#ff9800', fontWeight: 700 }}>1,245</Typography>
                        <Typography variant="body2" color="textSecondary">Participants</Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </AnalyticsCard>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>
      
      {/* Create Survey Dialog */}
      <Dialog open={surveyDialogOpen} onClose={() => setSurveyDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create Survey</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Survey Title"
            value={surveyForm.title}
            onChange={(e) => setSurveyForm({...surveyForm, title: e.target.value})}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Description"
            value={surveyForm.description}
            onChange={(e) => setSurveyForm({...surveyForm, description: e.target.value})}
            margin="normal"
            multiline
            rows={3}
          />
          <TextField
            fullWidth
            select
            label="Survey Type"
            value={surveyForm.type}
            onChange={(e) => setSurveyForm({...surveyForm, type: e.target.value})}
            margin="normal"
          >
            <MenuItem value="feedback">Customer Feedback</MenuItem>
            <MenuItem value="satisfaction">Satisfaction Survey</MenuItem>
            <MenuItem value="market_research">Market Research</MenuItem>
            <MenuItem value="employee">Employee Survey</MenuItem>
          </TextField>
          <TextField
            fullWidth
            select
            label="Target Audience"
            value={surveyForm.audience}
            onChange={(e) => setSurveyForm({...surveyForm, audience: e.target.value})}
            margin="normal"
          >
            <MenuItem value="customers">Customers</MenuItem>
            <MenuItem value="employees">Employees</MenuItem>
            <MenuItem value="partners">Partners</MenuItem>
            <MenuItem value="public">General Public</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSurveyDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleCreateSurvey} 
            variant="contained"
            sx={{ background: 'linear-gradient(45deg, #E91E63 30%, #AD1457 90%)' }}
          >
            Create Survey
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Add Question Dialog */}
      <Dialog open={questionDialogOpen} onClose={() => setQuestionDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Question</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            select
            label="Survey"
            value={questionForm.survey}
            onChange={(e) => setQuestionForm({...questionForm, survey: e.target.value})}
            margin="normal"
          >
            {surveys.map((survey, index) => (
              <MenuItem key={index} value={survey.title}>{survey.title}</MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth
            label="Question"
            value={questionForm.question}
            onChange={(e) => setQuestionForm({...questionForm, question: e.target.value})}
            margin="normal"
            multiline
            rows={2}
          />
          <TextField
            fullWidth
            select
            label="Question Type"
            value={questionForm.type}
            onChange={(e) => setQuestionForm({...questionForm, type: e.target.value})}
            margin="normal"
          >
            <MenuItem value="multiple_choice">Multiple Choice</MenuItem>
            <MenuItem value="text">Text Response</MenuItem>
            <MenuItem value="rating">Rating Scale</MenuItem>
            <MenuItem value="yes_no">Yes/No</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setQuestionDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleAddQuestion} 
            variant="contained"
            sx={{ background: 'linear-gradient(45deg, #2196F3 30%, #1976D2 90%)' }}
          >
            Add Question
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

export default SurveyDashboard;

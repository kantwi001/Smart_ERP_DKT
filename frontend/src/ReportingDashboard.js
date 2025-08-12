import React, { useState, useEffect, useContext } from 'react';
import { 
  Box, Typography, Grid, Card, CardContent, CircularProgress, Alert,
  Tabs, Tab, Paper, Chip, Avatar, LinearProgress, Divider, IconButton, List, ListItem, ListItemText, Button,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Snackbar
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AssessmentIcon from '@mui/icons-material/Assessment';
import PeopleIcon from '@mui/icons-material/People';
import InventoryIcon from '@mui/icons-material/Inventory';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import BarChartIcon from '@mui/icons-material/BarChart';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import InsightsIcon from '@mui/icons-material/Insights';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import RefreshIcon from '@mui/icons-material/Refresh';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import TableViewIcon from '@mui/icons-material/TableView';
import DataUsageIcon from '@mui/icons-material/DataUsage';
import api from './api';
import { AuthContext } from './AuthContext';
import AdvancedAnalytics from './components/AdvancedAnalytics';
import TimeBasedAnalytics from './components/TimeBasedAnalytics';
import GanttChart from './components/GanttChart';
import TransactionIntegration from './components/TransactionIntegration';
import { useTransactionIntegration } from './hooks/useTransactionIntegration';

// Styled components for modern design
const StyledTabs = styled(Tabs)(({ theme }) => ({
  backgroundColor: '#fff',
  borderRadius: '12px 12px 0 0',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  '& .MuiTabs-indicator': {
    height: 3,
    borderRadius: '3px 3px 0 0',
    background: 'linear-gradient(45deg, #673AB7 30%, #512DA8 90%)',
  },
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '0.95rem',
  minHeight: 64,
  color: '#666',
  '&.Mui-selected': {
    color: '#673AB7',
  },
}));

const MetricCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(135deg, #673AB7 0%, #512DA8 100%)',
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
      id={`reporting-tabpanel-${index}`}
      aria-labelledby={`reporting-tab-${index}`}
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

const periods = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: 'custom', label: 'Custom' },
];

const mockSummary = [
  { title: 'Reports Generated', value: 18, icon: <AssessmentIcon />, color: 'primary' },
  { title: 'Active Users', value: 25, icon: <PeopleIcon />, color: 'secondary' },
  { title: 'Data Sources', value: 6, icon: <InventoryIcon />, color: 'info' },
  { title: 'Exports', value: 8, icon: <SwapHorizIcon />, color: 'success' },
];

const mockLineData = [
  { date: 'Jul 14', Reports: 2, Exports: 1 },
  { date: 'Jul 15', Reports: 4, Exports: 2 },
  { date: 'Jul 16', Reports: 3, Exports: 2 },
  { date: 'Jul 17', Reports: 2, Exports: 1 },
  { date: 'Jul 18', Reports: 5, Exports: 2 },
  { date: 'Jul 19', Reports: 1, Exports: 0 },
  { date: 'Jul 20', Reports: 1, Exports: 0 },
];

const mockPieData1 = [
  { name: 'Sales', value: 5 },
  { name: 'Inventory', value: 4 },
  { name: 'HR', value: 3 },
  { name: 'Finance', value: 6 },
];
const mockPieData2 = [
  { name: 'PDF', value: 8 },
  { name: 'Excel', value: 7 },
  { name: 'CSV', value: 3 },
];
const mockPieData3 = [
  { name: 'Internal', value: 10 },
  { name: 'External', value: 8 },
];

const ReportingDashboard = () => {
  const { token } = useContext(AuthContext);
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reports, setReports] = useState([]);
  const [exports, setExports] = useState([]);
  const [filters, setFilters] = useState({});
  
  // Transaction integration
  const {
    transactions,
    analytics,
    recordReportingTransaction,
    refreshData
  } = useTransactionIntegration('reporting');
  
  // Quick Actions State
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  
  // Form State
  const [reportForm, setReportForm] = useState({
    name: '',
    type: 'sales',
    format: 'pdf',
    schedule: 'once'
  });
  
  // Quick Action Handlers
  const handleGenerateReport = async () => {
    try {
      console.log('Generating report:', reportForm);
      setSnackbarMessage('Report generated successfully!');
      setSnackbarOpen(true);
      setReportDialogOpen(false);
      setReportForm({ name: '', type: 'sales', format: 'pdf', schedule: 'once' });
    } catch (error) {
      setSnackbarMessage('Failed to generate report');
      setSnackbarOpen(true);
    }
  };
  
  const handleExportData = () => {
    window.open('/reporting/export', '_blank');
  };
  
  const handleScheduleReport = () => {
    window.open('/reporting/schedule', '_blank');
  };
  
  const handleCreateDashboard = () => {
    window.open('/reporting/dashboard/create', '_blank');
  };

  // Mock data for demonstration
  const recentActivity = [
    { action: 'Sales Report Q3 generated', timestamp: '5 minutes ago', type: 'success' },
    { action: 'Inventory Report exported to PDF', timestamp: '15 minutes ago', type: 'success' },
    { action: 'HR Analytics dashboard accessed', timestamp: '30 minutes ago', type: 'info' },
    { action: 'Financial Report scheduled', timestamp: '1 hour ago', type: 'info' },
    { action: 'Customer Analytics report failed', timestamp: '2 hours ago', type: 'warning' },
  ];

  const reportCategories = [
    { category: 'Sales', count: 5, percentage: 28 },
    { category: 'Inventory', count: 4, percentage: 22 },
    { category: 'HR', count: 3, percentage: 17 },
    { category: 'Finance', count: 6, percentage: 33 },
  ];

  const availableReports = [
    { name: 'Sales Performance Report', description: 'Comprehensive sales analytics and trends', category: 'Sales', lastRun: '2 hours ago' },
    { name: 'Inventory Stock Report', description: 'Current stock levels and movement analysis', category: 'Inventory', lastRun: '1 day ago' },
    { name: 'Employee Performance Report', description: 'HR metrics and employee analytics', category: 'HR', lastRun: '3 days ago' },
    { name: 'Financial Summary Report', description: 'Revenue, expenses, and profit analysis', category: 'Finance', lastRun: '1 hour ago' },
    { name: 'Customer Analytics Report', description: 'Customer behavior and satisfaction metrics', category: 'Sales', lastRun: '5 hours ago' },
  ];

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;
      
      setLoading(true);
      try {
        // Fetch reports with error handling
        try {
          const reportsRes = await api.get('/reporting/reports/', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setReports(reportsRes.data || []);
        } catch (err) {
          console.warn('Failed to load reports:', err);
        }

        // Fetch exports with error handling
        try {
          const exportsRes = await api.get('/reporting/exports/', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setExports(exportsRes.data || []);
        } catch (err) {
          console.warn('Failed to load exports:', err);
        }

      } catch (err) {
        setError('Failed to load reporting dashboard data.');
        console.error('Reporting dashboard error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const handleExportReport = (reportId, format) => {
    console.log(`Exporting report ${reportId} as ${format}`);
    // Add export logic here
  };

  return (
    <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh', p: 0 }}>
      {/* Header */}
      <Box sx={{ 
        background: 'linear-gradient(135deg, #673AB7 0%, #512DA8 100%)',
        color: 'white',
        p: 4,
        borderRadius: '0 0 24px 24px',
        mb: 3
      }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
              Reporting & Analytics Dashboard
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              Generate insights and export comprehensive business reports.
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
            <Button
              fullWidth
              variant="contained"
              startIcon={<AssessmentIcon />}
              onClick={() => setReportDialogOpen(true)}
              sx={{ 
                background: 'linear-gradient(45deg, #673AB7 30%, #512DA8 90%)',
                color: 'white',
                borderRadius: 2,
                py: 1.5,
                fontWeight: 600,
                textTransform: 'none',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
                }
              }}
            >
              Generate Report
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<FileDownloadIcon />}
              onClick={handleExportData}
              sx={{ 
                background: 'linear-gradient(45deg, #4CAF50 30%, #2E7D32 90%)',
                color: 'white',
                borderRadius: 2,
                py: 1.5,
                fontWeight: 600,
                textTransform: 'none',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
                }
              }}
            >
              Export Data
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<DataUsageIcon />}
              onClick={handleScheduleReport}
              sx={{ 
                background: 'linear-gradient(45deg, #FF9800 30%, #FF5722 90%)',
                color: 'white',
                borderRadius: 2,
                py: 1.5,
                fontWeight: 600,
                textTransform: 'none',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
                }
              }}
            >
              Schedule Report
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<InsightsIcon />}
              onClick={handleCreateDashboard}
              sx={{ 
                background: 'linear-gradient(45deg, #2196F3 30%, #1976D2 90%)',
                color: 'white',
                borderRadius: 2,
                py: 1.5,
                fontWeight: 600,
                textTransform: 'none',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
                }
              }}
            >
              Create Dashboard
            </Button>
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
          <StyledTab icon={<BarChartIcon />} label="Reports" />
          <StyledTab icon={<InsightsIcon />} label="Analytics" />
          <StyledTab icon={<FileDownloadIcon />} label="Exports" />
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
                      <Typography variant="body2" sx={{ opacity: 0.8, mb: 1 }}>Reports Generated</Typography>
                      <Typography variant="h3" sx={{ fontWeight: 700 }}>
                        {reports.length || 18}
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                      <AssessmentIcon sx={{ fontSize: 28 }} />
                    </Avatar>
                  </Box>
                </CardContent>
              </MetricCard>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <MetricCard sx={{ background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="body2" sx={{ opacity: 0.8, mb: 1 }}>Active Users</Typography>
                      <Typography variant="h3" sx={{ fontWeight: 700 }}>
                        25
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
              <MetricCard sx={{ background: 'linear-gradient(135deg, #2196F3 0%, #1565C0 100%)' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="body2" sx={{ opacity: 0.8, mb: 1 }}>Data Sources</Typography>
                      <Typography variant="h3" sx={{ fontWeight: 700 }}>
                        6
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                      <DataUsageIcon sx={{ fontSize: 28 }} />
                    </Avatar>
                  </Box>
                </CardContent>
              </MetricCard>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <MetricCard sx={{ background: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="body2" sx={{ opacity: 0.8, mb: 1 }}>Exports</Typography>
                      <Typography variant="h3" sx={{ fontWeight: 700 }}>
                        {exports.length || 8}
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                      <FileDownloadIcon sx={{ fontSize: 28 }} />
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
                    <BarChartIcon sx={{ mr: 1, color: '#673AB7' }} />
                    Recent Reporting Activity
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
                          label={item.type === 'success' ? 'Completed' : item.type === 'warning' ? 'Alert' : 'Info'}
                          size="small" 
                          color={item.type === 'success' ? 'success' : item.type === 'warning' ? 'warning' : 'info'}
                          variant="outlined" 
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </AnalyticsCard>
            </Grid>

            {/* Report Categories */}
            <Grid item xs={12} md={4}>
              <AnalyticsCard>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Report Categories</Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Box sx={{ space: 2 }}>
                    {reportCategories.map((category, idx) => (
                      <Box key={idx} sx={{ mb: 2 }}>
                        <Box display="flex" justifyContent="space-between" mb={1}>
                          <Typography variant="body2">{category.category}</Typography>
                          <Typography variant="body2" color="primary">{category.count} ({category.percentage}%)</Typography>
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={category.percentage} 
                          color={idx === 0 ? 'primary' : idx === 1 ? 'secondary' : idx === 2 ? 'success' : 'warning'} 
                          sx={{ borderRadius: 1, height: 8 }} 
                        />
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </AnalyticsCard>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Reports Tab */}
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <AnalyticsCard>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Available Reports</Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Grid container spacing={2}>
                    {availableReports.map((report, idx) => (
                      <Grid item xs={12} md={6} key={idx}>
                        <Card sx={{ borderRadius: 2, border: '1px solid #e0e0e0' }}>
                          <CardContent>
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>{report.name}</Typography>
                            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                              {report.description}
                            </Typography>
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                              <Chip label={report.category} size="small" color="primary" variant="outlined" />
                              <Typography variant="caption" color="textSecondary">
                                Last run: {report.lastRun}
                              </Typography>
                            </Box>
                            <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                              <Button 
                                size="small" 
                                variant="contained" 
                                onClick={() => handleGenerateReport(report.name)}
                                startIcon={<BarChartIcon />}
                              >
                                Generate
                              </Button>
                              <Button 
                                size="small" 
                                variant="outlined" 
                                onClick={() => handleExportReport(idx, 'PDF')}
                                startIcon={<PictureAsPdfIcon />}
                              >
                                Export
                              </Button>
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

        {/* Analytics Tab */}
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <AnalyticsCard>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Business Intelligence Analytics</Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} md={3}>
                      <Box textAlign="center" p={2}>
                        <Avatar sx={{ bgcolor: '#e8f5e8', color: '#388e3c', width: 64, height: 64, mx: 'auto', mb: 2 }}>
                          <TrendingUpIcon sx={{ fontSize: 32 }} />
                        </Avatar>
                        <Typography variant="h4" sx={{ color: '#4caf50', fontWeight: 700 }}>↑15%</Typography>
                        <Typography variant="body2" color="textSecondary">Report Usage Growth</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Box textAlign="center" p={2}>
                        <Avatar sx={{ bgcolor: '#f3e5f5', color: '#7b1fa2', width: 64, height: 64, mx: 'auto', mb: 2 }}>
                          <AssessmentIcon sx={{ fontSize: 32 }} />
                        </Avatar>
                        <Typography variant="h4" color="secondary" fontWeight={700}>18</Typography>
                        <Typography variant="body2" color="textSecondary">Total Reports</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Box textAlign="center" p={2}>
                        <Avatar sx={{ bgcolor: '#e3f2fd', color: '#1976d2', width: 64, height: 64, mx: 'auto', mb: 2 }}>
                          <DataUsageIcon sx={{ fontSize: 32 }} />
                        </Avatar>
                        <Typography variant="h4" color="primary" fontWeight={700}>6</Typography>
                        <Typography variant="body2" color="textSecondary">Data Sources</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Box textAlign="center" p={2}>
                        <Avatar sx={{ bgcolor: '#fff3e0', color: '#f57c00', width: 64, height: 64, mx: 'auto', mb: 2 }}>
                          <InsightsIcon sx={{ fontSize: 32 }} />
                        </Avatar>
                        <Typography variant="h4" sx={{ color: '#ff9800', fontWeight: 700 }}>94%</Typography>
                        <Typography variant="body2" color="textSecondary">Data Accuracy</Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </AnalyticsCard>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Exports Tab */}
        <TabPanel value={tabValue} index={3}>
          <Grid container spacing={3}>
            {/* Report Generation Analytics */}
            <Grid item xs={12} md={6}>
              <AnalyticsCard>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center' }}>
                    <TrendingUpIcon sx={{ mr: 1, color: '#4CAF50' }} />
                    Report Generation Analytics
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Box sx={{ height: 300 }}>
                    {/* Overall Performance Score */}
                    <Box sx={{ textAlign: 'center', mb: 3 }}>
                      <Typography variant="h3" color="primary" sx={{ mb: 1 }}>
                        91.8%
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Overall Reporting Performance
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={91.8} 
                        sx={{ height: 8, borderRadius: 4, mb: 2 }} 
                      />
                    </Box>
                    
                    {/* Performance Breakdown */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {[
                        { metric: 'Report Accuracy', score: 96, color: '#4CAF50' },
                        { metric: 'Generation Speed', score: 89, color: '#2196F3' },
                        { metric: 'Data Freshness', score: 93, color: '#FF9800' },
                        { metric: 'User Satisfaction', score: 89, color: '#9C27B0' }
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
              </AnalyticsCard>
            </Grid>

            {/* Export Format Analytics */}
            <Grid item xs={12} md={6}>
              <AnalyticsCard>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center' }}>
                    <FileDownloadIcon sx={{ mr: 1, color: '#FF9800' }} />
                    Export Format Analytics
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Box sx={{ height: 300 }}>
                    {/* Export Format Chart */}
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Export Format Usage (Last 30 Days)
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, mb: 2, alignItems: 'end', height: 100 }}>
                        {['PDF', 'Excel', 'CSV', 'JSON'].map((format, i) => {
                          const usage = [45, 32, 18, 5][i];
                          const height = (usage / 50) * 80;
                          return (
                            <Box key={format} sx={{ flex: 1, textAlign: 'center' }}>
                              <Box 
                                sx={{ 
                                  height: height, 
                                  bgcolor: format === 'PDF' ? '#F44336' : format === 'Excel' ? '#4CAF50' : format === 'CSV' ? '#FF9800' : '#2196F3', 
                                  borderRadius: 1,
                                  mb: 1,
                                  opacity: 0.8
                                }} 
                              />
                              <Typography variant="caption">{format}</Typography>
                              <Typography variant="caption" display="block" color="text.secondary">
                                {usage}%
                              </Typography>
                            </Box>
                          );
                        })}
                      </Box>
                    </Box>
                    
                    {/* Export Summary */}
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                      <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                        <Typography variant="h5">1,247</Typography>
                        <Typography variant="caption">Total Exports</Typography>
                      </Paper>
                      <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'success.light', color: 'success.contrastText' }}>
                        <Typography variant="h5">2.3s</Typography>
                        <Typography variant="caption">Avg Export Time</Typography>
                      </Paper>
                    </Box>
                  </Box>
                </CardContent>
              </AnalyticsCard>
            </Grid>

            {/* Report Usage Analytics */}
            <Grid item xs={12} md={6}>
              <AnalyticsCard>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center' }}>
                    <BarChartIcon sx={{ mr: 1, color: '#9C27B0' }} />
                    Report Usage Analytics
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Box sx={{ height: 300 }}>
                    {/* Most Used Reports */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {[
                        { report: 'Sales Summary', usage: 95, views: 342, frequency: 'Daily' },
                        { report: 'Inventory Report', usage: 87, views: 298, frequency: 'Weekly' },
                        { report: 'Financial Statement', usage: 92, views: 156, frequency: 'Monthly' },
                        { report: 'HR Analytics', usage: 78, views: 189, frequency: 'Weekly' },
                        { report: 'Customer Report', usage: 83, views: 234, frequency: 'Daily' }
                      ].map((report, idx) => (
                        <Box key={report.report}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {report.report}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {report.views} views • {report.frequency}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ flex: 1 }}>
                              <LinearProgress 
                                variant="determinate" 
                                value={report.usage} 
                                sx={{ height: 6, borderRadius: 3 }}
                                color={report.usage > 90 ? 'success' : report.usage > 80 ? 'primary' : 'warning'}
                              />
                            </Box>
                            <Typography variant="body2" color="text.secondary" sx={{ minWidth: 40 }}>
                              {report.usage}%
                            </Typography>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                </CardContent>
              </AnalyticsCard>
            </Grid>

            {/* Data Quality Analytics */}
            <Grid item xs={12} md={6}>
              <AnalyticsCard>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center' }}>
                    <DataUsageIcon sx={{ mr: 1, color: '#FF5722' }} />
                    Data Quality Analytics
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Box sx={{ height: 300 }}>
                    {/* Key Metrics */}
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 3 }}>
                      <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'success.light', color: 'success.contrastText' }}>
                        <Typography variant="h4">98.5%</Typography>
                        <Typography variant="caption">Data Accuracy</Typography>
                      </Paper>
                      <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'info.light', color: 'info.contrastText' }}>
                        <Typography variant="h4">99.2%</Typography>
                        <Typography variant="caption">Data Completeness</Typography>
                      </Paper>
                    </Box>

                    {/* Data Quality Breakdown */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          Data Freshness Score
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <LinearProgress 
                            variant="determinate" 
                            value={93} 
                            sx={{ flex: 1, height: 8, borderRadius: 4 }}
                            color="success"
                          />
                          <Typography variant="h6" color="success.main">93%</Typography>
                        </Box>
                      </Box>

                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          Average Data Latency
                        </Typography>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h4" color="info.main">1.2 min</Typography>
                          <Typography variant="caption" color="text.secondary">
                            -0.3 min from last month
                          </Typography>
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                        <Paper sx={{ p: 1.5, textAlign: 'center', bgcolor: 'warning.light', color: 'warning.contrastText', flex: 1, mr: 1 }}>
                          <Typography variant="h6">2</Typography>
                          <Typography variant="caption">Data Issues</Typography>
                        </Paper>
                        <Paper sx={{ p: 1.5, textAlign: 'center', bgcolor: 'primary.light', color: 'primary.contrastText', flex: 1, ml: 1 }}>
                          <Typography variant="h6">15</Typography>
                          <Typography variant="caption">Data Sources</Typography>
                        </Paper>
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </AnalyticsCard>
            </Grid>

            {/* Business Intelligence Analytics */}
            <Grid item xs={12}>
              <AnalyticsCard>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center' }}>
                    <InsightsIcon sx={{ mr: 1, color: '#2196F3' }} />
                    Business Intelligence Analytics
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Grid container spacing={3}>
                    {/* Dashboard Usage */}
                    <Grid item xs={12} md={4}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h3" color="primary" sx={{ mb: 1 }}>
                          87%
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          Dashboard Adoption Rate
                        </Typography>
                        <LinearProgress 
                          variant="determinate" 
                          value={87} 
                          sx={{ height: 8, borderRadius: 4 }} 
                        />
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                          Target: 90%
                        </Typography>
                      </Box>
                    </Grid>

                    {/* BI Insights Performance */}
                    <Grid item xs={12} md={8}>
                      <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                        Business Intelligence Insights Performance
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {[
                          { insight: 'Sales Trends', accuracy: 94, impact: 'High', usage: 89 },
                          { insight: 'Customer Behavior', accuracy: 91, impact: 'High', usage: 85 },
                          { insight: 'Inventory Optimization', accuracy: 88, impact: 'Medium', usage: 78 },
                          { insight: 'Financial Forecasting', accuracy: 96, impact: 'High', usage: 92 },
                          { insight: 'Operational Efficiency', accuracy: 87, impact: 'Medium', usage: 74 }
                        ].map((insight, idx) => (
                          <Box key={insight.insight} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ minWidth: 140 }}>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {insight.insight}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {insight.accuracy}% accuracy • {insight.impact} impact
                              </Typography>
                            </Box>
                            <Box sx={{ flex: 1 }}>
                              <LinearProgress 
                                variant="determinate" 
                                value={insight.usage} 
                                sx={{ height: 8, borderRadius: 4 }}
                                color={insight.usage > 85 ? 'success' : insight.usage > 75 ? 'primary' : 'warning'}
                              />
                            </Box>
                            <Typography variant="body2" color="text.secondary" sx={{ minWidth: 40 }}>
                              {insight.usage}%
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </AnalyticsCard>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>
      
      {/* Report Generation Dialog */}
      <Dialog open={reportDialogOpen} onClose={() => setReportDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Generate Report</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Report Name"
            value={reportForm.name}
            onChange={(e) => setReportForm({...reportForm, name: e.target.value})}
            margin="normal"
          />
          <TextField
            fullWidth
            select
            label="Report Type"
            value={reportForm.type}
            onChange={(e) => setReportForm({...reportForm, type: e.target.value})}
            margin="normal"
          >
            <MenuItem value="sales">Sales Report</MenuItem>
            <MenuItem value="inventory">Inventory Report</MenuItem>
            <MenuItem value="hr">HR Report</MenuItem>
            <MenuItem value="finance">Financial Report</MenuItem>
          </TextField>
          <TextField
            fullWidth
            select
            label="Format"
            value={reportForm.format}
            onChange={(e) => setReportForm({...reportForm, format: e.target.value})}
            margin="normal"
          >
            <MenuItem value="pdf">PDF</MenuItem>
            <MenuItem value="excel">Excel</MenuItem>
            <MenuItem value="csv">CSV</MenuItem>
          </TextField>
          <TextField
            fullWidth
            select
            label="Schedule"
            value={reportForm.schedule}
            onChange={(e) => setReportForm({...reportForm, schedule: e.target.value})}
            margin="normal"
          >
            <MenuItem value="once">Generate Once</MenuItem>
            <MenuItem value="daily">Daily</MenuItem>
            <MenuItem value="weekly">Weekly</MenuItem>
            <MenuItem value="monthly">Monthly</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReportDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleGenerateReport} 
            variant="contained"
            sx={{ background: 'linear-gradient(45deg, #673AB7 30%, #512DA8 90%)' }}
          >
            Generate Report
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

export default ReportingDashboard;

import React, { useState, useEffect, useContext } from 'react';
import { 
  Box, Typography, Grid, Card, CardContent, CircularProgress, Alert,
  Tabs, Tab, Paper, Chip, Avatar, LinearProgress, Divider, IconButton, List, ListItem, ListItemText,
  Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Snackbar
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AssessmentIcon from '@mui/icons-material/Assessment';
import InventoryIcon from '@mui/icons-material/Inventory';
import PeopleIcon from '@mui/icons-material/People';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import FactoryIcon from '@mui/icons-material/Factory';
import QualityIcon from '@mui/icons-material/VerifiedUser';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import RefreshIcon from '@mui/icons-material/Refresh';
import BuildIcon from '@mui/icons-material/Build';
import WarningIcon from '@mui/icons-material/Warning';
import AddIcon from '@mui/icons-material/Add';
import ScheduleIcon from '@mui/icons-material/Schedule';
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';
import TimelineIcon from '@mui/icons-material/Timeline';
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
    background: 'linear-gradient(45deg, #607D8B 30%, #455A64 90%)',
  },
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '0.95rem',
  minHeight: 64,
  color: '#666',
  '&.Mui-selected': {
    color: '#607D8B',
  },
}));

const MetricCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(135deg, #607D8B 0%, #455A64 100%)',
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
      id={`manufacturing-tabpanel-${index}`}
      aria-labelledby={`manufacturing-tab-${index}`}
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
  { title: 'Production Orders', value: 32, icon: <AssessmentIcon />, color: 'primary' },
  { title: 'Units Produced', value: 1200, icon: <InventoryIcon />, color: 'success' },
  { title: 'Downtime Hours', value: 8, icon: <SwapHorizIcon />, color: 'error' },
  { title: 'Operators', value: 14, icon: <PeopleIcon />, color: 'secondary' },
];

const mockLineData = [
  { date: 'Jul 14', Produced: 120, Downtime: 1 },
  { date: 'Jul 15', Produced: 150, Downtime: 0.5 },
  { date: 'Jul 16', Produced: 180, Downtime: 2 },
  { date: 'Jul 17', Produced: 200, Downtime: 1.5 },
  { date: 'Jul 18', Produced: 210, Downtime: 1 },
  { date: 'Jul 19', Produced: 170, Downtime: 1 },
  { date: 'Jul 20', Produced: 170, Downtime: 1 },
];

const mockPieData1 = [
  { name: 'Line A', value: 40 },
  { name: 'Line B', value: 30 },
  { name: 'Line C', value: 30 },
];
const mockPieData2 = [
  { name: 'Shift 1', value: 50 },
  { name: 'Shift 2', value: 30 },
  { name: 'Shift 3', value: 20 },
];
const mockPieData3 = [
  { name: 'Good', value: 1100 },
  { name: 'Rejected', value: 100 },
];

const ManufacturingDashboard = () => {
  const { token } = useContext(AuthContext);
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [productionOrders, setProductionOrders] = useState([]);
  const [qualityData, setQualityData] = useState([]);
  const [filters, setFilters] = useState({});
  
  // Transaction integration
  const {
    transactions,
    analytics,
    recordManufacturingTransaction,
    refreshData
  } = useTransactionIntegration('manufacturing');
  
  // Quick Actions State
  const [workOrderDialogOpen, setWorkOrderDialogOpen] = useState(false);
  const [maintenanceDialogOpen, setMaintenanceDialogOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  
  // Form State
  const [workOrderForm, setWorkOrderForm] = useState({
    product: '',
    quantity: '',
    priority: 'medium',
    dueDate: ''
  });
  
  const [maintenanceForm, setMaintenanceForm] = useState({
    equipment: '',
    type: 'preventive',
    scheduledDate: '',
    description: ''
  });

  // Mock data for demonstration
  const recentActivity = [
    { action: 'Production order #PO-1234 completed', timestamp: '5 minutes ago', type: 'success' },
    { action: 'Quality check failed for batch #B-567', timestamp: '20 minutes ago', type: 'warning' },
    { action: 'Machine maintenance scheduled', timestamp: '1 hour ago', type: 'info' },
    { action: 'New production order created', timestamp: '2 hours ago', type: 'info' },
    { action: 'Shift change completed', timestamp: '4 hours ago', type: 'success' },
  ];
  
  // Quick Action Handlers
  const handleCreateWorkOrder = async () => {
    try {
      console.log('Creating work order:', workOrderForm);
      setSnackbarMessage('Work order created successfully!');
      setSnackbarOpen(true);
      setWorkOrderDialogOpen(false);
      setWorkOrderForm({ product: '', quantity: '', priority: 'medium', dueDate: '' });
    } catch (error) {
      setSnackbarMessage('Failed to create work order');
      setSnackbarOpen(true);
    }
  };
  
  const handleScheduleMaintenance = async () => {
    try {
      console.log('Scheduling maintenance:', maintenanceForm);
      setSnackbarMessage('Maintenance scheduled successfully!');
      setSnackbarOpen(true);
      setMaintenanceDialogOpen(false);
      setMaintenanceForm({ equipment: '', type: 'preventive', scheduledDate: '', description: '' });
    } catch (error) {
      setSnackbarMessage('Failed to schedule maintenance');
      setSnackbarOpen(true);
    }
  };
  
  const handleQualityCheck = () => {
    window.open('/manufacturing/quality', '_blank');
  };
  
  const handleTrackProduction = () => {
    window.open('/manufacturing/tracking', '_blank');
  };
  
  const fetchData = async () => {
    if (!token) return;
    
    setLoading(true);
    try {
      // Fetch production orders with error handling
      try {
        const ordersRes = await api.get('/manufacturing/production-orders/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProductionOrders(ordersRes.data || []);
      } catch (err) {
        console.warn('Failed to load production orders:', err);
      }

      // Fetch quality data with error handling
      try {
        const qualityRes = await api.get('/manufacturing/quality/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setQualityData(qualityRes.data || []);
      } catch (err) {
        console.warn('Failed to load quality data:', err);
      }

    } catch (err) {
      setError('Failed to load manufacturing dashboard data.');
      console.error('Manufacturing dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleRefreshData = () => {
    fetchData();
  };

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token]);

  return (
    <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh', p: 0 }}>
      {/* Header */}
      <Box sx={{ 
        background: 'linear-gradient(135deg, #607D8B 0%, #455A64 100%)',
        color: 'white',
        p: 4,
        borderRadius: '0 0 24px 24px',
        mb: 3
      }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
              Manufacturing Dashboard
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              Monitor production efficiency and quality control processes.
            </Typography>
          </Box>
          <IconButton 
            onClick={handleRefreshData} 
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
              onClick={() => setWorkOrderDialogOpen(true)}
              sx={{ 
                background: 'linear-gradient(45deg, #607D8B 30%, #455A64 90%)',
                color: 'white'
              }}
            >
              Create Work Order
            </QuickActionButton>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <QuickActionButton
              fullWidth
              variant="contained"
              startIcon={<ScheduleIcon />}
              onClick={() => setMaintenanceDialogOpen(true)}
              sx={{ 
                background: 'linear-gradient(45deg, #FF9800 30%, #FF5722 90%)',
                color: 'white'
              }}
            >
              Schedule Maintenance
            </QuickActionButton>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <QuickActionButton
              fullWidth
              variant="contained"
              startIcon={<PlaylistAddCheckIcon />}
              onClick={handleQualityCheck}
              sx={{ 
                background: 'linear-gradient(45deg, #4CAF50 30%, #2E7D32 90%)',
                color: 'white'
              }}
            >
              Quality Check
            </QuickActionButton>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <QuickActionButton
              fullWidth
              variant="contained"
              startIcon={<TimelineIcon />}
              onClick={handleTrackProduction}
              sx={{ 
                background: 'linear-gradient(45deg, #2196F3 30%, #1976D2 90%)',
                color: 'white'
              }}
            >
              Track Production
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
          <StyledTab icon={<FactoryIcon />} label="Production" />
          <StyledTab icon={<QualityIcon />} label="Quality" />
          <StyledTab icon={<AssessmentIcon />} label="Analytics" />
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
                      <Typography variant="body2" sx={{ opacity: 0.8, mb: 1 }}>Production Orders</Typography>
                      <Typography variant="h3" sx={{ fontWeight: 700 }}>
                        {productionOrders.length || 32}
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
                      <Typography variant="body2" sx={{ opacity: 0.8, mb: 1 }}>Units Produced</Typography>
                      <Typography variant="h3" sx={{ fontWeight: 700 }}>
                        1,200
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                      <InventoryIcon sx={{ fontSize: 28 }} />
                    </Avatar>
                  </Box>
                </CardContent>
              </MetricCard>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <MetricCard sx={{ background: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="body2" sx={{ opacity: 0.8, mb: 1 }}>Downtime Hours</Typography>
                      <Typography variant="h3" sx={{ fontWeight: 700 }}>
                        8
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                      <WarningIcon sx={{ fontSize: 28 }} />
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
                      <Typography variant="body2" sx={{ opacity: 0.8, mb: 1 }}>Operators</Typography>
                      <Typography variant="h3" sx={{ fontWeight: 700 }}>
                        14
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                      <PeopleIcon sx={{ fontSize: 28 }} />
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
                    <FactoryIcon sx={{ mr: 1, color: '#607D8B' }} />
                    Recent Manufacturing Activity
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

            {/* Production Efficiency */}
            <Grid item xs={12} md={4}>
              <AnalyticsCard>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Production Efficiency</Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Box sx={{ space: 2 }}>
                    <Box sx={{ mb: 2 }}>
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="body2">Overall Efficiency</Typography>
                        <Typography variant="body2" color="success.main">92%</Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={92} color="success" sx={{ borderRadius: 1, height: 8 }} />
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="body2">Quality Rate</Typography>
                        <Typography variant="body2" color="primary">95%</Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={95} sx={{ borderRadius: 1, height: 8 }} />
                    </Box>
                    <Box>
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="body2">On-Time Delivery</Typography>
                        <Typography variant="body2" color="warning.main">88%</Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={88} color="warning" sx={{ borderRadius: 1, height: 8 }} />
                    </Box>
                  </Box>
                </CardContent>
              </AnalyticsCard>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Production Tab */}
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <AnalyticsCard>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Active Production Orders</Typography>
                  <Divider sx={{ mb: 2 }} />
                  {productionOrders.length > 0 ? (
                    <List sx={{ py: 0 }}>
                      {productionOrders.slice(0, 10).map((order, idx) => (
                        <ListItem key={idx} sx={{ px: 0, py: 1 }}>
                          <ListItemText 
                            primary={`Order #${order.id || `PO-${1000 + idx}`} - ${order.product?.name || 'Product'}`}
                            secondary={`Quantity: ${order.quantity || Math.floor(Math.random() * 500) + 100} | Status: ${order.status || 'In Progress'}`}
                            primaryTypographyProps={{ fontWeight: 500 }}
                          />
                          <Chip 
                            label={order.status || 'In Progress'}
                            size="small" 
                            color={order.status === 'Completed' ? 'success' : order.status === 'In Progress' ? 'warning' : 'default'}
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Alert severity="info" sx={{ borderRadius: 2 }}>No production orders available</Alert>
                  )}
                </CardContent>
              </AnalyticsCard>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Quality Tab */}
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <AnalyticsCard>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Quality Control</Typography>
                  <Divider sx={{ mb: 2 }} />
                  {qualityData.length > 0 ? (
                    <List sx={{ py: 0 }}>
                      {qualityData.slice(0, 10).map((quality, idx) => (
                        <ListItem key={idx} sx={{ px: 0, py: 1 }}>
                          <ListItemText 
                            primary={`Batch #${quality.batch_number || `B-${100 + idx}`} - ${quality.product?.name || 'Product'}`}
                            secondary={`Defect Rate: ${quality.defect_rate || (Math.random() * 5).toFixed(1)}% | Inspector: ${quality.inspector || 'QC Team'}`}
                            primaryTypographyProps={{ fontWeight: 500 }}
                          />
                          <Chip 
                            label={quality.status || 'Passed'}
                            size="small" 
                            color={quality.status === 'Passed' ? 'success' : quality.status === 'Failed' ? 'error' : 'warning'}
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Alert severity="info" sx={{ borderRadius: 2 }}>No quality data available</Alert>
                  )}
                </CardContent>
              </AnalyticsCard>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Analytics Tab */}
        <TabPanel value={tabValue} index={3}>
          <Grid container spacing={3}>
            {/* Production Efficiency Analytics */}
            <Grid item xs={12} md={6}>
              <AnalyticsCard>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center' }}>
                    <TrendingUpIcon sx={{ mr: 1, color: '#4CAF50' }} />
                    Production Efficiency Analytics
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Box sx={{ height: 300 }}>
                    {/* Overall Efficiency Score */}
                    <Box sx={{ textAlign: 'center', mb: 3 }}>
                      <Typography variant="h3" color="primary" sx={{ mb: 1 }}>
                        92.5%
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Overall Production Efficiency
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={92.5} 
                        sx={{ height: 8, borderRadius: 4, mb: 2 }} 
                      />
                    </Box>
                    
                    {/* Efficiency Breakdown */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {[
                        { metric: 'Equipment Utilization', score: 95, color: '#4CAF50' },
                        { metric: 'Labor Productivity', score: 88, color: '#2196F3' },
                        { metric: 'Material Efficiency', score: 94, color: '#FF9800' },
                        { metric: 'Energy Efficiency', score: 89, color: '#9C27B0' }
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

            {/* Quality Control Analytics */}
            <Grid item xs={12} md={6}>
              <AnalyticsCard>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center' }}>
                    <QualityIcon sx={{ mr: 1, color: '#FF9800' }} />
                    Quality Control Analytics
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Box sx={{ height: 300 }}>
                    {/* Quality Score Chart */}
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Weekly Quality Score (Last 4 Weeks)
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, mb: 2, alignItems: 'end', height: 100 }}>
                        {['Week 1', 'Week 2', 'Week 3', 'Week 4'].map((week, i) => {
                          const quality = [94, 96, 93, 97][i];
                          const height = (quality / 100) * 80;
                          return (
                            <Box key={week} sx={{ flex: 1, textAlign: 'center' }}>
                              <Box 
                                sx={{ 
                                  height: height, 
                                  bgcolor: quality > 95 ? '#4CAF50' : quality > 90 ? '#FF9800' : '#F44336', 
                                  borderRadius: 1,
                                  mb: 1,
                                  opacity: 0.8
                                }} 
                              />
                              <Typography variant="caption">{week}</Typography>
                              <Typography variant="caption" display="block" color="text.secondary">
                                {quality}%
                              </Typography>
                            </Box>
                          );
                        })}
                      </Box>
                    </Box>
                    
                    {/* Quality Metrics */}
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                      <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'success.light', color: 'success.contrastText' }}>
                        <Typography variant="h5">95.2%</Typography>
                        <Typography variant="caption">Pass Rate</Typography>
                      </Paper>
                      <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'error.light', color: 'error.contrastText' }}>
                        <Typography variant="h5">2.1%</Typography>
                        <Typography variant="caption">Defect Rate</Typography>
                      </Paper>
                    </Box>
                  </Box>
                </CardContent>
              </AnalyticsCard>
            </Grid>

            {/* Production Line Performance */}
            <Grid item xs={12} md={6}>
              <AnalyticsCard>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center' }}>
                    <FactoryIcon sx={{ mr: 1, color: '#9C27B0' }} />
                    Production Line Performance
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Box sx={{ height: 300 }}>
                    {/* Production Line Comparison */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {[
                        { line: 'Line A', efficiency: 95, output: 420, downtime: 2 },
                        { line: 'Line B', efficiency: 89, output: 380, downtime: 5 },
                        { line: 'Line C', efficiency: 92, output: 400, downtime: 3 },
                        { line: 'Line D', efficiency: 87, output: 350, downtime: 8 }
                      ].map((line, idx) => (
                        <Box key={line.line}>
                          <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                            {line.line}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="caption" color="text.secondary">Efficiency</Typography>
                              <LinearProgress 
                                variant="determinate" 
                                value={line.efficiency} 
                                sx={{ height: 4, borderRadius: 2 }}
                                color="primary"
                              />
                            </Box>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="caption" color="text.secondary">Output</Typography>
                              <LinearProgress 
                                variant="determinate" 
                                value={(line.output / 450) * 100} 
                                sx={{ height: 4, borderRadius: 2 }}
                                color="success"
                              />
                            </Box>
                            <Box sx={{ minWidth: 60, textAlign: 'center' }}>
                              <Typography variant="caption" color="text.secondary">Downtime</Typography>
                              <Typography variant="body2" color={line.downtime > 5 ? 'error.main' : 'text.primary'}>
                                {line.downtime}h
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                </CardContent>
              </AnalyticsCard>
            </Grid>

            {/* Equipment & Maintenance Analytics */}
            <Grid item xs={12} md={6}>
              <AnalyticsCard>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center' }}>
                    <BuildIcon sx={{ mr: 1, color: '#FF5722' }} />
                    Equipment & Maintenance Analytics
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Box sx={{ height: 300 }}>
                    {/* Key Metrics */}
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 3 }}>
                      <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                        <Typography variant="h4">18</Typography>
                        <Typography variant="caption">Active Equipment</Typography>
                      </Paper>
                      <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'warning.light', color: 'warning.contrastText' }}>
                        <Typography variant="h4">3</Typography>
                        <Typography variant="caption">Maintenance Due</Typography>
                      </Paper>
                    </Box>

                    {/* Equipment Health */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          Overall Equipment Health
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <LinearProgress 
                            variant="determinate" 
                            value={87} 
                            sx={{ flex: 1, height: 8, borderRadius: 4 }}
                            color="success"
                          />
                          <Typography variant="h6" color="success.main">87%</Typography>
                        </Box>
                      </Box>

                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          Average Maintenance Interval
                        </Typography>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h4" color="info.main">45 days</Typography>
                          <Typography variant="caption" color="text.secondary">
                            +2 days from last quarter
                          </Typography>
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                        <Paper sx={{ p: 1.5, textAlign: 'center', bgcolor: 'success.light', color: 'success.contrastText', flex: 1, mr: 1 }}>
                          <Typography variant="h6">96%</Typography>
                          <Typography variant="caption">Uptime</Typography>
                        </Paper>
                        <Paper sx={{ p: 1.5, textAlign: 'center', bgcolor: 'error.light', color: 'error.contrastText', flex: 1, ml: 1 }}>
                          <Typography variant="h6">4%</Typography>
                          <Typography variant="caption">Downtime</Typography>
                        </Paper>
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </AnalyticsCard>
            </Grid>

            {/* Production Planning & Scheduling */}
            <Grid item xs={12}>
              <AnalyticsCard>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center' }}>
                    <ScheduleIcon sx={{ mr: 1, color: '#2196F3' }} />
                    Production Planning & Scheduling Analytics
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Grid container spacing={3}>
                    {/* Schedule Adherence */}
                    <Grid item xs={12} md={4}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h3" color="primary" sx={{ mb: 1 }}>
                          91%
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          Schedule Adherence Rate
                        </Typography>
                        <LinearProgress 
                          variant="determinate" 
                          value={91} 
                          sx={{ height: 8, borderRadius: 4 }} 
                        />
                      </Box>
                    </Grid>

                    {/* Production Orders Status */}
                    <Grid item xs={12} md={8}>
                      <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                        Production Orders Status
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {[
                          { status: 'Completed', count: 28, total: 45, progress: 62, color: 'success' },
                          { status: 'In Progress', count: 12, total: 45, progress: 27, color: 'primary' },
                          { status: 'Pending', count: 3, total: 45, progress: 7, color: 'warning' },
                          { status: 'Delayed', count: 2, total: 45, progress: 4, color: 'error' }
                        ].map((order, idx) => (
                          <Box key={order.status} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ minWidth: 100 }}>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {order.status}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {order.count}/{order.total} orders
                              </Typography>
                            </Box>
                            <Box sx={{ flex: 1 }}>
                              <LinearProgress 
                                variant="determinate" 
                                value={order.progress} 
                                sx={{ height: 8, borderRadius: 4 }}
                                color={order.color}
                              />
                            </Box>
                            <Typography variant="body2" color="text.secondary" sx={{ minWidth: 40 }}>
                              {order.progress}%
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
    </Box>
  );
};

export default ManufacturingDashboard;

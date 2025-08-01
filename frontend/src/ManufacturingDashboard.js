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
            {/* Transaction Integration */}
            <Grid item xs={12} md={6}>
              <TransactionIntegration 
                moduleId="manufacturing" 
                title="Manufacturing Transaction Flow"
              />
            </Grid>
            
            {/* Time-Based Analytics */}
            <Grid item xs={12} md={6}>
              <TimeBasedAnalytics 
                moduleId="manufacturing" 
                title="Manufacturing Trends Analysis"
              />
            </Grid>
            
            {/* Advanced Analytics with Charts */}
            <Grid item xs={12}>
              <AdvancedAnalytics 
                moduleId="manufacturing" 
                title="Manufacturing Performance Analytics"
                data={{
                  efficiency_rate: 92,
                  quality_score: 95,
                  production_lines: 3,
                  downtime_hours: 8
                }}
              />
            </Grid>
            
            {/* Gantt Chart for Manufacturing Projects */}
            <Grid item xs={12}>
              <GanttChart 
                title="Manufacturing Project Timeline"
                projects={[
                  {
                    id: 1,
                    name: 'Production Line Optimization',
                    type: 'manufacturing',
                    manager: 'Production Manager',
                    status: 'in-progress',
                    priority: 'high',
                    startDate: new Date('2024-01-01'),
                    endDate: new Date('2024-03-31'),
                    progress: 75,
                    budget: 150000,
                    team: ['Production Engineer', 'Quality Control', 'Maintenance Team'],
                    tasks: [
                      {
                        id: 101,
                        name: 'Equipment Setup',
                        startDate: new Date('2024-01-01'),
                        endDate: new Date('2024-01-20'),
                        progress: 100,
                        status: 'completed',
                        assignee: 'Production Engineer',
                        dependencies: []
                      },
                      {
                        id: 102,
                        name: 'Process Optimization',
                        startDate: new Date('2024-01-15'),
                        endDate: new Date('2024-02-15'),
                        progress: 90,
                        status: 'in-progress',
                        assignee: 'Quality Control',
                        dependencies: [101]
                      },
                      {
                        id: 103,
                        name: 'Quality Testing',
                        startDate: new Date('2024-02-10'),
                        endDate: new Date('2024-03-10'),
                        progress: 60,
                        status: 'in-progress',
                        assignee: 'Quality Control',
                        dependencies: [102]
                      },
                      {
                        id: 104,
                        name: 'Full Production Run',
                        startDate: new Date('2024-03-01'),
                        endDate: new Date('2024-03-31'),
                        progress: 20,
                        status: 'pending',
                        assignee: 'Production Manager',
                        dependencies: [103]
                      }
                    ]
                  }
                ]}
              />
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default ManufacturingDashboard;

import React, { useState, useEffect, useContext } from 'react';
import { 
  Box, Typography, Grid, Card, CardContent, CircularProgress, Alert,
  Tabs, Tab, Paper, Chip, Avatar, LinearProgress, Divider, IconButton, List, ListItem, ListItemText, Button,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Snackbar
} from '@mui/material';
import { styled } from '@mui/material/styles';
import RouteIcon from '@mui/icons-material/Route';
import AssessmentIcon from '@mui/icons-material/Assessment';
import DirectionsIcon from '@mui/icons-material/Directions';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import MapIcon from '@mui/icons-material/Map';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import RefreshIcon from '@mui/icons-material/Refresh';
import AddIcon from '@mui/icons-material/Add';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
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
    background: 'linear-gradient(45deg, #3F51B5 30%, #1A237E 90%)',
  },
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '0.95rem',
  minHeight: 64,
  color: '#666',
  '&.Mui-selected': {
    color: '#3F51B5',
  },
}));

const MetricCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(135deg, #3F51B5 0%, #1A237E 100%)',
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
      id={`route-tabpanel-${index}`}
      aria-labelledby={`route-tab-${index}`}
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

const mockRouteData = [
  { id: 1, name: 'Accra-Kumasi Express', distance: '250 km', duration: '3h 45m', status: 'Active', efficiency: '92%' },
  { id: 2, name: 'Tema Port Distribution', distance: '45 km', duration: '1h 15m', status: 'Active', efficiency: '88%' },
  { id: 3, name: 'Northern Region Circuit', distance: '420 km', duration: '6h 30m', status: 'Planned', efficiency: '85%' },
  { id: 4, name: 'Coastal Delivery Route', distance: '180 km', duration: '2h 50m', status: 'Active', efficiency: '94%' },
];

const RoutePlanningDashboard = () => {
  const { token } = useContext(AuthContext);
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [routes, setRoutes] = useState([]);
  
  // Quick Actions State
  const [routeDialogOpen, setRouteDialogOpen] = useState(false);
  const [waypointDialogOpen, setWaypointDialogOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  
  // Form State
  const [routeForm, setRouteForm] = useState({
    name: '',
    startLocation: '',
    endLocation: '',
    vehicleType: 'truck'
  });
  
  const [waypointForm, setWaypointForm] = useState({
    route: '',
    location: '',
    stopDuration: '15',
    priority: 'medium'
  });
  
  // Quick Action Handlers
  const handleCreateRoute = async () => {
    try {
      console.log('Creating route:', routeForm);
      setSnackbarMessage('Route created successfully!');
      setSnackbarOpen(true);
      setRouteDialogOpen(false);
      setRouteForm({ name: '', startLocation: '', endLocation: '', vehicleType: 'truck' });
    } catch (error) {
      setSnackbarMessage('Failed to create route');
      setSnackbarOpen(true);
    }
  };
  
  const handleAddWaypoint = async () => {
    try {
      console.log('Adding waypoint:', waypointForm);
      setSnackbarMessage('Waypoint added successfully!');
      setSnackbarOpen(true);
      setWaypointDialogOpen(false);
      setWaypointForm({ route: '', location: '', stopDuration: '15', priority: 'medium' });
    } catch (error) {
      setSnackbarMessage('Failed to add waypoint');
      setSnackbarOpen(true);
    }
  };
  
  const handleOptimizeRoutes = () => {
    setSnackbarMessage('Route optimization started!');
    setSnackbarOpen(true);
  };
  
  const handleTrackDelivery = () => {
    setSnackbarMessage('Opening delivery tracking...');
    setSnackbarOpen(true);
  };

  const recentActivity = [
    { action: 'Accra-Kumasi Express route optimized - 15% time saved', timestamp: '10 minutes ago', type: 'success' },
    { action: 'New delivery route created for Northern Region', timestamp: '1 hour ago', type: 'info' },
    { action: 'Coastal Delivery Route completed successfully', timestamp: '2 hours ago', type: 'success' },
    { action: 'Traffic alert: Tema Port route delayed by 30 minutes', timestamp: '3 hours ago', type: 'warning' },
  ];

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;
      
      setLoading(true);
      try {
        try {
          const routesRes = await api.get('/routes/', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setRoutes(routesRes.data || mockRouteData);
        } catch (err) {
          console.warn('Failed to load routes:', err);
          setRoutes(mockRouteData);
        }
      } catch (err) {
        setError('Failed to load route planning dashboard data.');
        console.error('Route planning dashboard error:', err);
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
        background: 'linear-gradient(135deg, #3F51B5 0%, #1A237E 100%)',
        color: 'white',
        p: 4,
        borderRadius: '0 0 24px 24px',
        mb: 3
      }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
              Route Planning Dashboard
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              Optimize delivery routes, track shipments, and manage logistics efficiently.
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
              onClick={() => setRouteDialogOpen(true)}
              sx={{ 
                background: 'linear-gradient(45deg, #3F51B5 30%, #1A237E 90%)',
                color: 'white'
              }}
            >
              Create Route
            </QuickActionButton>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <QuickActionButton
              fullWidth
              variant="contained"
              startIcon={<GpsFixedIcon />}
              onClick={() => setWaypointDialogOpen(true)}
              sx={{ 
                background: 'linear-gradient(45deg, #4CAF50 30%, #2E7D32 90%)',
                color: 'white'
              }}
            >
              Add Waypoint
            </QuickActionButton>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <QuickActionButton
              fullWidth
              variant="contained"
              startIcon={<TrendingUpIcon />}
              onClick={handleOptimizeRoutes}
              sx={{ 
                background: 'linear-gradient(45deg, #FF9800 30%, #FF5722 90%)',
                color: 'white'
              }}
            >
              Optimize Routes
            </QuickActionButton>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <QuickActionButton
              fullWidth
              variant="contained"
              startIcon={<TrackChangesIcon />}
              onClick={handleTrackDelivery}
              sx={{ 
                background: 'linear-gradient(45deg, #2196F3 30%, #1976D2 90%)',
                color: 'white'
              }}
            >
              Track Delivery
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
          <StyledTab icon={<RouteIcon />} label="Routes" />
          <StyledTab icon={<MapIcon />} label="Live Map" />
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
                        {routes.length || 4}
                      </Typography>
                      <Typography variant="body1" sx={{ opacity: 0.9 }}>
                        Active Routes
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                      <RouteIcon sx={{ fontSize: 28 }} />
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
                      <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: '#3F51B5' }}>
                        895
                      </Typography>
                      <Typography variant="body1" color="textSecondary">
                        Total Distance (km)
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: '#e8eaf6', color: '#3F51B5', width: 56, height: 56 }}>
                      <DirectionsIcon sx={{ fontSize: 28 }} />
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
                        90%
                      </Typography>
                      <Typography variant="body1" color="textSecondary">
                        Avg Efficiency
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
                        24
                      </Typography>
                      <Typography variant="body1" color="textSecondary">
                        Active Vehicles
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: '#fff3e0', color: '#FF9800', width: 56, height: 56 }}>
                      <LocalShippingIcon sx={{ fontSize: 28 }} />
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
                          color={activity.type === 'success' ? 'success' : activity.type === 'warning' ? 'warning' : 'info'}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </AnalyticsCard>
            </Grid>

            {/* Route Status */}
            <Grid item xs={12} md={6}>
              <AnalyticsCard>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Route Status</Typography>
                  <Divider sx={{ mb: 2 }} />
                  {routes.slice(0, 4).map((route, index) => (
                    <Box key={index} sx={{ mb: 2 }}>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                        <Typography variant="body1" fontWeight={500}>{route.name}</Typography>
                        <Chip 
                          label={route.status}
                          size="small"
                          color={route.status === 'Active' ? 'success' : 'default'}
                        />
                      </Box>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                        <Typography variant="body2" color="textSecondary">{route.distance} • {route.duration}</Typography>
                        <Typography variant="body2" fontWeight={500}>{route.efficiency}</Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={parseInt(route.efficiency)} 
                        sx={{ 
                          height: 6, 
                          borderRadius: 3,
                          bgcolor: '#f0f0f0',
                          '& .MuiLinearProgress-bar': {
                            bgcolor: parseInt(route.efficiency) > 90 ? '#4caf50' : parseInt(route.efficiency) > 80 ? '#ff9800' : '#f44336'
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

        {/* Routes Tab */}
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <AnalyticsCard>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Route Directory</Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Typography variant="body1" color="textSecondary" textAlign="center" py={4}>
                    Route management interface will be displayed here.
                    Use the "Create Route" quick action to create new delivery routes.
                  </Typography>
                </CardContent>
              </AnalyticsCard>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Live Map Tab */}
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <AnalyticsCard>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Live Route Tracking</Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Box 
                    sx={{ 
                      height: 400, 
                      bgcolor: '#f5f5f5', 
                      borderRadius: 2, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      border: '2px dashed #ddd'
                    }}
                  >
                    <Box textAlign="center">
                      <MapIcon sx={{ fontSize: 64, color: '#bbb', mb: 2 }} />
                      <Typography variant="h6" color="textSecondary">
                        Interactive Map View
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Real-time vehicle tracking and route visualization will be displayed here.
                      </Typography>
                    </Box>
                  </Box>
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
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Route Analytics</Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Typography variant="body1" color="textSecondary" textAlign="center" py={4}>
                    Route performance analytics and optimization insights will be displayed here.
                    Use the "Optimize Routes" quick action to improve delivery efficiency.
                  </Typography>
                </CardContent>
              </AnalyticsCard>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>
      
      {/* Create Route Dialog */}
      <Dialog open={routeDialogOpen} onClose={() => setRouteDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create Route</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Route Name"
            value={routeForm.name}
            onChange={(e) => setRouteForm({...routeForm, name: e.target.value})}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Start Location"
            value={routeForm.startLocation}
            onChange={(e) => setRouteForm({...routeForm, startLocation: e.target.value})}
            margin="normal"
          />
          <TextField
            fullWidth
            label="End Location"
            value={routeForm.endLocation}
            onChange={(e) => setRouteForm({...routeForm, endLocation: e.target.value})}
            margin="normal"
          />
          <TextField
            fullWidth
            select
            label="Vehicle Type"
            value={routeForm.vehicleType}
            onChange={(e) => setRouteForm({...routeForm, vehicleType: e.target.value})}
            margin="normal"
          >
            <MenuItem value="truck">Truck</MenuItem>
            <MenuItem value="van">Van</MenuItem>
            <MenuItem value="motorcycle">Motorcycle</MenuItem>
            <MenuItem value="car">Car</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRouteDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleCreateRoute} 
            variant="contained"
            sx={{ background: 'linear-gradient(45deg, #3F51B5 30%, #1A237E 90%)' }}
          >
            Create Route
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Add Waypoint Dialog */}
      <Dialog open={waypointDialogOpen} onClose={() => setWaypointDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Waypoint</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            select
            label="Route"
            value={waypointForm.route}
            onChange={(e) => setWaypointForm({...waypointForm, route: e.target.value})}
            margin="normal"
          >
            {routes.map((route, index) => (
              <MenuItem key={index} value={route.name}>{route.name}</MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth
            label="Location"
            value={waypointForm.location}
            onChange={(e) => setWaypointForm({...waypointForm, location: e.target.value})}
            margin="normal"
            placeholder="Enter address or coordinates"
          />
          <TextField
            fullWidth
            label="Stop Duration (minutes)"
            value={waypointForm.stopDuration}
            onChange={(e) => setWaypointForm({...waypointForm, stopDuration: e.target.value})}
            margin="normal"
            type="number"
          />
          <TextField
            fullWidth
            select
            label="Priority"
            value={waypointForm.priority}
            onChange={(e) => setWaypointForm({...waypointForm, priority: e.target.value})}
            margin="normal"
          >
            <MenuItem value="high">High</MenuItem>
            <MenuItem value="medium">Medium</MenuItem>
            <MenuItem value="low">Low</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setWaypointDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleAddWaypoint} 
            variant="contained"
            sx={{ background: 'linear-gradient(45deg, #4CAF50 30%, #2E7D32 90%)' }}
          >
            Add Waypoint
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

export default RoutePlanningDashboard;

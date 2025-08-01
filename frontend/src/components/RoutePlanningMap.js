import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Grid,
  Card,
  CardContent,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Map as MapIcon,
  DirectionsRun as DirectionsIcon,
  LocationOn as LocationIcon,
  Add as AddIcon,
  Clear as ClearIcon,
  Route as RouteIcon,
  LocalShipping as TruckIcon,
  Timer as TimerIcon,
  Speed as SpeedIcon
} from '@mui/icons-material';
import GoogleMapsService from '../services/GoogleMapsService';

const RoutePlanningMap = ({ customers = [], warehouses = [], routes = [] }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [map, setMap] = useState(null);
  const [directionsService, setDirectionsService] = useState(null);
  const [directionsRenderer, setDirectionsRenderer] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [routeDialogOpen, setRouteDialogOpen] = useState(false);
  const [newRoute, setNewRoute] = useState({
    name: '',
    startLocation: '',
    endLocation: '',
    waypoints: []
  });
  const [routeResults, setRouteResults] = useState(null);
  
  const mapRef = useRef(null);

  useEffect(() => {
    initializeMap();
  }, []);

  useEffect(() => {
    if (map && customers.length > 0) {
      displayCustomerLocations();
    }
  }, [map, customers]);

  useEffect(() => {
    if (map && warehouses.length > 0) {
      displayWarehouseLocations();
    }
  }, [map, warehouses]);

  const initializeMap = async () => {
    try {
      setLoading(true);
      await GoogleMapsService.loadGoogleMaps();
      
      // Wait for DOM element to be available and visible
      if (mapRef.current && mapRef.current.offsetParent !== null) {
        // Add a small delay to ensure DOM is fully rendered
        setTimeout(() => {
          try {
            const mapInstance = GoogleMapsService.createMap(mapRef.current, {
              zoom: 7,
              center: { lat: 7.9465, lng: -1.0232 }, // Ghana center
              mapTypeId: window.google.maps.MapTypeId.ROADMAP
            });

            const directionsServiceInstance = new window.google.maps.DirectionsService();
            const directionsRendererInstance = new window.google.maps.DirectionsRenderer({
              draggable: true,
              panel: null
            });

            directionsRendererInstance.setMap(mapInstance);

            setMap(mapInstance);
            setDirectionsService(directionsServiceInstance);
            setDirectionsRenderer(directionsRendererInstance);

            // Add click listener for adding waypoints
            mapInstance.addListener('click', (event) => {
              handleMapClick(event.latLng);
            });
          } catch (mapError) {
            console.error('Map creation error:', mapError);
            setError('Failed to initialize route planning map');
          }
        }, 100);
      } else {
        // Retry after a short delay if element is not ready
        setTimeout(() => {
          if (mapRef.current) {
            initializeMap();
          }
        }, 200);
      }
    } catch (err) {
      setError('Failed to load Google Maps');
      console.error('Map initialization error:', err);
    } finally {
      setLoading(false);
    }
  };

  const displayCustomerLocations = () => {
    // Clear existing customer markers
    markers.forEach(marker => {
      if (marker.type === 'customer') {
        marker.setMap(null);
      }
    });

    const customerMarkers = [];

    customers.forEach(customer => {
      if (customer.latitude && customer.longitude) {
        const position = {
          lat: parseFloat(customer.latitude),
          lng: parseFloat(customer.longitude)
        };

        const marker = GoogleMapsService.addMarker(map, position, {
          title: customer.name,
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#f44336"/>
              </svg>
            `),
            scaledSize: new window.google.maps.Size(24, 24)
          }
        });

        marker.type = 'customer';

        GoogleMapsService.addInfoWindow(marker, `
          <div style="padding: 8px;">
            <h3 style="margin: 0 0 8px 0; color: #333;">${customer.name}</h3>
            <p style="margin: 0 0 4px 0;"><strong>Type:</strong> ${customer.customer_type}</p>
            <p style="margin: 0 0 4px 0;"><strong>Email:</strong> ${customer.email}</p>
            <p style="margin: 0 0 4px 0;"><strong>Phone:</strong> ${customer.phone || 'N/A'}</p>
            <p style="margin: 0;"><strong>Address:</strong> ${customer.address || 'N/A'}</p>
          </div>
        `);

        customerMarkers.push(marker);
      }
    });

    setMarkers(prev => [...prev.filter(m => m.type !== 'customer'), ...customerMarkers]);
  };

  const displayWarehouseLocations = () => {
    // Clear existing warehouse markers
    markers.forEach(marker => {
      if (marker.type === 'warehouse') {
        marker.setMap(null);
      }
    });

    const warehouseMarkers = [];

    warehouses.forEach(warehouse => {
      if (warehouse.latitude && warehouse.longitude) {
        const position = {
          lat: parseFloat(warehouse.latitude),
          lng: parseFloat(warehouse.longitude)
        };

        const marker = GoogleMapsService.addMarker(map, position, {
          title: warehouse.name,
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="#2196f3"/>
              </svg>
            `),
            scaledSize: new window.google.maps.Size(24, 24)
          }
        });

        marker.type = 'warehouse';

        GoogleMapsService.addInfoWindow(marker, `
          <div style="padding: 8px;">
            <h3 style="margin: 0 0 8px 0; color: #333;">${warehouse.name}</h3>
            <p style="margin: 0 0 4px 0;"><strong>Code:</strong> ${warehouse.code}</p>
            <p style="margin: 0 0 4px 0;"><strong>Manager:</strong> ${warehouse.manager || 'N/A'}</p>
            <p style="margin: 0;"><strong>Address:</strong> ${warehouse.address || 'N/A'}</p>
          </div>
        `);

        warehouseMarkers.push(marker);
      }
    });

    setMarkers(prev => [...prev.filter(m => m.type !== 'warehouse'), ...warehouseMarkers]);
  };

  const handleMapClick = (latLng) => {
    // Add waypoint to new route if dialog is open
    if (routeDialogOpen) {
      const waypoint = {
        lat: latLng.lat(),
        lng: latLng.lng(),
        name: `Waypoint ${newRoute.waypoints.length + 1}`
      };
      
      setNewRoute(prev => ({
        ...prev,
        waypoints: [...prev.waypoints, waypoint]
      }));
    }
  };

  const calculateRoute = async (origin, destination, waypoints = []) => {
    if (!directionsService || !directionsRenderer) return;

    try {
      setLoading(true);
      const result = await GoogleMapsService.getDirections(origin, destination, waypoints);
      
      directionsRenderer.setDirections(result);
      
      const route = result.routes[0];
      const leg = route.legs[0];
      
      setRouteResults({
        distance: route.legs.reduce((total, leg) => total + leg.distance.value, 0),
        duration: route.legs.reduce((total, leg) => total + leg.duration.value, 0),
        overview_path: route.overview_path
      });
      
    } catch (err) {
      setError('Failed to calculate route');
      console.error('Route calculation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRoute = async () => {
    if (!newRoute.startLocation || !newRoute.endLocation) {
      setError('Please specify start and end locations');
      return;
    }

    try {
      await calculateRoute(
        newRoute.startLocation,
        newRoute.endLocation,
        newRoute.waypoints.map(wp => ({ lat: wp.lat, lng: wp.lng }))
      );
      
      setRouteDialogOpen(false);
      setNewRoute({ name: '', startLocation: '', endLocation: '', waypoints: [] });
    } catch (err) {
      setError('Failed to create route');
    }
  };

  const clearRoute = () => {
    if (directionsRenderer) {
      directionsRenderer.setDirections({ routes: [] });
    }
    setRouteResults(null);
    setSelectedRoute(null);
  };

  const formatDistance = (meters) => {
    return meters > 1000 ? `${(meters / 1000).toFixed(1)} km` : `${meters} m`;
  };

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  return (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ height: 600, position: 'relative' }}>
            {loading && (
              <Box 
                position="absolute" 
                top={0} 
                left={0} 
                right={0} 
                bottom={0} 
                display="flex" 
                alignItems="center" 
                justifyContent="center"
                bgcolor="rgba(255,255,255,0.8)"
                zIndex={1000}
              >
                <CircularProgress />
              </Box>
            )}
            
            <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
            
            {/* Map Controls */}
            <Box position="absolute" top={16} right={16} display="flex" flexDirection="column" gap={1}>
              <Tooltip title="Create New Route">
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setRouteDialogOpen(true)}
                  size="small"
                >
                  New Route
                </Button>
              </Tooltip>
              
              {routeResults && (
                <Tooltip title="Clear Route">
                  <Button
                    variant="outlined"
                    startIcon={<ClearIcon />}
                    onClick={clearRoute}
                    size="small"
                  >
                    Clear
                  </Button>
                </Tooltip>
              )}
            </Box>

            {/* Legend */}
            <Box position="absolute" bottom={16} left={16}>
              <Paper sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.9)' }}>
                <Typography variant="subtitle2" gutterBottom>Legend</Typography>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <Box width={16} height={16} bgcolor="#f44336" borderRadius="50%" />
                  <Typography variant="caption">Customers</Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <Box width={16} height={16} bgcolor="#2196f3" borderRadius="50%" />
                  <Typography variant="caption">Warehouses</Typography>
                </Box>
              </Paper>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Box display="flex" flexDirection="column" gap={2}>
            {error && (
              <Alert severity="error" onClose={() => setError('')}>
                {error}
              </Alert>
            )}
            
            {/* Route Information */}
            {routeResults && (
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Route Information
                  </Typography>
                  
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <RouteIcon color="primary" />
                    <Typography variant="body2">
                      Distance: {formatDistance(routeResults.distance)}
                    </Typography>
                  </Box>
                  
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <TimerIcon color="primary" />
                    <Typography variant="body2">
                      Duration: {formatDuration(routeResults.duration)}
                    </Typography>
                  </Box>
                  
                  <Box display="flex" alignItems="center" gap={1}>
                    <SpeedIcon color="primary" />
                    <Typography variant="body2">
                      Avg Speed: {Math.round((routeResults.distance / 1000) / (routeResults.duration / 3600))} km/h
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            )}
            
            {/* Location Summary */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Locations Summary
                </Typography>
                
                <Box display="flex" justifyContent="space-between" mb={2}>
                  <Chip 
                    icon={<LocationIcon />} 
                    label={`${customers.filter(c => c.latitude && c.longitude).length} Customers`} 
                    color="error" 
                    variant="outlined" 
                  />
                  <Chip 
                    icon={<TruckIcon />} 
                    label={`${warehouses.filter(w => w.latitude && w.longitude).length} Warehouses`} 
                    color="primary" 
                    variant="outlined" 
                  />
                </Box>
                
                <Typography variant="body2" color="text.secondary">
                  Click on map markers to view location details. Use "New Route" to plan delivery routes.
                </Typography>
              </CardContent>
            </Card>
            
            {/* Quick Actions */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Quick Actions
                </Typography>
                
                <List dense>
                  <ListItem button onClick={() => setRouteDialogOpen(true)}>
                    <ListItemIcon>
                      <DirectionsIcon />
                    </ListItemIcon>
                    <ListItemText primary="Plan New Route" />
                  </ListItem>
                  
                  <ListItem button onClick={() => map && map.setCenter({ lat: 7.9465, lng: -1.0232 })}>
                    <ListItemIcon>
                      <MapIcon />
                    </ListItemIcon>
                    <ListItemText primary="Center on Ghana" />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Box>
        </Grid>
      </Grid>

      {/* New Route Dialog */}
      <Dialog open={routeDialogOpen} onClose={() => setRouteDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Route</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Route Name"
            value={newRoute.name}
            onChange={(e) => setNewRoute(prev => ({ ...prev, name: e.target.value }))}
            margin="normal"
          />
          
          <TextField
            fullWidth
            label="Start Location"
            value={newRoute.startLocation}
            onChange={(e) => setNewRoute(prev => ({ ...prev, startLocation: e.target.value }))}
            margin="normal"
            placeholder="Enter start address or coordinates"
          />
          
          <TextField
            fullWidth
            label="End Location"
            value={newRoute.endLocation}
            onChange={(e) => setNewRoute(prev => ({ ...prev, endLocation: e.target.value }))}
            margin="normal"
            placeholder="Enter destination address or coordinates"
          />
          
          {newRoute.waypoints.length > 0 && (
            <Box mt={2}>
              <Typography variant="subtitle2" gutterBottom>
                Waypoints ({newRoute.waypoints.length})
              </Typography>
              {newRoute.waypoints.map((waypoint, index) => (
                <Chip
                  key={index}
                  label={`${waypoint.name}: ${waypoint.lat.toFixed(4)}, ${waypoint.lng.toFixed(4)}`}
                  onDelete={() => {
                    setNewRoute(prev => ({
                      ...prev,
                      waypoints: prev.waypoints.filter((_, i) => i !== index)
                    }));
                  }}
                  size="small"
                  sx={{ mr: 1, mb: 1 }}
                />
              ))}
            </Box>
          )}
          
          <Alert severity="info" sx={{ mt: 2 }}>
            Click on the map to add waypoints to your route.
          </Alert>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setRouteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateRoute} variant="contained">
            Create Route
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RoutePlanningMap;

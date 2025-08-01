import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  Chip,
  Grid,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Tooltip,
  IconButton
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import GoogleMapsService from '../services/GoogleMapsService';

const CustomerLocationMap = ({ customers = [], title = "Customer Locations in Ghana" }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState(customers);
  const [filters, setFilters] = useState({
    customerType: 'all',
    showLabels: true,
    clusterMarkers: true
  });
  const [stats, setStats] = useState({
    total: 0,
    withLocation: 0,
    byType: {}
  });
  
  const mapRef = useRef(null);

  useEffect(() => {
    initializeMap();
  }, []);

  useEffect(() => {
    if (customers.length > 0) {
      updateStats();
      applyFilters();
    }
  }, [customers]);

  useEffect(() => {
    applyFilters();
  }, [filters]);

  useEffect(() => {
    if (map && filteredCustomers.length > 0) {
      displayCustomerMarkers();
    }
  }, [map, filteredCustomers]);

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
              mapTypeId: window.google.maps.MapTypeId.ROADMAP,
              styles: [
                {
                  featureType: 'water',
                  elementType: 'geometry',
                  stylers: [{ color: '#e9e9e9' }, { lightness: 17 }]
                },
                {
                  featureType: 'landscape',
                  elementType: 'geometry',
                  stylers: [{ color: '#f5f5f5' }, { lightness: 20 }]
                }
              ]
            });

            setMap(mapInstance);
          } catch (mapError) {
            console.error('Map creation error:', mapError);
            setError('Failed to initialize customer location map');
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

  const updateStats = () => {
    const total = customers.length;
    const withLocation = customers.filter(c => c.latitude && c.longitude).length;
    const byType = customers.reduce((acc, customer) => {
      const type = customer.customer_type || 'unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    setStats({ total, withLocation, byType });
  };

  const applyFilters = () => {
    let filtered = customers.filter(customer => 
      customer.latitude && customer.longitude &&
      GoogleMapsService.isInGhana(customer.latitude, customer.longitude)
    );

    if (filters.customerType !== 'all') {
      filtered = filtered.filter(customer => 
        customer.customer_type === filters.customerType
      );
    }

    setFilteredCustomers(filtered);
  };

  const displayCustomerMarkers = () => {
    // Clear existing markers
    markers.forEach(marker => marker.setMap(null));
    setMarkers([]);

    const newMarkers = [];
    const bounds = new window.google.maps.LatLngBounds();

    filteredCustomers.forEach((customer, index) => {
      const position = {
        lat: parseFloat(customer.latitude),
        lng: parseFloat(customer.longitude)
      };

      // Create custom red marker for customers
      const marker = GoogleMapsService.addMarker(map, position, {
        title: customer.name,
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="8" fill="#ff0000" stroke="#ffffff" stroke-width="2"/>
              <circle cx="12" cy="12" r="4" fill="#ffffff"/>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(24, 24),
          anchor: new window.google.maps.Point(12, 12)
        },
        animation: window.google.maps.Animation.DROP,
        zIndex: 1000 - index // Higher priority for first customers
      });

      // Create info window with customer details
      const infoWindowContent = `
        <div style="padding: 12px; min-width: 200px;">
          <div style="display: flex; align-items: center; margin-bottom: 8px;">
            <div style="width: 12px; height: 12px; background: #ff0000; border-radius: 50%; margin-right: 8px;"></div>
            <h3 style="margin: 0; color: #333; font-size: 16px;">${customer.name}</h3>
          </div>
          
          <div style="margin-bottom: 6px;">
            <strong style="color: #666;">Type:</strong> 
            <span style="background: ${getTypeColor(customer.customer_type)}; color: white; padding: 2px 8px; border-radius: 12px; font-size: 12px; margin-left: 4px;">
              ${customer.customer_type || 'Unknown'}
            </span>
          </div>
          
          <div style="margin-bottom: 6px;">
            <strong style="color: #666;">Email:</strong> 
            <span style="color: #333;">${customer.email}</span>
          </div>
          
          ${customer.phone ? `
            <div style="margin-bottom: 6px;">
              <strong style="color: #666;">Phone:</strong> 
              <span style="color: #333;">${customer.phone}</span>
            </div>
          ` : ''}
          
          ${customer.address ? `
            <div style="margin-bottom: 6px;">
              <strong style="color: #666;">Address:</strong> 
              <span style="color: #333;">${customer.address}</span>
            </div>
          ` : ''}
          
          <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #eee; font-size: 12px; color: #666;">
            <strong>Coordinates:</strong> ${parseFloat(customer.latitude).toFixed(4)}, ${parseFloat(customer.longitude).toFixed(4)}
          </div>
        </div>
      `;

      GoogleMapsService.addInfoWindow(marker, infoWindowContent);

      // Add label if enabled
      if (filters.showLabels) {
        const label = new window.google.maps.InfoWindow({
          content: `<div style="background: rgba(255,0,0,0.8); color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">${customer.name}</div>`,
          position: position,
          pixelOffset: new window.google.maps.Size(0, -35)
        });
        label.open(map);
      }

      newMarkers.push(marker);
      bounds.extend(position);
    });

    setMarkers(newMarkers);

    // Fit map to show all markers
    if (newMarkers.length > 0) {
      if (newMarkers.length === 1) {
        map.setCenter(bounds.getCenter());
        map.setZoom(12);
      } else {
        map.fitBounds(bounds);
        map.setZoom(Math.min(map.getZoom(), 10)); // Don't zoom in too much
      }
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'retailer': return '#4caf50';
      case 'wholesaler': return '#2196f3';
      case 'distributor': return '#ff9800';
      default: return '#757575';
    }
  };

  const refreshMap = () => {
    if (map) {
      displayCustomerMarkers();
    }
  };

  const centerOnGhana = () => {
    if (map) {
      map.setCenter({ lat: 7.9465, lng: -1.0232 });
      map.setZoom(7);
    }
  };

  return (
    <Box>
      <Grid container spacing={3}>
        {/* Map Section */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ height: 600, position: 'relative' }}>
            <Box position="absolute" top={16} left={16} zIndex={1000}>
              <Typography 
                variant="h6" 
                sx={{ 
                  bgcolor: 'rgba(255,255,255,0.9)', 
                  p: 1, 
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                <LocationIcon sx={{ color: '#ff0000' }} />
                {title}
              </Typography>
            </Box>

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
                <Typography sx={{ ml: 2 }}>Loading Ghana Map...</Typography>
              </Box>
            )}
            
            <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
            
            {/* Map Controls */}
            <Box position="absolute" top={16} right={16} display="flex" flexDirection="column" gap={1}>
              <Tooltip title="Refresh Map">
                <IconButton 
                  onClick={refreshMap}
                  sx={{ bgcolor: 'rgba(255,255,255,0.9)' }}
                  size="small"
                >
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            </Box>

            {/* Legend */}
            <Box position="absolute" bottom={16} left={16}>
              <Paper sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.95)' }}>
                <Typography variant="subtitle2" gutterBottom>
                  <LocationIcon sx={{ fontSize: 16, color: '#ff0000', mr: 1 }} />
                  Customer Locations
                </Typography>
                <Box display="flex" flexDirection="column" gap={1}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Box width={12} height={12} bgcolor="#ff0000" borderRadius="50%" />
                    <Typography variant="caption">Customer Location</Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Box width={12} height={12} bgcolor="#4caf50" borderRadius={1} />
                    <Typography variant="caption">Retailer</Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Box width={12} height={12} bgcolor="#2196f3" borderRadius={1} />
                    <Typography variant="caption">Wholesaler</Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Box width={12} height={12} bgcolor="#ff9800" borderRadius={1} />
                    <Typography variant="caption">Distributor</Typography>
                  </Box>
                </Box>
              </Paper>
            </Box>
          </Paper>
        </Grid>
        
        {/* Controls and Stats Section */}
        <Grid item xs={12} lg={4}>
          <Box display="flex" flexDirection="column" gap={2}>
            {error && (
              <Alert severity="error" onClose={() => setError('')}>
                {error}
              </Alert>
            )}
            
            {/* Statistics Card */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <PersonIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Customer Statistics
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Box textAlign="center">
                      <Typography variant="h4" color="primary">
                        {stats.total}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Total Customers
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box textAlign="center">
                      <Typography variant="h4" color="error">
                        {stats.withLocation}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        With GPS Location
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
                
                <Box mt={2}>
                  <Typography variant="subtitle2" gutterBottom>
                    By Customer Type:
                  </Typography>
                  {Object.entries(stats.byType).map(([type, count]) => (
                    <Box key={type} display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Chip 
                        label={type} 
                        size="small" 
                        sx={{ bgcolor: getTypeColor(type), color: 'white' }}
                      />
                      <Typography variant="body2">{count}</Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
            
            {/* Filters Card */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <FilterIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Map Filters
                </Typography>
                
                <FormControl fullWidth margin="normal">
                  <InputLabel>Customer Type</InputLabel>
                  <Select
                    value={filters.customerType}
                    onChange={(e) => setFilters(prev => ({ ...prev, customerType: e.target.value }))}
                    label="Customer Type"
                  >
                    <MenuItem value="all">All Types</MenuItem>
                    <MenuItem value="retailer">Retailer</MenuItem>
                    <MenuItem value="wholesaler">Wholesaler</MenuItem>
                    <MenuItem value="distributor">Distributor</MenuItem>
                  </Select>
                </FormControl>
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={filters.showLabels}
                      onChange={(e) => setFilters(prev => ({ ...prev, showLabels: e.target.checked }))}
                    />
                  }
                  label="Show Customer Names"
                />
              </CardContent>
            </Card>
            
            {/* Ghana Regions Card */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <BusinessIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Ghana Regions
                </Typography>
                
                <Typography variant="body2" color="text.secondary" paragraph>
                  Customer locations are displayed across Ghana's regions. Click on red markers to view customer details.
                </Typography>
                
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {GoogleMapsService.getGhanaRegions().map((region) => (
                    <Chip
                      key={region.name}
                      label={region.name}
                      size="small"
                      variant="outlined"
                      onClick={() => {
                        if (map) {
                          map.setCenter(region.center);
                          map.setZoom(9);
                        }
                      }}
                      sx={{ cursor: 'pointer' }}
                    />
                  ))}
                </Box>
              </CardContent>
            </Card>
            
            {/* Coverage Summary */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Coverage Summary
                </Typography>
                
                <Typography variant="body2" color="text.secondary">
                  Showing {filteredCustomers.length} customers with GPS coordinates in Ghana.
                  {stats.total - stats.withLocation > 0 && (
                    ` ${stats.total - stats.withLocation} customers don't have location data.`
                  )}
                </Typography>
                
                {filteredCustomers.length > 0 && (
                  <Box mt={2}>
                    <Typography variant="caption" color="success.main">
                      ✓ All displayed locations are within Ghana boundaries
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CustomerLocationMap;

import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  Paper,
  Grid,
  Chip
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  MyLocation as MyLocationIcon,
  Map as MapIcon,
  Check as CheckIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import GoogleMapsService from '../services/GoogleMapsService';

const LocationPicker = ({ 
  onLocationSelect, 
  initialLocation = null, 
  showMap = true,
  disabled = false 
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [location, setLocation] = useState(initialLocation);
  const [address, setAddress] = useState('');
  const [mapLoaded, setMapLoaded] = useState(false);
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);
  
  const mapRef = useRef(null);

  useEffect(() => {
    if (showMap) {
      initializeMap();
    }
  }, [showMap]);

  useEffect(() => {
    if (location && onLocationSelect) {
      onLocationSelect(location);
    }
  }, [location, onLocationSelect]);

  const initializeMap = async () => {
    try {
      setLoading(true);
      await GoogleMapsService.loadGoogleMaps();
      
      // Wait for DOM element to be available
      if (mapRef.current && mapRef.current.offsetParent !== null) {
        // Add a small delay to ensure DOM is fully rendered
        setTimeout(() => {
          try {
            const mapInstance = GoogleMapsService.createMap(mapRef.current, {
              zoom: 7,
              center: { lat: 7.9465, lng: -1.0232 }, // Ghana center
            });

            setMap(mapInstance);
            setMapLoaded(true);

            // Add click listener to map
            mapInstance.addListener('click', (event) => {
              handleMapClick(event.latLng);
            });

            // If there's an initial location, show it on the map
            if (initialLocation && initialLocation.latitude && initialLocation.longitude) {
              const position = {
                lat: parseFloat(initialLocation.latitude),
                lng: parseFloat(initialLocation.longitude)
              };
              addMarkerToMap(mapInstance, position);
              mapInstance.setCenter(position);
              mapInstance.setZoom(15);
            }
          } catch (mapError) {
            console.error('Map creation error:', mapError);
            setError('Failed to initialize map');
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

  const handleMapClick = (latLng) => {
    const newLocation = {
      latitude: latLng.lat(),
      longitude: latLng.lng(),
      accuracy: null,
      timestamp: new Date().toISOString()
    };

    setLocation(newLocation);
    addMarkerToMap(map, latLng);
    reverseGeocodeLocation(newLocation);
  };

  const addMarkerToMap = (mapInstance, position) => {
    // Remove existing marker
    if (marker) {
      marker.setMap(null);
    }

    // Add new marker
    const newMarker = GoogleMapsService.addMarker(mapInstance, position, {
      title: 'Customer Location',
      icon: {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#f44336"/>
          </svg>
        `),
        scaledSize: new window.google.maps.Size(24, 24)
      }
    });

    setMarker(newMarker);
  };

  const getCurrentLocation = async () => {
    try {
      setLoading(true);
      setError('');
      
      const currentLocation = await GoogleMapsService.getCurrentLocation();
      
      // Check if location is in Ghana
      if (!GoogleMapsService.isInGhana(currentLocation.latitude, currentLocation.longitude)) {
        setError('Location appears to be outside Ghana. Please verify the location.');
      }
      
      setLocation(currentLocation);
      setSuccess('Location captured successfully!');
      
      // Update map if available
      if (map) {
        const position = {
          lat: currentLocation.latitude,
          lng: currentLocation.longitude
        };
        map.setCenter(position);
        map.setZoom(15);
        addMarkerToMap(map, position);
      }
      
      // Get address for the location
      reverseGeocodeLocation(currentLocation);
      
    } catch (err) {
      setError(err.message);
      console.error('Location error:', err);
    } finally {
      setLoading(false);
    }
  };

  const reverseGeocodeLocation = async (locationData) => {
    try {
      const result = await GoogleMapsService.reverseGeocode(
        locationData.latitude, 
        locationData.longitude
      );
      setAddress(result.formatted_address);
    } catch (err) {
      console.warn('Reverse geocoding failed:', err);
      setAddress('Address not available');
    }
  };

  const geocodeAddress = async (addressText) => {
    try {
      setLoading(true);
      setError('');
      
      const result = await GoogleMapsService.geocodeAddress(addressText);
      
      const newLocation = {
        latitude: result.latitude,
        longitude: result.longitude,
        accuracy: null,
        timestamp: new Date().toISOString()
      };
      
      setLocation(newLocation);
      setAddress(result.formatted_address);
      setSuccess('Location found successfully!');
      
      // Update map if available
      if (map) {
        const position = {
          lat: result.latitude,
          lng: result.longitude
        };
        map.setCenter(position);
        map.setZoom(15);
        addMarkerToMap(map, position);
      }
      
    } catch (err) {
      setError('Address not found. Please try a different address.');
      console.error('Geocoding error:', err);
    } finally {
      setLoading(false);
    }
  };

  const clearLocation = () => {
    setLocation(null);
    setAddress('');
    setError('');
    setSuccess('');
    
    if (marker) {
      marker.setMap(null);
      setMarker(null);
    }
    
    if (map) {
      map.setCenter({ lat: 7.9465, lng: -1.0232 });
      map.setZoom(7);
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Customer Location
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} md={8}>
          <TextField
            fullWidth
            label="Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && address.trim()) {
                geocodeAddress(address);
              }
            }}
            placeholder="Enter address or click map to select location"
            disabled={disabled}
            InputProps={{
              endAdornment: address && (
                <IconButton onClick={() => geocodeAddress(address)} disabled={loading}>
                  <LocationIcon />
                </IconButton>
              )
            }}
          />
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Box display="flex" gap={1}>
            <Tooltip title="Get Current Location">
              <Button
                variant="outlined"
                onClick={getCurrentLocation}
                disabled={loading || disabled}
                startIcon={loading ? <CircularProgress size={16} /> : <MyLocationIcon />}
                fullWidth
              >
                GPS
              </Button>
            </Tooltip>
            
            {location && (
              <Tooltip title="Clear Location">
                <IconButton onClick={clearLocation} disabled={disabled}>
                  <ClearIcon />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Grid>
      </Grid>

      {location && (
        <Paper sx={{ p: 2, mb: 2, bgcolor: 'success.light', color: 'success.contrastText' }}>
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <CheckIcon />
            <Typography variant="subtitle2">Location Captured</Typography>
          </Box>
          
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="body2">
                <strong>Latitude:</strong> {parseFloat(location.latitude).toFixed(6)}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2">
                <strong>Longitude:</strong> {parseFloat(location.longitude).toFixed(6)}
              </Typography>
            </Grid>
            {location.accuracy && (
              <Grid item xs={12}>
                <Typography variant="body2">
                  <strong>Accuracy:</strong> ±{Math.round(location.accuracy)}m
                </Typography>
              </Grid>
            )}
          </Grid>
          
          {GoogleMapsService.isInGhana(location.latitude, location.longitude) ? (
            <Chip label="Location in Ghana ✓" color="success" size="small" sx={{ mt: 1 }} />
          ) : (
            <Chip label="Location outside Ghana ⚠️" color="warning" size="small" sx={{ mt: 1 }} />
          )}
        </Paper>
      )}

      {showMap && (
        <Paper sx={{ p: 1, height: 300, position: 'relative' }}>
          {loading && !mapLoaded && (
            <Box 
              display="flex" 
              alignItems="center" 
              justifyContent="center" 
              height="100%"
              flexDirection="column"
              gap={2}
            >
              <CircularProgress />
              <Typography>Loading Google Maps...</Typography>
            </Box>
          )}
          
          <div 
            ref={mapRef} 
            style={{ 
              width: '100%', 
              height: '100%',
              display: loading && !mapLoaded ? 'none' : 'block'
            }} 
          />
          
          {mapLoaded && (
            <Box position="absolute" top={8} right={8}>
              <Chip 
                icon={<MapIcon />} 
                label="Click map to select location" 
                size="small" 
                sx={{ bgcolor: 'rgba(255,255,255,0.9)' }}
              />
            </Box>
          )}
        </Paper>
      )}
    </Box>
  );
};

export default LocationPicker;

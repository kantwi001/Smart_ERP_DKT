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
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix leaflet default marker icons
if (typeof window !== 'undefined') {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
}

// Custom marker for location selection
const createLocationIcon = () => {
  if (typeof window === 'undefined') return null;
  
  return new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
};

// Map click handler component
const MapClickHandler = ({ onLocationSelect }) => {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      const newLocation = {
        latitude: lat.toFixed(8),
        longitude: lng.toFixed(8),
        accuracy: null,
        timestamp: new Date().toISOString()
      };
      onLocationSelect(newLocation);
    },
  });
  return null;
};

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
  const [mapCenter, setMapCenter] = useState([7.9465, -1.0232]); 
  const [mapZoom, setMapZoom] = useState(7);
  const [locationIcon, setLocationIcon] = useState(null);

  useEffect(() => {
    try {
      const icon = createLocationIcon();
      setLocationIcon(icon);
    } catch (error) {
      console.warn('Could not create location icon:', error);
    }
  }, []);

  useEffect(() => {
    if (location && onLocationSelect) {
      onLocationSelect(location);
    }
  }, [location, onLocationSelect]);

  useEffect(() => {
    if (location && location.latitude && location.longitude) {
      setMapCenter([parseFloat(location.latitude), parseFloat(location.longitude)]);
      setMapZoom(15);
    }
  }, [location]);

  const getCurrentLocation = async () => {
    try {
      setLoading(true);
      setError('');
      
      if (!navigator.geolocation) {
        throw new Error('Geolocation is not supported by this browser');
      }

      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000,
          }
        );
      });

      const { latitude, longitude, accuracy } = position.coords;
      
      const currentLocation = {
        latitude: latitude.toFixed(8),
        longitude: longitude.toFixed(8),
        accuracy: accuracy,
        timestamp: new Date().toISOString()
      };
      
      const isInGhana = latitude >= 4.5 && latitude <= 11.5 && longitude >= -3.5 && longitude <= 1.5;
      
      if (!isInGhana) {
        setError('Location appears to be outside Ghana. Please verify the location.');
      }
      
      setLocation(currentLocation);
      setSuccess('Location captured successfully!');
      
    } catch (err) {
      let errorMessage = 'Failed to get location';
      
      if (err.code === 1) {
        errorMessage = 'Location access denied. Please enable location services.';
      } else if (err.code === 2) {
        errorMessage = 'Location unavailable. Please try again.';
      } else if (err.code === 3) {
        errorMessage = 'Location request timed out. Please try again.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      console.error('Location error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddressChange = (e) => {
    setAddress(e.target.value);
  };

  const handleMapLocationSelect = (newLocation) => {
    setLocation(newLocation);
    setSuccess('Location selected on map!');
    setError('');
  };

  const clearLocation = () => {
    setLocation(null);
    setAddress('');
    setError('');
    setSuccess('');
    setMapCenter([7.9465, -1.0232]);
    setMapZoom(7);
  };

  const isInGhana = (lat, lng) => {
    return lat >= 4.5 && lat <= 11.5 && lng >= -3.5 && lng <= 1.5;
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
            onChange={handleAddressChange}
            placeholder="Enter customer address"
            disabled={disabled}
            multiline
            rows={2}
          />
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Box display="flex" gap={1} flexDirection="column">
            <Tooltip title="Get Current Location">
              <Button
                variant="outlined"
                onClick={getCurrentLocation}
                disabled={loading || disabled}
                startIcon={loading ? <CircularProgress size={16} /> : <MyLocationIcon />}
                fullWidth
              >
                {loading ? 'Getting GPS...' : 'Get GPS Location'}
              </Button>
            </Tooltip>
            
            {location && (
              <Tooltip title="Clear Location">
                <Button
                  variant="outlined"
                  color="error"
                  onClick={clearLocation}
                  disabled={disabled}
                  startIcon={<ClearIcon />}
                  fullWidth
                >
                  Clear Location
                </Button>
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
          
          {isInGhana(parseFloat(location.latitude), parseFloat(location.longitude)) ? (
            <Chip label="Location in Ghana " color="success" size="small" sx={{ mt: 1 }} />
          ) : (
            <Chip label="Location outside Ghana " color="warning" size="small" sx={{ mt: 1 }} />
          )}
        </Paper>
      )}

      {showMap && (
        <Paper sx={{ p: 1, height: 400, position: 'relative' }}>
          <Box position="absolute" top={8} right={8} zIndex={1000}>
            <Chip 
              icon={<MapIcon />} 
              label="Click map to select location" 
              size="small" 
              sx={{ bgcolor: 'rgba(255,255,255,0.9)' }}
            />
          </Box>
          
          <MapContainer 
            center={mapCenter} 
            zoom={mapZoom} 
            style={{ height: '100%', width: '100%', borderRadius: '8px' }}
            key={`${mapCenter[0]}-${mapCenter[1]}-${mapZoom}`}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
              url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
            />
            
            <MapClickHandler onLocationSelect={handleMapLocationSelect} />
            
            {location && location.latitude && location.longitude && (
              <Marker 
                position={[parseFloat(location.latitude), parseFloat(location.longitude)]}
                icon={locationIcon || undefined}
              >
                <Popup>
                  <Box sx={{ minWidth: 150 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                      Selected Location
                    </Typography>
                    <Typography variant="body2">
                      <strong>Lat:</strong> {parseFloat(location.latitude).toFixed(6)}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Lng:</strong> {parseFloat(location.longitude).toFixed(6)}
                    </Typography>
                    {location.accuracy && (
                      <Typography variant="body2">
                        <strong>Accuracy:</strong> ±{Math.round(location.accuracy)}m
                      </Typography>
                    )}
                  </Box>
                </Popup>
              </Marker>
            )}
          </MapContainer>
        </Paper>
      )}
    </Box>
  );
};

export default LocationPicker;

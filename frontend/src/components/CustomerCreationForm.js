import React, { useState, useEffect, useContext } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem,
  Grid, Typography, Box, Chip, Alert, CircularProgress, FormControlLabel, Switch,
  Card, CardContent, IconButton, Tooltip, Paper, Divider, InputAdornment,
  FormControl, InputLabel, Select, OutlinedInput, Fade, Zoom
} from '@mui/material';
import { styled } from '@mui/material/styles';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import BusinessIcon from '@mui/icons-material/Business';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import HomeIcon from '@mui/icons-material/Home';
import NotesIcon from '@mui/icons-material/Notes';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SaveIcon from '@mui/icons-material/Save';
import { AuthContext } from '../AuthContext';
import api from '../api';
import { addCustomer } from '../sharedData';

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: 20,
    maxWidth: 900,
    width: '95%',
    maxHeight: '95vh',
    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
  },
}));

const FormSection = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: 16,
  marginBottom: theme.spacing(2),
  background: 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    transition: 'all 0.3s ease',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      transform: 'translateY(-1px)',
    },
    '&.Mui-focused': {
      backgroundColor: 'white',
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 20px rgba(255, 152, 0, 0.2)',
    },
  },
  '& .MuiInputLabel-root': {
    fontWeight: 600,
  },
}));

const LocationCard = styled(Card)(({ theme }) => ({
  border: '2px dashed #e0e0e0',
  borderRadius: 16,
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  background: 'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)',
  '&:hover': {
    borderColor: '#FF9800',
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 25px rgba(255, 152, 0, 0.3)',
  },
  '&.active': {
    borderColor: '#FF9800',
    borderStyle: 'solid',
    background: 'linear-gradient(135deg, #FF9800 0%, #FF5722 100%)',
    color: 'white',
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 25px rgba(255, 152, 0, 0.4)',
  },
}));

const CustomerTypeCard = styled(Card)(({ theme, selected }) => ({
  padding: theme.spacing(2),
  margin: theme.spacing(1),
  borderRadius: 16,
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  border: '2px solid transparent',
  background: selected 
    ? 'linear-gradient(135deg, #FF9800 0%, #FF5722 100%)' 
    : 'rgba(255, 255, 255, 0.8)',
  color: selected ? 'white' : 'inherit',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
    borderColor: '#FF9800',
  },
}));

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: 12,
  padding: '12px 32px',
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '1rem',
  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 20px rgba(0, 0, 0, 0.3)',
  },
}));

const CustomerCreationForm = ({ onSuccess, onError, onClose }) => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    customer_type: 'retailer',
    payment_terms: 30,
    latitude: null,
    longitude: null,
    location_accuracy: null,
    location_timestamp: null,
    notes: '',
    priority: 'medium',
    estimated_value: '',
  });

  // Validation states
  const [fieldErrors, setFieldErrors] = useState({});
  const [locationStatus, setLocationStatus] = useState('none'); // none, getting, success, error

  const customerTypes = [
    { 
      value: 'wholesaler', 
      label: 'Wholesaler', 
      icon: <BusinessIcon />, 
      color: '#4CAF50',
      description: 'Bulk purchases, volume discounts'
    },
    { 
      value: 'distributor', 
      label: 'Distributor', 
      icon: <BusinessIcon />, 
      color: '#2196F3',
      description: 'Regional distribution network'
    },
    { 
      value: 'retailer', 
      label: 'Retailer', 
      icon: <PersonIcon />, 
      color: '#FF9800',
      description: 'Direct sales to consumers'
    },
  ];

  const paymentTermOptions = [
    { value: 15, label: '15 Days', description: 'Quick payment' },
    { value: 30, label: '30 Days', description: 'Standard terms' },
    { value: 60, label: '60 Days', description: 'Extended terms' },
    { value: 90, label: '90 Days', description: 'Long-term credit' },
    { value: 120, label: '120 Days', description: 'Special arrangement' },
  ];

  const priorityOptions = [
    { value: 'high', label: 'High Priority', color: '#f44336' },
    { value: 'medium', label: 'Medium Priority', color: '#ff9800' },
    { value: 'low', label: 'Low Priority', color: '#4caf50' },
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear field error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) errors.name = 'Customer name is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Invalid email format';
    if (!formData.phone.trim()) errors.phone = 'Phone number is required';
    if (!formData.address.trim()) errors.address = 'Address is required';
    if (!formData.customer_type) errors.customer_type = 'Customer type is required';
    if (!formData.payment_terms) errors.payment_terms = 'Payment terms are required';

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const getCurrentLocation = () => {
    setLocationLoading(true);
    setLocationStatus('getting');
    
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      setLocationStatus('error');
      setLocationLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        setFormData(prev => ({
          ...prev,
          latitude: latitude.toFixed(8),
          longitude: longitude.toFixed(8),
          location_accuracy: accuracy,
          location_timestamp: new Date().toISOString(),
        }));
        setLocationStatus('success');
        setLocationLoading(false);
        setSuccess('Location captured successfully!');
        setTimeout(() => setSuccess(''), 3000);
      },
      (error) => {
        setError(`Location error: ${error.message}`);
        setLocationStatus('error');
        setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  };

  const handleSubmit = async () => {
    console.log('=== Customer Creation Debug ===');
    console.log('Form data:', formData);
    
    if (!validateForm()) {
      console.log('Validation failed');
      console.log('Field errors:', fieldErrors);
      return;
    }

    setLoading(true);
    setError('');
    console.log('Starting customer creation process...');

    try {
      console.log('Attempting API call to /sales/customer-approvals/');
      const response = await api.post('/sales/customer-approvals/', {
        ...formData,
        requested_by: user?.id || 1,
      });

      console.log('API call successful:', response);
      const successMessage = 'Customer creation request submitted successfully! It will be reviewed by a manager.';
      setSuccess(successMessage);
      onSuccess && onSuccess(successMessage);
      
      // Reset form after success
      setTimeout(() => {
        onClose && onClose();
      }, 2000);
      
    } catch (error) {
      console.error('API Error creating customer:', error);
      console.log('Attempting fallback to local storage...');
      
      try {
        console.log('Calling addCustomer with data:', formData);
        const newCustomer = addCustomer(formData);
        console.log('Customer added successfully:', newCustomer);
        
        const fallbackMessage = `Customer "${formData.name}" added successfully! (Note: Using offline mode - sync when backend is available)`;
        setSuccess(fallbackMessage);
        onSuccess && onSuccess(fallbackMessage);
        
        // Reset form after success
        setTimeout(() => {
          onClose && onClose();
        }, 2000);
      } catch (fallbackError) {
        console.error('Fallback Error creating customer:', fallbackError);
        const errorMessage = `Failed to submit customer request: ${fallbackError.message}`;
        setError(errorMessage);
        onError && onError(errorMessage);
      }
    }

    setLoading(false);
  };

  return (
    <StyledDialog open={true} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ 
        background: 'linear-gradient(135deg, #FF9800 0%, #FF5722 100%)',
        color: 'white',
        textAlign: 'center',
        fontSize: '1.5rem',
        fontWeight: 700,
        py: 3
      }}>
        <PersonIcon sx={{ mr: 2, fontSize: '2rem' }} />
        Create New Customer
      </DialogTitle>
      
      <DialogContent sx={{ p: 3, background: 'transparent' }}>
        {error && (
          <Fade in={!!error}>
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError('')}>
              {error}
            </Alert>
          </Fade>
        )}
        {success && (
          <Fade in={!!success}>
            <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setSuccess('')}>
              {success}
            </Alert>
          </Fade>
        )}

        {/* Basic Information Section */}
        <FormSection elevation={3}>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: '#333', display: 'flex', alignItems: 'center' }}>
            <PersonIcon sx={{ mr: 1, color: '#FF9800' }} />
            Basic Information
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <StyledTextField
                fullWidth
                label="Customer Name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                error={!!fieldErrors.name}
                helperText={fieldErrors.name}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <StyledTextField
                fullWidth
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                error={!!fieldErrors.email}
                helperText={fieldErrors.email}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <StyledTextField
                fullWidth
                label="Phone Number"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                error={!!fieldErrors.phone}
                helperText={fieldErrors.phone}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
        </FormSection>

        {/* Business Details Section */}
        <FormSection elevation={3}>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: '#333', display: 'flex', alignItems: 'center' }}>
            <BusinessIcon sx={{ mr: 1, color: '#FF9800' }} />
            Business Details
          </Typography>
          
          {/* Customer Type Selection */}
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
            Select Customer Type
          </Typography>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {customerTypes.map((type) => (
              <Grid item xs={12} sm={4} key={type.value}>
                <Zoom in={true} style={{ transitionDelay: `${customerTypes.indexOf(type) * 100}ms` }}>
                  <CustomerTypeCard
                    selected={formData.customer_type === type.value}
                    onClick={() => handleInputChange('customer_type', type.value)}
                  >
                    <Box display="flex" flexDirection="column" alignItems="center" textAlign="center">
                      <Box sx={{ fontSize: '2rem', mb: 1, color: formData.customer_type === type.value ? 'white' : type.color }}>
                        {type.icon}
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                        {type.label}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.8 }}>
                        {type.description}
                      </Typography>
                    </Box>
                  </CustomerTypeCard>
                </Zoom>
              </Grid>
            ))}
          </Grid>

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Payment Terms</InputLabel>
                <Select
                  value={formData.payment_terms}
                  onChange={(e) => handleInputChange('payment_terms', e.target.value)}
                  input={<OutlinedInput label="Payment Terms" />}
                  sx={{ borderRadius: 3 }}
                >
                  {paymentTermOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      <Box>
                        <Typography variant="body1">{option.label}</Typography>
                        <Typography variant="body2" color="textSecondary">
                          {option.description}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Priority Level</InputLabel>
                <Select
                  value={formData.priority}
                  onChange={(e) => handleInputChange('priority', e.target.value)}
                  input={<OutlinedInput label="Priority Level" />}
                  sx={{ borderRadius: 3 }}
                >
                  {priorityOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      <Chip 
                        label={option.label} 
                        size="small" 
                        sx={{ backgroundColor: option.color, color: 'white' }}
                      />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <StyledTextField
                fullWidth
                label="Estimated Annual Value"
                type="number"
                value={formData.estimated_value}
                onChange={(e) => handleInputChange('estimated_value', e.target.value)}
                helperText="Expected annual business value (optional)"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AttachMoneyIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
        </FormSection>

        {/* Location & Address Section */}
        <FormSection elevation={3}>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: '#333', display: 'flex', alignItems: 'center' }}>
            <HomeIcon sx={{ mr: 1, color: '#FF9800' }} />
            Location & Address
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <StyledTextField
                fullWidth
                multiline
                rows={3}
                label="Customer Address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                error={!!fieldErrors.address}
                helperText={fieldErrors.address || 'Complete business address'}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <HomeIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                GPS Coordinates (Optional)
              </Typography>
              <LocationCard 
                className={locationStatus === 'success' ? 'active' : ''}
                onClick={getCurrentLocation}
              >
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box display="flex" alignItems="center">
                      <LocationOnIcon 
                        sx={{ 
                          mr: 2, 
                          fontSize: '2rem',
                          color: locationStatus === 'success' ? 'white' : '#FF9800'
                        }} 
                      />
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {locationStatus === 'success' ? 'Location Captured!' : 'Capture GPS Location'}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                          {locationStatus === 'success' 
                            ? `Lat: ${formData.latitude}, Lng: ${formData.longitude}`
                            : 'Click to get current location for precise mapping'
                          }
                        </Typography>
                      </Box>
                    </Box>
                    {locationLoading ? (
                      <CircularProgress size={32} sx={{ color: 'white' }} />
                    ) : (
                      <IconButton sx={{ color: locationStatus === 'success' ? 'white' : '#FF9800' }}>
                        <MyLocationIcon sx={{ fontSize: '2rem' }} />
                      </IconButton>
                    )}
                  </Box>
                  {locationStatus === 'success' && (
                    <Box mt={2}>
                      <Chip 
                        icon={<CheckCircleIcon />} 
                        label={`Accuracy: ${Math.round(formData.location_accuracy)}m`}
                        sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
                      />
                    </Box>
                  )}
                </CardContent>
              </LocationCard>
            </Grid>
          </Grid>
        </FormSection>

        {/* Additional Notes Section */}
        <FormSection elevation={3}>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: '#333', display: 'flex', alignItems: 'center' }}>
            <NotesIcon sx={{ mr: 1, color: '#FF9800' }} />
            Additional Information
          </Typography>
          <StyledTextField
            fullWidth
            multiline
            rows={4}
            label="Notes & Comments"
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            helperText="Any additional information about this customer"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <NotesIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
        </FormSection>
      </DialogContent>

      <DialogActions sx={{ p: 3, background: 'rgba(255,255,255,0.1)' }}>
        <ActionButton 
          onClick={onClose}
          variant="outlined"
          sx={{ 
            borderColor: '#666',
            color: '#666',
            '&:hover': {
              borderColor: '#333',
              backgroundColor: 'rgba(0,0,0,0.04)'
            }
          }}
        >
          Cancel
        </ActionButton>
        <ActionButton
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
          sx={{ 
            background: 'linear-gradient(45deg, #4CAF50 30%, #45a049 90%)',
            color: 'white',
            ml: 2
          }}
        >
          {loading ? 'Creating Customer...' : 'Create Customer'}
        </ActionButton>
      </DialogActions>
    </StyledDialog>
  );
};

export default CustomerCreationForm;

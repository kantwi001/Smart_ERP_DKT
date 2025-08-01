import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Avatar,
  Box,
  Typography,
  IconButton,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material';
import {
  PhotoCamera,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import api from '../api';
import { getProfilePictureUrl, validateProfilePicture } from '../utils/imageUtils';

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: 120,
  height: 120,
  margin: '0 auto',
  border: `4px solid ${theme.palette.primary.main}`,
  cursor: 'pointer',
  '&:hover': {
    opacity: 0.8,
  },
}));

const PhotoUploadBox = styled(Box)(({ theme }) => ({
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  marginBottom: theme.spacing(3),
}));

const HiddenInput = styled('input')({
  display: 'none',
});

const ProfileEditDialog = ({ open, onClose, user, onProfileUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [previewImage, setPreviewImage] = useState(null);
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    date_of_birth: user?.date_of_birth || '',
    address: user?.address || '',
    emergency_contact_name: user?.emergency_contact_name || '',
    emergency_contact_phone: user?.emergency_contact_phone || '',
    profile_picture: null
  });

  React.useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone: user.phone || '',
        bio: user.bio || '',
        date_of_birth: user.date_of_birth || '',
        address: user.address || '',
        emergency_contact_name: user.emergency_contact_name || '',
        emergency_contact_phone: user.emergency_contact_phone || '',
        profile_picture: null
      });
      setPreviewImage(null);
      setError('');
      setSuccess('');
    }
  }, [user, open]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate the file using utility function
      const validation = validateProfilePicture(file);
      if (!validation.isValid) {
        setError(validation.error);
        return;
      }

      setFormData(prev => ({
        ...prev,
        profile_picture: file
      }));

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target.result);
      };
      reader.readAsDataURL(file);
      setError('');
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Create FormData for file upload
      const submitData = new FormData();
      
      console.log('Form data before submission:', formData);
      
      // Add all form fields
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== '') {
          console.log(`Adding to FormData: ${key} =`, formData[key]);
          submitData.append(key, formData[key]);
        }
      });
      
      // Log FormData contents
      console.log('FormData entries:');
      for (let [key, value] of submitData.entries()) {
        console.log(`${key}:`, value);
      }

      const response = await api.patch('/users/me/profile/', submitData);
      // Note: Don't set Content-Type header manually for FormData
      // Axios will set it automatically with the correct boundary

      console.log('Profile update response:', response.data);
      console.log('Updated user data:', response.data.user);
      console.log('Profile picture URL:', response.data.user?.profile_picture_url);

      setSuccess('Profile updated successfully!');
      
      // Call the parent callback to update user data
      if (onProfileUpdate) {
        console.log('Calling onProfileUpdate with:', response.data.user);
        onProfileUpdate(response.data.user);
      }

      // Close dialog after a short delay
      setTimeout(() => {
        onClose();
      }, 1500);

    } catch (err) {
      console.error('Profile update error:', err);
      if (err.response?.data) {
        const errorMessages = Object.values(err.response.data).flat();
        setError(errorMessages.join(', '));
      } else {
        setError('Failed to update profile. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      bio: user?.bio || '',
      date_of_birth: user?.date_of_birth || '',
      address: user?.address || '',
      emergency_contact_name: user?.emergency_contact_name || '',
      emergency_contact_phone: user?.emergency_contact_phone || '',
      profile_picture: null
    });
    setPreviewImage(null);
    setError('');
    setSuccess('');
    onClose();
  };

  const getDisplayImage = () => {
    if (previewImage) return previewImage;
    return getProfilePictureUrl(user?.profile_picture_url);
  };

  return (
    <Dialog open={open} onClose={handleCancel} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <EditIcon />
          <Typography variant="h6">Edit Profile</Typography>
        </Box>
      </DialogTitle>
      
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          {/* Profile Picture Section */}
          <PhotoUploadBox>
            <StyledAvatar
              src={getDisplayImage()}
              onClick={handleAvatarClick}
              sx={{ mb: 1 }}
            >
              {!getDisplayImage() && (
                <PhotoCamera sx={{ fontSize: 40 }} />
              )}
            </StyledAvatar>
            
            <Button
              variant="outlined"
              size="small"
              startIcon={<PhotoCamera />}
              onClick={handleAvatarClick}
            >
              {getDisplayImage() ? 'Change Photo' : 'Upload Photo'}
            </Button>
            
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
              Max file size: 5MB. Supported formats: JPG, PNG, GIF
            </Typography>
            
            <HiddenInput
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
            />
          </PhotoUploadBox>

          <Divider sx={{ my: 3 }} />

          {/* Basic Information */}
          <Typography variant="h6" gutterBottom>
            Basic Information
          </Typography>
          
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="first_name"
                label="First Name"
                value={formData.first_name}
                onChange={handleInputChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="last_name"
                label="Last Name"
                value={formData.last_name}
                onChange={handleInputChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="email"
                label="Email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="phone"
                label="Phone Number"
                value={formData.phone}
                onChange={handleInputChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="date_of_birth"
                label="Date of Birth"
                type="date"
                value={formData.date_of_birth}
                onChange={handleInputChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>

          {/* Bio Section */}
          <Typography variant="h6" gutterBottom>
            About
          </Typography>
          
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12}>
              <TextField
                name="bio"
                label="Bio"
                value={formData.bio}
                onChange={handleInputChange}
                fullWidth
                multiline
                rows={3}
                placeholder="Tell us about yourself..."
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="address"
                label="Address"
                value={formData.address}
                onChange={handleInputChange}
                fullWidth
                multiline
                rows={2}
              />
            </Grid>
          </Grid>

          {/* Emergency Contact */}
          <Typography variant="h6" gutterBottom>
            Emergency Contact
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="emergency_contact_name"
                label="Emergency Contact Name"
                value={formData.emergency_contact_name}
                onChange={handleInputChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="emergency_contact_phone"
                label="Emergency Contact Phone"
                value={formData.emergency_contact_phone}
                onChange={handleInputChange}
                fullWidth
              />
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={handleCancel}
            startIcon={<CancelIcon />}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            startIcon={loading ? <CircularProgress size={16} /> : <SaveIcon />}
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ProfileEditDialog;

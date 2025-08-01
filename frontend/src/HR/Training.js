import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Tabs, Tab, Grid, Card, CardContent, Button,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Select, MenuItem, FormControl, InputLabel, Chip, IconButton,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, LinearProgress, Alert, Snackbar, CircularProgress,
  FormControlLabel, Switch, Avatar, Tooltip, Badge
} from '@mui/material';
import {
  Upload as UploadIcon, VideoLibrary as VideoIcon, Description as DocumentIcon,
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Download as DownloadIcon,
  Visibility as ViewIcon, PlayArrow as PlayIcon, School as SchoolIcon,
  CloudUpload as CloudUploadIcon, Assessment as StatsIcon, Schedule as ScheduleIcon
} from '@mui/icons-material';
import TrainingService from '../services/TrainingService';

const Training = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [materials, setMaterials] = useState([]);
  const [videos, setVideos] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [materialStats, setMaterialStats] = useState({});
  const [videoStats, setVideoStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [uploadDialog, setUploadDialog] = useState({ open: false, type: '' });
  const [formData, setFormData] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [materialsRes, videosRes, sessionsRes, materialStatsRes, videoStatsRes] = await Promise.all([
        TrainingService.getMaterials(),
        TrainingService.getVideos(),
        TrainingService.getSessions(),
        TrainingService.getMaterialStats(),
        TrainingService.getVideoStats()
      ]);
      
      setMaterials(materialsRes);
      setVideos(videosRes);
      setSessions(sessionsRes);
      setMaterialStats(materialStatsRes);
      setVideoStats(videoStatsRes);
    } catch (error) {
      console.error('Error loading training data:', error);
      showSnackbar('Error loading training data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleUploadClick = (type) => {
    setUploadDialog({ open: true, type });
    setFormData({});
    setSelectedFile(null);
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
    setFormData({ ...formData, title: file?.name?.split('.')[0] || '' });
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      showSnackbar('Please select a file', 'error');
      return;
    }

    try {
      setUploading(true);
      const uploadData = new FormData();
      
      Object.keys(formData).forEach(key => {
        if (formData[key]) uploadData.append(key, formData[key]);
      });
      
      if (uploadDialog.type === 'material') {
        uploadData.append('file', selectedFile);
        await TrainingService.createMaterial(uploadData);
      } else if (uploadDialog.type === 'video') {
        uploadData.append('video_file', selectedFile);
        await TrainingService.createVideo(uploadData);
      }
      
      showSnackbar(`${uploadDialog.type === 'material' ? 'Material' : 'Video'} uploaded successfully!`);
      setUploadDialog({ open: false, type: '' });
      loadData();
    } catch (error) {
      console.error('Upload error:', error);
      showSnackbar('Upload failed', 'error');
    } finally {
      setUploading(false);
    }
  };

  const renderOverview = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" mb={2}>
              <DocumentIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">Materials</Typography>
            </Box>
            <Typography variant="h4">{materialStats.total_materials || 0}</Typography>
            <Typography color="textSecondary">Total Documents</Typography>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" mb={2}>
              <VideoIcon color="secondary" sx={{ mr: 1 }} />
              <Typography variant="h6">Videos</Typography>
            </Box>
            <Typography variant="h4">{videoStats.total_videos || 0}</Typography>
            <Typography color="textSecondary">Training Videos</Typography>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" mb={2}>
              <ScheduleIcon color="warning" sx={{ mr: 1 }} />
              <Typography variant="h6">Sessions</Typography>
            </Box>
            <Typography variant="h4">{sessions.length}</Typography>
            <Typography color="textSecondary">Training Sessions</Typography>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" mb={2}>
              <StatsIcon color="success" sx={{ mr: 1 }} />
              <Typography variant="h6">Duration</Typography>
            </Box>
            <Typography variant="h4">{videoStats.total_duration || '0h 0m'}</Typography>
            <Typography color="textSecondary">Total Video Time</Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" display="flex" alignItems="center">
          <SchoolIcon sx={{ mr: 2, fontSize: 32 }} />
          Training Management
        </Typography>
        <Box>
          <Button
            variant="contained"
            startIcon={<CloudUploadIcon />}
            onClick={() => handleUploadClick('material')}
            sx={{ mr: 1 }}
          >
            Upload Material
          </Button>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<VideoIcon />}
            onClick={() => handleUploadClick('video')}
          >
            Upload Video
          </Button>
        </Box>
      </Box>

      <Paper sx={{ width: '100%', mb: 2 }}>
        <Tabs value={activeTab} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="Overview" />
          <Tab label="Materials" />
          <Tab label="Videos" />
          <Tab label="Sessions" />
        </Tabs>
        
        <Box sx={{ p: 3 }}>
          {activeTab === 0 && renderOverview()}
          {activeTab === 1 && (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Title</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Size</TableCell>
                    <TableCell>Uploaded By</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {materials.map((material) => (
                    <TableRow key={material.id}>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <Typography sx={{ mr: 1 }}>
                            {TrainingService.getFileIcon(material.file_extension)}
                          </Typography>
                          <Typography>{material.title}</Typography>
                          {material.is_mandatory && <Chip label="Mandatory" size="small" color="error" sx={{ ml: 1 }} />}
                        </Box>
                      </TableCell>
                      <TableCell>{material.material_type_display}</TableCell>
                      <TableCell>{TrainingService.formatFileSize(material.file_size)}</TableCell>
                      <TableCell>{material.uploaded_by_name}</TableCell>
                      <TableCell>{new Date(material.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Tooltip title="View">
                          <IconButton size="small" onClick={() => window.open(material.file, '_blank')}>
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Download">
                          <IconButton size="small">
                            <DownloadIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          {activeTab === 2 && (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Title</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Duration</TableCell>
                    <TableCell>Size</TableCell>
                    <TableCell>Uploaded By</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {videos.map((video) => (
                    <TableRow key={video.id}>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <VideoIcon sx={{ mr: 1 }} />
                          <Typography>{video.title}</Typography>
                          {video.is_mandatory && <Chip label="Mandatory" size="small" color="error" sx={{ ml: 1 }} />}
                        </Box>
                      </TableCell>
                      <TableCell>{video.video_type_display}</TableCell>
                      <TableCell>{video.duration_formatted}</TableCell>
                      <TableCell>{TrainingService.formatFileSize(video.file_size)}</TableCell>
                      <TableCell>{video.uploaded_by_name}</TableCell>
                      <TableCell>{new Date(video.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Tooltip title="Play">
                          <IconButton size="small" onClick={() => window.open(video.video_file, '_blank')}>
                            <PlayIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          {activeTab === 3 && (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Title</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Instructor</TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell>Attendees</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sessions.map((session) => (
                    <TableRow key={session.id}>
                      <TableCell>{session.title}</TableCell>
                      <TableCell>{session.date}</TableCell>
                      <TableCell>{session.instructor}</TableCell>
                      <TableCell>{session.location}</TableCell>
                      <TableCell>{session.attendees_count || 0}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </Paper>

      {/* Upload Dialog */}
      <Dialog open={uploadDialog.open} onClose={() => setUploadDialog({ open: false, type: '' })} maxWidth="md" fullWidth>
        <DialogTitle>
          Upload {uploadDialog.type === 'material' ? 'Training Material' : 'Training Video'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Button
                variant="outlined"
                component="label"
                fullWidth
                startIcon={<UploadIcon />}
                sx={{ p: 2, borderStyle: 'dashed' }}
              >
                {selectedFile ? selectedFile.name : `Select ${uploadDialog.type === 'material' ? 'Document' : 'Video'} File`}
                <input
                  type="file"
                  hidden
                  accept={uploadDialog.type === 'material' ? '.pdf,.doc,.docx,.jpg,.jpeg,.png,.ppt,.pptx' : '.mp4,.avi,.mov,.wmv'}
                  onChange={handleFileSelect}
                />
              </Button>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Title"
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>{uploadDialog.type === 'material' ? 'Material Type' : 'Video Type'}</InputLabel>
                <Select
                  value={formData[uploadDialog.type === 'material' ? 'material_type' : 'video_type'] || ''}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    [uploadDialog.type === 'material' ? 'material_type' : 'video_type']: e.target.value 
                  })}
                >
                  {(uploadDialog.type === 'material' ? [
                    { value: 'policy', label: 'Policy Document' },
                    { value: 'manual', label: 'Training Manual' },
                    { value: 'guide', label: 'User Guide' },
                    { value: 'presentation', label: 'Presentation' },
                    { value: 'form', label: 'Form/Template' },
                    { value: 'other', label: 'Other Document' }
                  ] : [
                    { value: 'training', label: 'Training Video' },
                    { value: 'orientation', label: 'Orientation Video' },
                    { value: 'safety', label: 'Safety Training' },
                    { value: 'compliance', label: 'Compliance Training' },
                    { value: 'skills', label: 'Skills Development' },
                    { value: 'policy', label: 'Policy Explanation' },
                    { value: 'other', label: 'Other' }
                  ]).map(option => (
                    <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Visibility</InputLabel>
                <Select
                  value={formData.visibility || 'all'}
                  onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}
                >
                  <MenuItem value="all">All Employees</MenuItem>
                  <MenuItem value="department">Department Only</MenuItem>
                  <MenuItem value="custom">Custom Selection</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.is_mandatory || false}
                    onChange={(e) => setFormData({ ...formData, is_mandatory: e.target.checked })}
                  />
                }
                label="Mandatory Training"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadDialog({ open: false, type: '' })}>Cancel</Button>
          <Button 
            onClick={handleUpload} 
            variant="contained" 
            disabled={uploading || !selectedFile}
            startIcon={uploading ? <CircularProgress size={20} /> : <UploadIcon />}
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Training;

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Chip,
  Box,
  Typography,
  Input
} from '@mui/material';
import { CloudUpload as UploadIcon } from '@mui/icons-material';

const AnnouncementDialog = ({ 
  open, 
  onClose, 
  announcementForm, 
  setAnnouncementForm, 
  onSubmit, 
  users = [],
  departments = [] 
}) => {
  const handleDepartmentChange = (event) => {
    const value = event.target.value;
    setAnnouncementForm({
      ...announcementForm,
      target_departments: typeof value === 'string' ? value.split(',') : value
    });
  };

  const handleUserChange = (event) => {
    const value = event.target.value;
    setAnnouncementForm({
      ...announcementForm,
      target_users: typeof value === 'string' ? value.split(',') : value
    });
  };

  const handleFileChange = (event, fileType) => {
    const file = event.target.files[0];
    setAnnouncementForm({
      ...announcementForm,
      [fileType]: file
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>Create New Announcement</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Announcement Title"
              value={announcementForm.title}
              onChange={(e) => setAnnouncementForm({...announcementForm, title: e.target.value})}
              required
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Announcement Type</InputLabel>
              <Select
                value={announcementForm.announcement_type}
                onChange={(e) => setAnnouncementForm({...announcementForm, announcement_type: e.target.value})}
              >
                <MenuItem value="general">General Announcement</MenuItem>
                <MenuItem value="policy">Policy Update</MenuItem>
                <MenuItem value="event">Event Announcement</MenuItem>
                <MenuItem value="holiday">Holiday Notice</MenuItem>
                <MenuItem value="deadline">Deadline Reminder</MenuItem>
                <MenuItem value="training">Training Announcement</MenuItem>
                <MenuItem value="emergency">Emergency Notice</MenuItem>
                <MenuItem value="celebration">Celebration</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                value={announcementForm.priority}
                onChange={(e) => setAnnouncementForm({...announcementForm, priority: e.target.value})}
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="critical">Critical</MenuItem>
                <MenuItem value="urgent">Urgent</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Content"
              multiline
              rows={4}
              value={announcementForm.content}
              onChange={(e) => setAnnouncementForm({...announcementForm, content: e.target.value})}
              required
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Audience Type</InputLabel>
              <Select
                value={announcementForm.audience_type}
                onChange={(e) => setAnnouncementForm({...announcementForm, audience_type: e.target.value})}
              >
                <MenuItem value="all">All Employees</MenuItem>
                <MenuItem value="departments">Specific Departments</MenuItem>
                <MenuItem value="users">Specific Users</MenuItem>
                <MenuItem value="roles">Specific Roles</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {announcementForm.audience_type === 'departments' && (
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Target Departments</InputLabel>
                <Select
                  multiple
                  value={announcementForm.target_departments}
                  onChange={handleDepartmentChange}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => {
                        const dept = departments.find(d => d.id === value);
                        return (
                          <Chip key={value} label={dept?.name || value} size="small" />
                        );
                      })}
                    </Box>
                  )}
                >
                  {departments.map((dept) => (
                    <MenuItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          )}

          {announcementForm.audience_type === 'users' && (
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Target Users</InputLabel>
                <Select
                  multiple
                  value={announcementForm.target_users}
                  onChange={handleUserChange}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => {
                        const user = users.find(u => u.id === value);
                        return (
                          <Chip key={value} label={user?.name || user?.username || value} size="small" />
                        );
                      })}
                    </Box>
                  )}
                >
                  {users.map((user) => (
                    <MenuItem key={user.id} value={user.id}>
                      {user.name || user.username}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          )}

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Publish Date"
              type="datetime-local"
              value={announcementForm.publish_date}
              onChange={(e) => setAnnouncementForm({...announcementForm, publish_date: e.target.value})}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Expiry Date"
              type="datetime-local"
              value={announcementForm.expiry_date}
              onChange={(e) => setAnnouncementForm({...announcementForm, expiry_date: e.target.value})}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Notification Settings
            </Typography>
          </Grid>

          <Grid item xs={12} md={4}>
            <FormControlLabel
              control={
                <Switch
                  checked={announcementForm.send_email}
                  onChange={(e) => setAnnouncementForm({...announcementForm, send_email: e.target.checked})}
                />
              }
              label="Send Email Notification"
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <FormControlLabel
              control={
                <Switch
                  checked={announcementForm.send_push}
                  onChange={(e) => setAnnouncementForm({...announcementForm, send_push: e.target.checked})}
                />
              }
              label="Send Push Notification"
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <FormControlLabel
              control={
                <Switch
                  checked={announcementForm.send_sms}
                  onChange={(e) => setAnnouncementForm({...announcementForm, send_sms: e.target.checked})}
                />
              }
              label="Send SMS Notification"
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Attachments
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box>
              <Typography variant="body2" gutterBottom>
                Attachment (PDF, DOC, etc.)
              </Typography>
              <Button
                variant="outlined"
                component="label"
                startIcon={<UploadIcon />}
                fullWidth
              >
                {announcementForm.attachment ? announcementForm.attachment.name : 'Upload Attachment'}
                <Input
                  type="file"
                  hidden
                  onChange={(e) => handleFileChange(e, 'attachment')}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
                />
              </Button>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box>
              <Typography variant="body2" gutterBottom>
                Image (JPG, PNG, GIF)
              </Typography>
              <Button
                variant="outlined"
                component="label"
                startIcon={<UploadIcon />}
                fullWidth
              >
                {announcementForm.image ? announcementForm.image.name : 'Upload Image'}
                <Input
                  type="file"
                  hidden
                  onChange={(e) => handleFileChange(e, 'image')}
                  accept="image/*"
                />
              </Button>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onSubmit} variant="contained">Create Announcement</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AnnouncementDialog;

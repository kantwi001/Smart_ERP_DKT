import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Button, Tabs, Tab,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Chip, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, FormControl, InputLabel, Select, Alert,
  IconButton, Tooltip, List, ListItem, ListItemText, ListItemSecondaryAction,
  Badge, Avatar, Divider, FormControlLabel, Switch
} from '@mui/material';
import {
  CalendarMonth as CalendarMonthIcon, Add as AddIcon, Event as EventIcon,
  Event as HolidayIcon, Schedule as ScheduleIcon, Announcement as AnnouncementIcon,
  Edit as EditIcon, Check as CheckIcon, Warning as WarningIcon,
  Notifications as NotificationsIcon, Today as TodayIcon, Upcoming as UpcomingIcon,
  Visibility as ViewIcon, MarkEmailRead as MarkReadIcon
} from '@mui/icons-material';
import HRCalendarService from '../services/HRCalendarService';
import api from '../api';
import HolidayDialog from './components/HolidayDialog';
import DeadlineDialog from './components/DeadlineDialog';
import AnnouncementDialog from './components/AnnouncementDialog';

const HRCalendar = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [dashboardStats, setDashboardStats] = useState({});
  const [events, setEvents] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [deadlines, setDeadlines] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Dialog states
  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [holidayDialogOpen, setHolidayDialogOpen] = useState(false);
  const [deadlineDialogOpen, setDeadlineDialogOpen] = useState(false);
  const [announcementDialogOpen, setAnnouncementDialogOpen] = useState(false);
  
  // Form states
  const [eventForm, setEventForm] = useState({
    title: '', description: '', event_type: 'other', start_date: '', end_date: '',
    start_time: '', end_time: '', is_all_day: false, location: '', priority: 'medium',
    is_public: true, send_notifications: true, notification_days_before: 1,
    assigned_to: [], departments: []
  });

  const [holidayForm, setHolidayForm] = useState({
    name: '', description: '', holiday_type: 'company', date: '',
    is_recurring: true, is_work_day: false, departments: []
  });

  const [deadlineForm, setDeadlineForm] = useState({
    title: '', description: '', deadline_type: 'other', due_date: '', due_time: '',
    assigned_to: [], department: '', reminder_days: 3, send_reminders: true
  });

  const [announcementForm, setAnnouncementForm] = useState({
    title: '', content: '', announcement_type: 'general', priority: 'medium',
    audience_type: 'all', target_departments: [], target_users: [],
    publish_date: '', expiry_date: '', send_email: true, send_push: true,
    send_sms: false, attachment: null, image: null
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Use mock data instead of API calls to avoid backend dependency
      const mockStats = {
        today_events: 3,
        upcoming_events: 8,
        overdue_deadlines: 2,
        unread_announcements: 5
      };
      
      const mockEvents = [
        {
          id: 1,
          title: 'Team Meeting',
          event_type: 'meeting',
          start_date: '2024-01-15',
          priority: 'medium',
          location: 'Conference Room A'
        },
        {
          id: 2,
          title: 'Training Session',
          event_type: 'training',
          start_date: '2024-01-18',
          priority: 'high',
          location: 'Training Center'
        }
      ];
      
      const mockHolidays = [
        {
          id: 1,
          name: 'New Year Day',
          holiday_type: 'national',
          date: '2024-01-01',
          is_work_day: false,
          department_names: ['All Departments']
        },
        {
          id: 2,
          name: 'Company Anniversary',
          holiday_type: 'company',
          date: '2024-03-15',
          is_work_day: true,
          department_names: ['All Departments']
        }
      ];
      
      const mockDeadlines = [
        {
          id: 1,
          title: 'Q1 Performance Reviews',
          deadline_type: 'performance_review',
          due_date: '2024-01-31',
          is_completed: false,
          is_overdue: false,
          assigned_to_names: ['HR Team']
        },
        {
          id: 2,
          title: 'Annual Training Completion',
          deadline_type: 'training',
          due_date: '2024-02-15',
          is_completed: false,
          is_overdue: true,
          assigned_to_names: ['All Employees']
        }
      ];
      
      const mockAnnouncements = [
        {
          id: 1,
          title: 'New Health Benefits Available',
          content: 'We are pleased to announce new health benefit options starting next month.',
          priority: 'high',
          is_pinned: true,
          is_read_by_user: false,
          created_by_name: 'HR Department',
          created_at: '2024-01-10'
        },
        {
          id: 2,
          title: 'Office Renovation Update',
          content: 'The office renovation will begin next week. Please see the attached schedule.',
          priority: 'medium',
          is_pinned: false,
          is_read_by_user: true,
          created_by_name: 'Facilities Team',
          created_at: '2024-01-08'
        }
      ];
      
      const mockUsers = [
        { id: 1, first_name: 'John', last_name: 'Doe', email: 'john@company.com' },
        { id: 2, first_name: 'Jane', last_name: 'Smith', email: 'jane@company.com' }
      ];
      
      const mockDepartments = [
        { id: 1, name: 'Human Resources' },
        { id: 2, name: 'Engineering' },
        { id: 3, name: 'Marketing' }
      ];

      setDashboardStats(mockStats);
      setEvents(mockEvents);
      setHolidays(mockHolidays);
      setDeadlines(mockDeadlines);
      setAnnouncements(mockAnnouncements);
      setUsers(mockUsers);
      setDepartments(mockDepartments);
      
    } catch (err) {
      setError('Failed to load HR calendar data');
      console.error('Error loading HR calendar data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async () => {
    try {
      await HRCalendarService.createEvent(eventForm);
      setSuccess('Event created successfully');
      setEventDialogOpen(false);
      resetForms();
      loadData();
    } catch (err) {
      setError('Failed to create event');
    }
  };

  const handleCreateHoliday = async () => {
    try {
      await HRCalendarService.createHoliday(holidayForm);
      setSuccess('Holiday created successfully');
      setHolidayDialogOpen(false);
      resetForms();
      loadData();
    } catch (err) {
      setError('Failed to create holiday');
    }
  };

  const handleCreateDeadline = async () => {
    try {
      await HRCalendarService.createDeadline(deadlineForm);
      setSuccess('Deadline created successfully');
      setDeadlineDialogOpen(false);
      resetForms();
      loadData();
    } catch (err) {
      setError('Failed to create deadline');
    }
  };

  const handleCreateAnnouncement = async () => {
    try {
      console.log('🚀 Creating announcement with form data:', announcementForm);
      
      // Validate required fields
      if (!announcementForm.title?.trim()) {
        setError('Announcement title is required');
        return;
      }
      
      if (!announcementForm.content?.trim()) {
        setError('Announcement content is required');
        return;
      }
      
      // Create FormData for file upload support
      const formData = new FormData();
      
      // Fields to exclude (backend will set these automatically)
      const excludeFields = ['created_by', 'created_at', 'updated_at', 'id'];
      
      // Add all form fields to FormData
      Object.keys(announcementForm).forEach(key => {
        // Skip fields that should be set by backend
        if (excludeFields.includes(key)) {
          return;
        }
        
        const value = announcementForm[key];
        if (value !== null && value !== undefined && value !== '') {
          if (Array.isArray(value)) {
            // Handle arrays (target_departments, target_users)
            if (value.length > 0) {
              value.forEach(item => formData.append(key, item));
            }
          } else if (value instanceof File) {
            // Handle file uploads
            formData.append(key, value);
          } else {
            // Handle regular fields
            formData.append(key, value);
          }
        }
      });
      
      // Add default values if not set
      if (!announcementForm.publish_date) {
        formData.append('publish_date', new Date().toISOString());
      }
      
      // Ensure is_published is set to true for immediate publishing
      if (!formData.has('is_published')) {
        formData.append('is_published', 'true');
      }
      
      // Log FormData contents for debugging
      console.log('📤 FormData contents:');
      for (let [key, value] of formData.entries()) {
        console.log(`  ${key}:`, value);
      }
      
      console.log('📡 Making API call to create announcement...');
      const response = await HRCalendarService.createAnnouncement(formData);
      console.log('✅ Announcement created successfully:', response);
      
      setSuccess('Announcement created successfully and notifications sent!');
      setAnnouncementDialogOpen(false);
      resetForms();
      await loadData(); // Refresh data to show new announcement
      
    } catch (err) {
      console.error('❌ Error creating announcement:', err);
      console.error('❌ Error response:', err.response?.data);
      console.error('❌ Error status:', err.response?.status);
      
      let errorMessage = 'Failed to create announcement';
      if (err.response?.data?.detail) {
        errorMessage = err.response.data.detail;
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data) {
        // Handle field-specific errors
        const errors = err.response.data;
        if (typeof errors === 'object') {
          const errorMessages = Object.entries(errors)
            .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
            .join('; ');
          errorMessage = `Validation errors: ${errorMessages}`;
        }
      } else if (err.response?.status === 401) {
        errorMessage = 'Authentication required. Please log in again.';
      } else if (err.response?.status === 403) {
        errorMessage = 'You do not have permission to create announcements.';
      } else if (err.response?.status === 400) {
        errorMessage = 'Invalid announcement data. Please check all fields.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    }
  };

  const handleCompleteDeadline = async (deadlineId) => {
    try {
      await HRCalendarService.completeDeadline(deadlineId);
      setSuccess('Deadline marked as completed');
      loadData();
    } catch (err) {
      setError('Failed to complete deadline');
    }
  };

  const handleMarkAnnouncementRead = async (announcementId) => {
    try {
      await HRCalendarService.markAnnouncementRead(announcementId);
      loadData();
    } catch (err) {
      console.error('Error marking announcement as read:', err);
    }
  };

  const resetForms = () => {
    setEventForm({ 
      title: '', 
      description: '', 
      event_type: 'other', 
      start_date: '', 
      end_date: '', 
      start_time: '', 
      end_time: '', 
      is_all_day: false, 
      location: '', 
      priority: 'medium', 
      is_public: true, 
      send_notifications: true, 
      notification_days_before: 1, 
      assigned_to: [], 
      departments: [] 
    });
    
    setHolidayForm({ 
      name: '', 
      description: '', 
      holiday_type: 'company', 
      date: '', 
      is_recurring: true, 
      is_work_day: false, 
      departments: [] 
    });
    
    setDeadlineForm({ 
      title: '', 
      description: '', 
      deadline_type: 'other', 
      due_date: '', 
      due_time: '', 
      assigned_to: [], 
      department: '', 
      reminder_days: 3, 
      send_reminders: true 
    });
    
    setAnnouncementForm({ 
      title: '', 
      content: '', 
      announcement_type: 'general', 
      priority: 'medium', 
      audience_type: 'all', 
      target_departments: [], 
      target_users: [], 
      publish_date: '', 
      expiry_date: '', 
      send_email: true, 
      send_push: true, 
      send_sms: false, 
      attachment: null, 
      image: null 
    });
    
    // Clear any error messages
    setError('');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const StatsCards = () => (
    <Grid container spacing={3} sx={{ mb: 3 }}>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center">
              <TodayIcon color="primary" sx={{ mr: 2 }} />
              <Box>
                <Typography variant="h4">{dashboardStats.today_events || 0}</Typography>
                <Typography color="textSecondary">Today's Events</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center">
              <UpcomingIcon color="warning" sx={{ mr: 2 }} />
              <Box>
                <Typography variant="h4">{dashboardStats.upcoming_events || 0}</Typography>
                <Typography color="textSecondary">Upcoming Events</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center">
              <WarningIcon color="error" sx={{ mr: 2 }} />
              <Box>
                <Typography variant="h4">{dashboardStats.overdue_deadlines || 0}</Typography>
                <Typography color="textSecondary">Overdue Deadlines</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center">
              <NotificationsIcon color="info" sx={{ mr: 2 }} />
              <Box>
                <Typography variant="h4">{dashboardStats.unread_announcements || 0}</Typography>
                <Typography color="textSecondary">Unread Announcements</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  if (loading) {
    return <Box p={3}><Typography>Loading HR calendar data...</Typography></Box>;
  }

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          <CalendarMonthIcon sx={{ mr: 1 }} />
          HR Calendar & Announcements
        </Typography>
        <Box>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setEventDialogOpen(true)} sx={{ mr: 1 }}>Add Event</Button>
          <Button variant="outlined" startIcon={<AnnouncementIcon />} onClick={() => setAnnouncementDialogOpen(true)}>Create Announcement</Button>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <StatsCards />

      <Card>
        <CardContent>
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
            <Tab label="Events" icon={<EventIcon />} />
            <Tab label="Holidays" icon={<HolidayIcon />} />
            <Tab label="Deadlines" icon={<ScheduleIcon />} />
            <Tab label="Announcements" icon={<AnnouncementIcon />} />
          </Tabs>

          <Box mt={3}>
            {activeTab === 0 && (
              <Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6">Calendar Events</Typography>
                  <Button variant="outlined" startIcon={<AddIcon />} onClick={() => setEventDialogOpen(true)}>Add Event</Button>
                </Box>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Title</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell>Priority</TableCell>
                        <TableCell>Location</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {events.length === 0 && (
                        <TableRow><TableCell colSpan={6} align="center">No events found.</TableCell></TableRow>
                      )}
                      {events.map((event) => (
                        <TableRow key={event.id}>
                          <TableCell>{event.title}</TableCell>
                          <TableCell>
                            <Chip label={event.event_type.replace('_', ' ').toUpperCase()} size="small" style={{ backgroundColor: HRCalendarService.getEventTypeColor(event.event_type), color: 'white' }} />
                          </TableCell>
                          <TableCell>{formatDate(event.start_date)}</TableCell>
                          <TableCell>
                            <Chip label={event.priority.toUpperCase()} size="small" style={{ backgroundColor: HRCalendarService.getPriorityColor(event.priority), color: 'white' }} />
                          </TableCell>
                          <TableCell>{event.location || 'N/A'}</TableCell>
                          <TableCell>
                            <Tooltip title="View Event"><IconButton size="small" color="primary"><ViewIcon /></IconButton></Tooltip>
                            <Tooltip title="Edit Event"><IconButton size="small" color="primary"><EditIcon /></IconButton></Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}

            {activeTab === 1 && (
              <Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6">Company Holidays</Typography>
                  <Button variant="outlined" startIcon={<AddIcon />} onClick={() => setHolidayDialogOpen(true)}>Add Holiday</Button>
                </Box>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell>Work Day</TableCell>
                        <TableCell>Departments</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {holidays.length === 0 && (
                        <TableRow><TableCell colSpan={6} align="center">No holidays found.</TableCell></TableRow>
                      )}
                      {holidays.map((holiday) => (
                        <TableRow key={holiday.id}>
                          <TableCell>{holiday.name}</TableCell>
                          <TableCell><Chip label={holiday.holiday_type.replace('_', ' ').toUpperCase()} size="small" color="primary" /></TableCell>
                          <TableCell>{formatDate(holiday.date)}</TableCell>
                          <TableCell><Chip label={holiday.is_work_day ? 'Work Day' : 'Holiday'} size="small" color={holiday.is_work_day ? 'warning' : 'success'} /></TableCell>
                          <TableCell>{holiday.department_names?.join(', ') || 'All Departments'}</TableCell>
                          <TableCell>
                            <Tooltip title="Edit Holiday"><IconButton size="small" color="primary"><EditIcon /></IconButton></Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}

            {activeTab === 2 && (
              <Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6">HR Deadlines</Typography>
                  <Button variant="outlined" startIcon={<AddIcon />} onClick={() => setDeadlineDialogOpen(true)}>Add Deadline</Button>
                </Box>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Title</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Due Date</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Assigned To</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {deadlines.length === 0 && (
                        <TableRow><TableCell colSpan={6} align="center">No deadlines found.</TableCell></TableRow>
                      )}
                      {deadlines.map((deadline) => (
                        <TableRow key={deadline.id}>
                          <TableCell>{deadline.title}</TableCell>
                          <TableCell><Chip label={deadline.deadline_type.replace('_', ' ').toUpperCase()} size="small" color="secondary" /></TableCell>
                          <TableCell>{formatDate(deadline.due_date)}</TableCell>
                          <TableCell>
                            <Chip label={deadline.is_completed ? 'Completed' : deadline.is_overdue ? 'Overdue' : 'Pending'} size="small" color={deadline.is_completed ? 'success' : deadline.is_overdue ? 'error' : 'warning'} />
                          </TableCell>
                          <TableCell>{deadline.assigned_to_names?.join(', ') || 'N/A'}</TableCell>
                          <TableCell>
                            {!deadline.is_completed && (
                              <Tooltip title="Mark Complete"><IconButton size="small" color="success" onClick={() => handleCompleteDeadline(deadline.id)}><CheckIcon /></IconButton></Tooltip>
                            )}
                            <Tooltip title="Edit Deadline"><IconButton size="small" color="primary"><EditIcon /></IconButton></Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}

            {activeTab === 3 && (
              <Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6">Company Announcements</Typography>
                  <Button variant="outlined" startIcon={<AddIcon />} onClick={() => setAnnouncementDialogOpen(true)}>Create Announcement</Button>
                </Box>
                <List>
                  {announcements.length === 0 && (
                    <ListItem><ListItemText primary="No announcements found." /></ListItem>
                  )}
                  {announcements.map((announcement) => (
                    <React.Fragment key={announcement.id}>
                      <ListItem>
                        <Avatar sx={{ mr: 2, bgcolor: HRCalendarService.getPriorityColor(announcement.priority) }}>
                          <AnnouncementIcon />
                        </Avatar>
                        <ListItemText
                          primary={
                            <Box display="flex" alignItems="center">
                              <Typography variant="h6" sx={{ mr: 1 }}>{announcement.title}</Typography>
                              <Chip label={announcement.priority.toUpperCase()} size="small" style={{ backgroundColor: HRCalendarService.getPriorityColor(announcement.priority), color: 'white' }} />
                              {announcement.is_pinned && <Chip label="PINNED" size="small" color="secondary" sx={{ ml: 1 }} />}
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography variant="body2" paragraph>{announcement.content}</Typography>
                              <Typography variant="caption" color="textSecondary">{announcement.created_by_name} • {formatDate(announcement.created_at)}</Typography>
                            </Box>
                          }
                        />
                        <ListItemSecondaryAction>
                          {!announcement.is_read_by_user && (
                            <Tooltip title="Mark as Read"><IconButton size="small" onClick={() => handleMarkAnnouncementRead(announcement.id)}><MarkReadIcon /></IconButton></Tooltip>
                          )}
                          <Tooltip title="View Details"><IconButton size="small" color="primary"><ViewIcon /></IconButton></Tooltip>
                        </ListItemSecondaryAction>
                      </ListItem>
                      <Divider />
                    </React.Fragment>
                  ))}
                </List>
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Create Event Dialog */}
      <Dialog open={eventDialogOpen} onClose={() => setEventDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create New Event</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField fullWidth label="Event Title" value={eventForm.title} onChange={(e) => setEventForm({...eventForm, title: e.target.value})} />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Event Type</InputLabel>
                <Select value={eventForm.event_type} onChange={(e) => setEventForm({...eventForm, event_type: e.target.value})}>
                  <MenuItem value="company_event">Company Event</MenuItem>
                  <MenuItem value="training">Training Session</MenuItem>
                  <MenuItem value="meeting">Meeting</MenuItem>
                  <MenuItem value="recruitment">Recruitment Event</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select value={eventForm.priority} onChange={(e) => setEventForm({...eventForm, priority: e.target.value})}>
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="critical">Critical</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Start Date" type="date" value={eventForm.start_date} onChange={(e) => setEventForm({...eventForm, start_date: e.target.value})} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="End Date" type="date" value={eventForm.end_date} onChange={(e) => setEventForm({...eventForm, end_date: e.target.value})} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Description" multiline rows={3} value={eventForm.description} onChange={(e) => setEventForm({...eventForm, description: e.target.value})} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Location" value={eventForm.location} onChange={(e) => setEventForm({...eventForm, location: e.target.value})} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEventDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateEvent} variant="contained">Create Event</Button>
        </DialogActions>
      </Dialog>

      {/* Holiday Dialog */}
      <HolidayDialog
        open={holidayDialogOpen}
        onClose={() => setHolidayDialogOpen(false)}
        holidayForm={holidayForm}
        setHolidayForm={setHolidayForm}
        onSubmit={handleCreateHoliday}
        departments={departments}
      />

      {/* Deadline Dialog */}
      <DeadlineDialog
        open={deadlineDialogOpen}
        onClose={() => setDeadlineDialogOpen(false)}
        deadlineForm={deadlineForm}
        setDeadlineForm={setDeadlineForm}
        onSubmit={handleCreateDeadline}
        users={users}
        departments={departments}
      />

      {/* Announcement Dialog */}
      <AnnouncementDialog
        open={announcementDialogOpen}
        onClose={() => setAnnouncementDialogOpen(false)}
        announcementForm={announcementForm}
        setAnnouncementForm={setAnnouncementForm}
        onSubmit={handleCreateAnnouncement}
        users={users}
        departments={departments}
      />
    </Box>
  );
};

export default HRCalendar;

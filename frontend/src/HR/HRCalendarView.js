import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Tabs, Tab,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Chip, Alert, List, ListItem, ListItemText,
  Badge, Avatar, Divider, CircularProgress
} from '@mui/material';
import {
  CalendarMonth as CalendarMonthIcon, Event as EventIcon,
  Event as HolidayIcon, Schedule as ScheduleIcon, Announcement as AnnouncementIcon,
  Today as TodayIcon, Upcoming as UpcomingIcon,
  Visibility as ViewIcon, Info as InfoIcon
} from '@mui/icons-material';
import HRCalendarService from '../services/HRCalendarService';

const HRCalendarView = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [dashboardStats, setDashboardStats] = useState({});
  const [events, setEvents] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [deadlines, setDeadlines] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const [statsRes, eventsRes, holidaysRes, deadlinesRes, announcementsRes] = await Promise.all([
        HRCalendarService.getDashboardStats(),
        HRCalendarService.getEvents(),
        HRCalendarService.getHolidays(),
        HRCalendarService.getDeadlines(),
        HRCalendarService.getAnnouncements()
      ]);

      setDashboardStats(statsRes);
      setEvents(eventsRes.results || eventsRes);
      setHolidays(holidaysRes.results || holidaysRes);
      setDeadlines(deadlinesRes.results || deadlinesRes);
      setAnnouncements(announcementsRes.results || announcementsRes);
    } catch (err) {
      setError('Failed to load calendar data');
      console.error('Error loading calendar data:', err);
    } finally {
      setLoading(false);
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString, timeString) => {
    const date = new Date(dateString);
    if (timeString) {
      const [hours, minutes] = timeString.split(':');
      date.setHours(parseInt(hours), parseInt(minutes));
    }
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: timeString ? 'numeric' : undefined,
      minute: timeString ? '2-digit' : undefined
    });
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'default';
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'overdue': return 'error';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>Loading calendar...</Typography>
      </Box>
    );
  }

  const renderDashboard = () => (
    <Grid container spacing={3} mb={3}>
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center">
              <EventIcon color="primary" sx={{ mr: 1 }} />
              <Box>
                <Typography variant="h6">{dashboardStats.total_events || 0}</Typography>
                <Typography variant="body2" color="text.secondary">Total Events</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center">
              <HolidayIcon color="secondary" sx={{ mr: 1 }} />
              <Box>
                <Typography variant="h6">{dashboardStats.total_holidays || 0}</Typography>
                <Typography variant="body2" color="text.secondary">Holidays</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center">
              <ScheduleIcon color="warning" sx={{ mr: 1 }} />
              <Box>
                <Typography variant="h6">{dashboardStats.pending_deadlines || 0}</Typography>
                <Typography variant="body2" color="text.secondary">Pending Deadlines</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center">
              <AnnouncementIcon color="info" sx={{ mr: 1 }} />
              <Box>
                <Typography variant="h6">{dashboardStats.active_announcements || 0}</Typography>
                <Typography variant="body2" color="text.secondary">Active Announcements</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderEvents = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell><strong>Event</strong></TableCell>
            <TableCell><strong>Type</strong></TableCell>
            <TableCell><strong>Date & Time</strong></TableCell>
            <TableCell><strong>Location</strong></TableCell>
            <TableCell><strong>Priority</strong></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {events.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                <Typography variant="body1" color="text.secondary">
                  No events scheduled
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            events.map((event) => (
              <TableRow key={event.id} hover>
                <TableCell>
                  <Typography variant="body2" fontWeight="medium">{event.title}</Typography>
                  {event.description && (
                    <Typography variant="caption" color="text.secondary" display="block">
                      {event.description}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Chip label={event.event_type || 'Other'} size="small" />
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {event.is_all_day 
                      ? formatDate(event.start_date)
                      : formatDateTime(event.start_date, event.start_time)
                    }
                  </Typography>
                  {!event.is_all_day && event.end_date && (
                    <Typography variant="caption" color="text.secondary" display="block">
                      to {formatDateTime(event.end_date, event.end_time)}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{event.location || 'Not specified'}</Typography>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={event.priority || 'Medium'} 
                    color={getPriorityColor(event.priority)}
                    size="small" 
                  />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderHolidays = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell><strong>Holiday</strong></TableCell>
            <TableCell><strong>Type</strong></TableCell>
            <TableCell><strong>Date</strong></TableCell>
            <TableCell><strong>Work Day</strong></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {holidays.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                <Typography variant="body1" color="text.secondary">
                  No holidays scheduled
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            holidays.map((holiday) => (
              <TableRow key={holiday.id} hover>
                <TableCell>
                  <Typography variant="body2" fontWeight="medium">{holiday.name}</Typography>
                  {holiday.description && (
                    <Typography variant="caption" color="text.secondary" display="block">
                      {holiday.description}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Chip label={holiday.holiday_type || 'Company'} size="small" />
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{formatDate(holiday.date)}</Typography>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={holiday.is_work_day ? 'Yes' : 'No'} 
                    color={holiday.is_work_day ? 'warning' : 'success'}
                    size="small" 
                  />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderDeadlines = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell><strong>Deadline</strong></TableCell>
            <TableCell><strong>Type</strong></TableCell>
            <TableCell><strong>Due Date</strong></TableCell>
            <TableCell><strong>Status</strong></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {deadlines.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                <Typography variant="body1" color="text.secondary">
                  No deadlines assigned
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            deadlines.map((deadline) => (
              <TableRow key={deadline.id} hover>
                <TableCell>
                  <Typography variant="body2" fontWeight="medium">{deadline.title}</Typography>
                  {deadline.description && (
                    <Typography variant="caption" color="text.secondary" display="block">
                      {deadline.description}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Chip label={deadline.deadline_type || 'Other'} size="small" />
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {formatDateTime(deadline.due_date, deadline.due_time)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={deadline.status || 'Pending'} 
                    color={getStatusColor(deadline.status)}
                    size="small" 
                  />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderAnnouncements = () => (
    <List>
      {announcements.length === 0 ? (
        <ListItem>
          <ListItemText 
            primary={
              <Typography variant="body1" color="text.secondary" align="center">
                No announcements available
              </Typography>
            }
          />
        </ListItem>
      ) : (
        announcements.map((announcement) => (
          <React.Fragment key={announcement.id}>
            <ListItem 
              alignItems="flex-start"
              sx={{ 
                cursor: 'pointer',
                '&:hover': { backgroundColor: 'action.hover' }
              }}
              onClick={() => handleMarkAnnouncementRead(announcement.id)}
            >
              <ListItemText
                primary={
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="body1" fontWeight="medium">
                      {announcement.title}
                    </Typography>
                    <Chip 
                      label={announcement.priority || 'Medium'} 
                      color={getPriorityColor(announcement.priority)}
                      size="small" 
                    />
                    {!announcement.is_read && (
                      <Badge color="primary" variant="dot" />
                    )}
                  </Box>
                }
                secondary={
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      {announcement.content}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      Published: {formatDate(announcement.publish_date)} 
                      {announcement.expiry_date && ` • Expires: ${formatDate(announcement.expiry_date)}`}
                    </Typography>
                  </Box>
                }
              />
            </ListItem>
            <Divider />
          </React.Fragment>
        ))
      )}
    </List>
  );

  return (
    <Box>
      <Box display="flex" alignItems="center" mb={3}>
        <CalendarMonthIcon sx={{ mr: 1, color: 'primary.main' }} />
        <Typography variant="h4" component="h1">
          HR Calendar
        </Typography>
      </Box>
      
      <Typography variant="body1" color="text.secondary" mb={3}>
        View company events, holidays, deadlines, and announcements.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {renderDashboard()}

      <Paper sx={{ mt: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Events" icon={<EventIcon />} />
          <Tab label="Holidays" icon={<HolidayIcon />} />
          <Tab label="Deadlines" icon={<ScheduleIcon />} />
          <Tab label="Announcements" icon={<AnnouncementIcon />} />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {activeTab === 0 && renderEvents()}
          {activeTab === 1 && renderHolidays()}
          {activeTab === 2 && renderDeadlines()}
          {activeTab === 3 && renderAnnouncements()}
        </Box>
      </Paper>

      <Box mt={2}>
        <Typography variant="caption" color="text.secondary">
          💡 This is a read-only view. Contact HR to create events or announcements.
        </Typography>
      </Box>
    </Box>
  );
};

export default HRCalendarView;

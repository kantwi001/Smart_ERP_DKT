import api from '../api';

class HRCalendarService {
  // Calendar Events
  async getEvents(params = {}) {
    const response = await api.get('/hr/calendar-events/', { params });
    return response.data;
  }

  async getEvent(id) {
    const response = await api.get(`/hr/calendar-events/${id}/`);
    return response.data;
  }

  async createEvent(data) {
    const response = await api.post('/hr/calendar-events/', data);
    return response.data;
  }

  async updateEvent(id, data) {
    const response = await api.put(`/hr/calendar-events/${id}/`, data);
    return response.data;
  }

  async deleteEvent(id) {
    await api.delete(`/hr/calendar-events/${id}/`);
  }

  async getUpcomingEvents() {
    const response = await api.get('/hr/calendar-events/upcoming/');
    return response.data;
  }

  async getTodayEvents() {
    const response = await api.get('/hr/calendar-events/today/');
    return response.data;
  }

  // Holidays
  async getHolidays(params = {}) {
    const response = await api.get('/hr/holidays/', { params });
    return response.data;
  }

  async getHoliday(id) {
    const response = await api.get(`/hr/holidays/${id}/`);
    return response.data;
  }

  async createHoliday(data) {
    const response = await api.post('/hr/holidays/', data);
    return response.data;
  }

  async updateHoliday(id, data) {
    const response = await api.put(`/hr/holidays/${id}/`, data);
    return response.data;
  }

  async deleteHoliday(id) {
    await api.delete(`/hr/holidays/${id}/`);
  }

  async getUpcomingHolidays() {
    const response = await api.get('/hr/holidays/upcoming/');
    return response.data;
  }

  // Deadlines
  async getDeadlines(params = {}) {
    const response = await api.get('/hr/deadlines/', { params });
    return response.data;
  }

  async getDeadline(id) {
    const response = await api.get(`/hr/deadlines/${id}/`);
    return response.data;
  }

  async createDeadline(data) {
    const response = await api.post('/hr/deadlines/', data);
    return response.data;
  }

  async updateDeadline(id, data) {
    const response = await api.put(`/hr/deadlines/${id}/`, data);
    return response.data;
  }

  async deleteDeadline(id) {
    await api.delete(`/hr/deadlines/${id}/`);
  }

  async completeDeadline(id) {
    const response = await api.post(`/hr/deadlines/${id}/complete/`);
    return response.data;
  }

  async getOverdueDeadlines() {
    const response = await api.get('/hr/deadlines/overdue/');
    return response.data;
  }

  async getUpcomingDeadlines() {
    const response = await api.get('/hr/deadlines/upcoming/');
    return response.data;
  }

  // Enhanced Announcements
  async getAnnouncements(params = {}) {
    const response = await api.get('/hr/enhanced-announcements/', { params });
    return response.data;
  }

  async getAnnouncement(id) {
    const response = await api.get(`/hr/enhanced-announcements/${id}/`);
    return response.data;
  }

  async createAnnouncement(data) {
    const response = await api.post('/hr/enhanced-announcements/', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async updateAnnouncement(id, data) {
    const response = await api.put(`/hr/enhanced-announcements/${id}/`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async deleteAnnouncement(id) {
    await api.delete(`/hr/enhanced-announcements/${id}/`);
  }

  async markAnnouncementRead(id) {
    const response = await api.post(`/hr/enhanced-announcements/${id}/mark_read/`);
    return response.data;
  }

  async getUnreadAnnouncements() {
    const response = await api.get('/hr/enhanced-announcements/unread/');
    return response.data;
  }

  async publishAnnouncement(id) {
    const response = await api.post(`/hr/enhanced-announcements/${id}/publish/`);
    return response.data;
  }

  // Notifications
  async getNotifications(params = {}) {
    const response = await api.get('/hr/calendar-notifications/', { params });
    return response.data;
  }

  // Dashboard Stats
  async getDashboardStats() {
    const response = await api.get('/hr/calendar-dashboard-stats/');
    return response.data;
  }

  // Utility methods
  formatDate(dateString) {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  }

  formatDateTime(dateTimeString) {
    if (!dateTimeString) return 'N/A';
    return new Date(dateTimeString).toLocaleString();
  }

  formatTime(timeString) {
    if (!timeString) return 'N/A';
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getEventTypeColor(eventType) {
    const colors = {
      'company_event': '#2196F3',
      'holiday': '#4CAF50',
      'hr_deadline': '#FF5722',
      'training': '#9C27B0',
      'meeting': '#FF9800',
      'birthday': '#E91E63',
      'anniversary': '#673AB7',
      'leave': '#795548',
      'recruitment': '#009688',
      'performance_review': '#3F51B5',
      'other': '#607D8B'
    };
    return colors[eventType] || colors.other;
  }

  getPriorityColor(priority) {
    const colors = {
      'low': '#4CAF50',
      'medium': '#FF9800',
      'high': '#FF5722',
      'critical': '#F44336',
      'urgent': '#D32F2F'
    };
    return colors[priority] || colors.medium;
  }

  getAnnouncementTypeIcon(type) {
    const icons = {
      'general': 'Announcement',
      'policy': 'Policy',
      'event': 'Event',
      'holiday': 'Holiday',
      'deadline': 'Schedule',
      'training': 'School',
      'emergency': 'Warning',
      'celebration': 'Celebration',
      'other': 'Info'
    };
    return icons[type] || icons.other;
  }
}

export default new HRCalendarService();

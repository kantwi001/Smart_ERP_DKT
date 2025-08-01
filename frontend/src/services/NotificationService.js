import api from '../api';

class NotificationService {
  // Get all notifications for current user
  async getNotifications() {
    try {
      const response = await api.get('/notifications/');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      return [];
    }
  }

  // Get notification statistics
  async getNotificationStats() {
    try {
      const response = await api.get('/notifications/stats/');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch notification stats:', error);
      return {
        total_notifications: 0,
        unread_notifications: 0,
        pending_approvals: 0
      };
    }
  }

  // Mark notification as read
  async markAsRead(notificationId) {
    try {
      await api.patch(`/notifications/${notificationId}/`, {
        mark_as_read: true
      });
      return true;
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      return false;
    }
  }

  // Mark all notifications as read
  async markAllAsRead() {
    try {
      const response = await api.post('/notifications/mark-all-read/');
      return response.data;
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      return null;
    }
  }

  // Get pending transfer approvals
  async getPendingApprovals() {
    try {
      const response = await api.get('/notifications/approvals/pending/');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch pending approvals:', error);
      return [];
    }
  }

  // Get transfer approval details
  async getTransferApprovalDetails(transferId) {
    try {
      const response = await api.get(`/notifications/transfers/${transferId}/details/`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch transfer approval details:', error);
      return null;
    }
  }

  // Approve transfer
  async approveTransfer(transferId, notes = '') {
    try {
      const response = await api.post(`/notifications/transfers/${transferId}/approve/`, {
        action: 'approve',
        notes: notes
      });
      return { success: true, message: response.data.message };
    } catch (error) {
      console.error('Failed to approve transfer:', error);
      return { 
        success: false, 
        message: error.response?.data?.error || 'Failed to approve transfer' 
      };
    }
  }

  // Reject transfer
  async rejectTransfer(transferId, reason = '') {
    try {
      const response = await api.post(`/notifications/transfers/${transferId}/approve/`, {
        action: 'reject',
        reason: reason
      });
      return { success: true, message: response.data.message };
    } catch (error) {
      console.error('Failed to reject transfer:', error);
      return { 
        success: false, 
        message: error.response?.data?.error || 'Failed to reject transfer' 
      };
    }
  }

  // Get notification channels (admin)
  async getNotificationChannels() {
    try {
      const response = await api.get('/notifications/channels/');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch notification channels:', error);
      return [];
    }
  }

  // Get notification templates (admin)
  async getNotificationTemplates() {
    try {
      const response = await api.get('/notifications/templates/');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch notification templates:', error);
      return [];
    }
  }
}

const notificationService = new NotificationService();
export default notificationService;

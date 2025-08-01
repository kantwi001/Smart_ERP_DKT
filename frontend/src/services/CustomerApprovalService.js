import api from '../api';

class CustomerApprovalService {
  /**
   * Get all customer approval requests (filtered by user role)
   */
  static async getApprovals() {
    try {
      const response = await api.get('/sales/customer-approvals/');
      return response.data;
    } catch (error) {
      console.error('Error fetching customer approvals:', error);
      throw error;
    }
  }

  /**
   * Get pending customer approval requests (Sales Manager/Superuser only)
   */
  static async getPendingApprovals() {
    try {
      const response = await api.get('/sales/customer-approvals/pending/');
      return response.data;
    } catch (error) {
      console.error('Error fetching pending approvals:', error);
      throw error;
    }
  }

  /**
   * Get current user's customer requests
   */
  static async getMyRequests() {
    try {
      const response = await api.get('/sales/customer-approvals/my_requests/');
      return response.data;
    } catch (error) {
      console.error('Error fetching my requests:', error);
      throw error;
    }
  }

  /**
   * Create a new customer approval request
   */
  static async createCustomerRequest(customerData) {
    try {
      const response = await api.post('/sales/customer-approvals/', customerData);
      return response.data;
    } catch (error) {
      console.error('Error creating customer request:', error);
      throw error;
    }
  }

  /**
   * Approve a customer request
   */
  static async approveCustomer(approvalId, customerType) {
    try {
      const response = await api.post(`/sales/customer-approvals/${approvalId}/approve_reject/`, {
        action: 'approve',
        approved_customer_type: customerType
      });
      return response.data;
    } catch (error) {
      console.error('Error approving customer:', error);
      throw error;
    }
  }

  /**
   * Reject a customer request
   */
  static async rejectCustomer(approvalId, reason) {
    try {
      const response = await api.post(`/sales/customer-approvals/${approvalId}/approve_reject/`, {
        action: 'reject',
        rejection_reason: reason
      });
      return response.data;
    } catch (error) {
      console.error('Error rejecting customer:', error);
      throw error;
    }
  }

  /**
   * Get customer approval statistics
   */
  static async getApprovalStats() {
    try {
      const approvals = await this.getApprovals();
      const pending = approvals.filter(a => a.status === 'pending').length;
      const approved = approvals.filter(a => a.status === 'approved').length;
      const rejected = approvals.filter(a => a.status === 'rejected').length;
      
      return {
        total: approvals.length,
        pending,
        approved,
        rejected
      };
    } catch (error) {
      console.error('Error getting approval stats:', error);
      return { total: 0, pending: 0, approved: 0, rejected: 0 };
    }
  }

  /**
   * Check if user can create customers directly (Superuser/Sales Manager)
   */
  static async canCreateDirectly() {
    try {
      const response = await api.get('/users/me/');
      const user = response.data;
      return user.is_superuser || ['sales_manager', 'admin'].includes(user.role);
    } catch (error) {
      console.error('Error checking user permissions:', error);
      return false;
    }
  }

  /**
   * Create customer directly (for Superuser/Sales Manager)
   */
  static async createCustomerDirectly(customerData) {
    try {
      const response = await api.post('/sales/customers/', customerData);
      return response.data;
    } catch (error) {
      console.error('Error creating customer directly:', error);
      throw error;
    }
  }
}

export default CustomerApprovalService;

import api from '../api';

class WorkflowService {
  // Workflow Templates
  async getWorkflowTemplates() {
    const response = await api.get('/workflows/templates/');
    return response.data;
  }

  async getWorkflowTemplatesByType(type) {
    const response = await api.get(`/workflows/templates/by_type/?type=${type}`);
    return response.data;
  }

  async createWorkflowTemplate(templateData) {
    const response = await api.post('/workflows/templates/', templateData);
    return response.data;
  }

  async updateWorkflowTemplate(id, templateData) {
    const response = await api.put(`/workflows/templates/${id}/`, templateData);
    return response.data;
  }

  async deleteWorkflowTemplate(id) {
    const response = await api.delete(`/workflows/templates/${id}/`);
    return response.data;
  }

  async duplicateWorkflowTemplate(id) {
    const response = await api.post(`/workflows/templates/${id}/duplicate/`);
    return response.data;
  }

  // Workflow Instances
  async getWorkflowInstances(filters = {}) {
    const params = new URLSearchParams(filters);
    const response = await api.get(`/workflows/instances/?${params}`);
    return response.data;
  }

  async getWorkflowInstance(id) {
    const response = await api.get(`/workflows/instances/${id}/`);
    return response.data;
  }

  async takeWorkflowAction(instanceId, actionData) {
    const response = await api.post(`/workflows/instances/${instanceId}/take_action/`, actionData);
    return response.data;
  }

  async cancelWorkflow(instanceId, reason) {
    const response = await api.post(`/workflows/instances/${instanceId}/cancel/`, { reason });
    return response.data;
  }

  // Workflow Approvals
  async getWorkflowApprovals(filters = {}) {
    const params = new URLSearchParams(filters);
    const response = await api.get(`/workflows/approvals/?${params}`);
    return response.data;
  }

  async getPendingApprovals() {
    const response = await api.get('/workflows/instances/?pending_for_me=true');
    return response.data;
  }

  // Workflow Steps
  async getWorkflowSteps(templateId) {
    const response = await api.get(`/workflows/steps/?template=${templateId}`);
    return response.data;
  }

  async createWorkflowStep(stepData) {
    const response = await api.post('/workflows/steps/', stepData);
    return response.data;
  }

  async updateWorkflowStep(id, stepData) {
    const response = await api.put(`/workflows/steps/${id}/`, stepData);
    return response.data;
  }

  async deleteWorkflowStep(id) {
    const response = await api.delete(`/workflows/steps/${id}/`);
    return response.data;
  }

  // Workflow Notifications
  async getWorkflowNotifications() {
    const response = await api.get('/workflows/notifications/');
    return response.data;
  }

  async markNotificationAsRead(id) {
    const response = await api.post(`/workflows/notifications/${id}/mark_read/`);
    return response.data;
  }

  static async getNotificationStatus(workflowInstanceId) {
    const response = await api.get(`/workflows/instances/${workflowInstanceId}/notification-status/`);
    return response;
  }

  static async sendReminderNotifications(workflowInstanceId) {
    const response = await api.post(`/workflows/instances/${workflowInstanceId}/send-reminders/`);
    return response.data;
  }

  static async getNotificationTimeline(workflowInstanceId) {
    const response = await api.get(`/workflows/instances/${workflowInstanceId}/notification-timeline/`);
    return response.data;
  }

  // Workflow Dashboard
  async getDashboardStats() {
    const response = await api.get('/workflows/dashboard/stats/');
    return response.data;
  }

  async getWorkflowStats() {
    const response = await api.get('/workflows/dashboard/stats/');
    return response.data;
  }

  async getMyTasks() {
    const response = await api.get('/workflows/dashboard/my_tasks/');
    return response.data;
  }

  // Workflow Configuration
  async getWorkflowConfigurations() {
    const response = await api.get('/workflows/configurations/');
    return response.data;
  }

  async getSystemSettings() {
    const response = await api.get('/workflows/configurations/system_settings/');
    return response.data;
  }

  async updateWorkflowConfigurations(configurations) {
    const response = await api.post('/workflows/configurations/bulk_update/', {
      configurations
    });
    return response.data;
  }

  // Audit Logs
  async getWorkflowAuditLogs(instanceId) {
    const response = await api.get(`/workflows/audit-logs/?instance=${instanceId}`);
    return response.data;
  }

  // Utility methods
  getWorkflowTypeOptions() {
    return [
      { value: 'staff_request', label: 'Staff Request' },
      { value: 'procurement', label: 'Procurement' },
      { value: 'leave_request', label: 'Leave Request' },
      { value: 'it_ticket', label: 'IT Ticket' },
      { value: 'expense_claim', label: 'Expense Claim' },
      { value: 'asset_request', label: 'Asset Request' },
      { value: 'custom', label: 'Custom Workflow' }
    ];
  }

  getApproverTypeOptions() {
    return [
      { value: 'direct_manager', label: 'Direct Manager' },
      { value: 'department_head', label: 'Department Head' },
      { value: 'finance_manager', label: 'Finance Manager' },
      { value: 'hr_manager', label: 'HR Manager' },
      { value: 'it_manager', label: 'IT Manager' },
      { value: 'procurement_manager', label: 'Procurement Manager' },
      { value: 'country_director', label: 'Country Director' },
      { value: 'specific_user', label: 'Specific User' },
      { value: 'role_based', label: 'Role Based' }
    ];
  }

  getStepTypeOptions() {
    return [
      { value: 'approval', label: 'Approval Step' },
      { value: 'notification', label: 'Notification Step' },
      { value: 'condition', label: 'Conditional Step' },
      { value: 'action', label: 'Action Step' }
    ];
  }

  getStatusOptions() {
    return [
      { value: 'pending', label: 'Pending' },
      { value: 'in_progress', label: 'In Progress' },
      { value: 'approved', label: 'Approved' },
      { value: 'rejected', label: 'Rejected' },
      { value: 'cancelled', label: 'Cancelled' },
      { value: 'escalated', label: 'Escalated' }
    ];
  }

  getActionOptions() {
    return [
      { value: 'approved', label: 'Approve' },
      { value: 'rejected', label: 'Reject' },
      { value: 'delegated', label: 'Delegate' }
    ];
  }
}

export default new WorkflowService();

import api from '../api';

class OnboardingService {
  // Templates
  async getTemplates(params = {}) {
    const response = await api.get('/hr/onboarding-templates/', { params });
    return response.data;
  }

  async getTemplate(id) {
    const response = await api.get(`/hr/onboarding-templates/${id}/`);
    return response.data;
  }

  async createTemplate(data) {
    const response = await api.post('/hr/onboarding-templates/', data);
    return response.data;
  }

  async updateTemplate(id, data) {
    const response = await api.put(`/hr/onboarding-templates/${id}/`, data);
    return response.data;
  }

  async deleteTemplate(id) {
    await api.delete(`/hr/onboarding-templates/${id}/`);
  }

  // Steps
  async getSteps(params = {}) {
    const response = await api.get('/hr/onboarding-steps/', { params });
    return response.data;
  }

  async createStep(data) {
    const response = await api.post('/hr/onboarding-steps/', data);
    return response.data;
  }

  async updateStep(id, data) {
    const response = await api.put(`/hr/onboarding-steps/${id}/`, data);
    return response.data;
  }

  async deleteStep(id) {
    await api.delete(`/hr/onboarding-steps/${id}/`);
  }

  // Processes
  async getProcesses(params = {}) {
    const response = await api.get('/hr/onboarding-processes/', { params });
    return response.data;
  }

  async getProcess(id) {
    const response = await api.get(`/hr/onboarding-processes/${id}/`);
    return response.data;
  }

  async createProcess(data) {
    const response = await api.post('/hr/onboarding-processes/', data);
    return response.data;
  }

  async updateProcess(id, data) {
    const response = await api.put(`/hr/onboarding-processes/${id}/`, data);
    return response.data;
  }

  async deleteProcess(id) {
    await api.delete(`/hr/onboarding-processes/${id}/`);
  }

  async startProcess(id) {
    const response = await api.post(`/hr/onboarding-processes/${id}/start_process/`);
    return response.data;
  }

  async completeProcess(id) {
    const response = await api.post(`/hr/onboarding-processes/${id}/complete_process/`);
    return response.data;
  }

  // Step Instances
  async getStepInstances(params = {}) {
    const response = await api.get('/hr/onboarding-step-instances/', { params });
    return response.data;
  }

  async updateStepInstance(id, data) {
    const response = await api.put(`/hr/onboarding-step-instances/${id}/`, data);
    return response.data;
  }

  async startStep(id) {
    const response = await api.post(`/hr/onboarding-step-instances/${id}/start_step/`);
    return response.data;
  }

  async completeStep(id, notes = '') {
    const response = await api.post(`/hr/onboarding-step-instances/${id}/complete_step/`, { notes });
    return response.data;
  }

  async skipStep(id, notes = '') {
    const response = await api.post(`/hr/onboarding-step-instances/${id}/skip_step/`, { notes });
    return response.data;
  }

  // Documents
  async getDocuments(params = {}) {
    const response = await api.get('/hr/onboarding-documents/', { params });
    return response.data;
  }

  async uploadDocument(data) {
    const response = await api.post('/hr/onboarding-documents/', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async deleteDocument(id) {
    await api.delete(`/hr/onboarding-documents/${id}/`);
  }

  // Feedback
  async getFeedback(params = {}) {
    const response = await api.get('/hr/onboarding-feedback/', { params });
    return response.data;
  }

  async createFeedback(data) {
    const response = await api.post('/hr/onboarding-feedback/', data);
    return response.data;
  }

  // Dashboard Stats
  async getDashboardStats() {
    const response = await api.get('/hr/onboarding-dashboard-stats/');
    return response.data;
  }
}

export default new OnboardingService();

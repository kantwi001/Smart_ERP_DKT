import api from '../api';

class TrainingService {
  // Training Materials
  static async getMaterials() {
    const response = await api.get('/hr/training-materials/');
    return response.data;
  }

  static async getMaterialById(id) {
    const response = await api.get(`/hr/training-materials/${id}/`);
    return response.data;
  }

  static async createMaterial(formData) {
    const response = await api.post('/hr/training-materials/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  static async updateMaterial(id, formData) {
    const response = await api.put(`/hr/training-materials/${id}/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  static async deleteMaterial(id) {
    const response = await api.delete(`/hr/training-materials/${id}/`);
    return response.data;
  }

  static async getMaterialStats() {
    const response = await api.get('/hr/training-materials/dashboard_stats/');
    return response.data;
  }

  static async markMaterialAccessed(id) {
    const response = await api.post(`/hr/training-materials/${id}/mark_accessed/`);
    return response.data;
  }

  static async markMaterialCompleted(id) {
    const response = await api.post(`/hr/training-materials/${id}/mark_completed/`);
    return response.data;
  }

  // Training Videos
  static async getVideos() {
    const response = await api.get('/hr/training-videos/');
    return response.data;
  }

  static async getVideoById(id) {
    const response = await api.get(`/hr/training-videos/${id}/`);
    return response.data;
  }

  static async createVideo(formData) {
    const response = await api.post('/hr/training-videos/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  static async updateVideo(id, formData) {
    const response = await api.put(`/hr/training-videos/${id}/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  static async deleteVideo(id) {
    const response = await api.delete(`/hr/training-videos/${id}/`);
    return response.data;
  }

  static async getVideoStats() {
    const response = await api.get('/hr/training-videos/dashboard_stats/');
    return response.data;
  }

  static async markVideoAccessed(id) {
    const response = await api.post(`/hr/training-videos/${id}/mark_accessed/`);
    return response.data;
  }

  static async markVideoCompleted(id) {
    const response = await api.post(`/hr/training-videos/${id}/mark_completed/`);
    return response.data;
  }

  static async updateVideoProgress(id, progressPercentage) {
    const response = await api.post(`/hr/training-videos/${id}/update_progress/`, {
      progress_percentage: progressPercentage,
    });
    return response.data;
  }

  // Training Progress
  static async getProgress() {
    const response = await api.get('/hr/training-progress/');
    return response.data;
  }

  static async getMyProgress() {
    const response = await api.get('/hr/training-progress/my_progress/');
    return response.data;
  }

  // Training Sessions
  static async getSessions() {
    const response = await api.get('/hr/training-sessions/');
    return response.data;
  }

  static async createSession(sessionData) {
    const response = await api.post('/hr/training-sessions/', sessionData);
    return response.data;
  }

  static async updateSession(id, sessionData) {
    const response = await api.put(`/hr/training-sessions/${id}/`, sessionData);
    return response.data;
  }

  static async deleteSession(id) {
    const response = await api.delete(`/hr/training-sessions/${id}/`);
    return response.data;
  }

  // Utility methods
  static getFileIcon(extension) {
    const iconMap = {
      pdf: '📄',
      doc: '📝',
      docx: '📝',
      ppt: '📊',
      pptx: '📊',
      jpg: '🖼️',
      jpeg: '🖼️',
      png: '🖼️',
      gif: '🖼️',
      mp4: '🎥',
      avi: '🎥',
      mov: '🎥',
      wmv: '🎥',
    };
    return iconMap[extension?.toLowerCase()] || '📄';
  }

  static formatFileSize(bytes) {
    if (!bytes) return '0 B';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  }

  static formatDuration(duration) {
    if (!duration) return 'Unknown';
    const parts = duration.split(':');
    if (parts.length === 3) {
      const hours = parseInt(parts[0]);
      const minutes = parseInt(parts[1]);
      const seconds = parseInt(parts[2]);
      
      if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      } else {
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
      }
    }
    return duration;
  }
}

export default TrainingService;

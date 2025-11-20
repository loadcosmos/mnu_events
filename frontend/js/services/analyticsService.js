import apiClient from './apiClient';

/**
 * Analytics Service
 * Handles platform statistics and analytics
 */
const analyticsService = {
  /**
   * Get dashboard statistics (ADMIN only)
   */
  getDashboard: async () => {
    const response = await apiClient.get('/api/analytics/dashboard');
    return response.data;
  },

  /**
   * Get organizer statistics
   * @param {string} userId - User ID (optional, defaults to current user)
   */
  getOrganizerStats: async (userId) => {
    const response = await apiClient.get(`/api/analytics/organizer/${userId}`);
    return response.data;
  },

  /**
   * Get student statistics
   * @param {string} userId - User ID (optional, defaults to current user)
   */
  getStudentStats: async (userId) => {
    const response = await apiClient.get(`/api/analytics/student/${userId}`);
    return response.data;
  },

  /**
   * Get revenue statistics (ADMIN only)
   */
  getRevenue: async () => {
    const response = await apiClient.get('/api/analytics/revenue');
    return response.data;
  },

  /**
   * Get detailed event statistics
   * @param {string} eventId - Event ID
   */
  getEventStats: async (eventId) => {
    const response = await apiClient.get(`/api/analytics/event/${eventId}`);
    return response.data;
  },

  /**
   * Get student CSI (Creativity, Service, Intelligence) statistics
   * @param {string} userId - User ID
   */
  getStudentCsiStats: async (userId) => {
    const response = await apiClient.get(`/api/analytics/student/${userId}/csi`);
    return response.data;
  },
};

export default analyticsService;

import { api } from './apiClient.js';

/**
 * Analytics Service
 * Handles platform statistics and analytics
 */
const analyticsService = {
  /**
   * Get dashboard statistics (ADMIN only)
   */
  getDashboard: async () => {
    const response = await api.get('/api/analytics/dashboard');
    return response;
  },

  /**
   * Get organizer statistics
   * @param {string} userId - User ID (optional, defaults to current user)
   */
  getOrganizerStats: async (userId) => {
    const response = await api.get(`/api/analytics/organizer/${userId}`);
    return response;
  },

  /**
   * Get student statistics
   * @param {string} userId - User ID (optional, defaults to current user)
   */
  getStudentStats: async (userId) => {
    const response = await api.get(`/api/analytics/student/${userId}`);
    return response;
  },

  /**
   * Get revenue statistics (ADMIN only)
   */
  getRevenue: async () => {
    const response = await api.get('/api/analytics/revenue');
    return response;
  },

  /**
   * Get detailed event statistics
   * @param {string} eventId - Event ID
   */
  getEventStats: async (eventId) => {
    const response = await api.get(`/api/analytics/event/${eventId}`);
    return response;
  },

  /**
   * Get student CSI (Creativity, Service, Intelligence) statistics
   * @param {string} userId - User ID
   */
  getStudentCsiStats: async (userId) => {
    const response = await api.get(`/api/analytics/student/${userId}/csi`);
    return response;
  },
};

export default analyticsService;

import apiClient from './apiClient';

/**
 * Services (Marketplace) Service
 * Handles marketplace services and tutoring
 */
const servicesService = {
  /**
   * Get all services with filters
   * @param {Object} filters - Filter parameters
   */
  getAll: async (filters = {}) => {
    const response = await apiClient.get('/services', { params: filters });
    return response.data;
  },

  /**
   * Get service by ID
   * @param {string} id - Service ID
   */
  getById: async (id) => {
    const response = await apiClient.get(`/services/${id}`);
    return response.data;
  },

  /**
   * Create a new service
   * @param {Object} data - Service data
   */
  create: async (data) => {
    const response = await apiClient.post('/services', data);
    return response.data;
  },

  /**
   * Update service
   * @param {string} id - Service ID
   * @param {Object} data - Updated service data
   */
  update: async (id, data) => {
    const response = await apiClient.put(`/services/${id}`, data);
    return response.data;
  },

  /**
   * Delete service
   * @param {string} id - Service ID
   */
  delete: async (id) => {
    const response = await apiClient.delete(`/services/${id}`);
    return response.data;
  },

  /**
   * Get current user's services
   */
  getMyServices: async () => {
    const response = await apiClient.get('/services/my-services');
    return response.data;
  },

  /**
   * Get services by provider
   * @param {string} providerId - Provider user ID
   */
  getByProvider: async (providerId) => {
    const response = await apiClient.get(`/services/provider/${providerId}`);
    return response.data;
  },
};

export default servicesService;

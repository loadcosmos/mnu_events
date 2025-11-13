import apiClient from './apiClient';

/**
 * Advertisements Service
 * Handles ad retrieval and tracking
 */
const adsService = {
  /**
   * Get active advertisements by position
   * @param {string} position - Ad position (TOP_BANNER, HERO_SLIDE, NATIVE_FEED, BOTTOM_BANNER, SIDEBAR)
   */
  getActive: async (position) => {
    const response = await apiClient.get('/advertisements/active', {
      params: { position }
    });
    return response.data;
  },

  /**
   * Track ad impression
   * @param {string} adId - Advertisement ID
   */
  trackImpression: async (adId) => {
    try {
      await apiClient.post(`/advertisements/${adId}/impression`);
    } catch (error) {
      console.warn('Failed to track ad impression:', error);
      // Don't throw error - tracking failures shouldn't break the app
    }
  },

  /**
   * Track ad click
   * @param {string} adId - Advertisement ID
   */
  trackClick: async (adId) => {
    try {
      await apiClient.post(`/advertisements/${adId}/click`);
    } catch (error) {
      console.warn('Failed to track ad click:', error);
    }
  },
};

export default adsService;

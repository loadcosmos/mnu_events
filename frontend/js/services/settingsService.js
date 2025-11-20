import { api } from './apiClient.js';

class SettingsService {
  /**
   * Get current event pricing
   */
  async getPricing() {
    const response = await api.get('/settings/pricing');
    return response.data;
  }

  /**
   * Update event pricing (admin only)
   */
  async updatePricing(pricingData) {
    const response = await api.put('/settings/pricing', pricingData);
    return response.data;
  }

  /**
   * Get pricing history (admin only)
   */
  async getPricingHistory() {
    const response = await api.get('/settings/pricing/history');
    return response.data;
  }
}

export default new SettingsService();

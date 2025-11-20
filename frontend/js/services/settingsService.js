import { api } from './apiClient.js';

class SettingsService {
  /**
   * Get current event pricing
   */
  async getPricing() {
    const response = await api.get('/api/settings/pricing');
    return response;
  }

  /**
   * Update event pricing (admin only)
   */
  async updatePricing(pricingData) {
    const response = await api.put('/api/settings/pricing', pricingData);
    return response;
  }

  /**
   * Get pricing history (admin only)
   */
  async getPricingHistory() {
    const response = await api.get('/api/settings/pricing/history');
    return response;
  }
}

export default new SettingsService();

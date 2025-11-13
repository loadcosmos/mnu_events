import apiClient from './apiClient';

const checkinService = {
  /**
   * Validate ticket QR code (Mode 1: Organizer scans student ticket)
   * @param {Object} qrData - QR code data from ticket
   * @returns {Promise} Validation response
   */
  validateTicket: async (qrData) => {
    const response = await apiClient.post('/checkin/validate-ticket', { qrData });
    return response.data;
  },

  /**
   * Validate student check-in (Mode 2: Student scans event QR code)
   * @param {string} qrData - QR code data from event
   * @returns {Promise} Validation response
   */
  validateStudent: async (qrData) => {
    const response = await apiClient.post('/checkin/validate-student', { qrData });
    return response.data;
  },

  /**
   * Get check-in statistics for an event
   * @param {string} eventId - Event ID
   * @returns {Promise} Check-in stats
   */
  getEventStats: async (eventId) => {
    const response = await apiClient.get(`/checkin/event/${eventId}/stats`);
    return response.data;
  },

  /**
   * Generate QR code for an event
   * @param {string} eventId - Event ID
   * @returns {Promise} QR code data
   */
  generateEventQR: async (eventId) => {
    const response = await apiClient.post('/checkin/generate-event-qr', { eventId });
    return response.data;
  },

  /**
   * Get list of all check-ins for an event
   * @param {string} eventId - Event ID
   * @returns {Promise} List of check-ins
   */
  getEventCheckIns: async (eventId) => {
    const response = await apiClient.get(`/checkin/event/${eventId}/list`);
    return response.data;
  },
};

export default checkinService;


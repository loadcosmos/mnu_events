import apiClient from './apiClient';

/**
 * Check-in Service
 * Handles QR code validation and event check-ins
 */
const checkinService = {
  /**
   * MODE 1: Organizer scans student ticket QR code (for paid events)
   * @param {Object} qrData - Decoded QR data from ticket
   * @returns {Promise} Validation response
   */
  validateTicket: async (qrData) => {
    const response = await apiClient.post('/checkin/validate-ticket', { qrData });
    return response.data;
  },

  /**
   * MODE 2: Student scans event QR code (for free events/lectures)
   * @param {Object} qrData - Decoded QR data from event
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
   * Generate QR code for event (MODE 2: students scan)
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
  getCheckInList: async (eventId) => {
    const response = await apiClient.get(`/checkin/event/${eventId}/list`);
    return response.data;
  },
};

export default checkinService;

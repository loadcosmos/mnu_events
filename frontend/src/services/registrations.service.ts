import { api } from './api';
import { Registration, PaginatedResponse } from '../types';

export const registrationsService = {
  register: async (eventId: string): Promise<Registration> => {
    const response = await api.post('/registrations', { eventId });
    return response.data;
  },

  getMyRegistrations: async (page?: number, limit?: number): Promise<PaginatedResponse<Registration>> => {
    const response = await api.get('/registrations/my', { params: { page, limit } });
    return response.data;
  },

  getEventParticipants: async (
    eventId: string,
    page?: number,
    limit?: number,
    search?: string
  ): Promise<PaginatedResponse<Registration>> => {
    const response = await api.get(`/registrations/event/${eventId}`, {
      params: { page, limit, search },
    });
    return response.data;
  },

  cancel: async (id: string) => {
    const response = await api.delete(`/registrations/${id}`);
    return response.data;
  },

  checkIn: async (id: string): Promise<Registration> => {
    const response = await api.patch(`/registrations/${id}/checkin`);
    return response.data;
  },

  undoCheckIn: async (id: string): Promise<Registration> => {
    const response = await api.patch(`/registrations/${id}/undo-checkin`);
    return response.data;
  },
};

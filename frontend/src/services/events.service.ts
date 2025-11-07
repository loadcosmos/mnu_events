import { api } from './api';
import { Event, Category, EventStatus, PaginatedResponse } from '../types';

export const eventsService = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    category?: Category;
    status?: EventStatus;
    search?: string;
  }): Promise<PaginatedResponse<Event>> => {
    const response = await api.get('/events', { params });
    return response.data;
  },

  getById: async (id: string): Promise<Event> => {
    const response = await api.get(`/events/${id}`);
    return response.data;
  },

  create: async (data: Partial<Event>): Promise<Event> => {
    const response = await api.post('/events', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Event>): Promise<Event> => {
    const response = await api.patch(`/events/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/events/${id}`);
    return response.data;
  },

  getMyEvents: async (page?: number, limit?: number): Promise<PaginatedResponse<Event>> => {
    const response = await api.get('/events/my', { params: { page, limit } });
    return response.data;
  },

  getStatistics: async (id: string) => {
    const response = await api.get(`/events/${id}/statistics`);
    return response.data;
  },
};

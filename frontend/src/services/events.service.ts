import api from './api';

export interface Event {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  startDate: string;
  endDate: string;
  capacity: number;
  imageUrl?: string;
  status: string;
  creator: {
    id: string;
    firstName: string;
    lastName: string;
  };
  _count?: {
    registrations: number;
  };
}

export interface CreateEventDto {
  title: string;
  description: string;
  category: string;
  location: string;
  startDate: string;
  endDate: string;
  capacity: number;
  imageUrl?: string;
}

class EventsService {
  async getAll(params?: {
    category?: string;
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const response = await api.get<Event[]>('/events', { params });
    return response.data;
  }

  async getById(id: string) {
    const response = await api.get<Event>(`/events/${id}`);
    return response.data;
  }

  async create(data: CreateEventDto) {
    const response = await api.post<Event>('/events', data);
    return response.data;
  }

  async update(id: string, data: Partial<CreateEventDto>) {
    const response = await api.patch<Event>(`/events/${id}`, data);
    return response.data;
  }

  async delete(id: string) {
    await api.delete(`/events/${id}`);
  }

  async getMyEvents() {
    const response = await api.get<Event[]>('/events/my-events');
    return response.data;
  }
}

export const eventsService = new EventsService();

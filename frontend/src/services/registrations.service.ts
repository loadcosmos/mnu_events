import api from './api';

export interface Registration {
  id: string;
  userId: string;
  eventId: string;
  status: string;
  checkedIn: boolean;
  checkedInAt?: string;
  createdAt: string;
  event?: {
    id: string;
    title: string;
    startDate: string;
    endDate: string;
    location: string;
    imageUrl?: string;
  };
}

class RegistrationsService {
  async register(eventId: string) {
    const response = await api.post<Registration>(`/registrations/${eventId}`);
    return response.data;
  }

  async cancel(eventId: string) {
    await api.delete(`/registrations/${eventId}`);
  }

  async getMyRegistrations() {
    const response = await api.get<Registration[]>('/registrations/my');
    return response.data;
  }

  async checkIn(eventId: string, userId: string) {
    const response = await api.post(`/registrations/${eventId}/check-in`, {
      userId,
    });
    return response.data;
  }
}

export const registrationsService = new RegistrationsService();

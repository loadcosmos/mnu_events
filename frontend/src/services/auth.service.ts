import { api } from './api';
import { User, AuthResponse } from '../types';

export const authService = {
  register: async (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  verifyEmail: async (email: string, code: string): Promise<AuthResponse> => {
    const response = await api.post('/auth/verify-email', { email, code });
    return response.data;
  },

  resendCode: async (email: string) => {
    const response = await api.post('/auth/resend-code', { email });
    return response.data;
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  getProfile: async (): Promise<User> => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },
};

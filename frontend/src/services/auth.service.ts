import api from './api';

export interface RegisterDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface VerifyEmailDto {
  email: string;
  code: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    emailVerified: boolean;
  };
}

class AuthService {
  async register(data: RegisterDto) {
    const response = await api.post<{ message: string }>('/auth/register', data);
    return response.data;
  }

  async verifyEmail(data: VerifyEmailDto) {
    const response = await api.post<AuthResponse>('/auth/verify-email', data);
    this.saveTokens(response.data);
    return response.data;
  }

  async login(data: LoginDto) {
    const response = await api.post<AuthResponse>('/auth/login', data);
    this.saveTokens(response.data);
    return response.data;
  }

  async logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  }

  async getProfile() {
    const response = await api.get('/auth/profile');
    return response.data;
  }

  private saveTokens(data: AuthResponse) {
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('refresh_token', data.refresh_token);
    localStorage.setItem('user', JSON.stringify(data.user));
  }

  getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  }
}

export const authService = new AuthService();

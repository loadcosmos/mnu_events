export enum Role {
  STUDENT = 'STUDENT',
  ORGANIZER = 'ORGANIZER',
  ADMIN = 'ADMIN',
}

export enum Category {
  ACADEMIC = 'ACADEMIC',
  SPORTS = 'SPORTS',
  CULTURAL = 'CULTURAL',
  TECH = 'TECH',
  SOCIAL = 'SOCIAL',
  CAREER = 'CAREER',
  OTHER = 'OTHER',
}

export enum EventStatus {
  UPCOMING = 'UPCOMING',
  ONGOING = 'ONGOING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum RegistrationStatus {
  REGISTERED = 'REGISTERED',
  WAITLIST = 'WAITLIST',
  CANCELLED = 'CANCELLED',
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  faculty?: string;
  role: Role;
  emailVerified: boolean;
  createdAt: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  category: Category;
  location: string;
  startDate: string;
  endDate: string;
  capacity: number;
  imageUrl?: string;
  status: EventStatus;
  creatorId: string;
  creator?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  _count?: {
    registrations: number;
  };
  availableSeats?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Registration {
  id: string;
  userId: string;
  eventId: string;
  status: RegistrationStatus;
  checkedIn: boolean;
  checkedInAt?: string;
  user?: User;
  event?: Event;
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

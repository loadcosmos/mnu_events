import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: PrismaService;
  let jwtService: JwtService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockJwtService = {
    signAsync: jest.fn(),
    verify: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config: Record<string, any> = {
        'jwt.secret': 'test-secret',
        'jwt.expiresIn': '15m',
        'refreshToken.secret': 'refresh-secret',
        'refreshToken.expiresIn': '7d',
        'email.smtp.host': 'smtp.test.com',
        'email.smtp.port': 587,
        'email.smtp.user': 'test@test.com',
        'email.smtp.password': 'password',
        'email.from': 'noreply@test.com',
      };
      return config[key];
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('logout', () => {
    it('should return success message', async () => {
      const result = await service.logout();

      expect(result).toEqual({ message: 'Logged out successfully' });
    });

    it('should not require any parameters', async () => {
      const result = await service.logout();

      expect(result).toHaveProperty('message');
      expect(mockPrismaService.user.findUnique).not.toHaveBeenCalled();
      expect(mockJwtService.signAsync).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should throw UnauthorizedException if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login({
          email: 'notfound@kazguu.kz',
          password: 'Password123!',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if email not verified', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: '1',
        email: 'test@kazguu.kz',
        password: 'hashed',
        emailVerified: false,
      });

      await expect(
        service.login({
          email: 'test@kazguu.kz',
          password: 'Password123!',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should successfully login with valid credentials', async () => {
      const hashedPassword = await bcrypt.hash('Password123!', 10);
      const mockUser = {
        id: '1',
        email: 'test@kazguu.kz',
        password: hashedPassword,
        firstName: 'Test',
        lastName: 'User',
        role: 'STUDENT',
        emailVerified: true,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockJwtService.signAsync.mockResolvedValue('mock-access-token');

      const result = await service.login({
        email: 'test@kazguu.kz',
        password: 'Password123!',
      });

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('user');
      expect(result.user.email).toBe('test@kazguu.kz');
      expect(mockJwtService.signAsync).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      const hashedPassword = await bcrypt.hash('CorrectPassword', 10);
      const mockUser = {
        id: '1',
        email: 'test@kazguu.kz',
        password: hashedPassword,
        emailVerified: true,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      await expect(
        service.login({
          email: 'test@kazguu.kz',
          password: 'WrongPassword',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('validateUser', () => {
    it('should return user for valid userId', async () => {
      const mockUser = {
        id: '1',
        email: 'test@kazguu.kz',
        firstName: 'Test',
        lastName: 'User',
        role: 'STUDENT',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service['validateUser']('1', 'test@kazguu.kz', 'STUDENT');

      expect(result).toEqual(mockUser);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should throw UnauthorizedException for invalid userId', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service['validateUser']('invalid-id', 'invalid@kazguu.kz', 'STUDENT')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});


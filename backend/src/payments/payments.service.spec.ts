import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsService } from './payments.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';

// Local enum until Prisma client is regenerated
enum TicketStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  REFUNDED = 'REFUNDED',
  USED = 'USED',
  EXPIRED = 'EXPIRED',
  FAILED = 'FAILED',
}

describe('PaymentsService', () => {
  let service: PaymentsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    event: {
      findUnique: jest.fn(),
    },
    ticket: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    checkIn: {
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
    prisma = module.get<PrismaService>(PrismaService);

    // Set environment variable for tests
    process.env.FRONTEND_URL = 'http://localhost:5173';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createPayment', () => {
    const createPaymentDto = {
      eventId: 'event-1',
      amount: 150,
      platformFee: 50,
      paymentMethod: 'mock' as const,
    };

    const mockEvent = {
      id: 'event-1',
      title: 'Paid Event',
      isPaid: true,
      price: 100,
      platformFee: 50,
      capacity: 100,
    };

    it('should successfully create a payment for a paid event', async () => {
      mockPrismaService.event.findUnique.mockResolvedValue(mockEvent);
      mockPrismaService.ticket.findFirst.mockResolvedValue(null);
      mockPrismaService.ticket.count.mockResolvedValue(50);
      mockPrismaService.ticket.create.mockResolvedValue({
        id: 'ticket-1',
        eventId: 'event-1',
        userId: 'user-1',
        status: TicketStatus.PENDING,
        transactionId: expect.any(String),
      });

      const result = await service.createPayment(createPaymentDto, 'user-1');

      expect(result).toHaveProperty('redirectUrl');
      expect(result).toHaveProperty('transactionId');
      expect(result.redirectUrl).toContain('mock-payment');
      expect(mockPrismaService.ticket.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException if event does not exist', async () => {
      mockPrismaService.event.findUnique.mockResolvedValue(null);

      await expect(
        service.createPayment(createPaymentDto, 'user-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if event is free', async () => {
      mockPrismaService.event.findUnique.mockResolvedValue({
        ...mockEvent,
        isPaid: false,
      });

      await expect(
        service.createPayment(createPaymentDto, 'user-1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw ConflictException if user already has a ticket', async () => {
      mockPrismaService.event.findUnique.mockResolvedValue(mockEvent);
      mockPrismaService.ticket.findFirst.mockResolvedValue({
        id: 'existing-ticket',
        userId: 'user-1',
        eventId: 'event-1',
        status: TicketStatus.PAID,
      });

      await expect(
        service.createPayment(createPaymentDto, 'user-1'),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw BadRequestException if event is sold out', async () => {
      mockPrismaService.event.findUnique.mockResolvedValue(mockEvent);
      mockPrismaService.ticket.findFirst.mockResolvedValue(null);
      mockPrismaService.ticket.count.mockResolvedValue(100); // At capacity

      await expect(
        service.createPayment(createPaymentDto, 'user-1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if payment amount is incorrect', async () => {
      mockPrismaService.event.findUnique.mockResolvedValue(mockEvent);
      mockPrismaService.ticket.findFirst.mockResolvedValue(null);
      mockPrismaService.ticket.count.mockResolvedValue(50);

      const incorrectDto = {
        ...createPaymentDto,
        amount: 100, // Wrong amount
      };

      await expect(
        service.createPayment(incorrectDto, 'user-1'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('confirmPayment', () => {
    it('should successfully confirm payment with valid signature', async () => {
      const mockTicket = {
        id: 'ticket-1',
        transactionId: 'txn_123',
        status: TicketStatus.PENDING,
        eventId: 'event-1',
        userId: 'user-1',
        price: 100,
        platformFee: 50,
        event: {
          title: 'Test Event',
          startDate: new Date('2025-12-01'),
        },
        user: {
          email: 'test@kazguu.kz',
          firstName: 'Test',
          lastName: 'User',
        },
      };

      mockPrismaService.ticket.findFirst.mockResolvedValue(mockTicket);
      mockPrismaService.ticket.update.mockResolvedValue({
        ...mockTicket,
        status: TicketStatus.PAID,
      });

      const webhookDto = {
        transactionId: 'txn_123',
        status: 'success' as const,
        signature: 'mock-signature',
      };

      const result = await service.confirmPayment(webhookDto);

      expect(result).toHaveProperty('ticketId');
      expect(result.message).toContain('success');
      expect(mockPrismaService.ticket.update).toHaveBeenCalledWith({
        where: { id: 'ticket-1' },
        data: {
          status: TicketStatus.PAID,
          paidAt: expect.any(Date),
        },
      });
    });

    it('should throw NotFoundException if ticket not found', async () => {
      mockPrismaService.ticket.findFirst.mockResolvedValue(null);

      const webhookDto = {
        transactionId: 'non-existent',
        status: 'success' as const,
        signature: 'mock-signature',
      };

      await expect(service.confirmPayment(webhookDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should handle payment failure', async () => {
      const mockTicket = {
        id: 'ticket-1',
        transactionId: 'txn_123',
        status: TicketStatus.PENDING,
      };

      mockPrismaService.ticket.findFirst.mockResolvedValue(mockTicket);
      mockPrismaService.ticket.update.mockResolvedValue({
        ...mockTicket,
        status: TicketStatus.FAILED,
      });

      const webhookDto = {
        transactionId: 'txn_123',
        status: 'failed' as const,
        signature: 'mock-signature',
      };

      const result = await service.confirmPayment(webhookDto);

      expect(mockPrismaService.ticket.update).toHaveBeenCalledWith({
        where: { id: 'ticket-1' },
        data: { status: TicketStatus.FAILED },
      });
    });
  });

  describe('getTicket', () => {
    it('should return ticket with QR code for authorized user', async () => {
      const mockTicket = {
        id: 'ticket-1',
        userId: 'user-1',
        status: TicketStatus.PAID,
        qrCode: 'qr-code-data',
        event: {
          id: 'event-1',
          title: 'Test Event',
          startDate: new Date(),
        },
      };

      mockPrismaService.ticket.findUnique.mockResolvedValue(mockTicket);

      const result = await service.getTicket('ticket-1', 'user-1');

      expect(result).toHaveProperty('qrCode');
      expect(result.event.title).toBe('Test Event');
    });

    it('should throw NotFoundException if ticket does not exist', async () => {
      mockPrismaService.ticket.findUnique.mockResolvedValue(null);

      await expect(service.getTicket('non-existent', 'user-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if user does not own the ticket', async () => {
      const mockTicket = {
        id: 'ticket-1',
        userId: 'user-1',
        status: TicketStatus.PAID,
      };

      mockPrismaService.ticket.findUnique.mockResolvedValue(mockTicket);

      await expect(service.getTicket('ticket-1', 'user-2')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('getMyTickets', () => {
    it('should return all tickets for the user', async () => {
      const mockTickets = [
        {
          id: 'ticket-1',
          userId: 'user-1',
          status: TicketStatus.PAID,
          event: { title: 'Event 1' },
        },
        {
          id: 'ticket-2',
          userId: 'user-1',
          status: TicketStatus.PAID,
          event: { title: 'Event 2' },
        },
      ];

      mockPrismaService.ticket.findMany.mockResolvedValue(mockTickets);

      const result = await service.getMyTickets('user-1');

      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('event');
    });

    it('should return empty array if user has no tickets', async () => {
      mockPrismaService.ticket.findMany.mockResolvedValue([]);

      const result = await service.getMyTickets('user-1');

      expect(result).toEqual([]);
    });
  });

  describe('refundTicket', () => {
    it('should successfully refund a paid ticket', async () => {
      const mockTicket = {
        id: 'ticket-1',
        userId: 'user-1',
        status: TicketStatus.PAID,
        paidAt: new Date(),
      };

      mockPrismaService.ticket.findUnique.mockResolvedValue(mockTicket);
      mockPrismaService.ticket.update.mockResolvedValue({
        ...mockTicket,
        status: TicketStatus.REFUNDED,
      });

      const refundDto = {
        reason: 'Changed plans',
      };

      const result = await service.refundTicket('ticket-1', refundDto, 'user-1');

      expect(result.message).toContain('success');
      expect(mockPrismaService.ticket.update).toHaveBeenCalledWith({
        where: { id: 'ticket-1' },
        data: {
          status: TicketStatus.REFUNDED,
          refundedAt: expect.any(Date),
        },
      });
    });

    it('should throw NotFoundException if ticket does not exist', async () => {
      mockPrismaService.ticket.findUnique.mockResolvedValue(null);

      await expect(
        service.refundTicket('non-existent', { reason: 'Test' }, 'user-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user does not own the ticket', async () => {
      const mockTicket = {
        id: 'ticket-1',
        userId: 'user-1',
        status: TicketStatus.PAID,
      };

      mockPrismaService.ticket.findUnique.mockResolvedValue(mockTicket);

      await expect(
        service.refundTicket('ticket-1', { reason: 'Test' }, 'user-2'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException if ticket is not paid', async () => {
      const mockTicket = {
        id: 'ticket-1',
        userId: 'user-1',
        status: TicketStatus.PENDING,
      };

      mockPrismaService.ticket.findUnique.mockResolvedValue(mockTicket);

      await expect(
        service.refundTicket('ticket-1', { reason: 'Test' }, 'user-1'),
      ).rejects.toThrow(BadRequestException);
    });
  });
});

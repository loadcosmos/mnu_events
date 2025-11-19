import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentWebhookDto } from './dto/payment-webhook.dto';
import { RefundTicketDto } from './dto/refund-ticket.dto';
import {
  PaymentResponse,
  TicketResponse,
  TransactionStatus,
} from './interfaces/payment-response.interface';
import * as QRCode from 'qrcode';
import * as crypto from 'crypto';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a mock payment and return redirect URL
   */
  async createPayment(
    dto: CreatePaymentDto,
    userId: string,
  ): Promise<PaymentResponse> {
    // 1. Verify event exists and is paid
    const event = await this.prisma.event.findUnique({
      where: { id: dto.eventId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (!event.isPaid) {
      throw new BadRequestException('This event is free');
    }

    // 2. Check if user already has a ticket for this event
    const existingTicket = await this.prisma.ticket.findFirst({
      where: {
        eventId: dto.eventId,
        userId: userId,
        status: { in: ['PENDING', 'PAID'] },
      },
    });

    if (existingTicket) {
      throw new ConflictException('You already have a ticket for this event');
    }

    // 3. Check event capacity
    const ticketCount = await this.prisma.ticket.count({
      where: {
        eventId: dto.eventId,
        status: { in: ['PENDING', 'PAID'] },
      },
    });

    if (ticketCount >= event.capacity) {
      throw new BadRequestException('Event is sold out');
    }

    // 4. Verify payment amount matches event price
    if (!event.price || !event.platformFee) {
      throw new BadRequestException('Event price not configured');
    }

    const expectedTotal = Number(event.price) + Number(event.platformFee);
    if (dto.amount !== expectedTotal) {
      throw new BadRequestException(
        `Invalid payment amount. Expected ${expectedTotal}`,
      );
    }

    // 5. Generate unique transaction ID
    const transactionId = `txn_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;

    // 6. Create pending ticket
    await this.prisma.ticket.create({
      data: {
        eventId: dto.eventId,
        userId: userId,
        price: event.price,
        platformFee: event.platformFee,
        status: 'PENDING',
        paymentMethod: 'mock',
        transactionId: transactionId,
      },
    });

    // 7. Return mock payment redirect URL
    const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/mock-payment/${transactionId}`;

    return {
      success: true,
      transactionId,
      redirectUrl,
      message: 'Redirecting to mock payment gateway',
    };
  }

  /**
   * Process webhook from mock payment gateway
   */
  async processWebhook(dto: PaymentWebhookDto): Promise<TicketResponse> {
    // 1. Find pending ticket by transaction ID
    const ticket = await this.prisma.ticket.findUnique({
      where: { transactionId: dto.transactionId },
      include: {
        event: true,
        user: true,
      },
    });

    if (!ticket) {
      throw new NotFoundException('Transaction not found');
    }

    if (ticket.status !== 'PENDING') {
      throw new BadRequestException('Transaction already processed');
    }

    // 2. Process based on webhook status
    if (dto.status === 'success') {
      // Generate QR code for the ticket
      const qrCodeData = await this.generateQRCode(ticket.id, ticket.eventId, ticket.userId);

      // Update ticket to PAID status
      const updatedTicket = await this.prisma.ticket.update({
        where: { id: ticket.id },
        data: {
          status: 'PAID',
          qrCode: qrCodeData,
        },
        include: {
          event: {
            select: {
              id: true,
              title: true,
              startDate: true,
              endDate: true,
              location: true,
            },
          },
        },
      });

      // TODO: Send email with ticket (if SMTP configured)
      // await this.sendTicketEmail(ticket.user.email, updatedTicket);

      return this.formatTicketResponse(updatedTicket);
    } else {
      // Payment failed or declined - delete pending ticket
      await this.prisma.ticket.delete({
        where: { id: ticket.id },
      });

      throw new BadRequestException(
        dto.status === 'declined'
          ? 'Payment was declined'
          : 'Payment failed',
      );
    }
  }

  /**
   * Get ticket by ID (with authorization check)
   */
  async getTicketById(
    ticketId: string,
    userId: string,
    userRole: string,
  ): Promise<TicketResponse> {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            startDate: true,
            endDate: true,
            location: true,
          },
        },
      },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    // Authorization: Only ticket owner or admin can view
    if (ticket.userId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException('You do not have access to this ticket');
    }

    return this.formatTicketResponse(ticket);
  }

  /**
   * Get all tickets for current user
   */
  async getMyTickets(userId: string): Promise<TicketResponse[]> {
    const tickets = await this.prisma.ticket.findMany({
      where: {
        userId: userId,
        status: { in: ['PAID', 'USED'] }, // Exclude PENDING, REFUNDED, EXPIRED
      },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            startDate: true,
            endDate: true,
            location: true,
          },
        },
      },
      orderBy: { purchasedAt: 'desc' },
    });

    return tickets.map((ticket) => this.formatTicketResponse(ticket));
  }

  /**
   * Refund a ticket
   */
  async refundTicket(
    ticketId: string,
    userId: string,
    userRole: string,
    dto?: RefundTicketDto,
  ): Promise<{ message: string }> {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
      include: { event: true },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    // Authorization: Only ticket owner or admin can refund
    if (ticket.userId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException('You do not have access to this ticket');
    }

    // Validate ticket status
    if (ticket.status === 'REFUNDED') {
      throw new BadRequestException('Ticket has already been refunded');
    }

    if (ticket.status === 'USED') {
      throw new BadRequestException('Ticket has already been used');
    }

    if (ticket.status !== 'PAID') {
      throw new BadRequestException('Only paid tickets can be refunded');
    }

    // Check if event has already started (cannot refund after event start)
    if (new Date() >= ticket.event.startDate) {
      throw new BadRequestException(
        'Cannot refund ticket after event has started',
      );
    }

    // Update ticket status to REFUNDED
    await this.prisma.ticket.update({
      where: { id: ticketId },
      data: {
        status: 'REFUNDED',
      },
    });

    // TODO: Process actual refund via payment gateway in production
    // TODO: Send refund confirmation email

    return {
      message: `Ticket refunded successfully${dto?.reason ? ': ' + dto.reason : ''}`,
    };
  }

  /**
   * Get transaction status
   */
  async getTransactionStatus(
    transactionId: string,
  ): Promise<TransactionStatus> {
    const ticket = await this.prisma.ticket.findUnique({
      where: { transactionId },
    });

    if (!ticket || !ticket.transactionId) {
      throw new NotFoundException('Transaction not found');
    }

    return {
      transactionId: ticket.transactionId,
      status: this.mapTicketStatusToTransactionStatus(ticket.status),
      amount: Number(ticket.price) + Number(ticket.platformFee),
      createdAt: ticket.purchasedAt,
      updatedAt: ticket.purchasedAt, // Tickets don't have updatedAt, using purchasedAt
    };
  }

  /**
   * Generate QR code for ticket
   * Format: JSON with signature for security
   */
  private async generateQRCode(
    ticketId: string,
    eventId: string,
    userId: string,
  ): Promise<string> {
    const qrPayload = {
      ticketId,
      eventId,
      userId,
      timestamp: Date.now(),
    };

    // Sign the payload for security validation
    // SECURITY: PAYMENT_SECRET must be set in environment variables
    if (!process.env.PAYMENT_SECRET) {
      throw new BadRequestException('Payment secret not configured');
    }
    
    const signature = crypto
      .createHmac('sha256', process.env.PAYMENT_SECRET)
      .update(JSON.stringify(qrPayload))
      .digest('hex');

    const qrData = {
      ...qrPayload,
      signature,
    };

    // Generate QR code as base64 data URL
    try {
      const qrCodeDataUrl = await QRCode.toDataURL(JSON.stringify(qrData), {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });

      return qrCodeDataUrl;
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw new BadRequestException('Failed to generate QR code');
    }
  }

  /**
   * Format ticket for response
   */
  private formatTicketResponse(ticket: any): TicketResponse {
    return {
      id: ticket.id,
      eventId: ticket.eventId,
      userId: ticket.userId,
      price: Number(ticket.price),
      platformFee: Number(ticket.platformFee),
      status: ticket.status,
      paymentMethod: ticket.paymentMethod,
      transactionId: ticket.transactionId,
      qrCode: ticket.qrCode,
      createdAt: ticket.purchasedAt,
      updatedAt: ticket.purchasedAt,
      event: ticket.event,
    };
  }

  /**
   * Map TicketStatus to TransactionStatus
   */
  private mapTicketStatusToTransactionStatus(
    status: string,
  ): 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED' {
    switch (status) {
      case 'PENDING':
        return 'PENDING';
      case 'PAID':
      case 'USED':
        return 'COMPLETED';
      case 'REFUNDED':
        return 'REFUNDED';
      case 'EXPIRED':
        return 'FAILED';
      default:
        return 'FAILED';
    }
  }
}

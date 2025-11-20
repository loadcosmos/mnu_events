import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UploadReceiptDto } from './dto/upload-receipt.dto';
import { VerifyPaymentDto } from './dto/verify-payment.dto';

@Injectable()
export class PaymentVerificationService {
  constructor(private prisma: PrismaService) {}

  /**
   * Upload receipt for payment verification
   * Student uploads screenshot of Kaspi transfer
   */
  async uploadReceipt(uploadReceiptDto: UploadReceiptDto) {
    const { ticketId, receiptImageUrl } = uploadReceiptDto;

    // Check if ticket exists
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
      include: { event: true, user: true },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    // Check if ticket is pending payment
    if (ticket.status !== 'PENDING') {
      throw new BadRequestException('Ticket is not pending payment');
    }

    // Check if verification already exists
    const existingVerification = await this.prisma.paymentVerification.findUnique({
      where: { ticketId },
    });

    if (existingVerification) {
      // Update existing verification
      return this.prisma.paymentVerification.update({
        where: { ticketId },
        data: {
          receiptImageUrl,
          status: 'PENDING',
          organizerNotes: null,
          verifiedAt: null,
        },
      });
    }

    // Create new verification
    return this.prisma.paymentVerification.create({
      data: {
        ticketId,
        receiptImageUrl,
        status: 'PENDING',
      },
    });
  }

  /**
   * Get pending verifications for organizer's events
   */
  async getPendingVerifications(organizerId: string, eventId?: string) {
    const where: any = {
      status: 'PENDING',
      ticket: {
        event: {
          creatorId: organizerId,
        },
      },
    };

    if (eventId) {
      where.ticket.eventId = eventId;
    }

    return this.prisma.paymentVerification.findMany({
      where,
      include: {
        ticket: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
            event: {
              select: {
                id: true,
                title: true,
                price: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  /**
   * Get all verifications for a specific event (organizer only)
   */
  async getEventVerifications(eventId: string, organizerId: string) {
    // Verify organizer owns the event
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (event.creatorId !== organizerId) {
      throw new ForbiddenException('You are not the organizer of this event');
    }

    return this.prisma.paymentVerification.findMany({
      where: {
        ticket: {
          eventId,
        },
      },
      include: {
        ticket: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Approve or reject payment verification
   * Organizer verifies the receipt and approves/rejects payment
   */
  async verifyPayment(
    verificationId: string,
    organizerId: string,
    verifyDto: VerifyPaymentDto,
  ) {
    const verification = await this.prisma.paymentVerification.findUnique({
      where: { id: verificationId },
      include: {
        ticket: {
          include: {
            event: true,
          },
        },
      },
    });

    if (!verification) {
      throw new NotFoundException('Payment verification not found');
    }

    // Verify organizer owns the event
    if (verification.ticket.event.creatorId !== organizerId) {
      throw new ForbiddenException(
        'You are not the organizer of this event',
      );
    }

    // Validate rejection has notes
    if (verifyDto.status === 'REJECTED' && !verifyDto.organizerNotes) {
      throw new BadRequestException(
        'Organizer notes are required when rejecting payment',
      );
    }

    // Update verification status
    const updated = await this.prisma.paymentVerification.update({
      where: { id: verificationId },
      data: {
        status: verifyDto.status,
        organizerNotes: verifyDto.organizerNotes,
        verifiedAt: new Date(),
      },
    });

    // If approved, update ticket status to PAID
    if (verifyDto.status === 'APPROVED') {
      await this.prisma.ticket.update({
        where: { id: verification.ticketId },
        data: {
          status: 'PAID',
        },
      });
    }

    // If rejected, you might want to allow student to re-upload
    // Ticket stays as PENDING

    return updated;
  }

  /**
   * Get verification by ID
   */
  async findOne(id: string) {
    const verification = await this.prisma.paymentVerification.findUnique({
      where: { id },
      include: {
        ticket: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
            event: {
              select: {
                id: true,
                title: true,
                price: true,
                creator: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!verification) {
      throw new NotFoundException('Payment verification not found');
    }

    return verification;
  }

  /**
   * Get student's payment verifications
   */
  async getMyVerifications(userId: string) {
    return this.prisma.paymentVerification.findMany({
      where: {
        ticket: {
          userId,
        },
      },
      include: {
        ticket: {
          include: {
            event: {
              select: {
                id: true,
                title: true,
                price: true,
                startDate: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}

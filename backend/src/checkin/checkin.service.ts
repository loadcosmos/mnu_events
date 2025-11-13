import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  ValidateTicketDto,
  ValidateTicketResponseDto,
} from './dto/validate-ticket.dto';
import {
  ValidateStudentDto,
  ValidateStudentResponseDto,
} from './dto/validate-student.dto';
import {
  CheckInStatsDto,
  GenerateEventQRDto,
  GenerateEventQRResponseDto,
} from './dto/checkin-stats.dto';
import * as QRCode from 'qrcode';
import * as crypto from 'crypto';

@Injectable()
export class CheckinService {
  private readonly rateLimitMap = new Map<string, number>();

  constructor(private prisma: PrismaService) {}

  /**
   * MODE 1: Organizer scans student's ticket QR code
   * Validates ticket and creates check-in record
   */
  async validateTicket(
    dto: ValidateTicketDto,
    organizerId: string,
  ): Promise<ValidateTicketResponseDto> {
    // 1. Verify organizer has access to this event
    const event = await this.prisma.event.findUnique({
      where: { id: dto.eventId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (event.creatorId !== organizerId) {
      throw new ForbiddenException('You do not have access to this event');
    }

    // 2. Parse and validate QR data
    let qrPayload: any;
    try {
      qrPayload = JSON.parse(dto.qrData);
    } catch {
      throw new BadRequestException('Invalid QR code format');
    }

    // 3. Verify QR signature
    const { signature, ...dataToVerify } = qrPayload;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.PAYMENT_SECRET || 'default-secret-key')
      .update(JSON.stringify(dataToVerify))
      .digest('hex');

    if (signature !== expectedSignature) {
      throw new BadRequestException('Invalid QR code signature');
    }

    // 4. Find ticket in database
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: qrPayload.ticketId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            faculty: true,
          },
        },
      },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    // 5. Validate ticket status
    if (ticket.status === 'USED') {
      throw new ConflictException('Ticket has already been used');
    }

    if (ticket.status !== 'PAID') {
      throw new BadRequestException(
        `Ticket is ${ticket.status.toLowerCase()}. Only paid tickets can be checked in.`,
      );
    }

    // 6. Verify ticket is for correct event
    if (ticket.eventId !== dto.eventId) {
      throw new BadRequestException(
        'Ticket is for a different event',
      );
    }

    // 8. Update ticket status to USED and create check-in record
    const [updatedTicket, checkIn] = await this.prisma.$transaction([
      this.prisma.ticket.update({
        where: { id: ticket.id },
        data: {
          status: 'USED',
          checkedInAt: new Date(),
        },
      }),
      this.prisma.checkIn.create({
        data: {
          eventId: dto.eventId,
          userId: ticket.userId,
          scanMode: 'ORGANIZER_SCANS',
        },
      }),
    ]);

    return {
      success: true,
      message: 'Check-in successful',
      user: {
        id: ticket.user.id,
        firstName: ticket.user.firstName,
        lastName: ticket.user.lastName,
        email: ticket.user.email,
        faculty: ticket.user.faculty ?? undefined,
      },
      ticket: {
        id: ticket.id,
        price: Number(ticket.price),
        purchasedAt: ticket.purchasedAt,
      },
      checkIn: {
        id: checkIn.id,
        checkedInAt: checkIn.checkedInAt,
      },
    };
  }

  /**
   * MODE 2: Student scans event's QR code
   * Validates event QR and creates check-in record
   */
  async validateStudent(
    dto: ValidateStudentDto,
    userId: string,
  ): Promise<ValidateStudentResponseDto> {
    // 1. Parse QR data
    let qrPayload: any;
    try {
      qrPayload = JSON.parse(dto.qrData);
    } catch {
      throw new BadRequestException('Invalid QR code format');
    }

    // 2. Verify QR signature
    const { signature, ...dataToVerify } = qrPayload;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.PAYMENT_SECRET || 'default-secret-key')
      .update(JSON.stringify(dataToVerify))
      .digest('hex');

    if (signature !== expectedSignature) {
      throw new BadRequestException('Invalid QR code signature');
    }

    // 3. Find event
    const event = await this.prisma.event.findUnique({
      where: { id: qrPayload.eventId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // 4. Verify QR code hasn't expired
    if (event.qrCodeExpiry && new Date() > event.qrCodeExpiry) {
      throw new BadRequestException('QR code has expired');
    }

    // 5. Check for duplicate check-in
    const existingCheckIn = await this.prisma.checkIn.findUnique({
      where: {
        eventId_userId: {
          eventId: event.id,
          userId: userId,
        },
      },
    });

    if (existingCheckIn) {
      throw new ConflictException('You have already checked in to this event');
    }

    // 6. Rate limiting: max 1 scan per 5 seconds per user
    const rateLimitKey = `${userId}:${event.id}`;
    const lastScanTime = this.rateLimitMap.get(rateLimitKey);
    const now = Date.now();

    if (lastScanTime && now - lastScanTime < 5000) {
      throw new BadRequestException('Please wait before scanning again');
    }

    this.rateLimitMap.set(rateLimitKey, now);

    // 7. Optional: Geolocation check (if location provided)
    if (dto.location) {
      // TODO: Implement proximity check (e.g., within 500m of event location)
      // This would require event coordinates in the database
      console.log('Location check:', dto.location);
    }

    // 8. Create check-in record
    const checkIn = await this.prisma.checkIn.create({
      data: {
        eventId: event.id,
        userId: userId,
        scanMode: 'STUDENTS_SCAN',
      },
    });

    // 9. Clean up old rate limit entries (older than 10 seconds)
    setTimeout(() => {
      const entries = Array.from(this.rateLimitMap.entries());
      entries.forEach(([key, timestamp]) => {
        if (Date.now() - timestamp > 10000) {
          this.rateLimitMap.delete(key);
        }
      });
    }, 10000);

    return {
      success: true,
      message: 'Check-in successful',
      checkIn: {
        id: checkIn.id,
        eventId: checkIn.eventId,
        checkedInAt: checkIn.checkedInAt,
      },
    };
  }

  /**
   * Get check-in statistics for an event
   */
  async getEventStats(eventId: string): Promise<CheckInStatsDto> {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    const totalCheckIns = await this.prisma.checkIn.count({
      where: { eventId },
    });

    let totalTickets: number | undefined;
    let totalRegistrations: number | undefined;
    let checkInRate: number;

    if (event.isPaid) {
      // For paid events, count tickets
      totalTickets = await this.prisma.ticket.count({
        where: {
          eventId,
          status: { in: ['PAID', 'USED'] },
        },
      });
      checkInRate = totalTickets > 0 ? (totalCheckIns / totalTickets) * 100 : 0;
    } else {
      // For free events, count registrations
      totalRegistrations = await this.prisma.registration.count({
        where: {
          eventId,
          status: 'REGISTERED',
        },
      });
      checkInRate =
        totalRegistrations > 0 ? (totalCheckIns / totalRegistrations) * 100 : 0;
    }

    return {
      totalCheckIns,
      totalTickets,
      totalRegistrations,
      checkInRate: Math.round(checkInRate * 10) / 10,
      capacity: event.capacity,
      checkInMode: event.checkInMode,
    };
  }

  /**
   * Get list of all check-ins for an event
   */
  async getCheckInList(eventId: string, organizerId: string) {
    // Verify organizer has access to this event
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (event.creatorId !== organizerId) {
      throw new ForbiddenException('You do not have access to this event');
    }

    const checkIns = await this.prisma.checkIn.findMany({
      where: { eventId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            faculty: true,
          },
        },
      },
      orderBy: { checkedInAt: 'desc' },
    });

    return checkIns;
  }

  /**
   * Generate QR code for event (MODE 2: students scan)
   */
  async generateEventQR(
    dto: GenerateEventQRDto,
    organizerId: string,
  ): Promise<GenerateEventQRResponseDto> {
    // Verify organizer has access to this event
    const event = await this.prisma.event.findUnique({
      where: { id: dto.eventId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (event.creatorId !== organizerId) {
      throw new ForbiddenException('You do not have access to this event');
    }

    // Generate QR payload
    const expiryHours = dto.expiryHours || 24;
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + expiryHours);

    const qrPayload = {
      eventId: event.id,
      timestamp: Date.now(),
    };

    // Sign the payload
    const signature = crypto
      .createHmac('sha256', process.env.PAYMENT_SECRET || 'default-secret-key')
      .update(JSON.stringify(qrPayload))
      .digest('hex');

    const qrData = {
      ...qrPayload,
      signature,
    };

    // Generate QR code
    const qrCodeDataUrl = await QRCode.toDataURL(JSON.stringify(qrData), {
      width: 400,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });

    // Update event with new QR code
    await this.prisma.event.update({
      where: { id: event.id },
      data: {
        eventQRCode: qrCodeDataUrl,
        qrCodeExpiry: expiresAt,
      },
    });

    return {
      qrCode: qrCodeDataUrl,
      expiresAt,
    };
  }
}

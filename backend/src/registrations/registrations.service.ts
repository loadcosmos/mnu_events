import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { Role, RegistrationStatus, EventStatus } from '@prisma/client';

@Injectable()
export class RegistrationsService {
  constructor(private prisma: PrismaService) {}

  async create(createRegistrationDto: CreateRegistrationDto, userId: string) {
    const { eventId } = createRegistrationDto;

    // Check if event exists
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: {
        _count: {
          select: {
            registrations: {
              where: { status: RegistrationStatus.REGISTERED },
            },
          },
        },
      },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // Check if event is not cancelled
    if (event.status === EventStatus.CANCELLED) {
      throw new BadRequestException('Cannot register for cancelled event');
    }

    // Check if event has already ended
    if (event.endDate < new Date()) {
      throw new BadRequestException('Cannot register for past event');
    }

    // Check if user already registered
    const existingRegistration = await this.prisma.registration.findUnique({
      where: {
        userId_eventId: {
          userId,
          eventId,
        },
      },
    });

    if (existingRegistration) {
      throw new ConflictException('You are already registered for this event');
    }

    // Check capacity
    const currentRegistrations = event._count.registrations;
    const isFull = currentRegistrations >= event.capacity;

    const registration = await this.prisma.registration.create({
      data: {
        userId,
        eventId,
        status: isFull ? RegistrationStatus.WAITLIST : RegistrationStatus.REGISTERED,
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
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return registration;
  }

  async findMyRegistrations(userId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [registrations, total] = await Promise.all([
      this.prisma.registration.findMany({
        where: { userId },
        skip,
        take: limit,
        include: {
          event: {
            include: {
              creator: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.registration.count({ where: { userId } }),
    ]);

    return {
      data: registrations,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findEventParticipants(
    eventId: string,
    userId: string,
    userRole: Role,
    page: number = 1,
    limit: number = 10,
    search?: string,
  ) {
    // Check if event exists
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // Only event creator, organizers, or admins can view participants
    if (event.creatorId !== userId && userRole !== Role.ADMIN && userRole !== Role.ORGANIZER) {
      throw new ForbiddenException('You do not have permission to view event participants');
    }

    const skip = (page - 1) * limit;

    const where: any = { eventId };

    if (search) {
      where.user = {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      };
    }

    const [registrations, total] = await Promise.all([
      this.prisma.registration.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatar: true,
              faculty: true,
            },
          },
        },
        orderBy: { createdAt: 'asc' },
      }),
      this.prisma.registration.count({ where }),
    ]);

    return {
      data: registrations,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async remove(id: string, userId: string) {
    const registration = await this.prisma.registration.findUnique({
      where: { id },
      include: {
        event: true,
      },
    });

    if (!registration) {
      throw new NotFoundException('Registration not found');
    }

    // Only the user who registered can cancel
    if (registration.userId !== userId) {
      throw new ForbiddenException('You can only cancel your own registrations');
    }

    // Cannot cancel if event has already started
    if (registration.event.startDate < new Date()) {
      throw new BadRequestException('Cannot cancel registration for event that has already started');
    }

    await this.prisma.registration.delete({
      where: { id },
    });

    // If there are users on waitlist, move the first one to registered
    const waitlistUser = await this.prisma.registration.findFirst({
      where: {
        eventId: registration.eventId,
        status: RegistrationStatus.WAITLIST,
      },
      orderBy: { createdAt: 'asc' },
    });

    if (waitlistUser) {
      await this.prisma.registration.update({
        where: { id: waitlistUser.id },
        data: { status: RegistrationStatus.REGISTERED },
      });
    }

    return { message: 'Registration cancelled successfully' };
  }

  async checkIn(id: string, userId: string, userRole: Role) {
    const registration = await this.prisma.registration.findUnique({
      where: { id },
      include: {
        event: true,
      },
    });

    if (!registration) {
      throw new NotFoundException('Registration not found');
    }

    // Only event creator, organizers, or admins can check-in
    if (
      registration.event.creatorId !== userId &&
      userRole !== Role.ADMIN &&
      userRole !== Role.ORGANIZER
    ) {
      throw new ForbiddenException('You do not have permission to check-in participants');
    }

    // Check if registration is active
    if (registration.status !== RegistrationStatus.REGISTERED) {
      throw new BadRequestException('Can only check-in registered participants');
    }

    // Check if already checked in
    if (registration.checkedIn) {
      throw new BadRequestException('User already checked in');
    }

    const updatedRegistration = await this.prisma.registration.update({
      where: { id },
      data: {
        checkedIn: true,
        checkedInAt: new Date(),
      },
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
    });

    return updatedRegistration;
  }

  async undoCheckIn(id: string, userId: string, userRole: Role) {
    const registration = await this.prisma.registration.findUnique({
      where: { id },
      include: {
        event: true,
      },
    });

    if (!registration) {
      throw new NotFoundException('Registration not found');
    }

    // Only event creator, organizers, or admins can undo check-in
    if (
      registration.event.creatorId !== userId &&
      userRole !== Role.ADMIN &&
      userRole !== Role.ORGANIZER
    ) {
      throw new ForbiddenException('You do not have permission to undo check-in');
    }

    if (!registration.checkedIn) {
      throw new BadRequestException('User is not checked in');
    }

    const updatedRegistration = await this.prisma.registration.update({
      where: { id },
      data: {
        checkedIn: false,
        checkedInAt: null,
      },
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
    });

    return updatedRegistration;
  }
}

import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { FilterEventsDto } from './dto/filter-events.dto';
import { Role } from '@prisma/client';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  async create(createEventDto: CreateEventDto, userId: string) {
    // Validate dates
    const startDate = new Date(createEventDto.startDate);
    const endDate = new Date(createEventDto.endDate);

    if (startDate >= endDate) {
      throw new BadRequestException('End date must be after start date');
    }

    if (startDate < new Date()) {
      throw new BadRequestException('Start date cannot be in the past');
    }

    const event = await this.prisma.event.create({
      data: {
        ...createEventDto,
        startDate,
        endDate,
        creatorId: userId,
      },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        _count: {
          select: {
            registrations: true,
          },
        },
      },
    });

    return event;
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    filterDto?: FilterEventsDto,
  ) {
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filterDto?.category) {
      where.category = filterDto.category;
    }

    if (filterDto?.status) {
      where.status = filterDto.status;
    }

    if (filterDto?.startDateFrom || filterDto?.startDateTo) {
      where.startDate = {};
      if (filterDto.startDateFrom) {
        where.startDate.gte = new Date(filterDto.startDateFrom);
      }
      if (filterDto.startDateTo) {
        where.startDate.lte = new Date(filterDto.startDateTo);
      }
    }

    if (filterDto?.search) {
      where.OR = [
        { title: { contains: filterDto.search, mode: 'insensitive' } },
        { description: { contains: filterDto.search, mode: 'insensitive' } },
        { location: { contains: filterDto.search, mode: 'insensitive' } },
      ];
    }

    if (filterDto?.creatorId) {
      where.creatorId = filterDto.creatorId;
    }

    const [events, total] = await Promise.all([
      this.prisma.event.findMany({
        where,
        skip,
        take: limit,
        include: {
          creator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          _count: {
            select: {
              registrations: true,
            },
          },
        },
        orderBy: { startDate: 'asc' },
      }),
      this.prisma.event.count({ where }),
    ]);

    return {
      data: events,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            registrations: true,
          },
        },
      },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // Calculate available seats
    const availableSeats = event.capacity - event._count.registrations;

    return {
      ...event,
      availableSeats,
    };
  }

  async update(id: string, updateEventDto: UpdateEventDto, userId: string, userRole: Role) {
    const event = await this.prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // Only creator or admin can update
    if (event.creatorId !== userId && userRole !== Role.ADMIN) {
      throw new ForbiddenException('You do not have permission to update this event');
    }

    // Validate dates if provided
    if (updateEventDto.startDate || updateEventDto.endDate) {
      const startDate = updateEventDto.startDate ? new Date(updateEventDto.startDate) : event.startDate;
      const endDate = updateEventDto.endDate ? new Date(updateEventDto.endDate) : event.endDate;

      if (startDate >= endDate) {
        throw new BadRequestException('End date must be after start date');
      }
    }

    const updatedEvent = await this.prisma.event.update({
      where: { id },
      data: {
        ...updateEventDto,
        startDate: updateEventDto.startDate ? new Date(updateEventDto.startDate) : undefined,
        endDate: updateEventDto.endDate ? new Date(updateEventDto.endDate) : undefined,
      },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        _count: {
          select: {
            registrations: true,
          },
        },
      },
    });

    return updatedEvent;
  }

  async remove(id: string, userId: string, userRole: Role) {
    const event = await this.prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // Only creator or admin can delete
    if (event.creatorId !== userId && userRole !== Role.ADMIN) {
      throw new ForbiddenException('You do not have permission to delete this event');
    }

    await this.prisma.event.delete({
      where: { id },
    });

    return { message: 'Event deleted successfully' };
  }

  async getMyEvents(userId: string, page: number = 1, limit: number = 10) {
    return this.findAll(page, limit, { creatorId: userId });
  }

  async getEventStatistics(eventId: string, userId: string, userRole: Role) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: {
        _count: {
          select: {
            registrations: true,
          },
        },
      },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // Only creator or admin can view statistics
    if (event.creatorId !== userId && userRole !== Role.ADMIN && userRole !== Role.ORGANIZER) {
      throw new ForbiddenException('You do not have permission to view event statistics');
    }

    const registrations = await this.prisma.registration.groupBy({
      by: ['status'],
      where: { eventId },
      _count: true,
    });

    const checkedInCount = await this.prisma.registration.count({
      where: { eventId, checkedIn: true },
    });

    return {
      eventId: event.id,
      title: event.title,
      capacity: event.capacity,
      totalRegistrations: event._count.registrations,
      availableSeats: event.capacity - event._count.registrations,
      checkedInCount,
      registrationsByStatus: registrations.map(r => ({
        status: r.status,
        count: r._count,
      })),
    };
  }
}

import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ModerationService } from '../moderation/moderation.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { FilterEventsDto } from './dto/filter-events.dto';
import { Role, Prisma, ModerationType } from '@prisma/client';
import {
  validatePagination,
  createPaginatedResponse,
  requireCreatorOrAdmin,
  validateEventListing,
} from '../common/utils';

@Injectable()
export class EventsService {
  constructor(
    private prisma: PrismaService,
    private moderationService: ModerationService,
  ) { }

  async create(createEventDto: CreateEventDto, userId: string, userRole: Role) {
    // Validate dates
    const startDate = new Date(createEventDto.startDate);
    const endDate = new Date(createEventDto.endDate);

    if (startDate >= endDate) {
      throw new BadRequestException('End date must be after start date');
    }

    if (startDate < new Date()) {
      throw new BadRequestException('Start date cannot be in the past');
    }

    // Moderation logic:
    // - ADMIN/MODERATOR: create with UPCOMING status (auto-approved)
    // - ORGANIZER: create with PENDING_MODERATION status + add to queue + validate filters
    const needsModeration = userRole !== Role.ADMIN && userRole !== Role.MODERATOR;

    // Apply automatic moderation filters for organizers
    if (needsModeration) {
      validateEventListing(
        createEventDto.title,
        createEventDto.description,
        createEventDto.isPaid || false,
        createEventDto.price ? Number(createEventDto.price) : undefined,
      );
    }

    const event = await this.prisma.event.create({
      data: {
        ...createEventDto,
        startDate,
        endDate,
        creatorId: userId,
        status: needsModeration ? 'PENDING_MODERATION' : 'UPCOMING',
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

    if (needsModeration) {
      // Organizers must go through moderation
      await this.moderationService.addToQueue(ModerationType.EVENT, event.id);
      console.log(`[EventsService] Event added to moderation queue: ${event.id}`);
    } else {
      // Admin/Moderator events are auto-approved
      console.log(`[EventsService] Event created by ${userRole}, auto-approved`);
    }

    return event;
  }

  async findAll(
    page?: number,
    limit?: number,
    filterDto?: FilterEventsDto,
  ) {
    const { skip, take, page: validatedPage } = validatePagination({ page, limit });

    const where: Prisma.EventWhereInput = {};

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
      // Note: mode: 'insensitive' only works with String fields, not Text fields
      // description is @db.Text, so we can't use mode: 'insensitive' for it
      where.OR = [
        { title: { contains: filterDto.search, mode: 'insensitive' } },
        { location: { contains: filterDto.search, mode: 'insensitive' } },
        // description is Text field, so we search it case-sensitively
        // If case-insensitive search is needed for description, we'd need to use raw SQL
        { description: { contains: filterDto.search } },
        // Search by organizer's first name
        {
          creator: {
            firstName: { contains: filterDto.search, mode: 'insensitive' }
          }
        },
        // Search by organizer's last name
        {
          creator: {
            lastName: { contains: filterDto.search, mode: 'insensitive' }
          }
        },
        // Search by organizer's email
        {
          creator: {
            email: { contains: filterDto.search, mode: 'insensitive' }
          }
        },
      ];
    }

    if (filterDto?.creatorId) {
      where.creatorId = filterDto.creatorId;
    }

    // CSI Tags filtering: event must have ALL selected tags
    if (filterDto?.csiTags) {
      const csiTagsArray = filterDto.csiTags.split(',').map(tag => tag.trim()).filter(tag => tag) as unknown as import('@prisma/client').CsiCategory[];
      if (csiTagsArray.length > 0) {
        where.csiTags = {
          hasEvery: csiTagsArray,
        };
      }
    }

    try {
      const [events, total] = await Promise.all([
        this.prisma.event.findMany({
          where,
          skip,
          take,
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

      return createPaginatedResponse(events, total, validatedPage, take);
    } catch (error) {
      console.error('[EventsService] findAll error:', error);
      throw error;
    }
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
    requireCreatorOrAdmin(userId, event.creatorId, userRole, 'event');

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
    requireCreatorOrAdmin(userId, event.creatorId, userRole, 'event');

    await this.prisma.event.delete({
      where: { id },
    });

    return { message: 'Event deleted successfully' };
  }

  async getMyEvents(userId: string, page?: number, limit?: number) {
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

import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { FilterServicesDto } from './dto/filter-services.dto';
import {
  validatePagination,
  createPaginatedResponse,
} from '../common/utils/pagination.util';
import { requireCreatorOrAdmin } from '../common/utils/authorization.util';
import { Prisma, Role } from '@prisma/client';

@Injectable()
export class ServicesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get all services with filters
   */
  async findAll(filters: FilterServicesDto) {
    const { skip, take, page } = validatePagination({
      page: filters.page,
      limit: filters.limit,
    });

    // Build where clause
    const where: Prisma.ServiceWhereInput = {
      isActive: true, // Only show active services
    };

    if (filters.type) {
      where.type = filters.type;
    }

    if (filters.category) {
      where.category = filters.category;
    }

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      where.price = {};
      if (filters.minPrice !== undefined) {
        where.price.gte = filters.minPrice;
      }
      if (filters.maxPrice !== undefined) {
        where.price.lte = filters.maxPrice;
      }
    }

    if (filters.minRating !== undefined) {
      where.rating = {
        gte: filters.minRating,
      };
    }

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    // Execute queries in parallel
    const [services, total] = await Promise.all([
      this.prisma.service.findMany({
        where,
        skip,
        take,
        include: {
          provider: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
              faculty: true,
            },
          },
        },
        orderBy: [{ rating: 'desc' }, { reviewCount: 'desc' }],
      }),
      this.prisma.service.count({ where }),
    ]);

    return createPaginatedResponse(
      services.map((s) => this.formatService(s)),
      total,
      page,
      take,
    );
  }

  /**
   * Get service by ID
   */
  async findOne(id: string) {
    const service = await this.prisma.service.findUnique({
      where: { id },
      include: {
        provider: {
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
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    return this.formatService(service);
  }

  /**
   * Create a new service
   */
  async create(dto: CreateServiceDto, userId: string) {
    const service = await this.prisma.service.create({
      data: {
        ...dto,
        providerId: userId,
      },
      include: {
        provider: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            faculty: true,
          },
        },
      },
    });

    return this.formatService(service);
  }

  /**
   * Update service
   */
  async update(
    id: string,
    dto: UpdateServiceDto,
    userId: string,
    userRole: Role,
  ) {
    const service = await this.prisma.service.findUnique({
      where: { id },
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    // Authorization: Only service provider or admin can update
    requireCreatorOrAdmin(userId, service.providerId, userRole, 'service');

    const updatedService = await this.prisma.service.update({
      where: { id },
      data: dto,
      include: {
        provider: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            faculty: true,
          },
        },
      },
    });

    return this.formatService(updatedService);
  }

  /**
   * Delete service
   */
  async remove(id: string, userId: string, userRole: Role) {
    const service = await this.prisma.service.findUnique({
      where: { id },
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    // Authorization: Only service provider or admin can delete
    requireCreatorOrAdmin(userId, service.providerId, userRole, 'service');

    await this.prisma.service.delete({
      where: { id },
    });

    return { message: 'Service deleted successfully' };
  }

  /**
   * Get user's own services
   */
  async getMyServices(userId: string) {
    const services = await this.prisma.service.findMany({
      where: { providerId: userId },
      include: {
        provider: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            faculty: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return services.map((s) => this.formatService(s));
  }

  /**
   * Get services by provider ID
   */
  async getByProvider(providerId: string) {
    const services = await this.prisma.service.findMany({
      where: {
        providerId,
        isActive: true, // Only show active services
      },
      include: {
        provider: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            faculty: true,
          },
        },
      },
      orderBy: [{ rating: 'desc' }, { createdAt: 'desc' }],
    });

    return services.map((s) => this.formatService(s));
  }

  /**
   * Format service for response (convert Decimal to number)
   */
  private formatService(service: any) {
    return {
      ...service,
      price: Number(service.price),
      rating: service.rating ? Number(service.rating) : null,
    };
  }
}

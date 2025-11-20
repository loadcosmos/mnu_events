import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ModerationStatus, ModerationType } from '@prisma/client';

@Injectable()
export class ModerationService {
    constructor(private prisma: PrismaService) { }

    async addToQueue(itemType: ModerationType, itemId: string) {
        return this.prisma.moderationQueue.create({
            data: {
                itemType,
                itemId,
                status: ModerationStatus.PENDING,
            },
        });
    }

    async getQueue(status: ModerationStatus = ModerationStatus.PENDING, type?: ModerationType) {
        const queueItems = await this.prisma.moderationQueue.findMany({
            where: {
                status,
                ...(type && { itemType: type }),
            },
            include: {
                moderator: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'asc',
            },
        });

        // Fetch details for each item
        const itemsWithDetails = await Promise.all(
            queueItems.map(async (item) => {
                let details = null;
                try {
                    switch (item.itemType) {
                        case ModerationType.SERVICE:
                            details = await this.prisma.service.findUnique({ where: { id: item.itemId } });
                            break;
                        case ModerationType.EVENT:
                            details = await this.prisma.event.findUnique({ where: { id: item.itemId } });
                            break;
                        case ModerationType.ADVERTISEMENT:
                            details = await this.prisma.advertisement.findUnique({ where: { id: item.itemId } });
                            break;
                    }
                } catch (error) {
                    console.error(`Failed to fetch details for item ${item.itemId}`, error);
                }
                return { ...item, details };
            }),
        );

        return itemsWithDetails;
    }

    async approve(id: string, moderatorId: string) {
        const item = await this.prisma.moderationQueue.findUnique({
            where: { id },
        });

        if (!item) {
            throw new NotFoundException('Moderation item not found');
        }

        // Update the actual item status based on type
        await this.updateItemStatus(item.itemType, item.itemId, true);

        return this.prisma.moderationQueue.update({
            where: { id },
            data: {
                status: ModerationStatus.APPROVED,
                moderatorId,
            },
        });
    }

    async reject(id: string, moderatorId: string, reason: string) {
        const item = await this.prisma.moderationQueue.findUnique({
            where: { id },
        });

        if (!item) {
            throw new NotFoundException('Moderation item not found');
        }

        // Update the actual item status based on type
        await this.updateItemStatus(item.itemType, item.itemId, false);

        return this.prisma.moderationQueue.update({
            where: { id },
            data: {
                status: ModerationStatus.REJECTED,
                moderatorId,
                rejectionReason: reason,
            },
        });
    }

    async getStats() {
        const pending = await this.prisma.moderationQueue.count({
            where: { status: ModerationStatus.PENDING },
        });
        const approved = await this.prisma.moderationQueue.count({
            where: { status: ModerationStatus.APPROVED },
        });
        const rejected = await this.prisma.moderationQueue.count({
            where: { status: ModerationStatus.REJECTED },
        });

        return { pending, approved, rejected };
    }

    private async updateItemStatus(type: ModerationType, itemId: string, isApproved: boolean) {
        // This logic depends on the actual models having an 'isActive' or similar field
        // For now, we assume Services and Advertisements have 'isActive'
        // Events might have 'status'

        switch (type) {
            case ModerationType.SERVICE:
                await this.prisma.service.update({
                    where: { id: itemId },
                    data: { isActive: isApproved },
                });
                break;
            case ModerationType.ADVERTISEMENT:
                await this.prisma.advertisement.update({
                    where: { id: itemId },
                    data: { isActive: isApproved },
                });
                break;
            case ModerationType.EVENT:
                // Events might need a specific status update logic
                // For now, we assume approved events are published/active
                // If rejected, maybe set to CANCELLED or keep as DRAFT/PENDING
                // This requires checking Event model structure more closely if needed
                break;
        }
    }
}

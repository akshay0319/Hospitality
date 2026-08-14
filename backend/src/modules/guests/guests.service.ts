import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateGuestDto, UpdateGuestDto, GuestPreferenceDto } from './dto/guest.dto';
import { PaginationDto, paginate } from '@/common/dto/pagination.dto';
import { toJsonString } from '@/prisma/json-fields';

@Injectable()
export class GuestsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(propertyId: string, query: PaginationDto) {
    const where = {
      propertyId,
      ...(query.search && {
        OR: [
          { firstName: { contains: query.search } },
          { lastName: { contains: query.search } },
          { email: { contains: query.search } },
          { phone: { contains: query.search } },
        ],
      }),
    };
    const [data, total] = await Promise.all([
      this.prisma.guest.findMany({
        where, include: { preferences: true },
        skip: query.skip, take: query.limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.guest.count({ where }),
    ]);
    return paginate(data, total, query.page ?? 1, query.limit ?? 20);
  }

  async segments(propertyId: string) {
    const [total, vip, platinum, gold, returning, highValue] = await Promise.all([
      this.prisma.guest.count({ where: { propertyId } }),
      this.prisma.guest.count({ where: { propertyId, isVip: true } }),
      this.prisma.guest.count({ where: { propertyId, loyaltyTier: 'PLATINUM' } }),
      this.prisma.guest.count({ where: { propertyId, loyaltyTier: 'GOLD' } }),
      this.prisma.guest.count({ where: { propertyId, totalStays: { gt: 1 } } }),
      this.prisma.guest.count({ where: { propertyId, lifetimeValue: { gte: 500000 } } }),
    ]);
    return {
      total,
      segments: [
        { key: 'vip', label: 'VIP Guests', count: vip, description: 'Flagged VIP — priority service' },
        { key: 'platinum', label: 'Platinum Tier', count: platinum, description: 'Top loyalty tier' },
        { key: 'gold', label: 'Gold Tier', count: gold, description: 'High loyalty tier' },
        { key: 'returning', label: 'Returning Guests', count: returning, description: 'More than one stay' },
        { key: 'highvalue', label: 'High Value', count: highValue, description: 'Lifetime value ≥ ₹5L' },
      ],
    };
  }

  async findOne(id: string, propertyId: string) {
    const guest = await this.prisma.guest.findFirst({
      where: { id, propertyId },
      include: {
        preferences: true,
        reservations: {
          orderBy: { checkIn: 'desc' },
          take: 10,
          include: { roomType: true, ratePlan: true },
        },
        loyaltyTxns: { orderBy: { createdAt: 'desc' }, take: 20 },
      },
    });
    if (!guest) throw new NotFoundException('Guest not found');
    return guest;
  }

  async create(propertyId: string, dto: CreateGuestDto) {
    const { tags, ...rest } = dto;
    return this.prisma.guest.create({
      data: { ...rest, propertyId, tags: toJsonString(tags) },
      include: { preferences: true },
    });
  }

  async update(id: string, propertyId: string, dto: UpdateGuestDto) {
    await this.findOne(id, propertyId);
    const { tags, ...rest } = dto;
    return this.prisma.guest.update({
      where: { id },
      data: { ...rest, ...(tags !== undefined && { tags: toJsonString(tags) }) },
      include: { preferences: true },
    });
  }

  async upsertPreferences(guestId: string, propertyId: string, dto: GuestPreferenceDto) {
    await this.findOne(guestId, propertyId);
    // `noDisturbance` exists on the DTO but not the model — exclude it.
    const { dietaryRestrictions, noDisturbance: _drop, ...rest } = dto;
    const data = {
      ...rest,
      ...(dietaryRestrictions !== undefined && { dietaryRestrictions: toJsonString(dietaryRestrictions) }),
    };
    return this.prisma.guestPreference.upsert({
      where: { guestId },
      create: { guestId, ...data },
      update: { ...data },
    });
  }

  async addLoyaltyPoints(guestId: string, points: number, description: string, referenceId?: string) {
    const [txn] = await this.prisma.$transaction([
      this.prisma.loyaltyTransaction.create({
        data: { guestId, points, type: points > 0 ? 'EARN' : 'REDEEM', description, referenceId },
      }),
      this.prisma.guest.update({
        where: { id: guestId },
        data: { loyaltyPoints: { increment: points } },
      }),
    ]);
    return txn;
  }
}

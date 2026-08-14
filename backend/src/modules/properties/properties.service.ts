import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreatePropertyDto, UpdatePropertyDto, CreateRoomTypeDto, UpdateRoomTypeDto } from './dto/property.dto';

@Injectable()
export class PropertiesService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Properties ──────────────────────────────────────────────────────────────

  async findAll(tenantId: string) {
    return this.prisma.property.findMany({
      where: { tenantId, isActive: true },
      include: { _count: { select: { rooms: true, reservations: true } } },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string, tenantId: string) {
    const property = await this.prisma.property.findFirst({
      where: { id, tenantId },
      include: {
        roomTypes: { orderBy: { sortOrder: 'asc' } },
        _count: { select: { rooms: true, guests: true, reservations: true } },
      },
    });
    if (!property) throw new NotFoundException('Property not found');
    return property;
  }

  async create(tenantId: string, dto: CreatePropertyDto) {
    return this.prisma.property.create({ data: { ...dto, tenantId } });
  }

  async update(id: string, tenantId: string, dto: UpdatePropertyDto) {
    await this.findOne(id, tenantId);
    return this.prisma.property.update({ where: { id }, data: dto });
  }

  // ── Room Types ───────────────────────────────────────────────────────────────

  async findRoomTypes(propertyId: string) {
    return this.prisma.roomType.findMany({
      where: { propertyId, isActive: true },
      include: { _count: { select: { rooms: true } } },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async createRoomType(propertyId: string, dto: CreateRoomTypeDto) {
    return this.prisma.roomType.create({ data: { ...dto, propertyId, baseRate: dto.baseRate } });
  }

  async updateRoomType(id: string, propertyId: string, dto: UpdateRoomTypeDto) {
    return this.prisma.roomType.update({ where: { id }, data: { ...dto } });
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { IsString, IsOptional, IsEnum, IsNumber, IsDateString, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MaintenanceStatus, MaintenancePriority } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';

// ── DTOs ─────────────────────────────────────────────────────────────────────
export class CreateMaintenanceDto {
  @ApiProperty() @IsString() @MinLength(2) title: string;
  @ApiProperty() @IsString() @MinLength(2) description: string;
  @ApiPropertyOptional({ enum: MaintenancePriority })
  @IsOptional() @IsEnum(MaintenancePriority) priority?: MaintenancePriority;
  @ApiPropertyOptional() @IsOptional() @IsString() roomId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() category?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() assignedToId?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() estimatedCost?: number;
  @ApiPropertyOptional() @IsOptional() @IsDateString() dueDate?: string;
}

export class UpdateMaintenanceStatusDto {
  @ApiProperty({ enum: MaintenanceStatus }) @IsEnum(MaintenanceStatus) status: MaintenanceStatus;
  @ApiPropertyOptional() @IsOptional() @IsNumber() actualCost?: number;
}

@Injectable()
export class MaintenanceService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(propertyId: string, status?: string, priority?: string) {
    return this.prisma.maintenanceTicket.findMany({
      where: {
        propertyId,
        ...(status && { status: status as MaintenanceStatus }),
        ...(priority && { priority: priority as MaintenancePriority }),
      },
      include: {
        room: { select: { number: true, floor: true } },
        assignedTo: { select: { firstName: true, lastName: true } },
      },
      orderBy: [{ createdAt: 'desc' }],
    });
  }

  async findOne(id: string, propertyId: string) {
    const ticket = await this.prisma.maintenanceTicket.findFirst({
      where: { id, propertyId },
      include: {
        room: { select: { number: true, floor: true } },
        assignedTo: { select: { firstName: true, lastName: true } },
      },
    });
    if (!ticket) throw new NotFoundException('Maintenance ticket not found');
    return ticket;
  }

  async create(propertyId: string, reportedById: string | null, dto: CreateMaintenanceDto) {
    return this.prisma.maintenanceTicket.create({
      data: {
        propertyId,
        reportedById,
        title: dto.title,
        description: dto.description,
        priority: dto.priority ?? 'NORMAL',
        roomId: dto.roomId ?? null,
        category: dto.category ?? null,
        assignedToId: dto.assignedToId ?? null,
        estimatedCost: dto.estimatedCost ?? null,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
      },
      include: {
        room: { select: { number: true, floor: true } },
        assignedTo: { select: { firstName: true, lastName: true } },
      },
    });
  }

  async updateStatus(id: string, propertyId: string, dto: UpdateMaintenanceStatusDto) {
    await this.findOne(id, propertyId);
    const isResolved = dto.status === 'RESOLVED' || dto.status === 'CLOSED';
    return this.prisma.maintenanceTicket.update({
      where: { id },
      data: {
        status: dto.status,
        ...(dto.actualCost !== undefined && { actualCost: dto.actualCost }),
        ...(isResolved ? { resolvedAt: new Date() } : { resolvedAt: null }),
      },
      include: {
        room: { select: { number: true, floor: true } },
        assignedTo: { select: { firstName: true, lastName: true } },
      },
    });
  }

  async assign(id: string, propertyId: string, assignedToId: string) {
    await this.findOne(id, propertyId);
    return this.prisma.maintenanceTicket.update({
      where: { id },
      data: { assignedToId, status: 'IN_PROGRESS' },
      include: {
        room: { select: { number: true, floor: true } },
        assignedTo: { select: { firstName: true, lastName: true } },
      },
    });
  }

  async getDashboard(propertyId: string) {
    const [open, inProgress, onHold, resolved, critical, byCategory] = await Promise.all([
      this.prisma.maintenanceTicket.count({ where: { propertyId, status: 'OPEN' } }),
      this.prisma.maintenanceTicket.count({ where: { propertyId, status: 'IN_PROGRESS' } }),
      this.prisma.maintenanceTicket.count({ where: { propertyId, status: 'ON_HOLD' } }),
      this.prisma.maintenanceTicket.count({ where: { propertyId, status: { in: ['RESOLVED', 'CLOSED'] } } }),
      this.prisma.maintenanceTicket.count({ where: { propertyId, priority: 'CRITICAL', status: { notIn: ['RESOLVED', 'CLOSED'] } } }),
      this.prisma.maintenanceTicket.groupBy({
        by: ['category'],
        where: { propertyId, status: { notIn: ['RESOLVED', 'CLOSED'] } },
        _count: { id: true },
      }),
    ]);
    return {
      open,
      inProgress,
      onHold,
      resolved,
      critical,
      byCategory: byCategory.map((c: { category: string | null; _count: { id: number } }) => ({
        category: c.category ?? 'Uncategorized',
        count: c._count.id,
      })),
    };
  }
}

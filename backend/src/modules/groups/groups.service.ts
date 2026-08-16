import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { IsString, IsOptional, IsArray, IsInt, IsDateString, IsEmail, Min, MinLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import dayjs from 'dayjs';
import { PrismaService } from '@/prisma/prisma.service';
import { ReservationsService } from '@/modules/reservations/reservations.service';

export class GroupBlockDto {
  @ApiProperty() @IsString() roomTypeId: string;
  @ApiProperty() @IsInt() @Min(1) quantity: number;
}

export class CreateGroupDto {
  @ApiProperty() @IsString() @MinLength(1) name: string;
  @ApiProperty() @IsString() @MinLength(1) contactName: string;
  @ApiPropertyOptional() @IsOptional() @IsEmail() contactEmail?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() contactPhone?: string;
  @ApiProperty() @IsDateString() checkIn: string;
  @ApiProperty() @IsDateString() checkOut: string;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
  @ApiProperty({ type: [GroupBlockDto] })
  @IsArray() @ValidateNested({ each: true }) @Type(() => GroupBlockDto)
  blocks: GroupBlockDto[];
}

@Injectable()
export class GroupsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly reservations: ReservationsService,
  ) {}

  private dateOnly(d: string): Date {
    return new Date(dayjs(d).format('YYYY-MM-DD'));
  }

  // Create a group + reserve a block: one contact guest holds every room in the block.
  // ponytail: block rate = BAR rate (no per-group discount yet — create() has no rate override).
  async create(propertyId: string, dto: CreateGroupDto) {
    if (!dto.blocks?.length) throw new BadRequestException('At least one room block is required');

    const ratePlan =
      (await this.prisma.ratePlan.findFirst({ where: { propertyId, type: 'BAR', isActive: true } })) ??
      (await this.prisma.ratePlan.findFirst({ where: { propertyId, isActive: true } }));
    if (!ratePlan) throw new BadRequestException('No rate plan configured');

    // Find-or-create the single group contact guest.
    const [firstName, ...rest] = dto.contactName.trim().split(' ');
    const lastName = rest.join(' ') || '(Group)';
    const email = dto.contactEmail?.toLowerCase();
    const guest =
      (email && (await this.prisma.guest.findFirst({ where: { propertyId, email } }))) ||
      (await this.prisma.guest.create({ data: { propertyId, firstName, lastName, email: email ?? null, phone: dto.contactPhone ?? null } }));

    const group = await this.prisma.group.create({
      data: {
        propertyId, name: dto.name, contactName: dto.contactName,
        contactEmail: email ?? null, contactPhone: dto.contactPhone ?? null,
        checkIn: this.dateOnly(dto.checkIn), checkOut: this.dateOnly(dto.checkOut),
        notes: dto.notes ?? null, status: 'CONFIRMED',
      },
    });

    let roomsCreated = 0, roomsFailed = 0;
    for (const block of dto.blocks) {
      for (let i = 0; i < block.quantity; i++) {
        try {
          const res = await this.reservations.create(propertyId, {
            guestId: guest.id, roomTypeId: block.roomTypeId, ratePlanId: ratePlan.id,
            checkIn: dto.checkIn, checkOut: dto.checkOut, adults: 2, children: 0, channel: 'DIRECT',
          });
          await this.prisma.reservation.update({ where: { id: res.id }, data: { groupId: group.id } });
          roomsCreated++;
        } catch {
          roomsFailed++; // availability exhausted for that room type — report as partial
        }
      }
    }

    return { group, roomsCreated, roomsFailed };
  }

  async list(propertyId: string) {
    const groups = await this.prisma.group.findMany({
      where: { propertyId }, orderBy: { createdAt: 'desc' },
      include: { reservations: { select: { totalAmount: true, status: true } } },
    });
    return groups.map((g) => {
      const active = g.reservations.filter((r) => r.status !== 'CANCELLED');
      return {
        id: g.id, name: g.name, contactName: g.contactName, contactEmail: g.contactEmail,
        checkIn: g.checkIn, checkOut: g.checkOut, status: g.status,
        rooms: g.reservations.length, activeRooms: active.length,
        totalValue: active.reduce((s, r) => s + Number(r.totalAmount), 0),
      };
    });
  }

  async findOne(id: string, propertyId: string) {
    const group = await this.prisma.group.findFirst({
      where: { id, propertyId },
      include: {
        reservations: {
          orderBy: { createdAt: 'asc' },
          include: {
            guest: { select: { firstName: true, lastName: true } },
            room: { select: { number: true } },
            roomType: { select: { name: true } },
          },
        },
      },
    });
    if (!group) throw new NotFoundException('Group not found');
    return {
      ...group,
      reservations: group.reservations.map((r) => ({
        id: r.id, confirmationNumber: r.confirmationNumber, roomType: r.roomType?.name,
        room: r.room?.number ?? null, status: r.status, total: Number(r.totalAmount),
      })),
    };
  }

  async cancel(id: string, propertyId: string) {
    const group = await this.prisma.group.findFirst({ where: { id, propertyId }, include: { reservations: true } });
    if (!group) throw new NotFoundException('Group not found');
    let cancelled = 0;
    for (const r of group.reservations) {
      if (r.status === 'CONFIRMED') {
        try { await this.reservations.cancel(r.id, propertyId, `Group cancellation — ${group.name}`); cancelled++; } catch { /* skip */ }
      }
    }
    await this.prisma.group.update({ where: { id }, data: { status: 'CANCELLED' } });
    return { cancelled };
  }
}

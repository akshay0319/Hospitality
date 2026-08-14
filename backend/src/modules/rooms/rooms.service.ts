import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { IsEnum, IsOptional, IsString, IsBoolean, IsDateString } from 'class-validator';
import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { PrismaService } from '@/prisma/prisma.service';
import { RoomStatus } from '@prisma/client';
import { toJsonString } from '@/prisma/json-fields';

export class CreateRoomDto {
  @IsString() number: string;
  @IsString() roomTypeId: string;
  number2?: never;
  floor: number;
}

export class UpdateRoomStatusDto {
  @ApiPropertyOptional({ enum: RoomStatus }) @IsEnum(RoomStatus) status: RoomStatus;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isBlocked?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsString() blockReason?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() blockedUntil?: string;
}

@Injectable()
export class RoomsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(propertyId: string, status?: string, roomTypeId?: string) {
    return this.prisma.room.findMany({
      where: {
        propertyId,
        ...(status && { status: status as RoomStatus }),
        ...(roomTypeId && { roomTypeId }),
      },
      include: { roomType: { select: { id: true, name: true, code: true } } },
      orderBy: [{ floor: 'asc' }, { number: 'asc' }],
    });
  }

  async block(id: string, propertyId: string, reason: string, until?: string) {
    await this.findOne(id, propertyId);
    return this.prisma.room.update({
      where: { id },
      data: {
        isBlocked: true,
        status: RoomStatus.BLOCKED,
        blockReason: reason,
        blockedUntil: until ? new Date(until) : null,
      },
      include: { roomType: { select: { id: true, name: true, code: true } } },
    });
  }

  async unblock(id: string, propertyId: string) {
    await this.findOne(id, propertyId);
    return this.prisma.room.update({
      where: { id },
      data: { isBlocked: false, status: RoomStatus.CLEAN, blockReason: null, blockedUntil: null },
      include: { roomType: { select: { id: true, name: true, code: true } } },
    });
  }

  async findOne(id: string, propertyId: string) {
    const room = await this.prisma.room.findFirst({
      where: { id, propertyId },
      include: { roomType: true },
    });
    if (!room) throw new NotFoundException('Room not found');
    return room;
  }

  async create(propertyId: string, dto: { number: string; roomTypeId: string; floor: number; features?: string[] }) {
    const exists = await this.prisma.room.findFirst({ where: { propertyId, number: dto.number } });
    if (exists) throw new BadRequestException(`Room ${dto.number} already exists`);
    const { features, ...rest } = dto;
    return this.prisma.room.create({ data: { ...rest, propertyId, features: toJsonString(features) } });
  }

  async updateStatus(id: string, propertyId: string, dto: UpdateRoomStatusDto) {
    await this.findOne(id, propertyId);
    return this.prisma.room.update({
      where: { id },
      data: {
        status: dto.status,
        ...(dto.isBlocked !== undefined && { isBlocked: dto.isBlocked }),
        ...(dto.blockReason !== undefined && { blockReason: dto.blockReason }),
        ...(dto.blockedUntil && { blockedUntil: new Date(dto.blockedUntil) }),
      },
    });
  }

  async getInventoryCalendar(propertyId: string, startDate: string, endDate: string) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const [rooms, reservations] = await Promise.all([
      this.prisma.room.findMany({
        where: { propertyId },
        include: { roomType: { select: { name: true, code: true } } },
        orderBy: [{ floor: 'asc' }, { number: 'asc' }],
      }),
      this.prisma.reservation.findMany({
        where: {
          propertyId,
          roomId: { not: null },
          status: { in: ['CONFIRMED', 'CHECKED_IN'] },
          checkIn: { lt: end },
          checkOut: { gt: start },
        },
        include: {
          guest: { select: { firstName: true, lastName: true } },
        },
      }),
    ]);

    return { rooms, reservations };
  }
}

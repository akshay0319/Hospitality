import {
  Injectable, NotFoundException, BadRequestException, ConflictException
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import {
  CreateReservationDto, UpdateReservationDto,
  CheckInDto, CheckOutDto, AvailabilityQueryDto, ReservationFilterDto
} from './dto/reservation.dto';
import { ReservationStatus, RoomStatus } from '@prisma/client';
import dayjs from 'dayjs';
import { v4 as uuidv4 } from 'uuid';
import { paginate } from '@/common/dto/pagination.dto';

@Injectable()
export class ReservationsService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Confirmation Number ──────────────────────────────────────────────────────

  private generateConfirmationNumber(): string {
    return `HOS-${Math.floor(100000 + Math.random() * 900000)}`;
  }

  /**
   * Anchor a calendar date at UTC midnight so Prisma's `@db.Date` serialization
   * doesn't shift it to the previous day (local-midnight → prior UTC day).
   */
  private toDateOnly(date?: string): Date {
    return new Date(dayjs(date).format('YYYY-MM-DD'));
  }

  // ── Availability ─────────────────────────────────────────────────────────────

  async checkAvailability(propertyId: string, query: AvailabilityQueryDto) {
    const checkIn = this.toDateOnly(query.checkIn);
    const checkOut = this.toDateOnly(query.checkOut);
    const nights = dayjs(checkOut).diff(dayjs(checkIn), 'day');

    if (nights <= 0) throw new BadRequestException('Check-out must be after check-in');

    const roomTypes = await this.prisma.roomType.findMany({
      where: { propertyId, isActive: true },
      include: {
        rooms: { where: { isBlocked: false } },
        ratePlanItems: {
          where: { date: { gte: checkIn, lt: checkOut } },
          include: { ratePlan: true },
        },
      },
    });

    const results = await Promise.all(
      roomTypes.map(async (rt) => {
        const overlapping = await this.prisma.reservation.count({
          where: {
            propertyId,
            roomTypeId: rt.id,
            status: { in: [ReservationStatus.CONFIRMED, ReservationStatus.CHECKED_IN] },
            checkIn: { lt: checkOut },
            checkOut: { gt: checkIn },
          },
        });

        const available = rt.totalCount - overlapping;
        const avgRate = rt.ratePlanItems.length > 0
          ? rt.ratePlanItems.reduce((s: number, i) => s + Number(i.ratePerNight), 0) / rt.ratePlanItems.length
          : Number(rt.baseRate);

        return {
          roomType: rt,
          available: Math.max(0, available),
          nights,
          ratePerNight: avgRate,
          totalRate: avgRate * nights,
        };
      }),
    );

    return results.filter((r) => r.available > 0);
  }

  // ── List ─────────────────────────────────────────────────────────────────────

  async findAll(propertyId: string, query: ReservationFilterDto) {
    const where: Record<string, unknown> = { propertyId };
    if (query.status) where.status = query.status;
    if (query.channel) where.channel = query.channel;
    if (query.checkInFrom || query.checkInTo) {
      where.checkIn = {
        ...(query.checkInFrom && { gte: new Date(query.checkInFrom) }),
        ...(query.checkInTo && { lte: new Date(query.checkInTo) }),
      };
    }
    if (query.search) {
      where.OR = [
        { confirmationNumber: { contains: query.search } },
        { guest: { firstName: { contains: query.search } } },
        { guest: { lastName: { contains: query.search } } },
        { guest: { email: { contains: query.search } } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.reservation.findMany({
        where,
        include: {
          guest: { select: { id: true, firstName: true, lastName: true, email: true, phone: true, loyaltyTier: true } },
          room: { select: { id: true, number: true, floor: true } },
          roomType: { select: { id: true, name: true, code: true } },
          ratePlan: { select: { id: true, name: true, code: true } },
          extras: true,
          payments: true,
        },
        skip: query.skip,
        take: query.limit ?? 20,
        orderBy: { checkIn: 'asc' },
      }),
      this.prisma.reservation.count({ where }),
    ]);

    return paginate(data, total, query.page ?? 1, query.limit ?? 20);
  }

  async findOne(id: string, propertyId: string) {
    const res = await this.prisma.reservation.findFirst({
      where: { id, propertyId },
      include: {
        guest: { include: { preferences: true } },
        room: true,
        roomType: true,
        ratePlan: true,
        extras: true,
        payments: true,
        folio: { include: { charges: true } },
      },
    });
    if (!res) throw new NotFoundException('Reservation not found');
    return res;
  }

  // ── Create ────────────────────────────────────────────────────────────────────

  async create(propertyId: string, dto: CreateReservationDto) {
    const checkIn = this.toDateOnly(dto.checkIn);
    const checkOut = this.toDateOnly(dto.checkOut);
    const nights = dayjs(checkOut).diff(dayjs(checkIn), 'day');
    if (nights <= 0) throw new BadRequestException('Check-out must be after check-in');

    const [guest, roomType, ratePlan] = await Promise.all([
      this.prisma.guest.findFirst({ where: { id: dto.guestId, propertyId } }),
      this.prisma.roomType.findFirst({ where: { id: dto.roomTypeId, propertyId } }),
      this.prisma.ratePlan.findFirst({ where: { id: dto.ratePlanId, propertyId } }),
    ]);

    if (!guest) throw new NotFoundException('Guest not found');
    if (!roomType) throw new NotFoundException('Room type not found');
    if (!ratePlan) throw new NotFoundException('Rate plan not found');

    // Check availability
    const overlapping = await this.prisma.reservation.count({
      where: {
        propertyId,
        roomTypeId: dto.roomTypeId,
        status: { in: [ReservationStatus.CONFIRMED, ReservationStatus.CHECKED_IN] },
        checkIn: { lt: checkOut },
        checkOut: { gt: checkIn },
      },
    });
    if (overlapping >= roomType.totalCount) {
      throw new ConflictException('No rooms available for the selected dates');
    }

    const ratePerNight = Number(roomType.baseRate);
    const subTotal = ratePerNight * nights;
    const taxRate = 0.18; // 18% GST
    const taxAmount = subTotal * taxRate;
    const totalAmount = subTotal + taxAmount;
    const extrasTotal = (dto.extras ?? []).reduce((s, e) => s + e.price * e.quantity, 0);

    const res = await this.prisma.reservation.create({
      data: {
        propertyId,
        confirmationNumber: this.generateConfirmationNumber(),
        guestId: dto.guestId,
        roomTypeId: dto.roomTypeId,
        ratePlanId: dto.ratePlanId,
        roomId: dto.roomId,
        checkIn,
        checkOut,
        nights,
        adults: dto.adults,
        children: dto.children ?? 0,
        ratePerNight,
        subTotal,
        taxAmount,
        totalAmount: totalAmount + extrasTotal,
        balanceDue: totalAmount + extrasTotal,
        paidAmount: 0,
        status: ReservationStatus.CONFIRMED,
        channel: dto.channel ?? 'DIRECT',
        specialRequests: dto.specialRequests,
        otaConfirmationNo: dto.otaConfirmationNo,
        extras: dto.extras ? {
          create: dto.extras.map((e) => ({
            name: e.name,
            description: e.description,
            price: e.price,
            quantity: e.quantity,
            totalPrice: e.price * e.quantity,
          })),
        } : undefined,
      },
      include: {
        guest: true, roomType: true, ratePlan: true, extras: true,
      },
    });

    // Update guest stay counts
    await this.prisma.guest.update({
      where: { id: dto.guestId },
      data: { totalStays: { increment: 1 } },
    });

    return res;
  }

  // ── Modify ────────────────────────────────────────────────────────────────────

  async update(id: string, propertyId: string, dto: UpdateReservationDto) {
    const existing = await this.findOne(id, propertyId);
    if (([ReservationStatus.CANCELLED, ReservationStatus.CHECKED_OUT, ReservationStatus.NO_SHOW] as string[]).includes(existing.status)) {
      throw new BadRequestException('Cannot modify a closed reservation');
    }

    const data: Record<string, unknown> = {
      ...(dto.roomId && { roomId: dto.roomId }),
      ...(dto.specialRequests !== undefined && { specialRequests: dto.specialRequests }),
      ...(dto.adults !== undefined && { adults: dto.adults }),
      ...(dto.children !== undefined && { children: dto.children }),
      ...(dto.channel && { channel: dto.channel }),
      ...(dto.ratePlanId && { ratePlanId: dto.ratePlanId }),
    };

    // Reprice only when dates or room type change (rate is per-room in this model).
    const roomTypeChanged = !!dto.roomTypeId && dto.roomTypeId !== existing.roomTypeId;
    if (dto.checkIn || dto.checkOut || roomTypeChanged) {
      const checkIn = dto.checkIn ? this.toDateOnly(dto.checkIn) : existing.checkIn;
      const checkOut = dto.checkOut ? this.toDateOnly(dto.checkOut) : existing.checkOut;
      const nights = dayjs(checkOut).diff(dayjs(checkIn), 'day');
      if (nights <= 0) throw new BadRequestException('Check-out must be after check-in');

      const roomTypeId = dto.roomTypeId ?? existing.roomTypeId;
      const roomType = await this.prisma.roomType.findFirst({ where: { id: roomTypeId, propertyId } });
      if (!roomType) throw new NotFoundException('Room type not found');

      // Availability for the new dates/type — exclude THIS reservation.
      const overlapping = await this.prisma.reservation.count({
        where: {
          propertyId,
          roomTypeId,
          status: { in: [ReservationStatus.CONFIRMED, ReservationStatus.CHECKED_IN] },
          checkIn: { lt: checkOut },
          checkOut: { gt: checkIn },
          NOT: { id },
        },
      });
      if (overlapping >= roomType.totalCount) {
        throw new ConflictException('No rooms available for the selected dates');
      }

      const ratePerNight = Number(roomType.baseRate);
      const subTotal = ratePerNight * nights;
      const taxAmount = subTotal * 0.18;
      const extrasTotal = (existing.extras ?? []).reduce((s, e) => s + Number(e.totalPrice), 0);
      const grandTotal = subTotal + taxAmount + extrasTotal;

      Object.assign(data, {
        checkIn,
        checkOut,
        nights,
        roomTypeId,
        ratePerNight,
        subTotal,
        taxAmount,
        totalAmount: grandTotal,
        balanceDue: grandTotal - Number(existing.paidAmount),
      });
    }

    return this.prisma.reservation.update({
      where: { id },
      data,
      include: { guest: true, roomType: true, room: true, ratePlan: true },
    });
  }

  // ── Cancel ────────────────────────────────────────────────────────────────────

  async cancel(id: string, propertyId: string, reason?: string) {
    const res = await this.findOne(id, propertyId);
    if (res.status === ReservationStatus.CHECKED_IN) {
      throw new BadRequestException('Cannot cancel a checked-in reservation. Please check out instead.');
    }
    if (([ReservationStatus.CANCELLED, ReservationStatus.CHECKED_OUT] as string[]).includes(res.status)) {
      throw new BadRequestException('Reservation is already closed');
    }

    // Apply the property's cancellation policy: compute fee/refund and settle.
    const policy = await this.getCancellationPolicy(propertyId);
    const q = this.computeRefund(res, policy);

    const updated = await this.prisma.reservation.update({
      where: { id },
      data: {
        status: ReservationStatus.CANCELLED,
        cancelledAt: new Date(),
        cancellationReason: reason ?? 'Guest request',
        paidAmount: q.fee,   // hotel retains the penalty; the rest is refunded
        balanceDue: 0,
      },
    });

    if (q.refund > 0) {
      await this.prisma.payment.create({
        data: {
          reservationId: id, amount: q.refund, method: 'CARD', status: 'REFUNDED',
          reference: `REFUND-${res.confirmationNumber}`, processedAt: new Date(),
          notes: q.free ? 'Full refund — free cancellation window' : `Refund after ${policy.penaltyType} penalty (₹${q.fee})`,
        },
      });
    }

    return { ...updated, cancellation: { fee: q.fee, refund: q.refund, freeCancellation: q.free } };
  }

  // ── Cancellation policy + refund math ───────────────────────────────────────
  async getCancellationPolicy(propertyId: string) {
    const p = await this.prisma.cancellationPolicy.findUnique({ where: { propertyId } });
    return p ?? { propertyId, name: 'Standard', freeCancellationHours: 48, penaltyType: 'FIRST_NIGHT' as const, penaltyValue: 0 };
  }

  async updateCancellationPolicy(propertyId: string, dto: { name?: string; freeCancellationHours?: number; penaltyType?: 'NONE' | 'FIRST_NIGHT' | 'PERCENT' | 'FULL'; penaltyValue?: number }) {
    return this.prisma.cancellationPolicy.upsert({
      where: { propertyId },
      create: {
        propertyId,
        name: dto.name ?? 'Standard',
        freeCancellationHours: dto.freeCancellationHours ?? 48,
        penaltyType: (dto.penaltyType ?? 'FIRST_NIGHT') as never,
        penaltyValue: dto.penaltyValue ?? 0,
      },
      update: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.freeCancellationHours !== undefined && { freeCancellationHours: dto.freeCancellationHours }),
        ...(dto.penaltyType !== undefined && { penaltyType: dto.penaltyType as never }),
        ...(dto.penaltyValue !== undefined && { penaltyValue: dto.penaltyValue }),
      },
    });
  }

  private computeRefund(
    res: { checkIn: Date; ratePerNight: unknown; totalAmount: unknown; paidAmount: unknown },
    policy: { freeCancellationHours: number; penaltyType: string; penaltyValue: unknown },
  ) {
    const paid = Number(res.paidAmount);
    const total = Number(res.totalAmount);
    const firstNight = Number(res.ratePerNight);
    const hoursUntil = (new Date(res.checkIn).getTime() - Date.now()) / 3_600_000;
    const free = hoursUntil >= policy.freeCancellationHours;
    let fee = 0;
    if (!free) {
      if (policy.penaltyType === 'FIRST_NIGHT') fee = Math.min(firstNight, total);
      else if (policy.penaltyType === 'PERCENT') fee = Math.round((total * Number(policy.penaltyValue)) / 100);
      else if (policy.penaltyType === 'FULL') fee = total;
    }
    fee = Math.min(fee, paid);
    return { free, fee, refund: Math.max(0, paid - fee), hoursUntil: Math.round(hoursUntil), paid };
  }

  async cancelQuote(id: string, propertyId: string) {
    const res = await this.findOne(id, propertyId);
    const policy = await this.getCancellationPolicy(propertyId);
    return {
      policy: { name: policy.name, freeCancellationHours: policy.freeCancellationHours, penaltyType: policy.penaltyType, penaltyValue: Number(policy.penaltyValue) },
      ...this.computeRefund(res, policy),
    };
  }

  // ── Check-In ──────────────────────────────────────────────────────────────────

  async checkIn(id: string, propertyId: string, dto: CheckInDto) {
    const res = await this.findOne(id, propertyId);
    if (res.status !== ReservationStatus.CONFIRMED) {
      throw new BadRequestException('Only confirmed reservations can be checked in');
    }

    const roomId = dto.roomId ?? res.roomId;
    if (!roomId) throw new BadRequestException('A room must be assigned before check-in');

    const room = await this.prisma.room.findFirst({ where: { id: roomId, propertyId } });
    if (!room) throw new NotFoundException('Room not found');
    if (room.status !== RoomStatus.CLEAN) throw new BadRequestException('Room is not clean. Please assign a clean room.');

    const [updated] = await this.prisma.$transaction([
      this.prisma.reservation.update({
        where: { id },
        data: {
          status: ReservationStatus.CHECKED_IN,
          roomId,
          checkedInAt: new Date(),
        },
        include: { guest: true, room: true, roomType: true },
      }),
      this.prisma.room.update({ where: { id: roomId }, data: { status: RoomStatus.DIRTY } }),
    ]);

    // Create folio
    await this.prisma.folio.upsert({
      where: { reservationId: id },
      create: {
        reservationId: id,
        totalCharges: res.totalAmount,
        totalPayments: res.paidAmount,
        balance: res.balanceDue,
      },
      update: {},
    });

    if (dto.idDocumentUrl) {
      await this.prisma.guest.update({
        where: { id: res.guestId },
        data: { idDocumentUrl: dto.idDocumentUrl },
      });
    }

    return updated;
  }

  // ── Check-Out ─────────────────────────────────────────────────────────────────

  async checkOut(id: string, propertyId: string, dto: CheckOutDto) {
    const res = await this.findOne(id, propertyId);
    if (res.status !== ReservationStatus.CHECKED_IN) {
      throw new BadRequestException('Only checked-in reservations can be checked out');
    }

    const [updated] = await this.prisma.$transaction([
      this.prisma.reservation.update({
        where: { id },
        data: {
          status: ReservationStatus.CHECKED_OUT,
          checkedOutAt: new Date(),
          internalNotes: dto.notes,
        },
        include: { guest: true, room: true, roomType: true, folio: true },
      }),
      // Mark room as dirty for housekeeping
      ...(res.roomId ? [this.prisma.room.update({
        where: { id: res.roomId },
        data: { status: RoomStatus.DIRTY },
      })] : []),
      // Close folio
      this.prisma.folio.updateMany({
        where: { reservationId: id },
        data: { isClosed: true, closedAt: new Date() },
      }),
    ]);

    // Update guest lifetime value
    await this.prisma.guest.update({
      where: { id: res.guestId },
      data: {
        lifetimeValue: { increment: res.totalAmount },
        totalNights: { increment: res.nights },
        lastStayAt: new Date(),
      },
    });

    // Create housekeeping task for the vacated room
    if (res.roomId) {
      await this.prisma.housekeepingTask.create({
        data: {
          propertyId,
          roomId: res.roomId,
          taskType: 'FULL_CLEAN',
          priority: 'NORMAL',
          scheduledDate: new Date(dayjs().format('YYYY-MM-DD')),
        },
      });
    }

    return updated;
  }

  // ── Today Summary ─────────────────────────────────────────────────────────────

  async getTodaySummary(propertyId: string) {
    const today = this.toDateOnly();
    const tomorrow = new Date(dayjs().add(1, 'day').format('YYYY-MM-DD'));

    const [arrivals, departures, inHouse, noShows] = await Promise.all([
      this.prisma.reservation.count({
        where: { propertyId, checkIn: { gte: today, lt: tomorrow }, status: ReservationStatus.CONFIRMED },
      }),
      this.prisma.reservation.count({
        where: { propertyId, checkOut: { gte: today, lt: tomorrow }, status: ReservationStatus.CHECKED_IN },
      }),
      this.prisma.reservation.count({
        where: { propertyId, status: ReservationStatus.CHECKED_IN },
      }),
      this.prisma.reservation.count({
        where: { propertyId, checkIn: { gte: today, lt: tomorrow }, status: ReservationStatus.NO_SHOW },
      }),
    ]);

    return { arrivals, departures, inHouse, noShows };
  }
}

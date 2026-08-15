import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import dayjs from 'dayjs';
import { PrismaService } from '@/prisma/prisma.service';
import { ReservationsService } from '@/modules/reservations/reservations.service';

// Fictional guest names for simulated OTA reservations.
const OTA_GUESTS = [
  { firstName: 'Aarav', lastName: 'Sharma' }, { firstName: 'Diya', lastName: 'Patel' },
  { firstName: 'Kabir', lastName: 'Reddy' }, { firstName: 'Ananya', lastName: 'Iyer' },
  { firstName: 'Vivaan', lastName: 'Mehta' }, { firstName: 'Ishaan', lastName: 'Rao' },
  { firstName: 'Sara', lastName: 'Khan' }, { firstName: 'Advait', lastName: 'Joshi' },
];

@Injectable()
export class ChannelsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly reservations: ReservationsService,
  ) {}

  private async find(propertyId: string, id: string) {
    const ch = await this.prisma.channel.findFirst({ where: { id, propertyId } });
    if (!ch) throw new NotFoundException('Channel not found');
    return ch;
  }

  private async requireConnected(propertyId: string, id: string) {
    const ch = await this.find(propertyId, id);
    if (!ch.isConnected) throw new BadRequestException(`${ch.name} is not connected`);
    return ch;
  }

  private log(propertyId: string, channelId: string, direction: 'PUSH' | 'PULL', summary: string, count: number) {
    return this.prisma.channelSyncLog.create({ data: { propertyId, channelId, direction, summary, count } });
  }

  async list(propertyId: string) {
    const [channels, otaReservations, entryRoom] = await Promise.all([
      this.prisma.channel.findMany({ where: { propertyId }, orderBy: { name: 'asc' } }),
      this.prisma.reservation.count({ where: { propertyId, channel: { notIn: ['DIRECT', 'PHONE', 'WALK_IN', 'OTHER'] } } }),
      this.prisma.roomType.findFirst({ where: { propertyId, isActive: true }, orderBy: { baseRate: 'asc' }, select: { baseRate: true } }),
    ]);
    const connected = channels.filter((c) => c.isConnected);
    const ourRate = Number(entryRoom?.baseRate ?? 0);
    return {
      channels: channels.map((c) => ({
        id: c.id, code: c.code, name: c.name, isConnected: c.isConnected,
        commissionPct: Number(c.commissionPct), autoSync: c.autoSync, lastSyncAt: c.lastSyncAt,
        // Mock rate parity: we push the same BAR rate everywhere, so connected channels are in parity.
        ourRate, channelRate: ourRate, parityOk: true,
      })),
      summary: {
        total: channels.length,
        connected: connected.length,
        otaReservations,
        avgCommission: connected.length ? +(connected.reduce((s, c) => s + Number(c.commissionPct), 0) / connected.length).toFixed(1) : 0,
      },
    };
  }

  async setConnected(propertyId: string, id: string, isConnected: boolean) {
    const ch = await this.find(propertyId, id);
    const updated = await this.prisma.channel.update({
      where: { id: ch.id },
      data: { isConnected, ...(isConnected && { lastSyncAt: new Date() }) },
    });
    await this.log(propertyId, ch.id, 'PUSH',
      isConnected ? `Connected ${ch.name} — initial rates & inventory pushed` : `Disconnected ${ch.name}`, 0);
    return { ...updated, commissionPct: Number(updated.commissionPct) };
  }

  // Mock push: publish rates + availability for every active room type over the next 30 days.
  async push(propertyId: string, id: string) {
    const ch = await this.requireConnected(propertyId, id);
    const roomTypes = await this.prisma.roomType.count({ where: { propertyId, isActive: true } });
    const days = 30;
    const count = roomTypes * days;
    await this.prisma.channel.update({ where: { id: ch.id }, data: { lastSyncAt: new Date() } });
    await this.log(propertyId, ch.id, 'PUSH', `Pushed rates & availability — ${roomTypes} room types × ${days} days`, count);
    return { channel: ch.name, roomTypes, days, count };
  }

  // Mock pull: simulate OTA bookings landing as REAL reservations in the PMS.
  async pull(propertyId: string, id: string) {
    const ch = await this.requireConnected(propertyId, id);
    const [roomType, ratePlan] = await Promise.all([
      this.prisma.roomType.findFirst({ where: { propertyId, isActive: true }, orderBy: { sortOrder: 'asc' } }),
      this.prisma.ratePlan.findFirst({ where: { propertyId, type: 'BAR', isActive: true } })
        .then((r) => r ?? this.prisma.ratePlan.findFirst({ where: { propertyId, isActive: true } })),
    ]);
    if (!roomType || !ratePlan) throw new BadRequestException('Property is not configured for bookings');

    const n = 1 + Math.floor(Math.random() * 2); // 1–2 bookings per pull
    const created: { confirmation: string; guest: string; checkIn: string; checkOut: string; total: number }[] = [];
    for (let i = 0; i < n; i++) {
      const who = OTA_GUESTS[Math.floor(Math.random() * OTA_GUESTS.length)];
      const email = `${who.firstName}.${who.lastName}.${Date.now()}${i}`.toLowerCase() + `@guest.${ch.code.toLowerCase()}.com`;
      const guest = await this.prisma.guest.create({ data: { propertyId, firstName: who.firstName, lastName: who.lastName, email } });
      const lead = 3 + Math.floor(Math.random() * 20);
      const nights = 1 + Math.floor(Math.random() * 3);
      try {
        const res = await this.reservations.create(propertyId, {
          guestId: guest.id, roomTypeId: roomType.id, ratePlanId: ratePlan.id,
          checkIn: dayjs().add(lead, 'day').format('YYYY-MM-DD'),
          checkOut: dayjs().add(lead + nights, 'day').format('YYYY-MM-DD'),
          adults: 2, children: 0, channel: ch.code as never,
          otaConfirmationNo: `${ch.code.slice(0, 4)}-${Math.floor(100000 + Math.random() * 900000)}`,
        });
        created.push({
          confirmation: res.confirmationNumber, guest: `${who.firstName} ${who.lastName}`,
          checkIn: dayjs(res.checkIn).format('YYYY-MM-DD'), checkOut: dayjs(res.checkOut).format('YYYY-MM-DD'),
          total: Number(res.totalAmount),
        });
      } catch {
        // Availability conflict for the random dates — drop that guest and move on.
        await this.prisma.guest.delete({ where: { id: guest.id } }).catch(() => undefined);
      }
    }
    await this.prisma.channel.update({ where: { id: ch.id }, data: { lastSyncAt: new Date() } });
    await this.log(propertyId, ch.id, 'PULL', `Pulled ${created.length} reservation(s) from ${ch.name}`, created.length);
    return { channel: ch.name, pulled: created.length, reservations: created };
  }

  async syncLog(propertyId: string) {
    const logs = await this.prisma.channelSyncLog.findMany({
      where: { propertyId }, orderBy: { createdAt: 'desc' }, take: 20,
      include: { channel: { select: { name: true } } },
    });
    return logs.map((l) => ({
      id: l.id, direction: l.direction, summary: l.summary, count: l.count,
      createdAt: l.createdAt, channel: l.channel.name,
    }));
  }
}

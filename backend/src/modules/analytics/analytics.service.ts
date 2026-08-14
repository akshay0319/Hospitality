import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { ReservationStatus } from '@prisma/client';
import dayjs from 'dayjs';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getRevenueTrend(propertyId: string, days = 30) {
    const results = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = dayjs().subtract(i, 'day').startOf('day');
      const nextDate = date.add(1, 'day').toDate();
      const dateVal = date.toDate();

      const [checkedIn, payments] = await Promise.all([
        this.prisma.reservation.count({
          where: {
            propertyId,
            status: { in: [ReservationStatus.CHECKED_IN, ReservationStatus.CHECKED_OUT] },
            checkIn: { lte: dateVal },
            checkOut: { gt: dateVal },
          },
        }),
        this.prisma.payment.aggregate({
          where: {
            reservation: { propertyId },
            processedAt: { gte: dateVal, lt: nextDate },
            status: 'PAID',
          },
          _sum: { amount: true },
        }),
      ]);

      const property = await this.prisma.property.findUnique({
        where: { id: propertyId }, select: { totalRooms: true },
      });
      const totalRooms = property?.totalRooms ?? 1;

      const revenue = Number(payments._sum.amount ?? 0);
      const occupancy = totalRooms > 0 ? (checkedIn / totalRooms) * 100 : 0;
      const adr = checkedIn > 0 ? revenue / checkedIn : 0;

      results.push({
        date: date.format('YYYY-MM-DD'),
        revenue,
        occupancy: Number(occupancy.toFixed(1)),
        adr: Number(adr.toFixed(0)),
        revpar: Number((adr * (occupancy / 100)).toFixed(0)),
        roomsSold: checkedIn,
      });
    }
    return results;
  }

  async getChannelBreakdown(propertyId: string, days = 30) {
    const since = dayjs().subtract(days, 'day').toDate();

    const channels = await this.prisma.reservation.groupBy({
      by: ['channel'],
      where: {
        propertyId,
        createdAt: { gte: since },
        status: { not: ReservationStatus.CANCELLED },
      },
      _count: { id: true },
      _sum: { totalAmount: true },
    });

    return channels.map((c) => ({
      channel: c.channel as string,
      bookings: c._count.id,
      revenue: Number(c._sum.totalAmount ?? 0),
    }));
  }

  async getOccupancyHeatmap(propertyId: string, year?: number) {
    const y = year ?? dayjs().year();
    const start = dayjs(`${y}-01-01`).toDate();
    const end = dayjs(`${y}-12-31`).toDate();

    const property = await this.prisma.property.findUnique({
      where: { id: propertyId }, select: { totalRooms: true },
    });
    const totalRooms = property?.totalRooms ?? 1;

    const reservations = await this.prisma.reservation.findMany({
      where: {
        propertyId,
        status: { in: [ReservationStatus.CHECKED_IN, ReservationStatus.CHECKED_OUT] },
        checkIn: { gte: start, lte: end },
      },
      select: { checkIn: true, checkOut: true },
    });

    // Build day-level occupancy map
    const map: Record<string, number> = {};
    for (const res of reservations) {
      let d = dayjs(res.checkIn);
      const out = dayjs(res.checkOut);
      while (d.isBefore(out)) {
        const key = d.format('YYYY-MM-DD');
        map[key] = (map[key] ?? 0) + 1;
        d = d.add(1, 'day');
      }
    }

    return Object.entries(map).map(([date, count]) => ({
      date,
      count,
      occupancy: Number(((count / totalRooms) * 100).toFixed(1)),
    }));
  }

  async getGuestStats(propertyId: string) {
    const [total, vip, returning, loyaltyBreakdown] = await Promise.all([
      this.prisma.guest.count({ where: { propertyId } }),
      this.prisma.guest.count({ where: { propertyId, isVip: true } }),
      this.prisma.guest.count({ where: { propertyId, totalStays: { gt: 1 } } }),
      this.prisma.guest.groupBy({
        by: ['loyaltyTier'],
        where: { propertyId },
        _count: { id: true },
      }),
    ]);

    return {
      total,
      vip,
      returning,
      newGuests: total - returning,
      loyaltyBreakdown: loyaltyBreakdown.map((l) => ({ tier: l.loyaltyTier as string, count: l._count.id })),
    };
  }
}

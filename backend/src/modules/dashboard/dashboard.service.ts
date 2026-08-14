import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { ReservationStatus, RoomStatus, TaskStatus } from '@prisma/client';
import dayjs from 'dayjs';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getKPIs(propertyId: string) {
    const today = dayjs().startOf('day').toDate();
    const tomorrow = dayjs().add(1, 'day').startOf('day').toDate();
    const yesterday = dayjs().subtract(1, 'day').startOf('day').toDate();

    const property = await this.prisma.property.findUnique({
      where: { id: propertyId },
      select: { totalRooms: true },
    });
    const totalRooms = property?.totalRooms ?? 0;

    const [
      checkedInCount,
      arrivalsToday,
      departureToday,
      revenueToday,
      revenueYesterday,
      arrivalsYesterday,
      roomStatusCounts,
    ] = await Promise.all([
      this.prisma.reservation.count({
        where: { propertyId, status: ReservationStatus.CHECKED_IN },
      }),
      this.prisma.reservation.count({
        where: { propertyId, checkIn: { gte: today, lt: tomorrow }, status: ReservationStatus.CONFIRMED },
      }),
      this.prisma.reservation.count({
        where: { propertyId, checkOut: { gte: today, lt: tomorrow }, status: ReservationStatus.CHECKED_IN },
      }),
      this.prisma.payment.aggregate({
        where: {
          reservation: { propertyId },
          processedAt: { gte: today, lt: tomorrow },
          status: 'PAID',
        },
        _sum: { amount: true },
      }),
      this.prisma.payment.aggregate({
        where: {
          reservation: { propertyId },
          processedAt: { gte: yesterday, lt: today },
          status: 'PAID',
        },
        _sum: { amount: true },
      }),
      this.prisma.reservation.count({
        where: { propertyId, checkIn: { gte: yesterday, lt: today } },
      }),
      this.prisma.room.groupBy({
        by: ['status'],
        where: { propertyId },
        _count: true,
      }),
    ]);

    const occupancyToday = totalRooms > 0 ? ((checkedInCount / totalRooms) * 100) : 0;
    const availableRooms = totalRooms - checkedInCount;
    const revToday = Number(revenueToday._sum.amount ?? 0);
    const revYesterday = Number(revenueYesterday._sum.amount ?? 0);

    const roomsByStatus = Object.fromEntries(
      roomStatusCounts.map((r: { status: string; _count: { id?: number } | number }) => [r.status, r._count])
    );

    return {
      occupancy: {
        value: Number(occupancyToday.toFixed(1)),
        unit: '%',
        trend: arrivalsYesterday > 0
          ? Number((((arrivalsToday - arrivalsYesterday) / arrivalsYesterday) * 100).toFixed(1))
          : 0,
        isPositive: arrivalsToday >= arrivalsYesterday,
      },
      availableRooms: {
        value: availableRooms,
        trend: null,
        isPositive: true,
      },
      arrivalsToday: {
        value: arrivalsToday,
        trend: null,
        isPositive: true,
      },
      departuresToday: {
        value: departureToday,
        trend: null,
        isPositive: true,
      },
      revenueToday: {
        value: revToday,
        currency: 'INR',
        trend: revYesterday > 0
          ? Number((((revToday - revYesterday) / revYesterday) * 100).toFixed(1))
          : 0,
        isPositive: revToday >= revYesterday,
      },
      roomStatus: roomsByStatus,
      totalRooms,
      inHouse: checkedInCount,
    };
  }
}

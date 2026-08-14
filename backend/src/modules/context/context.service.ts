import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import dayjs from 'dayjs';

/**
 * Unified context layer — assembles a single grounded snapshot of a property's
 * live state. This is the substrate every AI agent (Copilot, Revenue, Ops…)
 * reads from, so answers are backed by real data rather than guesses.
 */
@Injectable()
export class ContextService {
  constructor(private readonly prisma: PrismaService) {}

  private today(): Date {
    return new Date(dayjs().format('YYYY-MM-DD'));
  }

  async getSnapshot(propertyId: string) {
    const today = this.today();

    const [
      property, checkedIn, arrivals, departures, roomStatus,
      hk, maintOpen, maintCritical, topGuests, alerts, upcoming, revenueAgg,
    ] = await Promise.all([
      this.prisma.property.findUnique({
        where: { id: propertyId },
        select: { name: true, city: true, currency: true, totalRooms: true, starRating: true },
      }),
      this.prisma.reservation.count({ where: { propertyId, status: 'CHECKED_IN' } }),
      this.prisma.reservation.count({ where: { propertyId, checkIn: today, status: { in: ['CONFIRMED', 'CHECKED_IN'] } } }),
      this.prisma.reservation.count({ where: { propertyId, checkOut: today, status: { in: ['CHECKED_IN', 'CHECKED_OUT'] } } }),
      this.prisma.room.groupBy({ by: ['status'], where: { propertyId }, _count: { id: true } }),
      this.prisma.housekeepingTask.groupBy({ by: ['status'], where: { propertyId, scheduledDate: today }, _count: { id: true } }),
      this.prisma.maintenanceTicket.count({ where: { propertyId, status: { notIn: ['RESOLVED', 'CLOSED'] } } }),
      this.prisma.maintenanceTicket.count({ where: { propertyId, priority: 'CRITICAL', status: { notIn: ['RESOLVED', 'CLOSED'] } } }),
      this.prisma.guest.findMany({
        where: { propertyId }, orderBy: { lifetimeValue: 'desc' }, take: 5,
        select: { firstName: true, lastName: true, loyaltyTier: true, lifetimeValue: true, isVip: true },
      }),
      this.prisma.aIAlert.findMany({
        where: { propertyId, isRead: false }, take: 10,
        select: { title: true, severity: true, module: true },
      }),
      this.prisma.reservation.findMany({
        where: { propertyId, checkIn: { gte: today }, status: 'CONFIRMED' },
        orderBy: { checkIn: 'asc' }, take: 5,
        include: { guest: { select: { firstName: true, lastName: true } }, roomType: { select: { name: true } } },
      }),
      this.prisma.payment.aggregate({
        where: { reservation: { propertyId }, status: 'PAID', createdAt: { gte: today } },
        _sum: { amount: true },
      }),
    ]);

    const totalRooms = property?.totalRooms ?? 0;
    const occupancyPct = totalRooms ? Math.round((checkedIn / totalRooms) * 1000) / 10 : 0;
    const rooms = Object.fromEntries(roomStatus.map((r: { status: string; _count: { id: number } }) => [r.status, r._count.id]));
    const hkMap = Object.fromEntries(hk.map((h: { status: string; _count: { id: number } }) => [h.status, h._count.id]));

    return {
      generatedAt: new Date().toISOString(),
      date: dayjs().format('YYYY-MM-DD'),
      property: {
        name: property?.name, city: property?.city, currency: property?.currency,
        starRating: property?.starRating, totalRooms,
      },
      occupancy: {
        checkedIn,
        occupancyPct,
        availableRooms: Math.max(0, totalRooms - checkedIn),
      },
      today: {
        arrivals,
        departures,
        revenue: Number(revenueAgg._sum.amount ?? 0),
      },
      rooms,
      housekeeping: {
        pending: hkMap.PENDING ?? 0,
        inProgress: hkMap.IN_PROGRESS ?? 0,
        inspecting: hkMap.INSPECTING ?? 0,
        completed: hkMap.COMPLETED ?? 0,
      },
      maintenance: { open: maintOpen, critical: maintCritical },
      topGuests: topGuests.map((g) => ({
        name: `${g.firstName} ${g.lastName}`,
        tier: g.loyaltyTier,
        lifetimeValue: Number(g.lifetimeValue),
        vip: g.isVip,
      })),
      upcomingArrivals: upcoming.map((r) => ({
        guest: `${r.guest.firstName} ${r.guest.lastName}`,
        roomType: r.roomType?.name ?? null,
        checkIn: dayjs(r.checkIn).format('YYYY-MM-DD'),
      })),
      alerts: alerts.map((a) => ({ title: a.title, severity: a.severity, module: a.module })),
    };
  }
}

"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContextService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const dayjs_1 = __importDefault(require("dayjs"));
let ContextService = class ContextService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    today() {
        return new Date((0, dayjs_1.default)().format('YYYY-MM-DD'));
    }
    async getSnapshot(propertyId) {
        const today = this.today();
        const [property, checkedIn, arrivals, departures, roomStatus, hk, maintOpen, maintCritical, topGuests, alerts, upcoming, revenueAgg,] = await Promise.all([
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
        const rooms = Object.fromEntries(roomStatus.map((r) => [r.status, r._count.id]));
        const hkMap = Object.fromEntries(hk.map((h) => [h.status, h._count.id]));
        return {
            generatedAt: new Date().toISOString(),
            date: (0, dayjs_1.default)().format('YYYY-MM-DD'),
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
                checkIn: (0, dayjs_1.default)(r.checkIn).format('YYYY-MM-DD'),
            })),
            alerts: alerts.map((a) => ({ title: a.title, severity: a.severity, module: a.module })),
        };
    }
};
exports.ContextService = ContextService;
exports.ContextService = ContextService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ContextService);
//# sourceMappingURL=context.service.js.map
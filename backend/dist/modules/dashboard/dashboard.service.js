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
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
const dayjs_1 = __importDefault(require("dayjs"));
let DashboardService = class DashboardService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getKPIs(propertyId) {
        const today = (0, dayjs_1.default)().startOf('day').toDate();
        const tomorrow = (0, dayjs_1.default)().add(1, 'day').startOf('day').toDate();
        const yesterday = (0, dayjs_1.default)().subtract(1, 'day').startOf('day').toDate();
        const property = await this.prisma.property.findUnique({
            where: { id: propertyId },
            select: { totalRooms: true },
        });
        const totalRooms = property?.totalRooms ?? 0;
        const [checkedInCount, arrivalsToday, departureToday, revenueToday, revenueYesterday, arrivalsYesterday, roomStatusCounts,] = await Promise.all([
            this.prisma.reservation.count({
                where: { propertyId, status: client_1.ReservationStatus.CHECKED_IN },
            }),
            this.prisma.reservation.count({
                where: { propertyId, checkIn: { gte: today, lt: tomorrow }, status: client_1.ReservationStatus.CONFIRMED },
            }),
            this.prisma.reservation.count({
                where: { propertyId, checkOut: { gte: today, lt: tomorrow }, status: client_1.ReservationStatus.CHECKED_IN },
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
        const roomsByStatus = Object.fromEntries(roomStatusCounts.map((r) => [r.status, r._count]));
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
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map
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
exports.AnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
const dayjs_1 = __importDefault(require("dayjs"));
let AnalyticsService = class AnalyticsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getRevenueTrend(propertyId, days = 30) {
        const results = [];
        for (let i = days - 1; i >= 0; i--) {
            const date = (0, dayjs_1.default)().subtract(i, 'day').startOf('day');
            const nextDate = date.add(1, 'day').toDate();
            const dateVal = date.toDate();
            const [checkedIn, payments] = await Promise.all([
                this.prisma.reservation.count({
                    where: {
                        propertyId,
                        status: { in: [client_1.ReservationStatus.CHECKED_IN, client_1.ReservationStatus.CHECKED_OUT] },
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
    async getChannelBreakdown(propertyId, days = 30) {
        const since = (0, dayjs_1.default)().subtract(days, 'day').toDate();
        const channels = await this.prisma.reservation.groupBy({
            by: ['channel'],
            where: {
                propertyId,
                createdAt: { gte: since },
                status: { not: client_1.ReservationStatus.CANCELLED },
            },
            _count: { id: true },
            _sum: { totalAmount: true },
        });
        return channels.map((c) => ({
            channel: c.channel,
            bookings: c._count.id,
            revenue: Number(c._sum.totalAmount ?? 0),
        }));
    }
    async getOccupancyHeatmap(propertyId, year) {
        const y = year ?? (0, dayjs_1.default)().year();
        const start = (0, dayjs_1.default)(`${y}-01-01`).toDate();
        const end = (0, dayjs_1.default)(`${y}-12-31`).toDate();
        const property = await this.prisma.property.findUnique({
            where: { id: propertyId }, select: { totalRooms: true },
        });
        const totalRooms = property?.totalRooms ?? 1;
        const reservations = await this.prisma.reservation.findMany({
            where: {
                propertyId,
                status: { in: [client_1.ReservationStatus.CHECKED_IN, client_1.ReservationStatus.CHECKED_OUT] },
                checkIn: { gte: start, lte: end },
            },
            select: { checkIn: true, checkOut: true },
        });
        const map = {};
        for (const res of reservations) {
            let d = (0, dayjs_1.default)(res.checkIn);
            const out = (0, dayjs_1.default)(res.checkOut);
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
    async getGuestStats(propertyId) {
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
            loyaltyBreakdown: loyaltyBreakdown.map((l) => ({ tier: l.loyaltyTier, count: l._count.id })),
        };
    }
};
exports.AnalyticsService = AnalyticsService;
exports.AnalyticsService = AnalyticsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AnalyticsService);
//# sourceMappingURL=analytics.service.js.map
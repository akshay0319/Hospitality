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
exports.ChannelsService = void 0;
const common_1 = require("@nestjs/common");
const dayjs_1 = __importDefault(require("dayjs"));
const prisma_service_1 = require("../../prisma/prisma.service");
const reservations_service_1 = require("../reservations/reservations.service");
const OTA_GUESTS = [
    { firstName: 'Aarav', lastName: 'Sharma' }, { firstName: 'Diya', lastName: 'Patel' },
    { firstName: 'Kabir', lastName: 'Reddy' }, { firstName: 'Ananya', lastName: 'Iyer' },
    { firstName: 'Vivaan', lastName: 'Mehta' }, { firstName: 'Ishaan', lastName: 'Rao' },
    { firstName: 'Sara', lastName: 'Khan' }, { firstName: 'Advait', lastName: 'Joshi' },
];
let ChannelsService = class ChannelsService {
    constructor(prisma, reservations) {
        this.prisma = prisma;
        this.reservations = reservations;
    }
    async find(propertyId, id) {
        const ch = await this.prisma.channel.findFirst({ where: { id, propertyId } });
        if (!ch)
            throw new common_1.NotFoundException('Channel not found');
        return ch;
    }
    async requireConnected(propertyId, id) {
        const ch = await this.find(propertyId, id);
        if (!ch.isConnected)
            throw new common_1.BadRequestException(`${ch.name} is not connected`);
        return ch;
    }
    log(propertyId, channelId, direction, summary, count) {
        return this.prisma.channelSyncLog.create({ data: { propertyId, channelId, direction, summary, count } });
    }
    async list(propertyId) {
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
    async setConnected(propertyId, id, isConnected) {
        const ch = await this.find(propertyId, id);
        const updated = await this.prisma.channel.update({
            where: { id: ch.id },
            data: { isConnected, ...(isConnected && { lastSyncAt: new Date() }) },
        });
        await this.log(propertyId, ch.id, 'PUSH', isConnected ? `Connected ${ch.name} — initial rates & inventory pushed` : `Disconnected ${ch.name}`, 0);
        return { ...updated, commissionPct: Number(updated.commissionPct) };
    }
    async push(propertyId, id) {
        const ch = await this.requireConnected(propertyId, id);
        const roomTypes = await this.prisma.roomType.count({ where: { propertyId, isActive: true } });
        const days = 30;
        const count = roomTypes * days;
        await this.prisma.channel.update({ where: { id: ch.id }, data: { lastSyncAt: new Date() } });
        await this.log(propertyId, ch.id, 'PUSH', `Pushed rates & availability — ${roomTypes} room types × ${days} days`, count);
        return { channel: ch.name, roomTypes, days, count };
    }
    async pull(propertyId, id) {
        const ch = await this.requireConnected(propertyId, id);
        const [roomType, ratePlan] = await Promise.all([
            this.prisma.roomType.findFirst({ where: { propertyId, isActive: true }, orderBy: { sortOrder: 'asc' } }),
            this.prisma.ratePlan.findFirst({ where: { propertyId, type: 'BAR', isActive: true } })
                .then((r) => r ?? this.prisma.ratePlan.findFirst({ where: { propertyId, isActive: true } })),
        ]);
        if (!roomType || !ratePlan)
            throw new common_1.BadRequestException('Property is not configured for bookings');
        const n = 1 + Math.floor(Math.random() * 2);
        const created = [];
        for (let i = 0; i < n; i++) {
            const who = OTA_GUESTS[Math.floor(Math.random() * OTA_GUESTS.length)];
            const email = `${who.firstName}.${who.lastName}.${Date.now()}${i}`.toLowerCase() + `@guest.${ch.code.toLowerCase()}.com`;
            const guest = await this.prisma.guest.create({ data: { propertyId, firstName: who.firstName, lastName: who.lastName, email } });
            const lead = 3 + Math.floor(Math.random() * 20);
            const nights = 1 + Math.floor(Math.random() * 3);
            try {
                const res = await this.reservations.create(propertyId, {
                    guestId: guest.id, roomTypeId: roomType.id, ratePlanId: ratePlan.id,
                    checkIn: (0, dayjs_1.default)().add(lead, 'day').format('YYYY-MM-DD'),
                    checkOut: (0, dayjs_1.default)().add(lead + nights, 'day').format('YYYY-MM-DD'),
                    adults: 2, children: 0, channel: ch.code,
                    otaConfirmationNo: `${ch.code.slice(0, 4)}-${Math.floor(100000 + Math.random() * 900000)}`,
                });
                created.push({
                    confirmation: res.confirmationNumber, guest: `${who.firstName} ${who.lastName}`,
                    checkIn: (0, dayjs_1.default)(res.checkIn).format('YYYY-MM-DD'), checkOut: (0, dayjs_1.default)(res.checkOut).format('YYYY-MM-DD'),
                    total: Number(res.totalAmount),
                });
            }
            catch {
                await this.prisma.guest.delete({ where: { id: guest.id } }).catch(() => undefined);
            }
        }
        await this.prisma.channel.update({ where: { id: ch.id }, data: { lastSyncAt: new Date() } });
        await this.log(propertyId, ch.id, 'PULL', `Pulled ${created.length} reservation(s) from ${ch.name}`, created.length);
        return { channel: ch.name, pulled: created.length, reservations: created };
    }
    async syncLog(propertyId) {
        const logs = await this.prisma.channelSyncLog.findMany({
            where: { propertyId }, orderBy: { createdAt: 'desc' }, take: 20,
            include: { channel: { select: { name: true } } },
        });
        return logs.map((l) => ({
            id: l.id, direction: l.direction, summary: l.summary, count: l.count,
            createdAt: l.createdAt, channel: l.channel.name,
        }));
    }
};
exports.ChannelsService = ChannelsService;
exports.ChannelsService = ChannelsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        reservations_service_1.ReservationsService])
], ChannelsService);
//# sourceMappingURL=channels.service.js.map
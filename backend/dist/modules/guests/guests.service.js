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
Object.defineProperty(exports, "__esModule", { value: true });
exports.GuestsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const pagination_dto_1 = require("../../common/dto/pagination.dto");
const json_fields_1 = require("../../prisma/json-fields");
let GuestsService = class GuestsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(propertyId, query) {
        const where = {
            propertyId,
            ...(query.search && {
                OR: [
                    { firstName: { contains: query.search } },
                    { lastName: { contains: query.search } },
                    { email: { contains: query.search } },
                    { phone: { contains: query.search } },
                ],
            }),
        };
        const [data, total] = await Promise.all([
            this.prisma.guest.findMany({
                where, include: { preferences: true },
                skip: query.skip, take: query.limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.guest.count({ where }),
        ]);
        return (0, pagination_dto_1.paginate)(data, total, query.page ?? 1, query.limit ?? 20);
    }
    async segments(propertyId) {
        const [total, vip, platinum, gold, returning, highValue] = await Promise.all([
            this.prisma.guest.count({ where: { propertyId } }),
            this.prisma.guest.count({ where: { propertyId, isVip: true } }),
            this.prisma.guest.count({ where: { propertyId, loyaltyTier: 'PLATINUM' } }),
            this.prisma.guest.count({ where: { propertyId, loyaltyTier: 'GOLD' } }),
            this.prisma.guest.count({ where: { propertyId, totalStays: { gt: 1 } } }),
            this.prisma.guest.count({ where: { propertyId, lifetimeValue: { gte: 500000 } } }),
        ]);
        return {
            total,
            segments: [
                { key: 'vip', label: 'VIP Guests', count: vip, description: 'Flagged VIP — priority service' },
                { key: 'platinum', label: 'Platinum Tier', count: platinum, description: 'Top loyalty tier' },
                { key: 'gold', label: 'Gold Tier', count: gold, description: 'High loyalty tier' },
                { key: 'returning', label: 'Returning Guests', count: returning, description: 'More than one stay' },
                { key: 'highvalue', label: 'High Value', count: highValue, description: 'Lifetime value ≥ ₹5L' },
            ],
        };
    }
    async findOne(id, propertyId) {
        const guest = await this.prisma.guest.findFirst({
            where: { id, propertyId },
            include: {
                preferences: true,
                reservations: {
                    orderBy: { checkIn: 'desc' },
                    take: 10,
                    include: { roomType: true, ratePlan: true },
                },
                loyaltyTxns: { orderBy: { createdAt: 'desc' }, take: 20 },
            },
        });
        if (!guest)
            throw new common_1.NotFoundException('Guest not found');
        return guest;
    }
    async create(propertyId, dto) {
        const { tags, ...rest } = dto;
        return this.prisma.guest.create({
            data: { ...rest, propertyId, tags: (0, json_fields_1.toJsonString)(tags) },
            include: { preferences: true },
        });
    }
    async update(id, propertyId, dto) {
        await this.findOne(id, propertyId);
        const { tags, ...rest } = dto;
        return this.prisma.guest.update({
            where: { id },
            data: { ...rest, ...(tags !== undefined && { tags: (0, json_fields_1.toJsonString)(tags) }) },
            include: { preferences: true },
        });
    }
    async upsertPreferences(guestId, propertyId, dto) {
        await this.findOne(guestId, propertyId);
        const { dietaryRestrictions, noDisturbance: _drop, ...rest } = dto;
        const data = {
            ...rest,
            ...(dietaryRestrictions !== undefined && { dietaryRestrictions: (0, json_fields_1.toJsonString)(dietaryRestrictions) }),
        };
        return this.prisma.guestPreference.upsert({
            where: { guestId },
            create: { guestId, ...data },
            update: { ...data },
        });
    }
    async addLoyaltyPoints(guestId, points, description, referenceId) {
        const [txn] = await this.prisma.$transaction([
            this.prisma.loyaltyTransaction.create({
                data: { guestId, points, type: points > 0 ? 'EARN' : 'REDEEM', description, referenceId },
            }),
            this.prisma.guest.update({
                where: { id: guestId },
                data: { loyaltyPoints: { increment: points } },
            }),
        ]);
        return txn;
    }
};
exports.GuestsService = GuestsService;
exports.GuestsService = GuestsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GuestsService);
//# sourceMappingURL=guests.service.js.map
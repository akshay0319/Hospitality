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
exports.GuestsService = exports.CreateCampaignDto = exports.GenerateCampaignDto = void 0;
const common_1 = require("@nestjs/common");
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const openai_1 = __importDefault(require("openai"));
const dayjs_1 = __importDefault(require("dayjs"));
const prisma_service_1 = require("../../prisma/prisma.service");
const pagination_dto_1 = require("../../common/dto/pagination.dto");
const json_fields_1 = require("../../prisma/json-fields");
class GenerateCampaignDto {
}
exports.GenerateCampaignDto = GenerateCampaignDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GenerateCampaignDto.prototype, "segment", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GenerateCampaignDto.prototype, "goal", void 0);
class CreateCampaignDto {
}
exports.CreateCampaignDto = CreateCampaignDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    __metadata("design:type", String)
], CreateCampaignDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCampaignDto.prototype, "segment", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCampaignDto.prototype, "subject", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    __metadata("design:type", String)
], CreateCampaignDto.prototype, "body", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateCampaignDto.prototype, "audienceCount", void 0);
let GuestsService = class GuestsService {
    constructor(prisma) {
        this.prisma = prisma;
        const key = process.env.OPENAI_API_KEY?.trim();
        this.aiModel = process.env.AI_MODEL?.trim() || 'gpt-4o-mini';
        this.ai = key ? new openai_1.default({ apiKey: key }) : null;
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
    scoreGuest(g) {
        const ltv = Number(g.lifetimeValue);
        const avgStay = g.totalStays > 0 ? ltv / g.totalStays : 0;
        const last = g.lastStayAt ?? (g.totalStays > 0 ? g.createdAt : null);
        const daysSince = last ? (0, dayjs_1.default)().diff((0, dayjs_1.default)(last), 'day') : null;
        const tierBoost = g.isVip || g.loyaltyTier === 'PLATINUM' ? 1.5 : g.loyaltyTier === 'GOLD' ? 1.25 : 1;
        let churnRisk;
        let churnReason;
        let expectedFutureStays;
        if (g.totalStays === 0) {
            churnRisk = 'NEW';
            churnReason = 'No completed stays yet';
            expectedFutureStays = 0.5;
        }
        else if (daysSince === null) {
            churnRisk = 'LOW';
            churnReason = 'Recently added';
            expectedFutureStays = 2;
        }
        else if (daysSince > 180) {
            churnRisk = 'HIGH';
            churnReason = `${daysSince} days since last stay`;
            expectedFutureStays = 0.5;
        }
        else if (daysSince > 90) {
            churnRisk = 'MEDIUM';
            churnReason = `${daysSince} days since last stay`;
            expectedFutureStays = 1.5;
        }
        else {
            churnRisk = 'LOW';
            churnReason = `Stayed ${daysSince} days ago`;
            expectedFutureStays = 3;
        }
        const ltvProjection = Math.round(ltv + avgStay * expectedFutureStays * tierBoost);
        return { daysSince, churnRisk, churnReason, ltvProjection };
    }
    async insights(propertyId) {
        const guests = await this.prisma.guest.findMany({ where: { propertyId }, orderBy: { lifetimeValue: 'desc' } });
        const scored = guests.map((g) => ({
            id: g.id,
            name: `${g.firstName} ${g.lastName}`,
            email: g.email,
            tier: g.loyaltyTier,
            isVip: g.isVip,
            totalStays: g.totalStays,
            lifetimeValue: Number(g.lifetimeValue),
            lastStayAt: g.lastStayAt,
            ...this.scoreGuest(g),
        }));
        const by = (r) => scored.filter((s) => s.churnRisk === r).length;
        return {
            summary: {
                total: scored.length,
                high: by('HIGH'), medium: by('MEDIUM'), low: by('LOW'), new: by('NEW'),
                currentLtv: scored.reduce((s, x) => s + x.lifetimeValue, 0),
                projectedLtv: scored.reduce((s, x) => s + x.ltvProjection, 0),
            },
            atRisk: scored.filter((s) => s.churnRisk === 'HIGH').sort((a, b) => b.lifetimeValue - a.lifetimeValue).slice(0, 8),
            topValue: scored.slice(0, 8),
        };
    }
    async generateCampaign(propertyId, dto) {
        const { segments } = await this.segments(propertyId);
        const seg = segments.find((s) => s.key === dto.segment);
        const audienceCount = seg?.count ?? 0;
        const property = await this.prisma.property.findFirst({ where: { id: propertyId }, select: { name: true, city: true } });
        const label = seg?.label ?? 'valued';
        const goal = dto.goal?.trim() || 'win the guest back with a direct-booking offer';
        if (!this.ai) {
            return {
                subject: `A special offer for our ${label} guests`,
                body: `Dear guest,\n\nWe'd love to welcome you back to ${property?.name ?? 'our hotel'}. As one of our ${label.toLowerCase()} guests, enjoy an exclusive rate on your next stay when you book directly with us.\n\nWarm regards,\nThe ${property?.name ?? 'Hotel'} Team`,
                audienceCount,
                live: false,
            };
        }
        const prompt = `Write a short marketing email for ${property?.name} (a hotel in ${property?.city}). ` +
            `Audience: "${seg?.label}" — ${seg?.description}. Goal: ${goal}. ` +
            `Return strict JSON {"subject": string, "body": string}. ` +
            `Body 60-110 words, warm and specific, one clear call-to-action to book direct. ` +
            `Do NOT use placeholders like [Name] or [Hotel] — write finished copy.`;
        const resp = await this.ai.chat.completions.create({
            model: this.aiModel,
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
            response_format: { type: 'json_object' },
        });
        let parsed = {};
        try {
            parsed = JSON.parse(resp.choices[0].message.content || '{}');
        }
        catch { }
        return { subject: parsed.subject ?? '', body: parsed.body ?? '', audienceCount, live: true };
    }
    async createCampaign(propertyId, dto) {
        return this.prisma.campaign.create({
            data: {
                propertyId,
                name: dto.name,
                segment: dto.segment,
                subject: dto.subject ?? null,
                body: dto.body,
                audienceCount: dto.audienceCount ?? 0,
            },
        });
    }
    async listCampaigns(propertyId) {
        return this.prisma.campaign.findMany({ where: { propertyId }, orderBy: { createdAt: 'desc' }, take: 50 });
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
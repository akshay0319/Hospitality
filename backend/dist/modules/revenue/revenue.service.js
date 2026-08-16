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
var RevenueService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RevenueService = exports.BulkRateDto = exports.SetRateDto = exports.CreateRatePlanDto = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
const dayjs_1 = __importDefault(require("dayjs"));
class CreateRatePlanDto {
}
exports.CreateRatePlanDto = CreateRatePlanDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateRatePlanDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateRatePlanDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: client_1.RatePlanType }),
    (0, class_validator_1.IsEnum)(client_1.RatePlanType),
    __metadata("design:type", String)
], CreateRatePlanDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateRatePlanDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateRatePlanDto.prototype, "minStay", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateRatePlanDto.prototype, "maxStay", void 0);
class SetRateDto {
}
exports.SetRateDto = SetRateDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SetRateDto.prototype, "roomTypeId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], SetRateDto.prototype, "date", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], SetRateDto.prototype, "ratePerNight", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], SetRateDto.prototype, "isLocked", void 0);
class BulkRateDto {
}
exports.BulkRateDto = BulkRateDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BulkRateDto.prototype, "roomTypeId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], BulkRateDto.prototype, "startDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], BulkRateDto.prototype, "endDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], BulkRateDto.prototype, "ratePerNight", void 0);
let RevenueService = RevenueService_1 = class RevenueService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(RevenueService_1.name);
    }
    async findRatePlans(propertyId) {
        return this.prisma.ratePlan.findMany({
            where: { propertyId, isActive: true },
            orderBy: { name: 'asc' },
        });
    }
    async createRatePlan(propertyId, dto) {
        return this.prisma.ratePlan.create({ data: { ...dto, propertyId } });
    }
    async getRateGrid(propertyId, startDate, endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const [ratePlans, roomTypes, rateItems] = await Promise.all([
            this.prisma.ratePlan.findMany({ where: { propertyId, isActive: true } }),
            this.prisma.roomType.findMany({ where: { propertyId, isActive: true } }),
            this.prisma.ratePlanItem.findMany({
                where: {
                    ratePlan: { propertyId },
                    date: { gte: start, lte: end },
                },
                include: {
                    ratePlan: { select: { id: true, name: true, code: true } },
                    roomType: { select: { id: true, name: true, code: true } },
                },
            }),
        ]);
        return { ratePlans, roomTypes, rateItems };
    }
    async setRate(propertyId, ratePlanId, dto) {
        const ratePlan = await this.prisma.ratePlan.findFirst({ where: { id: ratePlanId, propertyId } });
        if (!ratePlan)
            throw new common_1.NotFoundException('Rate plan not found');
        return this.prisma.ratePlanItem.upsert({
            where: {
                ratePlanId_roomTypeId_date: {
                    ratePlanId,
                    roomTypeId: dto.roomTypeId,
                    date: new Date(dto.date),
                },
            },
            create: {
                ratePlanId,
                roomTypeId: dto.roomTypeId,
                date: new Date(dto.date),
                ratePerNight: dto.ratePerNight,
                isLocked: dto.isLocked ?? false,
            },
            update: {
                ratePerNight: dto.ratePerNight,
                ...(dto.isLocked !== undefined && { isLocked: dto.isLocked }),
            },
        });
    }
    async setBulkRates(propertyId, ratePlanId, dto) {
        const ratePlan = await this.prisma.ratePlan.findFirst({ where: { id: ratePlanId, propertyId } });
        if (!ratePlan)
            throw new common_1.NotFoundException('Rate plan not found');
        const dates = [];
        let current = (0, dayjs_1.default)(dto.startDate);
        const end = (0, dayjs_1.default)(dto.endDate);
        while (current.isBefore(end) || current.isSame(end, 'day')) {
            dates.push(current.toDate());
            current = current.add(1, 'day');
        }
        await this.prisma.$transaction(dates.map((date) => this.prisma.ratePlanItem.upsert({
            where: { ratePlanId_roomTypeId_date: { ratePlanId, roomTypeId: dto.roomTypeId, date } },
            create: { ratePlanId, roomTypeId: dto.roomTypeId, date, ratePerNight: dto.ratePerNight },
            update: { ratePerNight: dto.ratePerNight },
        })));
        return { updated: dates.length, startDate: dto.startDate, endDate: dto.endDate };
    }
    async getAIRecommendations(propertyId) {
        const today = (0, dayjs_1.default)().startOf('day');
        const next30Days = today.add(30, 'day').toDate();
        const roomTypes = await this.prisma.roomType.findMany({ where: { propertyId, isActive: true } });
        const recommendations = await Promise.all(roomTypes.map(async (rt) => {
            const dates = [];
            for (let i = 1; i <= 14; i++) {
                const date = today.add(i, 'day');
                const dateVal = date.toDate();
                const [booked, currentRate] = await Promise.all([
                    this.prisma.reservation.count({
                        where: {
                            propertyId, roomTypeId: rt.id,
                            status: { in: [client_1.ReservationStatus.CONFIRMED, client_1.ReservationStatus.CHECKED_IN] },
                            checkIn: { lte: dateVal }, checkOut: { gt: dateVal },
                        },
                    }),
                    this.prisma.ratePlanItem.findFirst({
                        where: { roomTypeId: rt.id, date: dateVal },
                        orderBy: { createdAt: 'desc' },
                    }),
                ]);
                const occupancyPct = rt.totalCount > 0 ? (booked / rt.totalCount) * 100 : 0;
                const baseRate = Number(currentRate?.ratePerNight ?? rt.baseRate);
                let multiplier = 1.0;
                if (occupancyPct > 85)
                    multiplier = 1.20;
                else if (occupancyPct > 70)
                    multiplier = 1.10;
                else if (occupancyPct < 40)
                    multiplier = 0.88;
                else if (occupancyPct < 25)
                    multiplier = 0.80;
                const isWeekend = [5, 6].includes(date.day());
                if (isWeekend)
                    multiplier *= 1.08;
                const recommended = Math.round(baseRate * multiplier / 100) * 100;
                const variance = recommended - baseRate;
                dates.push({
                    date: date.format('YYYY-MM-DD'),
                    roomTypeId: rt.id,
                    roomTypeName: rt.name,
                    currentRate: baseRate,
                    recommendedRate: recommended,
                    variance,
                    variancePercent: Number(((variance / baseRate) * 100).toFixed(1)),
                    occupancyPct: Number(occupancyPct.toFixed(1)),
                    demandScore: Math.round(occupancyPct),
                    isLocked: currentRate?.isLocked ?? false,
                });
            }
            return dates;
        }));
        return recommendations.flat().sort((a, b) => a.date.localeCompare(b.date));
    }
    async acceptRecommendation(propertyId, ratePlanId, roomTypeId, date, rate) {
        return this.setRate(propertyId, ratePlanId, { roomTypeId, date, ratePerNight: rate });
    }
    async runAutopilot(propertyId, trigger = 'MANUAL') {
        const recs = await this.getAIRecommendations(propertyId);
        const plan = (await this.prisma.ratePlan.findFirst({ where: { propertyId, type: 'BAR' } })) ??
            (await this.prisma.ratePlan.findFirst({ where: { propertyId } }));
        if (!plan)
            return { applied: 0, skippedLocked: 0, skippedSmall: 0, total: 0, summary: 'No rate plan configured' };
        let applied = 0, skippedLocked = 0, skippedSmall = 0;
        for (const r of recs) {
            if (r.isLocked) {
                skippedLocked++;
                continue;
            }
            if (Math.abs(r.variancePercent) < 3) {
                skippedSmall++;
                continue;
            }
            const clamped = Math.max(r.currentRate * 0.8, Math.min(r.currentRate * 1.2, r.recommendedRate));
            await this.setRate(propertyId, plan.id, {
                roomTypeId: r.roomTypeId, date: r.date, ratePerNight: Math.round(clamped / 100) * 100,
            });
            applied++;
        }
        const summary = `Applied ${applied} rate change(s) within ±20% guardrails; skipped ${skippedLocked} locked, ${skippedSmall} minor.`;
        await this.prisma.autopilotRun.create({ data: { propertyId, applied, skipped: skippedLocked + skippedSmall, trigger: trigger, summary } });
        await this.prisma.autopilotConfig.upsert({
            where: { propertyId },
            create: { propertyId, enabled: trigger === 'SCHEDULED', lastRunAt: new Date() },
            update: { lastRunAt: new Date() },
        });
        return { applied, skippedLocked, skippedSmall, total: recs.length, summary };
    }
    async getAutopilotStatus(propertyId) {
        const [config, runs] = await Promise.all([
            this.prisma.autopilotConfig.findUnique({ where: { propertyId } }),
            this.prisma.autopilotRun.findMany({ where: { propertyId }, orderBy: { createdAt: 'desc' }, take: 10 }),
        ]);
        return { enabled: config?.enabled ?? false, lastRunAt: config?.lastRunAt ?? null, runs };
    }
    async toggleAutopilot(propertyId, enabled) {
        const c = await this.prisma.autopilotConfig.upsert({
            where: { propertyId }, create: { propertyId, enabled }, update: { enabled },
        });
        return { enabled: c.enabled };
    }
    async runScheduledAutopilot() {
        const configs = await this.prisma.autopilotConfig.findMany({ where: { enabled: true } });
        for (const c of configs) {
            try {
                await this.runAutopilot(c.propertyId, 'SCHEDULED');
            }
            catch (e) {
                this.logger.error(`Autopilot failed for ${c.propertyId}: ${e.message}`);
            }
        }
        return configs.length;
    }
    async nightlyAutopilot() {
        const n = await this.runScheduledAutopilot();
        if (n)
            this.logger.log(`Nightly autopilot ran for ${n} property(ies)`);
    }
    async getForecast(propertyId, days = 14) {
        const property = await this.prisma.property.findUnique({ where: { id: propertyId }, select: { totalRooms: true } });
        const total = property?.totalRooms || 1;
        const out = [];
        for (let i = 0; i < days; i++) {
            const d = (0, dayjs_1.default)().add(i, 'day');
            const date = new Date(d.format('YYYY-MM-DD'));
            const onBooks = await this.prisma.reservation.count({
                where: {
                    propertyId,
                    status: { in: [client_1.ReservationStatus.CONFIRMED, client_1.ReservationStatus.CHECKED_IN] },
                    checkIn: { lte: date }, checkOut: { gt: date },
                },
            });
            const weekendLift = [5, 6].includes(d.day()) ? 15 : 0;
            const paceAssumption = 25;
            const occupancy = Math.min(100, Math.round((onBooks / total) * 100) + paceAssumption + weekendLift);
            out.push({ day: d.format('MMM D'), occupancy, onBooks });
        }
        return out;
    }
};
exports.RevenueService = RevenueService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_2AM),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RevenueService.prototype, "nightlyAutopilot", null);
exports.RevenueService = RevenueService = RevenueService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RevenueService);
//# sourceMappingURL=revenue.service.js.map
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
exports.GroupsService = exports.CreateGroupDto = exports.GroupBlockDto = void 0;
const common_1 = require("@nestjs/common");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
const dayjs_1 = __importDefault(require("dayjs"));
const prisma_service_1 = require("../../prisma/prisma.service");
const reservations_service_1 = require("../reservations/reservations.service");
class GroupBlockDto {
}
exports.GroupBlockDto = GroupBlockDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GroupBlockDto.prototype, "roomTypeId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], GroupBlockDto.prototype, "quantity", void 0);
class CreateGroupDto {
}
exports.CreateGroupDto = CreateGroupDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    __metadata("design:type", String)
], CreateGroupDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    __metadata("design:type", String)
], CreateGroupDto.prototype, "contactName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], CreateGroupDto.prototype, "contactEmail", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateGroupDto.prototype, "contactPhone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateGroupDto.prototype, "checkIn", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateGroupDto.prototype, "checkOut", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateGroupDto.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [GroupBlockDto] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => GroupBlockDto),
    __metadata("design:type", Array)
], CreateGroupDto.prototype, "blocks", void 0);
let GroupsService = class GroupsService {
    constructor(prisma, reservations) {
        this.prisma = prisma;
        this.reservations = reservations;
    }
    dateOnly(d) {
        return new Date((0, dayjs_1.default)(d).format('YYYY-MM-DD'));
    }
    async create(propertyId, dto) {
        if (!dto.blocks?.length)
            throw new common_1.BadRequestException('At least one room block is required');
        const ratePlan = (await this.prisma.ratePlan.findFirst({ where: { propertyId, type: 'BAR', isActive: true } })) ??
            (await this.prisma.ratePlan.findFirst({ where: { propertyId, isActive: true } }));
        if (!ratePlan)
            throw new common_1.BadRequestException('No rate plan configured');
        const [firstName, ...rest] = dto.contactName.trim().split(' ');
        const lastName = rest.join(' ') || '(Group)';
        const email = dto.contactEmail?.toLowerCase();
        const guest = (email && (await this.prisma.guest.findFirst({ where: { propertyId, email } }))) ||
            (await this.prisma.guest.create({ data: { propertyId, firstName, lastName, email: email ?? null, phone: dto.contactPhone ?? null } }));
        const group = await this.prisma.group.create({
            data: {
                propertyId, name: dto.name, contactName: dto.contactName,
                contactEmail: email ?? null, contactPhone: dto.contactPhone ?? null,
                checkIn: this.dateOnly(dto.checkIn), checkOut: this.dateOnly(dto.checkOut),
                notes: dto.notes ?? null, status: 'CONFIRMED',
            },
        });
        let roomsCreated = 0, roomsFailed = 0;
        for (const block of dto.blocks) {
            for (let i = 0; i < block.quantity; i++) {
                try {
                    const res = await this.reservations.create(propertyId, {
                        guestId: guest.id, roomTypeId: block.roomTypeId, ratePlanId: ratePlan.id,
                        checkIn: dto.checkIn, checkOut: dto.checkOut, adults: 2, children: 0, channel: 'DIRECT',
                    });
                    await this.prisma.reservation.update({ where: { id: res.id }, data: { groupId: group.id } });
                    roomsCreated++;
                }
                catch {
                    roomsFailed++;
                }
            }
        }
        return { group, roomsCreated, roomsFailed };
    }
    async list(propertyId) {
        const groups = await this.prisma.group.findMany({
            where: { propertyId }, orderBy: { createdAt: 'desc' },
            include: { reservations: { select: { totalAmount: true, status: true } } },
        });
        return groups.map((g) => {
            const active = g.reservations.filter((r) => r.status !== 'CANCELLED');
            return {
                id: g.id, name: g.name, contactName: g.contactName, contactEmail: g.contactEmail,
                checkIn: g.checkIn, checkOut: g.checkOut, status: g.status,
                rooms: g.reservations.length, activeRooms: active.length,
                totalValue: active.reduce((s, r) => s + Number(r.totalAmount), 0),
            };
        });
    }
    async findOne(id, propertyId) {
        const group = await this.prisma.group.findFirst({
            where: { id, propertyId },
            include: {
                reservations: {
                    orderBy: { createdAt: 'asc' },
                    include: {
                        guest: { select: { firstName: true, lastName: true } },
                        room: { select: { number: true } },
                        roomType: { select: { name: true } },
                    },
                },
            },
        });
        if (!group)
            throw new common_1.NotFoundException('Group not found');
        return {
            ...group,
            reservations: group.reservations.map((r) => ({
                id: r.id, confirmationNumber: r.confirmationNumber, roomType: r.roomType?.name,
                room: r.room?.number ?? null, status: r.status, total: Number(r.totalAmount),
            })),
        };
    }
    async cancel(id, propertyId) {
        const group = await this.prisma.group.findFirst({ where: { id, propertyId }, include: { reservations: true } });
        if (!group)
            throw new common_1.NotFoundException('Group not found');
        let cancelled = 0;
        for (const r of group.reservations) {
            if (r.status === 'CONFIRMED') {
                try {
                    await this.reservations.cancel(r.id, propertyId, `Group cancellation — ${group.name}`);
                    cancelled++;
                }
                catch { }
            }
        }
        await this.prisma.group.update({ where: { id }, data: { status: 'CANCELLED' } });
        return { cancelled };
    }
};
exports.GroupsService = GroupsService;
exports.GroupsService = GroupsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        reservations_service_1.ReservationsService])
], GroupsService);
//# sourceMappingURL=groups.service.js.map
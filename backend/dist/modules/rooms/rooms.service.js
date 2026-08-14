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
exports.RoomsService = exports.UpdateRoomStatusDto = exports.CreateRoomDto = void 0;
const common_1 = require("@nestjs/common");
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
const json_fields_1 = require("../../prisma/json-fields");
class CreateRoomDto {
}
exports.CreateRoomDto = CreateRoomDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateRoomDto.prototype, "number", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateRoomDto.prototype, "roomTypeId", void 0);
class UpdateRoomStatusDto {
}
exports.UpdateRoomStatusDto = UpdateRoomStatusDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: client_1.RoomStatus }),
    (0, class_validator_1.IsEnum)(client_1.RoomStatus),
    __metadata("design:type", String)
], UpdateRoomStatusDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateRoomStatusDto.prototype, "isBlocked", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateRoomStatusDto.prototype, "blockReason", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdateRoomStatusDto.prototype, "blockedUntil", void 0);
let RoomsService = class RoomsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(propertyId, status, roomTypeId) {
        return this.prisma.room.findMany({
            where: {
                propertyId,
                ...(status && { status: status }),
                ...(roomTypeId && { roomTypeId }),
            },
            include: { roomType: { select: { id: true, name: true, code: true } } },
            orderBy: [{ floor: 'asc' }, { number: 'asc' }],
        });
    }
    async block(id, propertyId, reason, until) {
        await this.findOne(id, propertyId);
        return this.prisma.room.update({
            where: { id },
            data: {
                isBlocked: true,
                status: client_1.RoomStatus.BLOCKED,
                blockReason: reason,
                blockedUntil: until ? new Date(until) : null,
            },
            include: { roomType: { select: { id: true, name: true, code: true } } },
        });
    }
    async unblock(id, propertyId) {
        await this.findOne(id, propertyId);
        return this.prisma.room.update({
            where: { id },
            data: { isBlocked: false, status: client_1.RoomStatus.CLEAN, blockReason: null, blockedUntil: null },
            include: { roomType: { select: { id: true, name: true, code: true } } },
        });
    }
    async findOne(id, propertyId) {
        const room = await this.prisma.room.findFirst({
            where: { id, propertyId },
            include: { roomType: true },
        });
        if (!room)
            throw new common_1.NotFoundException('Room not found');
        return room;
    }
    async create(propertyId, dto) {
        const exists = await this.prisma.room.findFirst({ where: { propertyId, number: dto.number } });
        if (exists)
            throw new common_1.BadRequestException(`Room ${dto.number} already exists`);
        const { features, ...rest } = dto;
        return this.prisma.room.create({ data: { ...rest, propertyId, features: (0, json_fields_1.toJsonString)(features) } });
    }
    async updateStatus(id, propertyId, dto) {
        await this.findOne(id, propertyId);
        return this.prisma.room.update({
            where: { id },
            data: {
                status: dto.status,
                ...(dto.isBlocked !== undefined && { isBlocked: dto.isBlocked }),
                ...(dto.blockReason !== undefined && { blockReason: dto.blockReason }),
                ...(dto.blockedUntil && { blockedUntil: new Date(dto.blockedUntil) }),
            },
        });
    }
    async getInventoryCalendar(propertyId, startDate, endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const [rooms, reservations] = await Promise.all([
            this.prisma.room.findMany({
                where: { propertyId },
                include: { roomType: { select: { name: true, code: true } } },
                orderBy: [{ floor: 'asc' }, { number: 'asc' }],
            }),
            this.prisma.reservation.findMany({
                where: {
                    propertyId,
                    roomId: { not: null },
                    status: { in: ['CONFIRMED', 'CHECKED_IN'] },
                    checkIn: { lt: end },
                    checkOut: { gt: start },
                },
                include: {
                    guest: { select: { firstName: true, lastName: true } },
                },
            }),
        ]);
        return { rooms, reservations };
    }
};
exports.RoomsService = RoomsService;
exports.RoomsService = RoomsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RoomsService);
//# sourceMappingURL=rooms.service.js.map
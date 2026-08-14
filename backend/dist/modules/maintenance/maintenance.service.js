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
exports.MaintenanceService = exports.UpdateMaintenanceStatusDto = exports.CreateMaintenanceDto = void 0;
const common_1 = require("@nestjs/common");
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
class CreateMaintenanceDto {
}
exports.CreateMaintenanceDto = CreateMaintenanceDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    __metadata("design:type", String)
], CreateMaintenanceDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    __metadata("design:type", String)
], CreateMaintenanceDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: client_1.MaintenancePriority }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.MaintenancePriority),
    __metadata("design:type", String)
], CreateMaintenanceDto.prototype, "priority", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMaintenanceDto.prototype, "roomId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMaintenanceDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMaintenanceDto.prototype, "assignedToId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateMaintenanceDto.prototype, "estimatedCost", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateMaintenanceDto.prototype, "dueDate", void 0);
class UpdateMaintenanceStatusDto {
}
exports.UpdateMaintenanceStatusDto = UpdateMaintenanceStatusDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: client_1.MaintenanceStatus }),
    (0, class_validator_1.IsEnum)(client_1.MaintenanceStatus),
    __metadata("design:type", String)
], UpdateMaintenanceStatusDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateMaintenanceStatusDto.prototype, "actualCost", void 0);
let MaintenanceService = class MaintenanceService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(propertyId, status, priority) {
        return this.prisma.maintenanceTicket.findMany({
            where: {
                propertyId,
                ...(status && { status: status }),
                ...(priority && { priority: priority }),
            },
            include: {
                room: { select: { number: true, floor: true } },
                assignedTo: { select: { firstName: true, lastName: true } },
            },
            orderBy: [{ createdAt: 'desc' }],
        });
    }
    async findOne(id, propertyId) {
        const ticket = await this.prisma.maintenanceTicket.findFirst({
            where: { id, propertyId },
            include: {
                room: { select: { number: true, floor: true } },
                assignedTo: { select: { firstName: true, lastName: true } },
            },
        });
        if (!ticket)
            throw new common_1.NotFoundException('Maintenance ticket not found');
        return ticket;
    }
    async create(propertyId, reportedById, dto) {
        return this.prisma.maintenanceTicket.create({
            data: {
                propertyId,
                reportedById,
                title: dto.title,
                description: dto.description,
                priority: dto.priority ?? 'NORMAL',
                roomId: dto.roomId ?? null,
                category: dto.category ?? null,
                assignedToId: dto.assignedToId ?? null,
                estimatedCost: dto.estimatedCost ?? null,
                dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
            },
            include: {
                room: { select: { number: true, floor: true } },
                assignedTo: { select: { firstName: true, lastName: true } },
            },
        });
    }
    async updateStatus(id, propertyId, dto) {
        await this.findOne(id, propertyId);
        const isResolved = dto.status === 'RESOLVED' || dto.status === 'CLOSED';
        return this.prisma.maintenanceTicket.update({
            where: { id },
            data: {
                status: dto.status,
                ...(dto.actualCost !== undefined && { actualCost: dto.actualCost }),
                ...(isResolved ? { resolvedAt: new Date() } : { resolvedAt: null }),
            },
            include: {
                room: { select: { number: true, floor: true } },
                assignedTo: { select: { firstName: true, lastName: true } },
            },
        });
    }
    async assign(id, propertyId, assignedToId) {
        await this.findOne(id, propertyId);
        return this.prisma.maintenanceTicket.update({
            where: { id },
            data: { assignedToId, status: 'IN_PROGRESS' },
            include: {
                room: { select: { number: true, floor: true } },
                assignedTo: { select: { firstName: true, lastName: true } },
            },
        });
    }
    async getDashboard(propertyId) {
        const [open, inProgress, onHold, resolved, critical, byCategory] = await Promise.all([
            this.prisma.maintenanceTicket.count({ where: { propertyId, status: 'OPEN' } }),
            this.prisma.maintenanceTicket.count({ where: { propertyId, status: 'IN_PROGRESS' } }),
            this.prisma.maintenanceTicket.count({ where: { propertyId, status: 'ON_HOLD' } }),
            this.prisma.maintenanceTicket.count({ where: { propertyId, status: { in: ['RESOLVED', 'CLOSED'] } } }),
            this.prisma.maintenanceTicket.count({ where: { propertyId, priority: 'CRITICAL', status: { notIn: ['RESOLVED', 'CLOSED'] } } }),
            this.prisma.maintenanceTicket.groupBy({
                by: ['category'],
                where: { propertyId, status: { notIn: ['RESOLVED', 'CLOSED'] } },
                _count: { id: true },
            }),
        ]);
        return {
            open,
            inProgress,
            onHold,
            resolved,
            critical,
            byCategory: byCategory.map((c) => ({
                category: c.category ?? 'Uncategorized',
                count: c._count.id,
            })),
        };
    }
};
exports.MaintenanceService = MaintenanceService;
exports.MaintenanceService = MaintenanceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MaintenanceService);
//# sourceMappingURL=maintenance.service.js.map
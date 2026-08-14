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
exports.PropertiesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let PropertiesService = class PropertiesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(tenantId) {
        return this.prisma.property.findMany({
            where: { tenantId, isActive: true },
            include: { _count: { select: { rooms: true, reservations: true } } },
            orderBy: { name: 'asc' },
        });
    }
    async findOne(id, tenantId) {
        const property = await this.prisma.property.findFirst({
            where: { id, tenantId },
            include: {
                roomTypes: { orderBy: { sortOrder: 'asc' } },
                _count: { select: { rooms: true, guests: true, reservations: true } },
            },
        });
        if (!property)
            throw new common_1.NotFoundException('Property not found');
        return property;
    }
    async create(tenantId, dto) {
        return this.prisma.property.create({ data: { ...dto, tenantId } });
    }
    async update(id, tenantId, dto) {
        await this.findOne(id, tenantId);
        return this.prisma.property.update({ where: { id }, data: dto });
    }
    async findRoomTypes(propertyId) {
        return this.prisma.roomType.findMany({
            where: { propertyId, isActive: true },
            include: { _count: { select: { rooms: true } } },
            orderBy: { sortOrder: 'asc' },
        });
    }
    async createRoomType(propertyId, dto) {
        return this.prisma.roomType.create({ data: { ...dto, propertyId, baseRate: dto.baseRate } });
    }
    async updateRoomType(id, propertyId, dto) {
        return this.prisma.roomType.update({ where: { id }, data: { ...dto } });
    }
};
exports.PropertiesService = PropertiesService;
exports.PropertiesService = PropertiesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PropertiesService);
//# sourceMappingURL=properties.service.js.map
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const bcrypt = __importStar(require("bcrypt"));
const prisma_service_1 = require("../../prisma/prisma.service");
const pagination_dto_1 = require("../../common/dto/pagination.dto");
const USER_SELECT = {
    id: true, email: true, firstName: true, lastName: true,
    phone: true, role: true, department: true, isActive: true,
    avatarUrl: true, lastLoginAt: true, propertyId: true, tenantId: true,
    createdAt: true, updatedAt: true,
};
let UsersService = class UsersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(tenantId, query) {
        const where = {
            tenantId,
            ...(query.search && {
                OR: [
                    { firstName: { contains: query.search } },
                    { lastName: { contains: query.search } },
                    { email: { contains: query.search } },
                ],
            }),
        };
        const [data, total] = await Promise.all([
            this.prisma.user.findMany({
                where, select: USER_SELECT,
                skip: query.skip, take: query.limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.user.count({ where }),
        ]);
        return (0, pagination_dto_1.paginate)(data, total, query.page ?? 1, query.limit ?? 20);
    }
    async findOne(id, tenantId) {
        const user = await this.prisma.user.findFirst({ where: { id, tenantId }, select: USER_SELECT });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        return user;
    }
    async create(tenantId, dto) {
        const exists = await this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase() } });
        if (exists)
            throw new common_1.ConflictException('Email already in use');
        const password = await bcrypt.hash(dto.password, 12);
        return this.prisma.user.create({
            data: { ...dto, email: dto.email.toLowerCase(), password, tenantId },
            select: USER_SELECT,
        });
    }
    async update(id, tenantId, dto) {
        await this.findOne(id, tenantId);
        const data = { ...dto };
        if (dto.password)
            data.password = await bcrypt.hash(dto.password, 12);
        return this.prisma.user.update({ where: { id }, data, select: USER_SELECT });
    }
    async deactivate(id, tenantId) {
        await this.findOne(id, tenantId);
        return this.prisma.user.update({ where: { id }, data: { isActive: false }, select: USER_SELECT });
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map
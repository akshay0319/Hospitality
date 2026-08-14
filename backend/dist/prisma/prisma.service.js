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
var PrismaService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const json_fields_1 = require("./json-fields");
let PrismaService = PrismaService_1 = class PrismaService extends client_1.PrismaClient {
    constructor() {
        super({
            log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
        });
        this.logger = new common_1.Logger(PrismaService_1.name);
        this.$use(async (params, next) => {
            const result = await next(params);
            return (0, json_fields_1.parseJsonFields)(params.model, result);
        });
    }
    async onModuleInit() {
        await this.$connect();
        this.logger.log('Database connected');
    }
    async onModuleDestroy() {
        await this.$disconnect();
        this.logger.log('Database disconnected');
    }
    async cleanDatabase() {
        if (process.env.NODE_ENV === 'production') {
            throw new Error('cleanDatabase is not allowed in production');
        }
        const rows = await this.$queryRaw `
      SELECT TABLE_NAME FROM information_schema.tables
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_TYPE = 'BASE TABLE'
    `;
        await this.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 0;');
        for (const { TABLE_NAME } of rows) {
            await this.$executeRawUnsafe(`TRUNCATE TABLE \`${TABLE_NAME}\`;`);
        }
        await this.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 1;');
    }
};
exports.PrismaService = PrismaService;
exports.PrismaService = PrismaService = PrismaService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], PrismaService);
//# sourceMappingURL=prisma.service.js.map
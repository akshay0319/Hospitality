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
exports.AuditInterceptor = void 0;
const common_1 = require("@nestjs/common");
const operators_1 = require("rxjs/operators");
const prisma_service_1 = require("../../prisma/prisma.service");
let AuditInterceptor = class AuditInterceptor {
    constructor(prisma) {
        this.prisma = prisma;
    }
    intercept(context, next) {
        const request = context.switchToHttp().getRequest();
        const { method, url, user, ip, headers } = request;
        const writeMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
        if (!writeMethods.includes(method) || !user) {
            return next.handle();
        }
        return next.handle().pipe((0, operators_1.tap)(async (data) => {
            try {
                const entity = url.split('/')[3] ?? 'unknown';
                await this.prisma.auditLog.create({
                    data: {
                        propertyId: user.propertyId ?? user.tenantId,
                        userId: user.id,
                        action: method,
                        entity,
                        entityId: data?.id,
                        afterState: data != null ? JSON.stringify(data) : null,
                        ipAddress: ip,
                        userAgent: headers['user-agent'],
                    },
                });
            }
            catch {
            }
        }));
    }
};
exports.AuditInterceptor = AuditInterceptor;
exports.AuditInterceptor = AuditInterceptor = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AuditInterceptor);
//# sourceMappingURL=audit.interceptor.js.map
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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HousekeepingController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const passport_1 = require("@nestjs/passport");
const housekeeping_service_1 = require("./housekeeping.service");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let HousekeepingController = class HousekeepingController {
    constructor(hkService) {
        this.hkService = hkService;
    }
    getDashboard(propertyId) {
        return this.hkService.getDashboard(propertyId);
    }
    runOptimizer(propertyId) {
        return this.hkService.runAIOptimizer(propertyId);
    }
    acceptAIPlan(propertyId) {
        return this.hkService.acceptAIPlan(propertyId);
    }
    findAll(propertyId, date) {
        return this.hkService.findAll(propertyId, date);
    }
    create(propertyId, dto) {
        return this.hkService.create(propertyId, dto);
    }
    updateStatus(id, propertyId, dto) {
        return this.hkService.updateStatus(id, propertyId, dto);
    }
    assign(id, propertyId, body) {
        return this.hkService.assign(id, propertyId, body.assignedToId);
    }
};
exports.HousekeepingController = HousekeepingController;
__decorate([
    (0, common_1.Get)('dashboard'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('propertyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], HousekeepingController.prototype, "getDashboard", null);
__decorate([
    (0, common_1.Get)('ai-optimize'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('propertyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], HousekeepingController.prototype, "runOptimizer", null);
__decorate([
    (0, common_1.Post)('accept-ai-plan'),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('propertyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], HousekeepingController.prototype, "acceptAIPlan", null);
__decorate([
    (0, common_1.Get)(),
    openapi.ApiResponse({ status: 200, type: [Object] }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('propertyId')),
    __param(1, (0, common_1.Query)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], HousekeepingController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)(),
    openapi.ApiResponse({ status: 201, type: Object }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('propertyId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, housekeeping_service_1.CreateTaskDto]),
    __metadata("design:returntype", void 0)
], HousekeepingController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('propertyId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, housekeeping_service_1.UpdateTaskStatusDto]),
    __metadata("design:returntype", void 0)
], HousekeepingController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Patch)(':id/assign'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('propertyId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], HousekeepingController.prototype, "assign", null);
exports.HousekeepingController = HousekeepingController = __decorate([
    (0, swagger_1.ApiTags)('Housekeeping'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Controller)('housekeeping'),
    __metadata("design:paramtypes", [housekeeping_service_1.HousekeepingService])
], HousekeepingController);
//# sourceMappingURL=housekeeping.controller.js.map
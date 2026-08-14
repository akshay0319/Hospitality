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
exports.RevenueController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const passport_1 = require("@nestjs/passport");
const revenue_service_1 = require("./revenue.service");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let RevenueController = class RevenueController {
    constructor(revenueService) {
        this.revenueService = revenueService;
    }
    findRatePlans(propertyId) {
        return this.revenueService.findRatePlans(propertyId);
    }
    createRatePlan(propertyId, dto) {
        return this.revenueService.createRatePlan(propertyId, dto);
    }
    getRateGrid(propertyId, startDate, endDate) {
        return this.revenueService.getRateGrid(propertyId, startDate, endDate);
    }
    setRate(ratePlanId, propertyId, dto) {
        return this.revenueService.setRate(propertyId, ratePlanId, dto);
    }
    setBulkRates(ratePlanId, propertyId, dto) {
        return this.revenueService.setBulkRates(propertyId, ratePlanId, dto);
    }
    getAIRecommendations(propertyId) {
        return this.revenueService.getAIRecommendations(propertyId);
    }
    runAutopilot(propertyId) {
        return this.revenueService.runAutopilot(propertyId);
    }
    getForecast(propertyId, days) {
        return this.revenueService.getForecast(propertyId, days ? parseInt(days) : 14);
    }
    acceptRecommendation(propertyId, body) {
        return this.revenueService.acceptRecommendation(propertyId, body.ratePlanId, body.roomTypeId, body.date, body.rate);
    }
};
exports.RevenueController = RevenueController;
__decorate([
    (0, common_1.Get)('rate-plans'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('propertyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RevenueController.prototype, "findRatePlans", null);
__decorate([
    (0, common_1.Post)('rate-plans'),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('propertyId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, revenue_service_1.CreateRatePlanDto]),
    __metadata("design:returntype", void 0)
], RevenueController.prototype, "createRatePlan", null);
__decorate([
    (0, common_1.Get)('rate-grid'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('propertyId')),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], RevenueController.prototype, "getRateGrid", null);
__decorate([
    (0, common_1.Patch)('rate-plans/:id/rates'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('propertyId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, revenue_service_1.SetRateDto]),
    __metadata("design:returntype", void 0)
], RevenueController.prototype, "setRate", null);
__decorate([
    (0, common_1.Patch)('rate-plans/:id/bulk-rates'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('propertyId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, revenue_service_1.BulkRateDto]),
    __metadata("design:returntype", void 0)
], RevenueController.prototype, "setBulkRates", null);
__decorate([
    (0, common_1.Get)('ai-recommendations'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('propertyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RevenueController.prototype, "getAIRecommendations", null);
__decorate([
    (0, common_1.Post)('autopilot'),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('propertyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RevenueController.prototype, "runAutopilot", null);
__decorate([
    (0, common_1.Get)('forecast'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('propertyId')),
    __param(1, (0, common_1.Query)('days')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], RevenueController.prototype, "getForecast", null);
__decorate([
    (0, common_1.Post)('ai-recommendations/accept'),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('propertyId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], RevenueController.prototype, "acceptRecommendation", null);
exports.RevenueController = RevenueController = __decorate([
    (0, swagger_1.ApiTags)('Revenue'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Controller)('revenue'),
    __metadata("design:paramtypes", [revenue_service_1.RevenueService])
], RevenueController);
//# sourceMappingURL=revenue.controller.js.map
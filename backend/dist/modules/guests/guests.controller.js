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
exports.GuestsController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const passport_1 = require("@nestjs/passport");
const guests_service_1 = require("./guests.service");
const guest_dto_1 = require("./dto/guest.dto");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const pagination_dto_1 = require("../../common/dto/pagination.dto");
let GuestsController = class GuestsController {
    constructor(guestsService) {
        this.guestsService = guestsService;
    }
    findAll(propertyId, query) {
        return this.guestsService.findAll(propertyId, query);
    }
    segments(propertyId) {
        return this.guestsService.segments(propertyId);
    }
    findOne(id, propertyId) {
        return this.guestsService.findOne(id, propertyId);
    }
    create(propertyId, dto) {
        return this.guestsService.create(propertyId, dto);
    }
    update(id, propertyId, dto) {
        return this.guestsService.update(id, propertyId, dto);
    }
    upsertPreferences(id, propertyId, dto) {
        return this.guestsService.upsertPreferences(id, propertyId, dto);
    }
};
exports.GuestsController = GuestsController;
__decorate([
    (0, common_1.Get)(),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('propertyId')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, pagination_dto_1.PaginationDto]),
    __metadata("design:returntype", void 0)
], GuestsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('segments'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('propertyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], GuestsController.prototype, "segments", null);
__decorate([
    (0, common_1.Get)(':id'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('propertyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], GuestsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    openapi.ApiResponse({ status: 201, type: Object }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('propertyId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, guest_dto_1.CreateGuestDto]),
    __metadata("design:returntype", void 0)
], GuestsController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('propertyId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, guest_dto_1.UpdateGuestDto]),
    __metadata("design:returntype", void 0)
], GuestsController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/preferences'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('propertyId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, guest_dto_1.GuestPreferenceDto]),
    __metadata("design:returntype", void 0)
], GuestsController.prototype, "upsertPreferences", null);
exports.GuestsController = GuestsController = __decorate([
    (0, swagger_1.ApiTags)('Guests'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Controller)('guests'),
    __metadata("design:paramtypes", [guests_service_1.GuestsService])
], GuestsController);
//# sourceMappingURL=guests.controller.js.map
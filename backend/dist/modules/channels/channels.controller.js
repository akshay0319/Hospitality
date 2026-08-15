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
exports.ChannelsController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const passport_1 = require("@nestjs/passport");
const channels_service_1 = require("./channels.service");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let ChannelsController = class ChannelsController {
    constructor(channels) {
        this.channels = channels;
    }
    list(propertyId) {
        return this.channels.list(propertyId);
    }
    syncLog(propertyId) {
        return this.channels.syncLog(propertyId);
    }
    connect(id, propertyId) {
        return this.channels.setConnected(propertyId, id, true);
    }
    disconnect(id, propertyId) {
        return this.channels.setConnected(propertyId, id, false);
    }
    push(id, propertyId) {
        return this.channels.push(propertyId, id);
    }
    pull(id, propertyId) {
        return this.channels.pull(propertyId, id);
    }
};
exports.ChannelsController = ChannelsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List OTA channels + parity + sync summary' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('propertyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ChannelsController.prototype, "list", null);
__decorate([
    (0, common_1.Get)('sync-log'),
    (0, swagger_1.ApiOperation)({ summary: 'Recent channel sync activity' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('propertyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ChannelsController.prototype, "syncLog", null);
__decorate([
    (0, common_1.Post)(':id/connect'),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('propertyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ChannelsController.prototype, "connect", null);
__decorate([
    (0, common_1.Post)(':id/disconnect'),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('propertyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ChannelsController.prototype, "disconnect", null);
__decorate([
    (0, common_1.Post)(':id/push'),
    (0, swagger_1.ApiOperation)({ summary: 'Push rates & availability to the channel (mock)' }),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('propertyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ChannelsController.prototype, "push", null);
__decorate([
    (0, common_1.Post)(':id/pull'),
    (0, swagger_1.ApiOperation)({ summary: 'Pull reservations from the channel — lands real bookings in the PMS (mock)' }),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('propertyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ChannelsController.prototype, "pull", null);
exports.ChannelsController = ChannelsController = __decorate([
    (0, swagger_1.ApiTags)('Channel Manager'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Controller)('channels'),
    __metadata("design:paramtypes", [channels_service_1.ChannelsService])
], ChannelsController);
//# sourceMappingURL=channels.controller.js.map
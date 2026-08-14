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
exports.ContextController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const passport_1 = require("@nestjs/passport");
const context_service_1 = require("./context.service");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let ContextController = class ContextController {
    constructor(service) {
        this.service = service;
    }
    getSnapshot(propertyId) {
        return this.service.getSnapshot(propertyId);
    }
};
exports.ContextController = ContextController;
__decorate([
    (0, common_1.Get)('snapshot'),
    (0, swagger_1.ApiOperation)({ summary: 'Unified live snapshot of the property (AI grounding data)' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('propertyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ContextController.prototype, "getSnapshot", null);
exports.ContextController = ContextController = __decorate([
    (0, swagger_1.ApiTags)('Context'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Controller)('context'),
    __metadata("design:paramtypes", [context_service_1.ContextService])
], ContextController);
//# sourceMappingURL=context.controller.js.map
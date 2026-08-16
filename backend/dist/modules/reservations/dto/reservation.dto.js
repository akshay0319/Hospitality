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
exports.ReservationFilterDto = exports.AvailabilityQueryDto = exports.CheckOutDto = exports.CheckInDto = exports.UpdateReservationDto = exports.CreateReservationDto = exports.CreateReservationExtraDto = exports.UpdateCancellationPolicyDto = void 0;
const openapi = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
class UpdateCancellationPolicyDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { name: { required: false, type: () => String }, freeCancellationHours: { required: false, type: () => Number, minimum: 0 }, penaltyType: { required: false, type: () => Object }, penaltyValue: { required: false, type: () => Number, minimum: 0 } };
    }
}
exports.UpdateCancellationPolicyDto = UpdateCancellationPolicyDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateCancellationPolicyDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdateCancellationPolicyDto.prototype, "freeCancellationHours", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: client_1.CancellationPenaltyType }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.CancellationPenaltyType),
    __metadata("design:type", String)
], UpdateCancellationPolicyDto.prototype, "penaltyType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdateCancellationPolicyDto.prototype, "penaltyValue", void 0);
class CreateReservationExtraDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { name: { required: true, type: () => String }, description: { required: false, type: () => String }, price: { required: true, type: () => Number }, quantity: { required: true, type: () => Number, minimum: 1 } };
    }
}
exports.CreateReservationExtraDto = CreateReservationExtraDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateReservationExtraDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateReservationExtraDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateReservationExtraDto.prototype, "price", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateReservationExtraDto.prototype, "quantity", void 0);
class CreateReservationDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { guestId: { required: true, type: () => String }, roomTypeId: { required: true, type: () => String }, ratePlanId: { required: true, type: () => String }, roomId: { required: false, type: () => String }, checkIn: { required: true, type: () => String }, checkOut: { required: true, type: () => String }, adults: { required: true, type: () => Number, minimum: 1 }, children: { required: false, type: () => Number, minimum: 0 }, specialRequests: { required: false, type: () => String }, channel: { required: false, type: () => Object }, otaConfirmationNo: { required: false, type: () => String }, extras: { required: false, type: () => [require("./reservation.dto").CreateReservationExtraDto] } };
    }
}
exports.CreateReservationDto = CreateReservationDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateReservationDto.prototype, "guestId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateReservationDto.prototype, "roomTypeId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateReservationDto.prototype, "ratePlanId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateReservationDto.prototype, "roomId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateReservationDto.prototype, "checkIn", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateReservationDto.prototype, "checkOut", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateReservationDto.prototype, "adults", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateReservationDto.prototype, "children", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateReservationDto.prototype, "specialRequests", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.BookingChannel),
    __metadata("design:type", String)
], CreateReservationDto.prototype, "channel", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateReservationDto.prototype, "otaConfirmationNo", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [CreateReservationExtraDto] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => CreateReservationExtraDto),
    __metadata("design:type", Array)
], CreateReservationDto.prototype, "extras", void 0);
class UpdateReservationDto extends (0, swagger_1.PartialType)(CreateReservationDto) {
    static _OPENAPI_METADATA_FACTORY() {
        return {};
    }
}
exports.UpdateReservationDto = UpdateReservationDto;
class CheckInDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { roomId: { required: false, type: () => String }, idDocumentUrl: { required: false, type: () => String } };
    }
}
exports.CheckInDto = CheckInDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CheckInDto.prototype, "roomId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CheckInDto.prototype, "idDocumentUrl", void 0);
class CheckOutDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { notes: { required: false, type: () => String } };
    }
}
exports.CheckOutDto = CheckOutDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CheckOutDto.prototype, "notes", void 0);
class AvailabilityQueryDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { checkIn: { required: true, type: () => String }, checkOut: { required: true, type: () => String }, adults: { required: false, type: () => Number, minimum: 1 }, children: { required: false, type: () => Number, minimum: 0 } };
    }
}
exports.AvailabilityQueryDto = AvailabilityQueryDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], AvailabilityQueryDto.prototype, "checkIn", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], AvailabilityQueryDto.prototype, "checkOut", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], AvailabilityQueryDto.prototype, "adults", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], AvailabilityQueryDto.prototype, "children", void 0);
class ReservationFilterDto {
    get skip() { return ((this.page ?? 1) - 1) * (this.limit ?? 20); }
    static _OPENAPI_METADATA_FACTORY() {
        return { status: { required: false, type: () => Object }, checkInFrom: { required: false, type: () => String }, checkInTo: { required: false, type: () => String }, channel: { required: false, type: () => Object }, search: { required: false, type: () => String }, page: { required: false, type: () => Number }, limit: { required: false, type: () => Number } };
    }
}
exports.ReservationFilterDto = ReservationFilterDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.ReservationStatus),
    __metadata("design:type", String)
], ReservationFilterDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], ReservationFilterDto.prototype, "checkInFrom", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], ReservationFilterDto.prototype, "checkInTo", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.BookingChannel),
    __metadata("design:type", String)
], ReservationFilterDto.prototype, "channel", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReservationFilterDto.prototype, "search", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], ReservationFilterDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], ReservationFilterDto.prototype, "limit", void 0);
//# sourceMappingURL=reservation.dto.js.map
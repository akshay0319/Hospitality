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
exports.BookingController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const booking_service_1 = require("./booking.service");
let BookingController = class BookingController {
    constructor(booking) {
        this.booking = booking;
    }
    property(propertyId) {
        return this.booking.getProperty(propertyId);
    }
    availability(propertyId, checkIn, checkOut, adults) {
        return this.booking.availability(propertyId, checkIn, checkOut, adults ? parseInt(adults) : 2);
    }
    promo(propertyId, code, roomTypeId, checkIn, checkOut) {
        return this.booking.previewPromo(propertyId, code, roomTypeId, checkIn, checkOut);
    }
    order(propertyId, dto) {
        return this.booking.createOrder(propertyId, dto);
    }
    book(propertyId, dto) {
        return this.booking.book(propertyId, dto);
    }
    getReservation(propertyId, confirmationNumber, email) {
        return this.booking.getReservation(propertyId, confirmationNumber, email);
    }
    cancelQuote(propertyId, confirmationNumber, email) {
        return this.booking.cancelQuote(propertyId, confirmationNumber, email);
    }
    cancelReservation(propertyId, confirmationNumber, dto) {
        return this.booking.cancelReservation(propertyId, confirmationNumber, dto.email, dto.reason);
    }
};
exports.BookingController = BookingController;
__decorate([
    (0, common_1.Get)(':propertyId/property'),
    (0, swagger_1.ApiOperation)({ summary: 'Public property info for the booking widget' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('propertyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BookingController.prototype, "property", null);
__decorate([
    (0, common_1.Get)(':propertyId/availability'),
    (0, swagger_1.ApiOperation)({ summary: 'Public availability + rates for dates' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('propertyId')),
    __param(1, (0, common_1.Query)('checkIn')),
    __param(2, (0, common_1.Query)('checkOut')),
    __param(3, (0, common_1.Query)('adults')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", void 0)
], BookingController.prototype, "availability", null);
__decorate([
    (0, common_1.Get)(':propertyId/promo'),
    (0, swagger_1.ApiOperation)({ summary: 'Validate a promo code and preview the discount' }),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, common_1.Param)('propertyId')),
    __param(1, (0, common_1.Query)('code')),
    __param(2, (0, common_1.Query)('roomTypeId')),
    __param(3, (0, common_1.Query)('checkIn')),
    __param(4, (0, common_1.Query)('checkOut')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], BookingController.prototype, "promo", null);
__decorate([
    (0, common_1.Post)(':propertyId/payment/order'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a Razorpay order (or signal mock mode) for the given stay' }),
    openapi.ApiResponse({ status: 201, type: Object }),
    __param(0, (0, common_1.Param)('propertyId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, booking_service_1.OrderDto]),
    __metadata("design:returntype", void 0)
], BookingController.prototype, "order", null);
__decorate([
    (0, common_1.Post)(':propertyId/book'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a direct booking (verifies Razorpay signature when live)' }),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, common_1.Param)('propertyId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, booking_service_1.BookDto]),
    __metadata("design:returntype", void 0)
], BookingController.prototype, "book", null);
__decorate([
    (0, common_1.Get)(':propertyId/reservation/:confirmationNumber'),
    (0, swagger_1.ApiOperation)({ summary: 'Guest self-service — look up a booking by confirmation number + email' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('propertyId')),
    __param(1, (0, common_1.Param)('confirmationNumber')),
    __param(2, (0, common_1.Query)('email')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], BookingController.prototype, "getReservation", null);
__decorate([
    (0, common_1.Get)(':propertyId/reservation/:confirmationNumber/cancel-quote'),
    (0, swagger_1.ApiOperation)({ summary: 'Guest self-service — preview refund/penalty before cancelling' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('propertyId')),
    __param(1, (0, common_1.Param)('confirmationNumber')),
    __param(2, (0, common_1.Query)('email')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], BookingController.prototype, "cancelQuote", null);
__decorate([
    (0, common_1.Post)(':propertyId/reservation/:confirmationNumber/cancel'),
    (0, swagger_1.ApiOperation)({ summary: 'Guest self-service — cancel a booking (email-guarded)' }),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, common_1.Param)('propertyId')),
    __param(1, (0, common_1.Param)('confirmationNumber')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, booking_service_1.CancelBookingDto]),
    __metadata("design:returntype", void 0)
], BookingController.prototype, "cancelReservation", null);
exports.BookingController = BookingController = __decorate([
    (0, swagger_1.ApiTags)('Booking Engine (public)'),
    (0, common_1.Controller)('booking'),
    __metadata("design:paramtypes", [booking_service_1.BookingService])
], BookingController);
//# sourceMappingURL=booking.controller.js.map
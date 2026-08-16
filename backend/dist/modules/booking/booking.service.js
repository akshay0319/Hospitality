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
exports.BookingService = exports.OrderDto = exports.CancelBookingDto = exports.BookDto = void 0;
const common_1 = require("@nestjs/common");
const class_validator_1 = require("class-validator");
const crypto = __importStar(require("crypto"));
const swagger_1 = require("@nestjs/swagger");
const prisma_service_1 = require("../../prisma/prisma.service");
const reservations_service_1 = require("../reservations/reservations.service");
class BookDto {
}
exports.BookDto = BookDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BookDto.prototype, "roomTypeId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], BookDto.prototype, "checkIn", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], BookDto.prototype, "checkOut", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], BookDto.prototype, "adults", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], BookDto.prototype, "children", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    __metadata("design:type", String)
], BookDto.prototype, "firstName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    __metadata("design:type", String)
], BookDto.prototype, "lastName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], BookDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BookDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BookDto.prototype, "specialRequests", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], BookDto.prototype, "addons", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BookDto.prototype, "promoCode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BookDto.prototype, "paymentToken", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BookDto.prototype, "razorpayOrderId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BookDto.prototype, "razorpayPaymentId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BookDto.prototype, "razorpaySignature", void 0);
class CancelBookingDto {
}
exports.CancelBookingDto = CancelBookingDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], CancelBookingDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CancelBookingDto.prototype, "reason", void 0);
class OrderDto {
}
exports.OrderDto = OrderDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], OrderDto.prototype, "roomTypeId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], OrderDto.prototype, "checkIn", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], OrderDto.prototype, "checkOut", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], OrderDto.prototype, "addons", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], OrderDto.prototype, "promoCode", void 0);
let BookingService = class BookingService {
    constructor(prisma, reservations) {
        this.prisma = prisma;
        this.reservations = reservations;
    }
    async property(propertyId) {
        const p = await this.prisma.property.findFirst({
            where: { id: propertyId, isActive: true },
            select: { id: true, name: true, brand: true, city: true, state: true, country: true, starRating: true, currency: true, checkInTime: true, checkOutTime: true },
        });
        if (!p)
            throw new common_1.NotFoundException('Property not found');
        return p;
    }
    async getProperty(propertyId) {
        const p = await this.property(propertyId);
        return { ...p, paymentLive: !!this.rzpKeys };
    }
    get rzpKeys() {
        const keyId = process.env.RAZORPAY_KEY_ID?.trim();
        const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();
        return keyId && keySecret ? { keyId, keySecret } : null;
    }
    async quoteAmount(propertyId, dto) {
        const rt = await this.prisma.roomType.findFirst({ where: { id: dto.roomTypeId, propertyId }, select: { baseRate: true } });
        if (!rt)
            throw new common_1.BadRequestException('Room type not found');
        const subtotal = Number(rt.baseRate) * this.nights(dto.checkIn, dto.checkOut);
        const addonsTotal = (dto.addons ?? []).filter((a) => a && a.price > 0).reduce((s, a) => s + a.price * (a.quantity || 1), 0);
        let discount = 0;
        if (dto.promoCode) {
            const promo = await this.findPromo(propertyId, dto.promoCode);
            if (!promo)
                throw new common_1.BadRequestException('Invalid or expired promo code');
            discount = this.discountFor(promo, subtotal);
        }
        return Math.max(0, subtotal * 1.18 + addonsTotal - discount);
    }
    async createOrder(propertyId, dto) {
        await this.property(propertyId);
        const amount = await this.quoteAmount(propertyId, dto);
        const keys = this.rzpKeys;
        if (!keys)
            return { mock: true, amount };
        const paise = Math.round(amount * 100);
        const auth = Buffer.from(`${keys.keyId}:${keys.keySecret}`).toString('base64');
        const resp = await fetch('https://api.razorpay.com/v1/orders', {
            method: 'POST',
            headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount: paise, currency: 'INR', receipt: `be_${propertyId.slice(0, 8)}` }),
        });
        if (!resp.ok)
            throw new common_1.BadRequestException('Payment initialisation failed');
        const order = (await resp.json());
        return { mock: false, orderId: order.id, amount: paise, keyId: keys.keyId, currency: 'INR' };
    }
    verifySignature(orderId, paymentId, signature, secret) {
        const expected = crypto.createHmac('sha256', secret).update(`${orderId}|${paymentId}`).digest('hex');
        if (expected.length !== signature.length)
            return false;
        return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
    }
    async availability(propertyId, checkIn, checkOut, adults) {
        await this.property(propertyId);
        return this.reservations.checkAvailability(propertyId, { checkIn, checkOut, adults });
    }
    nights(checkIn, checkOut) {
        return Math.max(0, Math.round((+new Date(checkOut) - +new Date(checkIn)) / 86400000));
    }
    async findPromo(propertyId, code) {
        if (!code)
            return null;
        return this.prisma.promoCode.findFirst({ where: { propertyId, code: code.trim().toUpperCase(), isActive: true } });
    }
    discountFor(promo, subtotal) {
        const v = Number(promo.discountValue);
        const raw = promo.discountType === 'PERCENT' ? (subtotal * v) / 100 : v;
        return Math.min(subtotal, Math.round(raw));
    }
    async previewPromo(propertyId, code, roomTypeId, checkIn, checkOut) {
        const promo = await this.findPromo(propertyId, code);
        if (!promo)
            return { valid: false };
        const rt = await this.prisma.roomType.findFirst({ where: { id: roomTypeId, propertyId }, select: { baseRate: true } });
        if (!rt)
            return { valid: false };
        const subtotal = Number(rt.baseRate) * this.nights(checkIn, checkOut);
        const discount = this.discountFor(promo, subtotal);
        const label = promo.discountType === 'PERCENT' ? `${Number(promo.discountValue)}% off` : `₹${Number(promo.discountValue)} off`;
        return { valid: true, code: promo.code, discount, label };
    }
    async book(propertyId, dto) {
        await this.property(propertyId);
        const keys = this.rzpKeys;
        if (keys) {
            const { razorpayOrderId: oid, razorpayPaymentId: pid, razorpaySignature: sig } = dto;
            if (!oid || !pid || !sig)
                throw new common_1.BadRequestException('Payment verification required');
            if (!this.verifySignature(oid, pid, sig, keys.keySecret))
                throw new common_1.BadRequestException('Payment signature verification failed');
        }
        const ratePlan = await this.prisma.ratePlan.findFirst({ where: { propertyId, type: 'BAR', isActive: true } })
            ?? await this.prisma.ratePlan.findFirst({ where: { propertyId, isActive: true } });
        if (!ratePlan)
            throw new common_1.BadRequestException('No rate plan configured');
        const email = dto.email.toLowerCase();
        const guest = await this.prisma.guest.findFirst({ where: { propertyId, email } })
            ?? await this.prisma.guest.create({
                data: { propertyId, firstName: dto.firstName, lastName: dto.lastName, email, phone: dto.phone ?? null },
            });
        const extras = (dto.addons ?? [])
            .filter((a) => a && a.price > 0)
            .map((a) => ({ name: a.name, price: a.price, quantity: a.quantity || 1 }));
        if (dto.promoCode) {
            const promo = await this.findPromo(propertyId, dto.promoCode);
            if (!promo)
                throw new common_1.BadRequestException('Invalid or expired promo code');
            const rt = await this.prisma.roomType.findFirst({ where: { id: dto.roomTypeId, propertyId }, select: { baseRate: true } });
            const subtotal = Number(rt?.baseRate ?? 0) * this.nights(dto.checkIn, dto.checkOut);
            const discount = this.discountFor(promo, subtotal);
            if (discount > 0)
                extras.push({ name: `Promo ${promo.code}`, price: -discount, quantity: 1 });
        }
        const res = await this.reservations.create(propertyId, {
            guestId: guest.id,
            roomTypeId: dto.roomTypeId,
            ratePlanId: ratePlan.id,
            checkIn: dto.checkIn,
            checkOut: dto.checkOut,
            adults: dto.adults,
            children: dto.children ?? 0,
            channel: 'DIRECT',
            specialRequests: dto.specialRequests,
            extras: extras.length ? extras : undefined,
        });
        await this.prisma.payment.create({
            data: {
                reservationId: res.id,
                amount: res.totalAmount,
                method: 'CARD',
                status: 'PAID',
                reference: dto.razorpayPaymentId ?? `BE-${dto.paymentToken ?? Math.random().toString(36).slice(2, 10).toUpperCase()}`,
                processedAt: new Date(),
                notes: keys ? 'Booking engine (Razorpay)' : 'Booking engine (mock gateway)',
            },
        });
        await this.prisma.reservation.update({
            where: { id: res.id },
            data: { paidAmount: res.totalAmount, balanceDue: 0 },
        });
        return {
            confirmationNumber: res.confirmationNumber,
            guest: `${guest.firstName} ${guest.lastName}`,
            checkIn: dto.checkIn,
            checkOut: dto.checkOut,
            nights: res.nights,
            total: Number(res.totalAmount),
            paid: true,
        };
    }
    async findGuarded(propertyId, confirmationNumber, email) {
        const res = await this.prisma.reservation.findFirst({
            where: { propertyId, confirmationNumber: confirmationNumber.trim() },
            include: { guest: true, roomType: true, room: true, extras: true },
        });
        if (!res || res.guest.email?.toLowerCase() !== email.trim().toLowerCase()) {
            throw new common_1.NotFoundException('Booking not found. Check the confirmation number and email.');
        }
        return res;
    }
    publicView(res) {
        return {
            confirmationNumber: res.confirmationNumber,
            status: res.status,
            guest: `${res.guest.firstName} ${res.guest.lastName}`,
            email: res.guest.email,
            roomType: res.roomType?.name ?? '—',
            room: res.room?.number ?? null,
            checkIn: dayjsDate(res.checkIn),
            checkOut: dayjsDate(res.checkOut),
            nights: res.nights,
            adults: res.adults,
            children: res.children,
            total: Number(res.totalAmount),
            paid: Number(res.paidAmount),
            balanceDue: Number(res.balanceDue),
            extras: (res.extras ?? []).map((e) => ({ name: e.name, price: Number(e.price), quantity: e.quantity })),
            cancellable: res.status === 'CONFIRMED',
        };
    }
    async getReservation(propertyId, confirmationNumber, email) {
        if (!email?.trim())
            throw new common_1.BadRequestException('Email is required');
        return this.publicView(await this.findGuarded(propertyId, confirmationNumber, email));
    }
    async cancelQuote(propertyId, confirmationNumber, email) {
        if (!email?.trim())
            throw new common_1.BadRequestException('Email is required');
        const res = await this.findGuarded(propertyId, confirmationNumber, email);
        return this.reservations.cancelQuote(res.id, propertyId);
    }
    async cancelReservation(propertyId, confirmationNumber, email, reason) {
        if (!email?.trim())
            throw new common_1.BadRequestException('Email is required');
        const res = await this.findGuarded(propertyId, confirmationNumber, email);
        await this.reservations.cancel(res.id, propertyId, reason?.trim() || 'Guest self-service cancellation');
        return this.publicView(await this.findGuarded(propertyId, confirmationNumber, email));
    }
};
exports.BookingService = BookingService;
exports.BookingService = BookingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        reservations_service_1.ReservationsService])
], BookingService);
function dayjsDate(d) {
    return new Date(d).toISOString().slice(0, 10);
}
//# sourceMappingURL=booking.service.js.map
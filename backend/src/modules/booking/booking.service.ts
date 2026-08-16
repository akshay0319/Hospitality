import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { IsString, IsEmail, IsOptional, IsInt, IsDateString, IsArray, Min, MinLength } from 'class-validator';
import * as crypto from 'crypto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PrismaService } from '@/prisma/prisma.service';
import { ReservationsService } from '@/modules/reservations/reservations.service';

export class BookDto {
  @ApiProperty() @IsString() roomTypeId: string;
  @ApiProperty() @IsDateString() checkIn: string;
  @ApiProperty() @IsDateString() checkOut: string;
  @ApiProperty() @IsInt() @Min(1) adults: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) children?: number;
  @ApiProperty() @IsString() @MinLength(1) firstName: string;
  @ApiProperty() @IsString() @MinLength(1) lastName: string;
  @ApiProperty() @IsEmail() email: string;
  @ApiPropertyOptional() @IsOptional() @IsString() phone?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() specialRequests?: string;
  @ApiPropertyOptional() @IsOptional() @IsArray() addons?: { name: string; price: number; quantity: number }[];
  @ApiPropertyOptional() @IsOptional() @IsString() promoCode?: string;
  // Mock gateway token (used only when Razorpay keys are absent).
  @ApiPropertyOptional() @IsOptional() @IsString() paymentToken?: string;
  // Razorpay checkout result — required (and signature-verified) when live keys are set.
  @ApiPropertyOptional() @IsOptional() @IsString() razorpayOrderId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() razorpayPaymentId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() razorpaySignature?: string;
}

// Guest self-service cancel — email guards the confirmation number.
export class CancelBookingDto {
  @ApiProperty() @IsEmail() email: string;
  @ApiPropertyOptional() @IsOptional() @IsString() reason?: string;
}

// Payment-order request — the pricing-relevant subset of a booking.
export class OrderDto {
  @ApiProperty() @IsString() roomTypeId: string;
  @ApiProperty() @IsDateString() checkIn: string;
  @ApiProperty() @IsDateString() checkOut: string;
  @ApiPropertyOptional() @IsOptional() @IsArray() addons?: { name: string; price: number; quantity: number }[];
  @ApiPropertyOptional() @IsOptional() @IsString() promoCode?: string;
}

@Injectable()
export class BookingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly reservations: ReservationsService,
  ) {}

  private async property(propertyId: string) {
    const p = await this.prisma.property.findFirst({
      where: { id: propertyId, isActive: true },
      select: { id: true, name: true, brand: true, city: true, state: true, country: true, starRating: true, currency: true, checkInTime: true, checkOutTime: true },
    });
    if (!p) throw new NotFoundException('Property not found');
    return p;
  }

  async getProperty(propertyId: string) {
    const p = await this.property(propertyId);
    return { ...p, paymentLive: !!this.rzpKeys };
  }

  // ── Payments (Razorpay, test-mode) ──────────────────────────────────────────
  // Live only when both keys are set; otherwise the mock gateway is used.
  private get rzpKeys() {
    const keyId = process.env.RAZORPAY_KEY_ID?.trim();
    const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();
    return keyId && keySecret ? { keyId, keySecret } : null;
  }

  /** Amount in rupees, mirroring reservations.create(): room×GST + addons − promo (addons/promo untaxed). */
  private async quoteAmount(propertyId: string, dto: OrderDto) {
    const rt = await this.prisma.roomType.findFirst({ where: { id: dto.roomTypeId, propertyId }, select: { baseRate: true } });
    if (!rt) throw new BadRequestException('Room type not found');
    const subtotal = Number(rt.baseRate) * this.nights(dto.checkIn, dto.checkOut);
    const addonsTotal = (dto.addons ?? []).filter((a) => a && a.price > 0).reduce((s, a) => s + a.price * (a.quantity || 1), 0);
    let discount = 0;
    if (dto.promoCode) {
      const promo = await this.findPromo(propertyId, dto.promoCode);
      if (!promo) throw new BadRequestException('Invalid or expired promo code');
      discount = this.discountFor(promo, subtotal);
    }
    return Math.max(0, subtotal * 1.18 + addonsTotal - discount);
  }

  async createOrder(propertyId: string, dto: OrderDto) {
    await this.property(propertyId);
    const amount = await this.quoteAmount(propertyId, dto);
    const keys = this.rzpKeys;
    if (!keys) return { mock: true as const, amount };

    const paise = Math.round(amount * 100);
    const auth = Buffer.from(`${keys.keyId}:${keys.keySecret}`).toString('base64');
    const resp = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: paise, currency: 'INR', receipt: `be_${propertyId.slice(0, 8)}` }),
    });
    if (!resp.ok) throw new BadRequestException('Payment initialisation failed');
    const order = (await resp.json()) as { id: string };
    return { mock: false as const, orderId: order.id, amount: paise, keyId: keys.keyId, currency: 'INR' };
  }

  /** HMAC-SHA256(order_id|payment_id) must equal the signature Razorpay returned. */
  private verifySignature(orderId: string, paymentId: string, signature: string, secret: string) {
    const expected = crypto.createHmac('sha256', secret).update(`${orderId}|${paymentId}`).digest('hex');
    if (expected.length !== signature.length) return false;
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  }

  async availability(propertyId: string, checkIn: string, checkOut: string, adults: number) {
    await this.property(propertyId);
    return this.reservations.checkAvailability(propertyId, { checkIn, checkOut, adults });
  }

  private nights(checkIn: string, checkOut: string) {
    return Math.max(0, Math.round((+new Date(checkOut) - +new Date(checkIn)) / 86400000));
  }

  private async findPromo(propertyId: string, code?: string) {
    if (!code) return null;
    return this.prisma.promoCode.findFirst({ where: { propertyId, code: code.trim().toUpperCase(), isActive: true } });
  }

  private discountFor(promo: { discountType: string; discountValue: unknown }, subtotal: number) {
    const v = Number(promo.discountValue);
    const raw = promo.discountType === 'PERCENT' ? (subtotal * v) / 100 : v;
    return Math.min(subtotal, Math.round(raw));
  }

  async previewPromo(propertyId: string, code: string, roomTypeId: string, checkIn: string, checkOut: string) {
    const promo = await this.findPromo(propertyId, code);
    if (!promo) return { valid: false as const };
    const rt = await this.prisma.roomType.findFirst({ where: { id: roomTypeId, propertyId }, select: { baseRate: true } });
    if (!rt) return { valid: false as const };
    const subtotal = Number(rt.baseRate) * this.nights(checkIn, checkOut);
    const discount = this.discountFor(promo, subtotal);
    const label = promo.discountType === 'PERCENT' ? `${Number(promo.discountValue)}% off` : `₹${Number(promo.discountValue)} off`;
    return { valid: true as const, code: promo.code, discount, label };
  }

  async book(propertyId: string, dto: BookDto) {
    await this.property(propertyId);

    // Live gateway → the payment must be signed by Razorpay before we hold the room.
    // ponytail: signature ties payment→order; no webhook/amount reconciliation (add for production capture).
    const keys = this.rzpKeys;
    if (keys) {
      const { razorpayOrderId: oid, razorpayPaymentId: pid, razorpaySignature: sig } = dto;
      if (!oid || !pid || !sig) throw new BadRequestException('Payment verification required');
      if (!this.verifySignature(oid, pid, sig, keys.keySecret)) throw new BadRequestException('Payment signature verification failed');
    }

    const ratePlan = await this.prisma.ratePlan.findFirst({ where: { propertyId, type: 'BAR', isActive: true } })
      ?? await this.prisma.ratePlan.findFirst({ where: { propertyId, isActive: true } });
    if (!ratePlan) throw new BadRequestException('No rate plan configured');

    // Find-or-create the guest by email within this property.
    const email = dto.email.toLowerCase();
    const guest = await this.prisma.guest.findFirst({ where: { propertyId, email } })
      ?? await this.prisma.guest.create({
        data: { propertyId, firstName: dto.firstName, lastName: dto.lastName, email, phone: dto.phone ?? null },
      });

    const extras = (dto.addons ?? [])
      .filter((a) => a && a.price > 0)
      .map((a) => ({ name: a.name, price: a.price, quantity: a.quantity || 1 }));

    // Promo code → discount line (negative extra flows through create()'s pricing).
    if (dto.promoCode) {
      const promo = await this.findPromo(propertyId, dto.promoCode);
      if (!promo) throw new BadRequestException('Invalid or expired promo code');
      const rt = await this.prisma.roomType.findFirst({ where: { id: dto.roomTypeId, propertyId }, select: { baseRate: true } });
      const subtotal = Number(rt?.baseRate ?? 0) * this.nights(dto.checkIn, dto.checkOut);
      const discount = this.discountFor(promo, subtotal);
      if (discount > 0) extras.push({ name: `Promo ${promo.code}`, price: -discount, quantity: 1 });
    }

    // Reuse the PMS create (availability re-check, GST, extras, confirmation number, etc.).
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

    // Records a PAID payment and settles the reservation (real ref if Razorpay, else mock).
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

  // ── Guest self-service (public, email-guarded) ──────────────────────────────

  // Look up by confirmation number, then require the guest's email to match —
  // stops booking-number guessing from exposing/mutating someone else's reservation.
  private async findGuarded(propertyId: string, confirmationNumber: string, email: string) {
    const res = await this.prisma.reservation.findFirst({
      where: { propertyId, confirmationNumber: confirmationNumber.trim() },
      include: { guest: true, roomType: true, room: true, extras: true },
    });
    if (!res || res.guest.email?.toLowerCase() !== email.trim().toLowerCase()) {
      throw new NotFoundException('Booking not found. Check the confirmation number and email.');
    }
    return res;
  }

  private publicView(res: Awaited<ReturnType<BookingService['findGuarded']>>) {
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

  async getReservation(propertyId: string, confirmationNumber: string, email: string) {
    if (!email?.trim()) throw new BadRequestException('Email is required');
    return this.publicView(await this.findGuarded(propertyId, confirmationNumber, email));
  }

  async cancelQuote(propertyId: string, confirmationNumber: string, email: string) {
    if (!email?.trim()) throw new BadRequestException('Email is required');
    const res = await this.findGuarded(propertyId, confirmationNumber, email);
    return this.reservations.cancelQuote(res.id, propertyId);
  }

  async cancelReservation(propertyId: string, confirmationNumber: string, email: string, reason?: string) {
    if (!email?.trim()) throw new BadRequestException('Email is required');
    const res = await this.findGuarded(propertyId, confirmationNumber, email);
    // reservations.cancel() enforces the state rules (no cancelling a checked-in/closed stay).
    await this.reservations.cancel(res.id, propertyId, reason?.trim() || 'Guest self-service cancellation');
    return this.publicView(await this.findGuarded(propertyId, confirmationNumber, email));
  }
}

// Serialize a Prisma @db.Date to a plain YYYY-MM-DD (avoids TZ shift on the wire).
function dayjsDate(d: Date): string {
  return new Date(d).toISOString().slice(0, 10);
}

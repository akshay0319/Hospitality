import { Controller, Get, Post, Param, Query, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { BookingService, BookDto, OrderDto, CancelBookingDto } from './booking.service';

// PUBLIC — no auth guard. This is the guest-facing direct booking engine.
@ApiTags('Booking Engine (public)')
@Controller('booking')
export class BookingController {
  constructor(private readonly booking: BookingService) {}

  @Get(':propertyId/property')
  @ApiOperation({ summary: 'Public property info for the booking widget' })
  property(@Param('propertyId') propertyId: string) {
    return this.booking.getProperty(propertyId);
  }

  @Get(':propertyId/availability')
  @ApiOperation({ summary: 'Public availability + rates for dates' })
  availability(
    @Param('propertyId') propertyId: string,
    @Query('checkIn') checkIn: string,
    @Query('checkOut') checkOut: string,
    @Query('adults') adults?: string,
  ) {
    return this.booking.availability(propertyId, checkIn, checkOut, adults ? parseInt(adults) : 2);
  }

  @Get(':propertyId/promo')
  @ApiOperation({ summary: 'Validate a promo code and preview the discount' })
  promo(
    @Param('propertyId') propertyId: string,
    @Query('code') code: string,
    @Query('roomTypeId') roomTypeId: string,
    @Query('checkIn') checkIn: string,
    @Query('checkOut') checkOut: string,
  ) {
    return this.booking.previewPromo(propertyId, code, roomTypeId, checkIn, checkOut);
  }

  @Post(':propertyId/payment/order')
  @ApiOperation({ summary: 'Create a Razorpay order (or signal mock mode) for the given stay' })
  order(@Param('propertyId') propertyId: string, @Body() dto: OrderDto) {
    return this.booking.createOrder(propertyId, dto);
  }

  @Post(':propertyId/book')
  @ApiOperation({ summary: 'Create a direct booking (verifies Razorpay signature when live)' })
  book(@Param('propertyId') propertyId: string, @Body() dto: BookDto) {
    return this.booking.book(propertyId, dto);
  }

  @Get(':propertyId/reservation/:confirmationNumber')
  @ApiOperation({ summary: 'Guest self-service — look up a booking by confirmation number + email' })
  getReservation(
    @Param('propertyId') propertyId: string,
    @Param('confirmationNumber') confirmationNumber: string,
    @Query('email') email: string,
  ) {
    return this.booking.getReservation(propertyId, confirmationNumber, email);
  }

  @Get(':propertyId/reservation/:confirmationNumber/cancel-quote')
  @ApiOperation({ summary: 'Guest self-service — preview refund/penalty before cancelling' })
  cancelQuote(
    @Param('propertyId') propertyId: string,
    @Param('confirmationNumber') confirmationNumber: string,
    @Query('email') email: string,
  ) {
    return this.booking.cancelQuote(propertyId, confirmationNumber, email);
  }

  @Post(':propertyId/reservation/:confirmationNumber/cancel')
  @ApiOperation({ summary: 'Guest self-service — cancel a booking (email-guarded)' })
  cancelReservation(
    @Param('propertyId') propertyId: string,
    @Param('confirmationNumber') confirmationNumber: string,
    @Body() dto: CancelBookingDto,
  ) {
    return this.booking.cancelReservation(propertyId, confirmationNumber, dto.email, dto.reason);
  }
}

import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ReservationsService } from './reservations.service';
import {
  CreateReservationDto, UpdateReservationDto,
  CheckInDto, CheckOutDto, AvailabilityQueryDto, ReservationFilterDto
} from './dto/reservation.dto';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

@ApiTags('Reservations')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Get('availability')
  @ApiOperation({ summary: 'Check room availability for dates' })
  checkAvailability(@CurrentUser('propertyId') propertyId: string, @Query() query: AvailabilityQueryDto) {
    return this.reservationsService.checkAvailability(propertyId, query);
  }

  @Get('today')
  @ApiOperation({ summary: "Get today's arrivals, departures, in-house summary" })
  getTodaySummary(@CurrentUser('propertyId') propertyId: string) {
    return this.reservationsService.getTodaySummary(propertyId);
  }

  @Get()
  @ApiOperation({ summary: 'List reservations with filters' })
  findAll(@CurrentUser('propertyId') propertyId: string, @Query() query: ReservationFilterDto) {
    return this.reservationsService.findAll(propertyId, query);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser('propertyId') propertyId: string) {
    return this.reservationsService.findOne(id, propertyId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new reservation' })
  create(@CurrentUser('propertyId') propertyId: string, @Body() dto: CreateReservationDto) {
    return this.reservationsService.create(propertyId, dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @CurrentUser('propertyId') propertyId: string, @Body() dto: UpdateReservationDto) {
    return this.reservationsService.update(id, propertyId, dto);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel a reservation' })
  cancel(@Param('id') id: string, @CurrentUser('propertyId') propertyId: string, @Body() body: { reason?: string }) {
    return this.reservationsService.cancel(id, propertyId, body.reason);
  }

  @Patch(':id/check-in')
  @ApiOperation({ summary: 'Check in a guest' })
  checkIn(@Param('id') id: string, @CurrentUser('propertyId') propertyId: string, @Body() dto: CheckInDto) {
    return this.reservationsService.checkIn(id, propertyId, dto);
  }

  @Patch(':id/check-out')
  @ApiOperation({ summary: 'Check out a guest' })
  checkOut(@Param('id') id: string, @CurrentUser('propertyId') propertyId: string, @Body() dto: CheckOutDto) {
    return this.reservationsService.checkOut(id, propertyId, dto);
  }
}

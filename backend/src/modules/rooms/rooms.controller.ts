import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RoomsService, UpdateRoomStatusDto } from './rooms.service';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

@ApiTags('Rooms')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Get()
  findAll(
    @CurrentUser('propertyId') propertyId: string,
    @Query('status') status?: string,
    @Query('roomTypeId') roomTypeId?: string,
  ) {
    return this.roomsService.findAll(propertyId, status, roomTypeId);
  }

  @Get('calendar')
  getCalendar(
    @CurrentUser('propertyId') propertyId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.roomsService.getInventoryCalendar(propertyId, startDate, endDate);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser('propertyId') propertyId: string) {
    return this.roomsService.findOne(id, propertyId);
  }

  @Post()
  create(@CurrentUser('propertyId') propertyId: string, @Body() dto: { number: string; roomTypeId: string; floor: number; features?: string[] }) {
    return this.roomsService.create(propertyId, dto);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @CurrentUser('propertyId') propertyId: string, @Body() dto: UpdateRoomStatusDto) {
    return this.roomsService.updateStatus(id, propertyId, dto);
  }

  @Patch(':id/block')
  block(@Param('id') id: string, @CurrentUser('propertyId') propertyId: string, @Body() body: { reason?: string; until?: string }) {
    return this.roomsService.block(id, propertyId, body.reason ?? 'Blocked by staff', body.until);
  }

  @Patch(':id/unblock')
  unblock(@Param('id') id: string, @CurrentUser('propertyId') propertyId: string) {
    return this.roomsService.unblock(id, propertyId);
  }
}

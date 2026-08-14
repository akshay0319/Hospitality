import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { MaintenanceService, CreateMaintenanceDto, UpdateMaintenanceStatusDto } from './maintenance.service';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

@ApiTags('Maintenance')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('maintenance')
export class MaintenanceController {
  constructor(private readonly service: MaintenanceService) {}

  @Get('dashboard')
  getDashboard(@CurrentUser('propertyId') propertyId: string) {
    return this.service.getDashboard(propertyId);
  }

  @Get()
  findAll(
    @CurrentUser('propertyId') propertyId: string,
    @Query('status') status?: string,
    @Query('priority') priority?: string,
  ) {
    return this.service.findAll(propertyId, status, priority);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser('propertyId') propertyId: string) {
    return this.service.findOne(id, propertyId);
  }

  @Post()
  create(
    @CurrentUser('propertyId') propertyId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateMaintenanceDto,
  ) {
    return this.service.create(propertyId, userId, dto);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @CurrentUser('propertyId') propertyId: string,
    @Body() dto: UpdateMaintenanceStatusDto,
  ) {
    return this.service.updateStatus(id, propertyId, dto);
  }

  @Patch(':id/assign')
  assign(
    @Param('id') id: string,
    @CurrentUser('propertyId') propertyId: string,
    @Body() body: { assignedToId: string },
  ) {
    return this.service.assign(id, propertyId, body.assignedToId);
  }
}

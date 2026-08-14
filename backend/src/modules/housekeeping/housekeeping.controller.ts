import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { HousekeepingService, CreateTaskDto, UpdateTaskStatusDto } from './housekeeping.service';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

@ApiTags('Housekeeping')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('housekeeping')
export class HousekeepingController {
  constructor(private readonly hkService: HousekeepingService) {}

  @Get('dashboard')
  getDashboard(@CurrentUser('propertyId') propertyId: string) {
    return this.hkService.getDashboard(propertyId);
  }

  @Get('ai-optimize')
  runOptimizer(@CurrentUser('propertyId') propertyId: string) {
    return this.hkService.runAIOptimizer(propertyId);
  }

  @Get()
  findAll(@CurrentUser('propertyId') propertyId: string, @Query('date') date?: string) {
    return this.hkService.findAll(propertyId, date);
  }

  @Post()
  create(@CurrentUser('propertyId') propertyId: string, @Body() dto: CreateTaskDto) {
    return this.hkService.create(propertyId, dto);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @CurrentUser('propertyId') propertyId: string, @Body() dto: UpdateTaskStatusDto) {
    return this.hkService.updateStatus(id, propertyId, dto);
  }

  @Patch(':id/assign')
  assign(@Param('id') id: string, @CurrentUser('propertyId') propertyId: string, @Body() body: { assignedToId: string }) {
    return this.hkService.assign(id, propertyId, body.assignedToId);
  }
}

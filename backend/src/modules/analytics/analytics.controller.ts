import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AnalyticsService } from './analytics.service';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

@ApiTags('Analytics')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('revenue-trend')
  getRevenueTrend(@CurrentUser('propertyId') propertyId: string, @Query('days') days?: string) {
    return this.analyticsService.getRevenueTrend(propertyId, days ? parseInt(days) : 30);
  }

  @Get('channel-breakdown')
  getChannelBreakdown(@CurrentUser('propertyId') propertyId: string, @Query('days') days?: string) {
    return this.analyticsService.getChannelBreakdown(propertyId, days ? parseInt(days) : 30);
  }

  @Get('occupancy-heatmap')
  getOccupancyHeatmap(@CurrentUser('propertyId') propertyId: string, @Query('year') year?: string) {
    return this.analyticsService.getOccupancyHeatmap(propertyId, year ? parseInt(year) : undefined);
  }

  @Get('guest-stats')
  getGuestStats(@CurrentUser('propertyId') propertyId: string) {
    return this.analyticsService.getGuestStats(propertyId);
  }
}

import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RevenueService, CreateRatePlanDto, SetRateDto, BulkRateDto } from './revenue.service';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

@ApiTags('Revenue')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('revenue')
export class RevenueController {
  constructor(private readonly revenueService: RevenueService) {}

  @Get('rate-plans')
  findRatePlans(@CurrentUser('propertyId') propertyId: string) {
    return this.revenueService.findRatePlans(propertyId);
  }

  @Post('rate-plans')
  createRatePlan(@CurrentUser('propertyId') propertyId: string, @Body() dto: CreateRatePlanDto) {
    return this.revenueService.createRatePlan(propertyId, dto);
  }

  @Get('rate-grid')
  getRateGrid(
    @CurrentUser('propertyId') propertyId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.revenueService.getRateGrid(propertyId, startDate, endDate);
  }

  @Patch('rate-plans/:id/rates')
  setRate(@Param('id') ratePlanId: string, @CurrentUser('propertyId') propertyId: string, @Body() dto: SetRateDto) {
    return this.revenueService.setRate(propertyId, ratePlanId, dto);
  }

  @Patch('rate-plans/:id/bulk-rates')
  setBulkRates(@Param('id') ratePlanId: string, @CurrentUser('propertyId') propertyId: string, @Body() dto: BulkRateDto) {
    return this.revenueService.setBulkRates(propertyId, ratePlanId, dto);
  }

  @Get('ai-recommendations')
  getAIRecommendations(@CurrentUser('propertyId') propertyId: string) {
    return this.revenueService.getAIRecommendations(propertyId);
  }

  @Post('autopilot')
  runAutopilot(@CurrentUser('propertyId') propertyId: string) {
    return this.revenueService.runAutopilot(propertyId);
  }

  @Get('forecast')
  getForecast(@CurrentUser('propertyId') propertyId: string, @Query('days') days?: string) {
    return this.revenueService.getForecast(propertyId, days ? parseInt(days) : 14);
  }

  @Post('ai-recommendations/accept')
  acceptRecommendation(
    @CurrentUser('propertyId') propertyId: string,
    @Body() body: { ratePlanId: string; roomTypeId: string; date: string; rate: number },
  ) {
    return this.revenueService.acceptRecommendation(propertyId, body.ratePlanId, body.roomTypeId, body.date, body.rate);
  }
}

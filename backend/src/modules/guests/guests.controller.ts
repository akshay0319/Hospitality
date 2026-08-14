import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { GuestsService, GenerateCampaignDto, CreateCampaignDto } from './guests.service';
import { CreateGuestDto, UpdateGuestDto, GuestPreferenceDto } from './dto/guest.dto';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { PaginationDto } from '@/common/dto/pagination.dto';

@ApiTags('Guests')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('guests')
export class GuestsController {
  constructor(private readonly guestsService: GuestsService) {}

  @Get()
  findAll(@CurrentUser('propertyId') propertyId: string, @Query() query: PaginationDto) {
    return this.guestsService.findAll(propertyId, query);
  }

  @Get('segments')
  segments(@CurrentUser('propertyId') propertyId: string) {
    return this.guestsService.segments(propertyId);
  }

  @Get('insights')
  insights(@CurrentUser('propertyId') propertyId: string) {
    return this.guestsService.insights(propertyId);
  }

  @Get('campaigns')
  listCampaigns(@CurrentUser('propertyId') propertyId: string) {
    return this.guestsService.listCampaigns(propertyId);
  }

  @Post('campaigns/generate')
  generateCampaign(@CurrentUser('propertyId') propertyId: string, @Body() dto: GenerateCampaignDto) {
    return this.guestsService.generateCampaign(propertyId, dto);
  }

  @Post('campaigns')
  createCampaign(@CurrentUser('propertyId') propertyId: string, @Body() dto: CreateCampaignDto) {
    return this.guestsService.createCampaign(propertyId, dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser('propertyId') propertyId: string) {
    return this.guestsService.findOne(id, propertyId);
  }

  @Post()
  create(@CurrentUser('propertyId') propertyId: string, @Body() dto: CreateGuestDto) {
    return this.guestsService.create(propertyId, dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @CurrentUser('propertyId') propertyId: string, @Body() dto: UpdateGuestDto) {
    return this.guestsService.update(id, propertyId, dto);
  }

  @Patch(':id/preferences')
  upsertPreferences(@Param('id') id: string, @CurrentUser('propertyId') propertyId: string, @Body() dto: GuestPreferenceDto) {
    return this.guestsService.upsertPreferences(id, propertyId, dto);
  }
}

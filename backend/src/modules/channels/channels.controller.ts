import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ChannelsService } from './channels.service';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

@ApiTags('Channel Manager')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('channels')
export class ChannelsController {
  constructor(private readonly channels: ChannelsService) {}

  @Get()
  @ApiOperation({ summary: 'List OTA channels + parity + sync summary' })
  list(@CurrentUser('propertyId') propertyId: string) {
    return this.channels.list(propertyId);
  }

  @Get('sync-log')
  @ApiOperation({ summary: 'Recent channel sync activity' })
  syncLog(@CurrentUser('propertyId') propertyId: string) {
    return this.channels.syncLog(propertyId);
  }

  @Post(':id/connect')
  connect(@Param('id') id: string, @CurrentUser('propertyId') propertyId: string) {
    return this.channels.setConnected(propertyId, id, true);
  }

  @Post(':id/disconnect')
  disconnect(@Param('id') id: string, @CurrentUser('propertyId') propertyId: string) {
    return this.channels.setConnected(propertyId, id, false);
  }

  @Post(':id/push')
  @ApiOperation({ summary: 'Push rates & availability to the channel (mock)' })
  push(@Param('id') id: string, @CurrentUser('propertyId') propertyId: string) {
    return this.channels.push(propertyId, id);
  }

  @Post(':id/pull')
  @ApiOperation({ summary: 'Pull reservations from the channel — lands real bookings in the PMS (mock)' })
  pull(@Param('id') id: string, @CurrentUser('propertyId') propertyId: string) {
    return this.channels.pull(propertyId, id);
  }
}

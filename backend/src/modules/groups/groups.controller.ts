import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { GroupsService, CreateGroupDto } from './groups.service';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

@ApiTags('Group Reservations')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('groups')
export class GroupsController {
  constructor(private readonly groups: GroupsService) {}

  @Get()
  list(@CurrentUser('propertyId') propertyId: string) {
    return this.groups.list(propertyId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser('propertyId') propertyId: string) {
    return this.groups.findOne(id, propertyId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a group and reserve a block of rooms' })
  create(@CurrentUser('propertyId') propertyId: string, @Body() dto: CreateGroupDto) {
    return this.groups.create(propertyId, dto);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel a group and all its confirmed reservations' })
  cancel(@Param('id') id: string, @CurrentUser('propertyId') propertyId: string) {
    return this.groups.cancel(id, propertyId);
  }
}

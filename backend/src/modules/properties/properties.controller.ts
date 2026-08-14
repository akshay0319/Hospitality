import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { PropertiesService } from './properties.service';
import { CreatePropertyDto, UpdatePropertyDto, CreateRoomTypeDto, UpdateRoomTypeDto } from './dto/property.dto';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

@ApiTags('Properties')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('properties')
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Get()
  @ApiOperation({ summary: 'List all properties for tenant' })
  findAll(@CurrentUser('tenantId') tenantId: string) {
    return this.propertiesService.findAll(tenantId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser('tenantId') tenantId: string) {
    return this.propertiesService.findOne(id, tenantId);
  }

  @Post()
  create(@CurrentUser('tenantId') tenantId: string, @Body() dto: CreatePropertyDto) {
    return this.propertiesService.create(tenantId, dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @CurrentUser('tenantId') tenantId: string, @Body() dto: UpdatePropertyDto) {
    return this.propertiesService.update(id, tenantId, dto);
  }

  @Get(':id/room-types')
  findRoomTypes(@Param('id') id: string) {
    return this.propertiesService.findRoomTypes(id);
  }

  @Post(':id/room-types')
  createRoomType(@Param('id') propertyId: string, @Body() dto: CreateRoomTypeDto) {
    return this.propertiesService.createRoomType(propertyId, dto);
  }

  @Patch(':id/room-types/:rtId')
  updateRoomType(@Param('id') propertyId: string, @Param('rtId') rtId: string, @Body() dto: UpdateRoomTypeDto) {
    return this.propertiesService.updateRoomType(rtId, propertyId, dto);
  }
}

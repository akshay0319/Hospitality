import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { PaginationDto } from '@/common/dto/pagination.dto';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'List all users for tenant' })
  findAll(@CurrentUser('tenantId') tenantId: string, @Query() query: PaginationDto) {
    return this.usersService.findAll(tenantId, query);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser('tenantId') tenantId: string) {
    return this.usersService.findOne(id, tenantId);
  }

  @Post()
  create(@CurrentUser('tenantId') tenantId: string, @Body() dto: CreateUserDto) {
    return this.usersService.create(tenantId, dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @CurrentUser('tenantId') tenantId: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, tenantId, dto);
  }

  @Delete(':id')
  deactivate(@Param('id') id: string, @CurrentUser('tenantId') tenantId: string) {
    return this.usersService.deactivate(id, tenantId);
  }
}

import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ContextService } from './context.service';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

@ApiTags('Context')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('context')
export class ContextController {
  constructor(private readonly service: ContextService) {}

  @Get('snapshot')
  @ApiOperation({ summary: 'Unified live snapshot of the property (AI grounding data)' })
  getSnapshot(@CurrentUser('propertyId') propertyId: string) {
    return this.service.getSnapshot(propertyId);
  }
}

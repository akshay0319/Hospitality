import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AiService, ChatMessage } from './ai.service';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

@ApiTags('AI Copilot')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('ai')
export class AiController {
  constructor(private readonly ai: AiService) {}

  @Get('status')
  status() {
    return { live: this.ai.isLive };
  }

  @Post('copilot')
  @ApiOperation({ summary: 'Ask the AI Operations Copilot (grounded on live property data)' })
  copilot(
    @CurrentUser('propertyId') propertyId: string,
    @Body() body: { messages: ChatMessage[]; allowWrites?: boolean },
  ) {
    return this.ai.chat(propertyId, body.messages ?? [], body.allowWrites ?? false);
  }
}

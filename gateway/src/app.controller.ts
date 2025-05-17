import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('health')
@Controller('/health')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @ApiOperation({ summary: '서버 상태 확인' })
  @Get()
  healthCheck(): { status: string; message: string; timestamp: string } {
    return this.appService.getHealth();
  }
}

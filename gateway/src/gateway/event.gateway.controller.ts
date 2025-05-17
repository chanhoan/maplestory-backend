import { Controller, All, Req, UseGuards, HttpStatus } from '@nestjs/common';
import { JwtAuthGuard } from '../security/jwt.guard';
import { RolesGuard } from '../security/roles.guard';
import { GatewayService } from './gateway.service';
import { Request } from 'express';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UserRole } from '../user/user.role';
import { Roles } from '../common/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@ApiResponse({ status: HttpStatus.OK, description: 'Auth 서비스 응답' })
@Controller('/api/events')
export class EventGatewayController {
  constructor(private readonly gatewayService: GatewayService) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: '이벤트 서비스 엔드포인트 Proxy' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Event 서비스 응답 객체' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.USER)
  @All('/*')
  proxyEvents(@Req() req: Request) {
    return this.gatewayService.forward(req, 'events');
  }
}

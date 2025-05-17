import { Controller, All, Req, UseGuards, HttpStatus } from '@nestjs/common';
import { JwtAuthGuard } from '../security/jwt.guard';
import { RolesGuard } from '../security/roles.guard';
import { GatewayService } from './gateway.service';
import { Request } from 'express';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UserRole } from '../user/user.role';
import { Roles } from '../security/roles.decorator';

@Controller()
export class GatewayController {
  constructor(private readonly gatewayService: GatewayService) {}

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'ADMIN만 이용가능한 엔드포인트 Proxy',
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Auth 서비스 응답 객체' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @All(['auth/roles'])
  proxyAuthAdmin(@Req() req: Request) {
    return this.gatewayService.forward(req, 'auth');
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary:
      '권한 인증, 인가를 통과한 모든 사용자가 이용가능한 엔드포인트 Proxy',
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Auth 서비스 응답 객체' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('*')
  @All(['auth/logout', 'auth/refresh'])
  proxyAuthUser(@Req() req: Request) {
    return this.gatewayService.forward(req, 'auth');
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: '권한 인증, 인가 없이 모든 사용자가 이용가능한 엔드포인트 Proxy',
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Auth 서비스 응답 객체' })
  @Roles('*')
  @All(['auth/login', 'auth/register', 'auth/info'])
  proxyUser(@Req() req: Request) {
    return this.gatewayService.forward(req, 'auth');
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: '이벤트 서비스 엔드포인트 Proxy' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Event 서비스 응답 객체' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('*')
  @All('events/*')
  proxyEvents(@Req() req: Request) {
    return this.gatewayService.forward(req, 'events');
  }
}

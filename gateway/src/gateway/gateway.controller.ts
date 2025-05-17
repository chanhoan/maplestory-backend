import {
  Controller,
  All,
  Req,
  Res,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../security/jwt.guard';
import { RolesGuard } from '../security/roles.guard';
import { GatewayService } from './gateway.service';
import { Request, Response } from 'express';
import {
  ApiBearerAuth,
  ApiExcludeEndpoint,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';

@Controller()
export class GatewayController {
  constructor(private readonly gatewayService: GatewayService) {}

  @ApiOperation({ summary: '로그인, 유저 등록 엔드포인트 Proxy' })
  @All(['auth/login', 'auth/register'])
  proxyAuthPublic(@Req() req: Request, @Res() res: Response) {
    return this.gatewayService.forward(req, 'auth');
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: '유저 정보 관리, 역할 관리, 로그아웃, 토큰 발급 엔드포인트 Proxy',
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Auth 서비스 응답 객체' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @All(['auth/info', 'auth/roles', 'auth/logout', 'auth/refresh'])
  proxyAuthProtected(@Req() req: Request, @Res() res: Response) {
    return this.gatewayService.forward(req, 'auth');
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: '이벤트 서비스 엔드포인트 Proxy' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Event 서비스 응답 객체' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @All('events/*')
  proxyEvents(@Req() req: Request, @Res() res: Response) {
    return this.gatewayService.forward(req);
  }
}

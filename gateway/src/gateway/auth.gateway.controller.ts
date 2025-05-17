import {
  Controller,
  Req,
  UseGuards,
  HttpStatus,
  Post,
  Put,
  Get,
  Delete,
} from '@nestjs/common';
import { JwtAuthGuard } from '../security/jwt.guard';
import { RolesGuard } from '../security/roles.guard';
import { GatewayService } from './gateway.service';
import { Request } from 'express';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UserRole } from '../user/user.role';
import { Roles } from '../common/roles.decorator';
import { Public } from '../common/public.decorator';

@ApiBearerAuth()
@ApiResponse({ status: HttpStatus.OK, description: 'Auth 서비스 응답' })
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('/api/auth')
export class AuthGatewayController {
  constructor(private readonly gatewayService: GatewayService) {}

  @Public()
  @ApiOperation({ summary: '유저 등록 Proxy' })
  @Post('/register')
  proxyRegister(@Req() req: Request) {
    return this.gatewayService.forward(req, 'auth');
  }

  @Public()
  @ApiOperation({ summary: '로그인 Proxy' })
  @Post('/login')
  proxyLogin(@Req() req: Request) {
    return this.gatewayService.forward(req, 'auth');
  }

  @ApiOperation({ summary: '로그아웃 Proxy' })
  @Roles('*')
  @Post('/logout')
  proxyLogout(@Req() req: Request) {
    return this.gatewayService.forward(req, 'auth');
  }

  @ApiOperation({ summary: '토큰 재발급 Proxy' })
  @Roles('*')
  @Post('/refresh')
  proxyRefresh(@Req() req: Request) {
    return this.gatewayService.forward(req, 'auth');
  }

  @ApiOperation({ summary: '유저 정보 조회 Proxy' })
  @Roles('*')
  @Get('/info')
  proxyGetInfo(@Req() req: Request) {
    return this.gatewayService.forward(req, 'auth');
  }

  @ApiOperation({ summary: '유저 정보 업데이트 Proxy' })
  @Roles('*')
  @Put('/info')
  proxyUpdateInfo(@Req() req: Request) {
    return this.gatewayService.forward(req, 'auth');
  }

  @ApiOperation({ summary: '유저 탈퇴 Proxy' })
  @Roles('*')
  @Delete('/delete')
  proxyDelete(@Req() req: Request) {
    return this.gatewayService.forward(req, 'auth');
  }

  @ApiOperation({ summary: '유저 전체 조회 Proxy' })
  @Roles(UserRole.ADMIN)
  @Get('/all-users')
  proxyGetAllUsers(@Req() req: Request) {
    return this.gatewayService.forward(req, 'auth');
  }

  @ApiOperation({ summary: '유저 권한 관리 Proxy' })
  @Roles(UserRole.ADMIN)
  @Put('/roles/:id')
  proxyUpdateRoles(@Req() req: Request) {
    return this.gatewayService.forward(req, 'auth');
  }
}

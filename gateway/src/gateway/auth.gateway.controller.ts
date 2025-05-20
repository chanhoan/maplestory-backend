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
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserRole } from '../common/enums/user.role';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Gateway/Auth')
@ApiBearerAuth()
@ApiResponse({ status: HttpStatus.OK, description: 'Auth 서비스 응답' })
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('/api/auth')
export class AuthGatewayController {
  constructor(private readonly gatewayService: GatewayService) {}

  /**
   * 회원가입 요청을 인증 서비스로 프록시합니다.
   *
   * @param req - Express Request 객체
   * @returns 인증 서비스의 회원가입 응답
   */
  @Public()
  @ApiOperation({ summary: '유저 등록 Proxy' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: '회원가입 성공 시 인증 서비스 응답',
  })
  @Post('/register')
  proxyRegister(@Req() req: Request) {
    return this.gatewayService.forward(req, 'auth');
  }

  /**
   * 로그인 요청을 인증 서비스로 프록시합니다.
   *
   * @param req - Express Request 객체
   * @returns 인증 서비스의 로그인 응답
   */
  @Public()
  @ApiOperation({ summary: '로그인 Proxy' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '로그인 성공 시 인증 서비스 응답',
  })
  @Post('/login')
  proxyLogin(@Req() req: Request) {
    return this.gatewayService.forward(req, 'auth');
  }

  /**
   * 로그아웃 요청을 인증 서비스로 프록시합니다.
   *
   * @param req - Express Request 객체
   * @returns 인증 서비스의 로그아웃 응답
   */
  @ApiOperation({ summary: '로그아웃 Proxy' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '로그아웃 성공 시 인증 서비스 응답',
  })
  @Roles('*')
  @Post('/logout')
  proxyLogout(@Req() req: Request) {
    return this.gatewayService.forward(req, 'auth');
  }

  /**
   * 토큰 재발급 요청을 인증 서비스로 프록시합니다.
   *
   * @param req - Express Request 객체
   * @returns 인증 서비스의 토큰 재발급 응답
   */
  @ApiOperation({ summary: '토큰 재발급 Proxy' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '토큰 재발급 성공 시 인증 서비스 응답',
  })
  @Roles('*')
  @Post('/refresh')
  proxyRefresh(@Req() req: Request) {
    return this.gatewayService.forward(req, 'auth');
  }

  /**
   * 사용자 정보 조회 요청을 인증 서비스로 프록시합니다.
   *
   * @param req - Express Request 객체
   * @returns 인증 서비스의 프로필 조회 응답
   */
  @ApiOperation({ summary: '유저 정보 조회 Proxy' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '프로필 조회 성공 시 인증 서비스 응답',
  })
  @Roles('*')
  @Get('/info')
  proxyGetInfo(@Req() req: Request) {
    return this.gatewayService.forward(req, 'auth');
  }

  /**
   * 사용자 정보 업데이트 요청을 인증 서비스로 프록시합니다.
   *
   * @param req - Express Request 객체
   * @returns 인증 서비스의 정보 업데이트 응답
   */
  @ApiOperation({ summary: '유저 정보 업데이트 Proxy' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '정보 업데이트 성공 시 인증 서비스 응답',
  })
  @Roles('*')
  @Put('/info')
  proxyUpdateInfo(@Req() req: Request) {
    return this.gatewayService.forward(req, 'auth');
  }

  /**
   * 회원 탈퇴 요청을 인증 서비스로 프록시합니다.
   *
   * @param req - Express Request 객체
   * @returns 인증 서비스의 탈퇴 처리 응답
   */
  @ApiOperation({ summary: '유저 탈퇴 Proxy' })
  @ApiResponse({
    status: HttpStatus.ACCEPTED,
    description: '탈퇴 요청 접수 시 인증 서비스 응답',
  })
  @Roles('*')
  @Delete()
  proxyDelete(@Req() req: Request) {
    return this.gatewayService.forward(req, 'auth');
  }

  /**
   * 전체 사용자 조회 요청을 인증 서비스로 프록시합니다.
   *
   * @param req - Express Request 객체
   * @returns 인증 서비스의 전체 사용자 목록 응답
   */
  @ApiOperation({ summary: '유저 전체 조회 Proxy' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '전체 사용자 조회 성공 시 인증 서비스 응답',
  })
  @Roles(UserRole.ADMIN)
  @Get('/all-users')
  proxyGetAllUsers(@Req() req: Request) {
    return this.gatewayService.forward(req, 'auth');
  }

  /**
   * 사용자 권한 관리(역할 할당) 요청을 인증 서비스로 프록시합니다.
   *
   * @param req - Express Request 객체
   * @returns 인증 서비스의 권한 할당 응답
   */
  @ApiOperation({ summary: '유저 권한 관리 Proxy' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '권한 관리 성공 시 인증 서비스 응답',
  })
  @Roles(UserRole.ADMIN)
  @Put('/roles')
  proxyUpdateRoles(@Req() req: Request) {
    return this.gatewayService.forward(req, 'auth');
  }
}

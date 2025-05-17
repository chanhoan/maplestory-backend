import { Controller, Post, Body, Req, Param, Get, Put } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserRole } from '../user/user.role';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Request } from 'express';

import { LoginRequest } from './dto/request/login.request';
import { RegisterRequest } from './dto/request/register.request';

import { DuplicateResponse } from './dto/response/dupblicate.response';
import { RegisterResponse } from './dto/response/register.response';
import { LoginResponse } from './dto/response/login.response';
import { BasicResponse } from './dto/response/basic.response';
import { GetProfileResponse } from './dto/response/get.profile.response';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @ApiOperation({ summary: '아이디 중복검사' })
  @ApiResponse({ status: 200, description: '아이디 중복 여부' })
  @Get('duplicate')
  duplicateCheck(
    @Param('username') username: string,
  ): Promise<DuplicateResponse> {
    return this.auth.isDuplicate(username);
  }

  @ApiOperation({ summary: '회원가입' })
  @ApiResponse({ status: 201, description: '회원가입 성공' })
  @Post('register')
  register(@Body() dto: RegisterRequest): Promise<RegisterResponse> {
    return this.auth.register(dto);
  }

  @ApiOperation({ summary: '로그인' })
  @ApiResponse({ status: 200, description: '로그인 성공 → 토큰 반환' })
  @Post('login')
  login(@Body() dto: LoginRequest): Promise<LoginResponse> {
    return this.auth.login(dto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: '로그아웃' })
  @ApiResponse({ status: 200, description: '로그아웃 처리' })
  @Post('logout')
  logout(@Req() req: Request): Promise<BasicResponse> {
    return this.auth.logout(req);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: '토큰 재발급 (refresh)' })
  @ApiResponse({ status: 200, description: '새 토큰 반환' })
  @Post('refresh')
  refresh(@Req() req: Request): Promise<LoginResponse> {
    return this.auth.refresh(req);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: '사용자 정보 관리' })
  @ApiResponse({ status: 200, description: '사용자 정보 반환' })
  @Post('info')
  getMyProfile(@Req() req: Request): Promise<GetProfileResponse> {
    return this.auth.getProfile(req);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: '사용자 정보 관리' })
  @ApiResponse({ status: 200, description: '사용자 정보 업데이트' })
  @Put('info')
  updateMyProfile(@Req() req: Request): Promise<GetProfileResponse> {
    return this.auth.getProfile(req);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: '권한 부여 (ADMIN 전용)' })
  @ApiResponse({ status: 200, description: '권한 변경 완료' })
  @Post('roles/assign')
  assignRole(
    @Req() req: any,
    @Body() body: { username: string; role: UserRole },
  ) {
    return this.auth.assignRole(req.user.username, body.username, body.role);
  }
}

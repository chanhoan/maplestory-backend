import {
  Controller,
  Post,
  Body,
  Req,
  Param,
  Get,
  Put,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
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
import { UpdateInfoRequest } from './dto/request/update.info.request';
import { AssignRoleRequest } from './dto/request/assign.role.request';

@ApiTags('Auth')
@Controller('/api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: '아이디 중복검사' })
  @ApiResponse({ status: 200, description: '아이디 중복 여부' })
  @Get('/duplicate')
  duplicateCheck(
    @Param('username') username: string,
  ): Promise<DuplicateResponse> {
    return this.authService.isDuplicate(username);
  }

  @ApiOperation({ summary: '회원가입' })
  @ApiResponse({ status: 201, description: '회원가입 성공' })
  @Post('/register')
  register(@Body() dto: RegisterRequest): Promise<RegisterResponse> {
    console.log('register request received');
    return this.authService.register(dto);
  }

  @ApiOperation({ summary: '로그인' })
  @ApiResponse({ status: 200, description: '로그인 성공 → 토큰 반환' })
  @Post('/login')
  login(@Body() dto: LoginRequest): Promise<LoginResponse> {
    return this.authService.login(dto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: '로그아웃' })
  @ApiResponse({ status: 200, description: '로그아웃 처리' })
  @Post('/logout')
  logout(@Req() req: Request): Promise<BasicResponse> {
    return this.authService.logout(req);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: '토큰 재발급 (refresh)' })
  @ApiResponse({ status: 200, description: '새 토큰 반환' })
  @Post('/refresh')
  refresh(@Req() req: Request): Promise<LoginResponse> {
    return this.authService.refresh(req);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: '사용자 정보 관리' })
  @ApiResponse({ status: 200, description: '사용자 정보 반환' })
  @Post('/info')
  getInfo(@Req() req: Request): Promise<GetProfileResponse> {
    return this.authService.getInfo(req);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: '사용자 정보 관리' })
  @ApiResponse({ status: 200, description: '사용자 정보 업데이트' })
  @Put('/info')
  updateMyProfile(
    @Req() req: Request,
    @Body() dto: UpdateInfoRequest,
  ): Promise<BasicResponse> {
    return this.authService.updateInfo(req, dto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: '사용자 탈퇴' })
  @ApiResponse({ status: 200, description: '사용자 탈퇴' })
  @HttpCode(HttpStatus.ACCEPTED)
  @Put('/info')
  delete(@Req() req: Request): Promise<BasicResponse> {
    return this.authService.delete(req);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: '사용자 권한 부여' })
  @ApiResponse({ status: 200, description: '사용자 권한 부여 결과' })
  @HttpCode(HttpStatus.ACCEPTED)
  @Get('/all-users')
  getALlUsers(@Req() req: Request): Promise<BasicResponse> {
    return this.authService.getAllUsers(req);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: '사용자 권한 부여' })
  @ApiResponse({ status: 200, description: '사용자 권한 부여 결과' })
  @HttpCode(HttpStatus.ACCEPTED)
  @Put('/roles')
  assignRole(
    @Req() req: Request,
    @Body() dto: AssignRoleRequest,
  ): Promise<BasicResponse> {
    return this.authService.assignRole(req, dto);
  }
}

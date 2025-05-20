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
  Delete,
} from '@nestjs/common';
import { AuthService } from '../service/auth.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { Request } from 'express';

import { LoginRequest } from '../dto/request/login.request';
import { RegisterRequest } from '../dto/request/register.request';
import { UpdateInfoRequest } from '../dto/request/update.info.request';
import { AssignRoleRequest } from '../dto/request/assign.role.request';

import { DuplicateResponse } from '../dto/response/dupblicate.response';
import { RegisterResponse } from '../dto/response/register.response';
import { LoginResponse } from '../dto/response/login.response';
import { BasicResponse } from '../../../common/responses/basic.response';
import { GetProfileResponse } from '../dto/response/get.profile.response';

/**
 * 인증(Authentication) 관련 엔드포인트를 제공하는 컨트롤러입니다.
 */
@ApiTags('Auth')
@Controller('/api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * 주어진 사용자명으로 아이디 중복 여부를 확인합니다.
   *
   * @param username 중복 검사할 사용자명
   * @returns 중복 여부를 담은 객체
   */
  @ApiOperation({ summary: '아이디 중복검사' })
  @ApiParam({
    name: 'username',
    description: '중복 검사할 사용자명',
    example: 'johndoe',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '아이디 중복 여부',
    type: DuplicateResponse,
  })
  @Get('/duplicate/:username')
  duplicateCheck(
    @Param('username') username: string,
  ): Promise<DuplicateResponse> {
    return this.authService.isDuplicate(username);
  }

  /**
   * 새로운 사용자를 회원가입시킵니다.
   *
   * @param dto 회원가입 정보 DTO
   * @returns 생성된 사용자 정보
   */
  @ApiOperation({ summary: '회원가입' })
  @ApiBody({ type: RegisterRequest })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: '회원가입 성공',
    type: RegisterResponse,
  })
  @Post('/register')
  register(@Body() dto: RegisterRequest): Promise<RegisterResponse> {
    return this.authService.register(dto);
  }

  /**
   * 사용자 로그인하여 액세스 토큰과 리프레시 토큰을 발급합니다.
   *
   * @param dto 로그인 정보 DTO
   * @returns 발급된 토큰 정보
   */
  @ApiOperation({ summary: '로그인' })
  @ApiBody({ type: LoginRequest })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: '로그인 성공 → 토큰 반환',
    type: LoginResponse,
  })
  @Post('/login')
  login(@Body() dto: LoginRequest): Promise<LoginResponse> {
    return this.authService.login(dto);
  }

  /**
   * 현재 요청에 대해 로그아웃 처리합니다.
   *
   * @param req HTTP 요청 객체 (토큰을 포함)
   * @returns 기본 응답
   */
  @ApiBearerAuth()
  @ApiOperation({ summary: '로그아웃' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: '로그아웃 처리',
    type: BasicResponse,
  })
  @Post('/logout')
  logout(@Req() req: Request): Promise<BasicResponse> {
    return this.authService.logout(req);
  }

  /**
   * 리프레시 토큰으로 액세스 토큰을 재발급합니다.
   *
   * @param req HTTP 요청 객체 (리프레시 토큰 포함)
   * @returns 새로 발급된 토큰 정보
   */
  @ApiBearerAuth()
  @ApiOperation({ summary: '토큰 재발급 (refresh)' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: '새 토큰 반환',
    type: LoginResponse,
  })
  @Post('/refresh')
  refresh(@Req() req: Request): Promise<LoginResponse> {
    return this.authService.refresh(req);
  }

  /**
   * 현재 로그인한 사용자의 프로필 정보를 조회합니다.
   *
   * @param req HTTP 요청 객체 (액세스 토큰 포함)
   * @returns 사용자 프로필 정보
   */
  @ApiBearerAuth()
  @ApiOperation({ summary: '사용자 정보 조회' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '사용자 정보 반환',
    type: GetProfileResponse,
  })
  @Get('/info')
  getInfo(@Req() req: Request): Promise<GetProfileResponse> {
    return this.authService.getInfo(req);
  }

  /**
   * 현재 로그인한 사용자의 프로필 정보를 업데이트합니다.
   *
   * @param req HTTP 요청 객체 (액세스 토큰 포함)
   * @param dto 업데이트할 사용자 정보 DTO
   * @returns 기본 응답
   */
  @ApiBearerAuth()
  @ApiOperation({ summary: '사용자 정보 업데이트' })
  @ApiBody({ type: UpdateInfoRequest })
  @ApiResponse({
    status: HttpStatus.ACCEPTED,
    description: '사용자 정보 업데이트',
    type: BasicResponse,
  })
  @Put('/info')
  updateMyProfile(
    @Req() req: Request,
    @Body() dto: UpdateInfoRequest,
  ): Promise<BasicResponse> {
    return this.authService.updateInfo(req, dto);
  }

  /**
   * 사용자 삭제 요청을 처리합니다. (Soft Delete + SAGA 시작)
   *
   * @param req HTTP 요청 객체 (액세스 토큰 포함)
   * @returns 삭제 요청 발행 결과
   */
  @ApiBearerAuth()
  @ApiOperation({ summary: '사용자 삭제 요청 (soft delete + SAGA 시작)' })
  @ApiResponse({
    status: HttpStatus.ACCEPTED,
    description: '삭제 요청 발행됨',
    type: BasicResponse,
  })
  @HttpCode(HttpStatus.ACCEPTED)
  @Delete()
  delete(@Req() req: Request): Promise<BasicResponse> {
    return this.authService.delete(req);
  }

  /**
   * 모든 사용자 목록을 조회합니다.
   *
   * @returns 사용자 목록 조회 결과
   */
  @ApiBearerAuth()
  @ApiOperation({ summary: '전체 사용자 조회' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '모든 사용자 정보 반환',
    type: BasicResponse,
  })
  @Get('/all-users')
  getAllUsers(): Promise<BasicResponse> {
    return this.authService.getAllUsers();
  }

  /**
   * 사용자의 역할을 할당합니다.
   *
   * @param req HTTP 요청 객체 (액세스 토큰 포함)
   * @param dto 역할 할당 정보 DTO
   * @returns 역할 할당 처리 결과
   */
  @ApiBearerAuth()
  @ApiOperation({ summary: '사용자 권한 부여' })
  @ApiBody({ type: AssignRoleRequest })
  @ApiResponse({
    status: HttpStatus.ACCEPTED,
    description: '사용자 권한 부여 결과',
    type: BasicResponse,
  })
  @HttpCode(HttpStatus.ACCEPTED)
  @Put('/roles')
  assignRole(
    @Req() req: Request,
    @Body() dto: AssignRoleRequest,
  ): Promise<BasicResponse> {
    return this.authService.assignRole(req, dto);
  }
}

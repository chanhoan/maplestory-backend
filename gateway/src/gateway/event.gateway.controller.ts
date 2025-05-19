import { Controller, Req, UseGuards, Get, Post } from '@nestjs/common';
import { JwtAuthGuard } from '../security/jwt.guard';
import { RolesGuard } from '../security/roles.guard';
import { GatewayService } from './gateway.service';
import { Request } from 'express';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiResponse,
} from '@nestjs/swagger';
import { UserRole } from '../common/user.role';
import { Roles } from '../common/roles.decorator';

@ApiTags('Gateway/Events')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
/**
 * 이벤트 서비스로의 모든 요청을 프록시하는 게이트웨이 컨트롤러입니다.
 */
@Controller('/api/events')
export class EventGatewayController {
  constructor(private readonly gatewayService: GatewayService) {}

  /**
   * 전체 이벤트 목록을 조회합니다.
   *
   * @param req - Express 요청 객체
   * @returns 이벤트 서비스의 목록 응답
   */
  @ApiOperation({ summary: '이벤트 조회 Proxy' })
  @ApiResponse({ status: 200, description: '이벤트 목록 조회 성공' })
  @Roles('*')
  @Get()
  proxyGetEvents(@Req() req: Request) {
    return this.gatewayService.forward(req, 'events');
  }

  /**
   * 단일 이벤트의 상세 정보를 조회합니다.
   *
   * @param req - Express 요청 객체
   * @returns 이벤트 서비스의 상세 조회 응답
   */
  @ApiOperation({ summary: '이벤트 상세 조회 Proxy' })
  @ApiResponse({ status: 200, description: '이벤트 상세 조회 성공' })
  @Roles('*')
  @Get(':id')
  proxyGetEvent(@Req() req: Request) {
    return this.gatewayService.forward(req, 'events');
  }

  /**
   * 새 이벤트를 등록합니다.
   *
   * @param req - Express 요청 객체
   * @returns 이벤트 서비스의 등록 응답
   */
  @ApiOperation({ summary: '이벤트 등록 Proxy' })
  @ApiResponse({ status: 201, description: '이벤트 등록 성공' })
  @Roles(UserRole.ADMIN, UserRole.OPERATOR)
  @Post()
  proxyRegisterEvent(@Req() req: Request) {
    return this.gatewayService.forward(req, 'events');
  }

  /**
   * 특정 이벤트의 보상 목록을 조회합니다.
   *
   * @param req - Express 요청 객체
   * @returns 이벤트 서비스의 보상 목록 응답
   */
  @ApiOperation({ summary: '보상 조회 Proxy' })
  @ApiResponse({ status: 200, description: '보상 목록 조회 성공' })
  @Roles('*')
  @Get(':eventId/rewards')
  proxyGetRewards(@Req() req: Request) {
    return this.gatewayService.forward(req, 'events');
  }

  /**
   * 특정 보상의 상세 정보를 조회합니다.
   *
   * @param req - Express 요청 객체
   * @returns 이벤트 서비스의 보상 상세 응답
   */
  @ApiOperation({ summary: '보상 상세 조회 Proxy' })
  @ApiResponse({ status: 200, description: '보상 상세 조회 성공' })
  @Roles('*')
  @Get(':eventId/rewards/:rewardId')
  proxyGetReward(@Req() req: Request) {
    return this.gatewayService.forward(req, 'events');
  }

  /**
   * 특정 이벤트에 대한 새 보상을 등록합니다.
   *
   * @param req - Express 요청 객체
   * @returns 이벤트 서비스의 보상 등록 응답
   */
  @ApiOperation({ summary: '보상 등록 Proxy' })
  @ApiResponse({ status: 201, description: '보상 등록 성공' })
  @Roles(UserRole.ADMIN, UserRole.OPERATOR)
  @Post(':eventId/rewards')
  proxyRegisterReward(@Req() req: Request) {
    return this.gatewayService.forward(req, 'events');
  }

  /**
   * 사용자 권한으로 보상 요청을 생성합니다.
   *
   * @param req - Express 요청 객체
   * @returns 이벤트 서비스의 보상 요청 생성 응답
   */
  @ApiOperation({ summary: '보상 요청 생성 (USER)' })
  @ApiResponse({ status: 201, description: '보상 요청 생성 성공' })
  @Roles(UserRole.USER)
  @Post(':eventId/requests')
  async register(@Req() req: Request) {
    return this.gatewayService.forward(req, 'events');
  }

  /**
   * 사용자가 생성한 모든 보상 요청 목록을 조회합니다.
   *
   * @param req - Express 요청 객체
   * @returns 이벤트 서비스의 보상 요청 목록 응답
   */
  @ApiOperation({ summary: '보상 요청 목록 조회' })
  @ApiResponse({ status: 200, description: '보상 요청 목록 조회 성공' })
  @Roles(UserRole.USER, UserRole.AUDITOR, UserRole.ADMIN)
  @Get('requests')
  async getMyAllRequests(@Req() req: Request) {
    return this.gatewayService.forward(req, 'events');
  }

  /**
   * 특정 보상 요청의 상세 정보를 조회합니다.
   *
   * @param req - Express 요청 객체
   * @returns 이벤트 서비스의 보상 요청 상세 응답
   */
  @ApiOperation({ summary: '보상 요청 상세 조회' })
  @ApiResponse({ status: 200, description: '보상 요청 상세 조회 성공' })
  @Roles(UserRole.USER, UserRole.AUDITOR, UserRole.ADMIN)
  @Get('requests/:id')
  async findMyOne(@Req() req: Request) {
    return this.gatewayService.forward(req, 'events');
  }
}

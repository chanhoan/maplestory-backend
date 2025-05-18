import { RewardRequestService } from './reward-request.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  HttpStatus,
} from '@nestjs/common';
import { RewardRequestRegisterResponse } from './dto/response/reward-request.register.response';
import { Request } from 'express';
import { GetAllRewardRequestResponse } from './dto/response/get-all-reward-request-response';
import { GetRewardRequestResponse } from './dto/response/get-reward-request.response';
import { RewardRequestFilterRequest } from './dto/request/reward-request.filter.request';

@ApiTags('RewardRequests')
@Controller('/api/events')
export class RewardRequestController {
  constructor(private readonly rewardRequestService: RewardRequestService) {}

  /**
   * 보상 요청 생성 (USER)
   *
   * @param eventId - 요청할 이벤트 ID
   * @param req - Express Request 객체 (인증 헤더 포함)
   * @returns 생성된 보상 요청 ID 및 연관 이벤트 ID
   */
  @ApiOperation({ summary: '보상 요청 생성 (USER)' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: '보상 요청 성공',
    type: RewardRequestRegisterResponse,
  })
  @Post('/:eventId/requests')
  async register(
    @Param('eventId') eventId: string,
    @Req() req: Request,
  ): Promise<RewardRequestRegisterResponse> {
    return this.rewardRequestService.register(eventId, req);
  }

  /**
   * 보상 요청 목록 조회 (USER 본인 요청)
   *
   * @param req - Express Request 객체 (인증 헤더 포함)
   * @param filter - 조회 필터 DTO
   * @returns 조건에 맞는 보상 요청 리스트
   */
  @ApiOperation({ summary: '보상 요청 목록 조회' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '조회 성공',
    type: GetAllRewardRequestResponse,
  })
  @Get('/requests')
  async getMyAllRequests(
    @Req() req: Request,
    @Query() filter: RewardRequestFilterRequest,
  ): Promise<GetAllRewardRequestResponse> {
    return this.rewardRequestService.getAllRequests(req, filter);
  }

  /**
   * 단일 보상 요청 상세 조회
   *
   * @param req - Express Request 객체 (인증 헤더 포함)
   * @param id - 조회할 보상 요청 ID
   * @returns 보상 요청 상세 정보
   */
  @ApiOperation({ summary: '보상 요청 상세 조회' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '상세 조회 성공',
    type: GetRewardRequestResponse,
  })
  @Get('requests/:id')
  async findMyOne(
    @Req() req: Request,
    @Param('id') id: string,
  ): Promise<GetRewardRequestResponse> {
    return await this.rewardRequestService.getRequest(req, id);
  }
}

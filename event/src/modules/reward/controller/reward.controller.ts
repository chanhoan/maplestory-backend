import { GetAllRewardResponse } from '../dto/response/get-all-reward.response';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  HttpStatus,
} from '@nestjs/common';
import { RewardService } from '../service/reward.service';
import { RewardRegisterRequest } from '../dto/request/reward.register.request';
import { RewardRegisterResponse } from '../dto/response/reward.register.response';
import { RewardFilterRequest } from '../dto/request/reward.filter.request';
import { GetRewardResponse } from '../dto/response/get-reward.response';

@ApiTags('Rewards')
@Controller('/api/events/:eventId/rewards')
export class RewardController {
  constructor(private readonly rewardService: RewardService) {}

  /**
   * 새로운 보상을 등록합니다.
   *
   * @param dto - 보상 등록 요청 DTO
   * @returns 생성된 보상 ID 및 연관 이벤트 ID
   */
  @ApiOperation({ summary: '보상 등록' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: '보상 등록 성공',
    type: RewardRegisterResponse,
  })
  @Post()
  register(
    @Body() dto: RewardRegisterRequest,
  ): Promise<RewardRegisterResponse> {
    return this.rewardService.register(dto);
  }

  /**
   * 보상을 필터링하여 조회하거나 전체 목록을 조회합니다.
   *
   * @param filterDto - 조회 필터 DTO
   * @returns 필터링된 보상 리스트
   */
  @ApiOperation({ summary: '보상 조회 (필터링/전체)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '보상 조회 성공',
    type: GetAllRewardResponse,
  })
  @Get()
  findAll(
    @Query() filterDto: RewardFilterRequest,
  ): Promise<GetAllRewardResponse> {
    return this.rewardService.getFilterRewards(filterDto);
  }

  /**
   * 단일 보상의 상세 정보를 조회합니다.
   *
   * @param eventId - 조회할 보상이 속한 이벤트 ID
   * @returns 단일 보상 상세 정보
   */
  @ApiOperation({ summary: '보상 상세 조회' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '보상 상세 조회 성공',
    type: GetRewardResponse,
  })
  @Get('/:id')
  getReward(@Param('eventId') eventId: string): Promise<GetRewardResponse> {
    return this.rewardService.getReward(eventId);
  }
}

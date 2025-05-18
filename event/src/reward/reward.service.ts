import { NotFoundException } from '@nestjs/common';
import { RewardRepository } from './reward.repository';
import { RewardType } from './reward.type';
import { RewardRegisterRequest } from './dto/request/reward.register.request';
import { RewardRegisterResponse } from './dto/response/reward.register.response';
import { GetAllRewardResponse } from './dto/response/get-all-reward.response';
import { RewardFilterRequest } from './dto/request/reward.filter.request';
import { RewardDocument } from './reward.schema';
import { FilterQuery } from 'mongoose';
import { RewardResponse } from './dto/response/reward.response';
import { GetRewardResponse } from './dto/response/get-reward.response';

/**
 * 보상(Reward) 도메인의 비즈니스 로직을 처리하는 서비스입니다.
 * - 보상 생성
 * - 필터링된 보상 조회
 * - 단일 보상 조회
 */
export class RewardService {
  constructor(private readonly rewardRepository: RewardRepository) {}

  /**
   * 새로운 보상을 등록합니다.
   *
   * @param dto - 보상 등록 요청 DTO
   * @returns 생성된 보상의 ID와 연관 이벤트 ID를 포함한 응답 DTO
   */
  async register(dto: RewardRegisterRequest): Promise<RewardRegisterResponse> {
    const metadata = this.buildMetadata(dto);

    const reward = await this.rewardRepository.create({
      eventId: dto.eventId,
      type: dto.type,
      metadata,
    });

    return {
      status: 'SUCCESS',
      message: '보상 등록 성공',
      id: reward.id,
      eventId: reward.eventId,
    };
  }

  /**
   * 주어진 필터 조건에 따라 보상 목록을 조회합니다.
   * - deletedAt이 없는(soft‑delete되지 않은) 보상만 포함
   *
   * @param dto - 보상 조회 필터 DTO
   * @returns 필터링된 보상 리스트를 포함한 응답 DTO
   */
  async getFilterRewards(
    dto: RewardFilterRequest,
  ): Promise<GetAllRewardResponse> {
    const baseQuery: FilterQuery<RewardDocument> = {
      deletedAt: { $exists: false },
    };

    const filter: FilterQuery<RewardDocument> = {
      ...baseQuery,
      ...(dto.eventId && { eventId: dto.eventId }),
      ...(dto.type && { type: dto.type }),
    };

    const filteredRewards = await this.rewardRepository.findByFilters(filter);

    const rewards: RewardResponse[] = filteredRewards.map((r) => ({
      id: r.id,
      eventId: r.eventId,
      type: r.type,
      metadata: r.metadata,
    }));

    return {
      status: 'SUCCESS',
      message: '모든 보상 조회 성공',
      rewards,
    };
  }

  /**
   * 특정 이벤트의 단일 보상을 조회합니다.
   *
   * @param eventId - 조회할 보상이 속한 이벤트 ID
   * @throws NotFoundException 해당 이벤트에 보상이 없을 경우
   * @returns 조회된 보상 상세 정보를 포함한 응답 DTO
   */
  async getReward(eventId: string): Promise<GetRewardResponse> {
    const reward = await this.rewardRepository.findByEvent(eventId);

    if (!reward) {
      throw new NotFoundException(`이벤트에 보상이 없습니다.: ${eventId}`);
    }

    const result: RewardResponse = {
      id: reward.id,
      eventId: reward.eventId,
      type: reward.type,
      metadata: reward.metadata,
    };

    return {
      status: 'SUCCESS',
      message: '보상 조회 성공',
      reward: result,
    };
  }

  /**
   * RewardType에 따라 metadata 객체를 구성합니다.
   *
   * @param dto - 보상 등록 요청 DTO
   * @returns metadata로 사용할 객체
   */
  private buildMetadata(dto: RewardRegisterRequest): Record<string, any> {
    switch (dto.type) {
      case RewardType.POINT:
        return { amount: dto.amount };
      default:
        return {};
    }
  }
}

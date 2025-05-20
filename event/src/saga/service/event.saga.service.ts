import { Injectable } from '@nestjs/common';
import { EventProgressRepository } from '../../modules/event-progress/repository/event-progress.repository';
import { RewardRequestRepository } from '../../modules/reward-request/repository/reward-request.repository';

/**
 * 사용자 단위 SAGA 서비스로,
 * 이벤트 진행 및 보상 요청 데이터의 soft‑delete/restore를 책임집니다.
 */
@Injectable()
export class EventSagaService {
  constructor(
    private readonly eventProgressRepository: EventProgressRepository,
    private readonly rewardRequestRepository: RewardRequestRepository,
  ) {}

  /**
   * 지정된 사용자의 모든 이벤트 진행 기록과 보상 요청을 soft‑delete 처리합니다.
   *
   * @param userId - soft‑delete 대상 사용자 ID
   */
  async softDeleteByUser(userId: string): Promise<void> {
    await this.eventProgressRepository.softDeleteByUser(userId);
    await this.rewardRequestRepository.softDeleteByUser(userId);
  }

  /**
   * 지정된 사용자의 soft‑deleted된 이벤트 진행 기록과 보상 요청을 복구합니다.
   *
   * @param userId - 복구 대상 사용자 ID
   */
  async restoreByUser(userId: string): Promise<void> {
    await this.eventProgressRepository.restoreByUser(userId);
    await this.rewardRequestRepository.restoreByUser(userId);
  }
}

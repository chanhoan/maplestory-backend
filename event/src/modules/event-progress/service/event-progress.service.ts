import { Injectable, Inject, Logger } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { EventProgressRepository } from '../repository/event-progress.repository';
import { EventRepository } from '../../event/repository/event.repository';
import { ConditionType } from '../../../common/type/condition.type';
import { RewardRequestRepository } from '../../reward-request/repository/reward-request.repository';

const MAX_RETRIES = 3;

/**
 * 사용자 로그인 이벤트를 처리하여
 * 연속 로그인 이벤트의 진행 상태를 업데이트하고,
 * 조건 충족 시 보상 요청을 자동 승인/발행하는 서비스입니다.
 */
@Injectable()
export class EventProgressService {
  private readonly logger = new Logger(EventProgressService.name);

  constructor(
    private readonly eventRepository: EventRepository,
    private readonly eventProgressRepository: EventProgressRepository,
    private readonly rewardRequestRepository: RewardRequestRepository,
    @Inject('KAFKA_PRODUCER')
    private readonly kafkaProducer: ClientKafka,
  ) {}

  /**
   * `user.login` 이벤트 발생 시 호출됩니다.
   * 1. 연속 로그인 조건의 활성 이벤트를 조회
   * 2. 각 이벤트에 대해 progress를 upsert (최대 ${MAX_RETRIES}회 재시도)
   * 3. 조건 충족 시 보상 요청을 bulkApprove
   * 4. 재시도 모두 실패 시 오류 이벤트 및 DLQ 토픽 발행
   *
   * @param userId - 로그인한 사용자 ID
   */
  async handleUserLogin(userId: string): Promise<void> {
    // 연속 로그인 조건의 활성 이벤트 목록 조회
    const activeEvents = await this.eventRepository.findByTypeAndActive(
      ConditionType.CONSECUTIVE_LOGIN,
    );

    for (const ev of activeEvents) {
      let attempt = 0;
      let lastError: Error | null = null;

      // 최대 MAX_RETRIES회까지 upsert 시도
      while (attempt < MAX_RETRIES) {
        try {
          const progress =
            await this.eventProgressRepository.upsertLoginProgress(
              userId,
              ev.id,
              ev.conditionParams.days,
            );

          // 조건 충족 시 보상 요청 승인
          if (progress.eligible) {
            await this.rewardRequestRepository.bulkApprove({
              userId,
              eventId: ev.id,
            });
          }
          break;
        } catch (err) {
          lastError = err as Error;
          attempt++;
          this.logger.warn(
            `upsert 실패: user=${userId}, event=${ev.id}, 시도 ${attempt}/${MAX_RETRIES} → ${lastError.message}`,
          );
          // 지수 백오프: 100ms * 2^(attempt-1)
          await new Promise((r) => setTimeout(r, 100 * 2 ** (attempt - 1)));
        }
      }

      // 모든 재시도 실패 시 오류 이벤트 발행
      if (attempt === MAX_RETRIES && lastError) {
        const payload = {
          userId,
          eventId: ev.id,
          error: lastError.message,
          timestamp: new Date().toISOString(),
        };

        this.logger.error(
          `upsert 완전 실패: user=${userId}, event=${ev.id}, error=${lastError.message}`,
        );

        // 실패 토픽
        this.kafkaProducer.emit('event.progress.failed', payload);
        // DLQ 토픽
        this.kafkaProducer.emit('event.progress.dlq', payload);
      }
    }
  }
}

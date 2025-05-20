import { Controller, Inject, Injectable, Logger } from '@nestjs/common';
import { EventPattern, Payload, ClientKafka } from '@nestjs/microservices';
import { AuthRepository } from '../../auth/repository/auth.repository';
import { UserDeletionSagaClient } from './user-deletion.client';

/**
 * 사용자 삭제 요청 SAGA를 오케스트레이션합니다.
 * - 'user.deletion.requested' 이벤트를 받아,
 *   1) 이벤트 서비스 삭제
 *   2) 사용자 soft-delete
 *   3) 성공/실패 이벤트 발행
 * - 실패 시 이전 단계를 보상(롤백) 처리합니다.
 */
@Injectable()
@Controller()
export class UserDeletionOrchestrator {
  private readonly logger = new Logger(UserDeletionOrchestrator.name);

  /**
   * @param userRepository - 사용자 데이터 접근 레이어
   * @param sagaClient - 다른 마이크로서비스(API) 호출 클라이언트
   * @param kafkaClient - SAGA 결과를 발행할 Kafka 클라이언트
   */
  constructor(
    private readonly userRepository: AuthRepository,
    private readonly sagaClient: UserDeletionSagaClient,
    @Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka,
  ) {}

  /**
   * 사용자 삭제 요청 이벤트를 처리합니다.
   *
   * 1. 이벤트 서비스에서 사용자 관련 리소스 삭제
   * 2. 사용자 도큐먼트 soft-delete
   * 3. 성공 시 'user.deletion.succeeded' 발행
   * 4. 실패 시, 완료한 단계들을 역순으로 보상 처리 후
   *    'user.deletion.failed' 발행
   *
   * @param message - Kafka 메시지 페이로드 ({ userId: string })
   */
  @EventPattern('user.deletion.requested')
  async handleDeletionRequested(@Payload() message: { userId: string }) {
    const { userId } = message;
    const steps: string[] = [];

    try {
      // 1) 이벤트 서비스 리소스 삭제
      await this.sagaClient.deleteEventByUser(userId);
      steps.push('events');

      // 2) 사용자 soft-delete
      await this.userRepository.softDelete(userId);
      steps.push('user');

      this.logger.log(`User(${userId}) fully deleted.`);

      // 3) 성공 이벤트 발행
      this.kafkaClient.emit('user.deletion.succeeded', { userId });
    } catch (err) {
      this.logger.error(`SAGA failed for ${userId}: ${err.message}`);

      // 4) 실패 시 보상 처리
      for (const step of [...steps].reverse()) {
        try {
          await this.compensateStep(step, userId);
        } catch (compErr) {
          this.logger.error(
            `compensation failed for step=${step}, user=${userId}: ${compErr.message}`,
          );
        }
      }

      // 실패 이벤트 발행
      this.kafkaClient.emit('user.deletion.failed', {
        userId,
        reason: err.message,
      });
    }
  }

  /**
   * SAGA 보상(roll‑back) 처리 메서드입니다.
   *
   * @param step - 보상할 단계 식별자 ('events' | 'user')
   * @param userId - 대상 사용자 ID
   * @returns Promise resolving when 보상 작업 완료
   */
  private compensateStep(step: string, userId: string) {
    switch (step) {
      case 'events':
        // 이벤트 서비스에서 복구 요청
        return this.sagaClient.restoreEventByUser(userId);

      case 'user':
        // 사용자 soft-delete 롤백 (restore)
        return this.userRepository.restoreById(userId);

      default:
        this.logger.warn(`Unknown compensation step: ${step}`);
    }
  }
}

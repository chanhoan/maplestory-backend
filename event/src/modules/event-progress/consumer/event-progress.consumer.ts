import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { EventProgressService } from '../service/event-progress.service';

/**
 * Kafka 메시지의 `user.login` 이벤트를 수신하여
 * 해당 유저의 이벤트 진행 상태를 업데이트하는 컨슈머입니다.
 */
@Controller()
export class EventProgressConsumer {
  private readonly logger = new Logger(EventProgressConsumer.name);

  constructor(private readonly eventProgressService: EventProgressService) {}

  /**
   * `user.login` 이벤트를 처리합니다.
   * - Kafka 토픽에서 수신된 userId로 이벤트 프로그레스 로직을 호출
   *
   * @param payload - Kafka 메시지 페이로드 ({ userId: string })
   */
  @EventPattern('user.login')
  async handleUserLogin(@Payload() payload: { userId: string }): Promise<void> {
    const { userId } = payload;
    this.logger.log(`Received user.login for user=${userId}`);
    await this.eventProgressService.handleUserLogin(userId);
  }
}

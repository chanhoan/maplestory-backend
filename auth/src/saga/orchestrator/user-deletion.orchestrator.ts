import { Inject, Injectable, Logger } from '@nestjs/common';
import { EventPattern, Payload, ClientKafka } from '@nestjs/microservices';
import { UserRepository } from '../../user/user.repository';
import { UserDeletionSagaClient } from '../clients/user-deletion.client';

@Injectable()
export class UserDeletionOrchestrator {
  private readonly logger = new Logger(UserDeletionOrchestrator.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly sagaClient: UserDeletionSagaClient,
    @Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka,
  ) {}

  @EventPattern('user.deletion.requested')
  async handleDeletionRequested(@Payload() message: { username: string }) {
    const { username } = message;
    const steps: string[] = [];

    try {
      await this.sagaClient.deleteEventByUser(username);
      steps.push('events');

      this.logger.log(`User(${username}) fully deleted.`);

      this.kafkaClient.emit('user.deletion.succeeded', { username });
    } catch (err) {
      this.logger.error(`SAGA failed for ${username}: ${err.message}`);

      for (const step of steps.reverse()) {
        try {
          await this.compensateStep(step, username);
        } catch (compErr) {
          this.logger.error(
            `compensation failed for step=${step}, user=${username}: ${compErr.message}`,
          );
        }
      }

      await this.userRepository.restoreByUsername(username);

      this.kafkaClient.emit('user.deletion.failed', {
        username,
        reason: err.message,
      });
    }
  }

  private compensateStep(step: string, username: string) {
    switch (step) {
      case 'events':
        return this.sagaClient.restoreEventByUser(username);
      default:
        this.logger.warn(`Unknown compensation step: ${step}`);
    }
  }
}

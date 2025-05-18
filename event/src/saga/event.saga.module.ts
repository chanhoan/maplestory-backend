import { Module } from '@nestjs/common';
import { EventProgressModule } from '../event-progress/event-progress.module';
import { RewardRequestModule } from '../reward-request/reward-request.module';
import { EventSagaService } from './event.saga.service';
import { EventSagaController } from './event.saga.controller';

@Module({
  imports: [EventProgressModule, RewardRequestModule],
  controllers: [EventSagaController],
  providers: [EventSagaService],
})
export class EventSagaModule {}

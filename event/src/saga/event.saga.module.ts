import { Module } from '@nestjs/common';
import { EventProgressModule } from '../modules/event-progress/event-progress.module';
import { RewardRequestModule } from '../modules/reward-request/reward-request.module';
import { EventSagaService } from './service/event.saga.service';
import { EventSagaController } from './controller/event.saga.controller';

@Module({
  imports: [EventProgressModule, RewardRequestModule],
  controllers: [EventSagaController],
  providers: [EventSagaService],
})
export class EventSagaModule {}

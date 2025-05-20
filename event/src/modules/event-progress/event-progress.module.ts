import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EventProgress, EventProgressSchema } from './schema/event-progress.schema';
import { EventProgressRepository } from './repository/event-progress.repository';
import { EventProgressConsumer } from './consumer/event-progress.consumer';
import { EventProgressService } from './service/event-progress.service';
import { KafkaModule } from '../../kafka/kafka.module';
import { EventModule } from '../event/event.module';
import { RewardRequestModule } from '../reward-request/reward-request.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: EventProgress.name, schema: EventProgressSchema },
    ]),
    KafkaModule,
    EventModule,
    forwardRef(() => RewardRequestModule),
  ],
  providers: [EventProgressRepository, EventProgressService],
  exports: [EventProgressRepository],
  controllers: [EventProgressConsumer],
})
export class EventProgressModule {}

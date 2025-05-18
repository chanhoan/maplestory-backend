import { Module } from '@nestjs/common';
import { CleanupService } from './cleanup.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Event, EventSchema } from '../event/event.schema';
import {
  EventProgress,
  EventProgressSchema,
} from '../event-progress/event-progress.schema';
import { Reward, RewardSchema } from '../reward/reward.schema';
import {
  RewardRequest,
  RewardRequestSchema,
} from '../reward-request/reward-request.schema';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    MongooseModule.forFeature([
      { name: Event.name, schema: EventSchema },
      { name: EventProgress.name, schema: EventProgressSchema },
      { name: Reward.name, schema: RewardSchema },
      { name: RewardRequest.name, schema: RewardRequestSchema },
    ]),
  ],
  providers: [CleanupService],
})
export class CleanupModule {}

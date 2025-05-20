import { Module } from '@nestjs/common';
import { CleanupService } from './cleanup.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Event, EventSchema } from '../modules/event/schema/event.schema';
import {
  EventProgress,
  EventProgressSchema,
} from '../modules/event-progress/schema/event-progress.schema';
import { Reward, RewardSchema } from '../modules/reward/schema/reward.schema';
import {
  RewardRequest,
  RewardRequestSchema,
} from '../modules/reward-request/schema/reward-request.schema';
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

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Reward, RewardSchema } from './reward.schema';
import { RewardRepository } from './reward.repository';
import { Event, EventSchema } from '../event/event.schema';
import { EventRepository } from '../event/event.repository';
import { RewardController } from './reward.controller';
import { RewardService } from './reward.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Event.name, schema: EventSchema },
      { name: Reward.name, schema: RewardSchema },
    ]),
  ],
  controllers: [RewardController],
  providers: [EventRepository, RewardRepository, RewardService],
  exports: [RewardRepository],
})
export class RewardModule {}

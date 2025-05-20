import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Reward, RewardSchema } from './schema/reward.schema';
import { RewardRepository } from './repository/reward.repository';
import { Event, EventSchema } from '../event/schema/event.schema';
import { EventRepository } from '../event/repository/event.repository';
import { RewardController } from './controller/reward.controller';
import { RewardService } from './service/reward.service';

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

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RewardRequest, RewardRequestSchema } from './reward-request.schema';
import { RewardRequestRepository } from './reward-request.repository';
import { RewardRequestService } from './reward-request.service';
import { RewardRequestController } from './reward-request.controller';
import { EventModule } from '../event/event.module';
import { RewardModule } from '../reward/reward.module';
import { EventProgressModule } from '../event-progress/event-progress.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RewardRequest.name, schema: RewardRequestSchema },
    ]),
    EventModule,
    RewardModule,
    EventProgressModule,
  ],
  controllers: [RewardRequestController],
  providers: [RewardRequestRepository, RewardRequestService],
  exports: [RewardRequestRepository],
})
export class RewardRequestModule {}

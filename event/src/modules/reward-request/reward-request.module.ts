import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RewardRequest, RewardRequestSchema } from './schema/reward-request.schema';
import { RewardRequestRepository } from './repository/reward-request.repository';
import { RewardRequestService } from './service/reward-request.service';
import { RewardRequestController } from './controller/reward-request.controller';
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

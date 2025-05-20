import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import configuration from './config/configuration';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { EventModule } from './modules/event/event.module';
import { RewardModule } from './modules/reward/reward.module';
import { RewardRequestModule } from './modules/reward-request/reward-request.module';
import { EventProgressModule } from './modules/event-progress/event-progress.module';
import { KafkaModule } from './kafka/kafka.module';
import { EventSagaModule } from './saga/event.saga.module';
import { CleanupModule } from './cleanup/cleanup.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    DatabaseModule,
    EventModule,
    RewardModule,
    RewardRequestModule,
    EventProgressModule,
    EventSagaModule,
    KafkaModule,
    CleanupModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

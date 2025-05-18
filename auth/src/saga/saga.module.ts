import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { UserDeletionSagaClient } from './clients/user-deletion.client';
import { UserDeletionOrchestrator } from './orchestrator/user-deletion.orchestrator';
import { KafkaModule } from '../kafka/kafka.module';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../auth/user.shema';
import { AuthRepository } from '../auth/auth.repository';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    KafkaModule,
    HttpModule.register({ timeout: 5000 }),
  ],
  providers: [AuthRepository, UserDeletionSagaClient],
  controllers: [UserDeletionOrchestrator],
})
export class SagaModule {}

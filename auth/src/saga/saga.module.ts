import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { UserDeletionSagaClient } from './user-deletion/user-deletion.client';
import { UserDeletionOrchestrator } from './user-deletion/user-deletion.orchestrator';
import { KafkaModule } from '../kafka/kafka.module';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../modules/auth/schema/user.shema';
import { AuthRepository } from '../modules/auth/repository/auth.repository';

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

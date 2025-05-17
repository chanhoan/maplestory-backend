import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../user/user.shema';
import { UserRepository } from '../user/user.repository';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JWTConfigModule } from '../config/jwt/jwt.config.module';
import { CacheConfigModule } from '../config/cache/cache.config.module';
import { SagaModule } from '../saga/saga.module';
import { KafkaModule } from '../kafka/kafka.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    PassportModule,
    JWTConfigModule,
    CacheConfigModule,
    KafkaModule,
    SagaModule,
  ],
  controllers: [AuthController],
  providers: [UserRepository, AuthService],
  exports: [UserRepository],
})
export class AuthModule {}

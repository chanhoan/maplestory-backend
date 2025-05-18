import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './user.shema';
import { AuthRepository } from './auth.repository';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JWTConfigModule } from '../jwt/jwt.config.module';
import { CacheConfigModule } from '../cache/cache.config.module';
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
  providers: [AuthRepository, AuthService],
  exports: [AuthRepository],
})
export class AuthModule {}

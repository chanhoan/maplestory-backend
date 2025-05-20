import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schema/user.shema';
import { AuthRepository } from './repository/auth.repository';
import { AuthService } from './service/auth.service';
import { AuthController } from './controller/auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JWTConfigModule } from '../../jwt/jwt.config.module';
import { CacheConfigModule } from '../../cache/cache.config.module';
import { SagaModule } from '../../saga/saga.module';
import { KafkaModule } from '../../kafka/kafka.module';

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

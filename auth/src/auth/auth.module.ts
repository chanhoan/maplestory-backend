import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../user/user.shema';
import { UserRepository } from '../user/user.repository';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JWTConfigModule } from '../config/jwt/jwt.config.module';
import { CacheConfigModule } from '../config/cache/cache.config.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    PassportModule,
    JWTConfigModule,
    CacheConfigModule,
  ],
  controllers: [AuthController],
  providers: [UserRepository, AuthService],
})
export class AuthModule {}

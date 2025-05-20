import { Module } from '@nestjs/common';
import { CleanupService } from './cleanup.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { User, UserSchema } from '../modules/auth/schema/user.shema';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  providers: [CleanupService],
})
export class CleanupModule {}

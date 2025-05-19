import { Module, Global } from '@nestjs/common';
import { MongooseModule, MongooseModuleOptions } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Global()
@Module({
  imports: [
    ConfigModule,
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (cs: ConfigService): MongooseModuleOptions => {
        const m = cs.get<{
          host: string;
          port: number;
          db: string;
          user?: string;
          pass?: string;
        }>('mongodb')!;

        const uri = `mongodb://${encodeURIComponent(m.user!)}:${encodeURIComponent(m.pass!)}@${m.host}:${m.port}/${m.db}?authSource=${m.db}`;

        return {
          uri,
        };
      },
      inject: [ConfigService],
    }),
  ],
  exports: [MongooseModule],
})
export class DatabaseModule {}

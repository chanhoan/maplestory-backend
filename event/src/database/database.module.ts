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

        const auth =
          m.user && m.pass
            ? `${encodeURIComponent(m.user)}:${encodeURIComponent(m.pass)}@`
            : '';
        const uri = `mongodb://${auth}${m.host}:${m.port}/${m.db}`;

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

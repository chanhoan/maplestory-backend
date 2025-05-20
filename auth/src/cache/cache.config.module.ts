import { Module, Global } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as redisStore from 'cache-manager-redis-store';

@Global()
@Module({
  imports: [
    ConfigModule,
    CacheModule.registerAsync({
      imports: [ConfigModule],
      isGlobal: true,
      useFactory: (cs: ConfigService) => {
        const host = cs.get<string>('REDIS_HOST');
        const port = cs.get<number>('REDIS_PORT');
        const password = cs.get<string>('REDIS_PASSWORD');
        const ttl = cs.get<number>('REFRESH_TOKEN_TTL') || 60 * 60 * 24 * 7;

        return {
          store: redisStore,
          url: `redis://:${encodeURIComponent(password!)}@${host}:${port}`,

          ttl,
        };
      },
      inject: [ConfigService],
    }),
  ],
  exports: [CacheModule],
})
export class CacheConfigModule {}

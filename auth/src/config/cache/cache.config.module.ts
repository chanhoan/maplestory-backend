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
      useFactory: (cs: ConfigService) => ({
        store: redisStore,
        url: `redis://${cs.get('REDIS_HOST')}:${cs.get('REDIS_PORT')}`,
        ttl: cs.get<number>('REFRESH_TOKEN_TTL') || 60 * 60 * 24 * 7,
      }),
      inject: [ConfigService],
    }),
  ],
  exports: [CacheModule],
})
export class CacheConfigModule {}

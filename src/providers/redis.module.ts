import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Redis from 'ioredis';

import { REDIS, RedisConfig } from 'src/common';
import { redisConfig } from 'src/config';

@Module({
  imports: [ConfigModule.forFeature(redisConfig)],
  providers: [
    {
      provide: REDIS,
      useFactory: (configService: ConfigService) => {
        const redisConfig = configService.get<RedisConfig>('redis');

        return new Redis(redisConfig.host);
      },
      inject: [ConfigService],
    },
  ],
})
export class RedisModule {}

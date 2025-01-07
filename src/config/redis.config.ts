import { ConfigType, registerAs } from '@nestjs/config';

export const redisRegToken = 'redis';

export const RedisConfig = registerAs(redisRegToken, () => ({
  host: process.env.REDIS_HOST ?? 'romantic-locust-24380.upstash.io',
  port: process.env.REDIS_PORT ?? 6379,
  password: process.env.REDIS_PASSWORD || 'AV88AAIjcDE0NjhiYzViYzUwNGQ0MTZmODljYzkxMzllYzhhZTc3N3AxMA',
  db: process.env.REDIS_DB,
}));

export type IRedisConfig = ConfigType<typeof RedisConfig>;

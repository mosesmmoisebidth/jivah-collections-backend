import { CacheModuleAsyncOptions } from "@nestjs/cache-manager";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { redisStore } from "cache-manager-redis-store";

export const RedisOptions: CacheModuleAsyncOptions = {
  isGlobal: true,
  imports: [ConfigModule],
  useFactory: async (configService: ConfigService) => {
    const store = await redisStore({
      socket: {
        tls: true,
        connectTimeout: 15000,
        host: configService.get<string>('REDIS_HOST') || 'redis-14099.c10.us-east-1-2.ec2.redns.redis-cloud.com',
        port: parseInt(configService.get<string>('REDIS_PORT')!) || 14099,
      },
      password: configService.get<string>('REDIS_PASSWORD') || '5YgCbziHBoodq6q6RuYPz99MJGkcWNPq'
    });
    return {
      store: () => store,
    };
  },
  inject: [ConfigService],
};
import { ConfigType, registerAs } from '@nestjs/config';

export const cacheRegToken = 'cache';

export const CacheConfig = registerAs(cacheRegToken, () => ({
    cache_key: process.env.CACHING_KEY,
    cache_duration: process.env.CACHING_DURATION
}));
export type ICachingConfig = ConfigType<typeof CacheConfig>;


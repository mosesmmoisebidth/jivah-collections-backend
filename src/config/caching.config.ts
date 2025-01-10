import { ConfigType, registerAs } from '@nestjs/config';

export const cacheRegToken = 'cache';

export const CacheConfig = registerAs(cacheRegToken, () => ({
    cache_key: process.env.CACHING_KEY_PRODUCTS,
    cache_duration: process.env.CACHING_DURATION
}));
export type ICachingConfig = ConfigType<typeof CacheConfig>;


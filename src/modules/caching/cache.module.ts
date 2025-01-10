import { Module } from "@nestjs/common";
import { CacheModule } from "@nestjs/cache-manager";
import { CacheService } from "./cache.service";
import { RedisOptions } from "./caching";
@Module({
    imports: [
        CacheModule.registerAsync(RedisOptions)
    ],
    providers: [CacheService],
    exports: [CacheService]
})
export class CachingModule {}
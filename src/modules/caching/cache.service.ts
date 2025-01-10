import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Identifiable } from 'src/interfaces/identifiable.interface';

@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async get<T>(key: string): Promise<T | null> {
    return await this.cacheManager.get<T>(key);
  }

  async set(key: string, value: any, ttl: number = 3600): Promise<void> {
    await this.cacheManager.set(key, value,  ttl);
  }

  async del(key: string): Promise<void> {
    await this.cacheManager.del(key);
  }

  async update<T extends Identifiable>(key: string, id: string, newValue: T): Promise<void> {
    const items = await this.get<T[]>(key);
    if (items) {
      const index = items.findIndex(item => item.id === id);
      if (index !== -1) {
        items[index] = { ...items[index], ...newValue };
        await this.set(key, items);
      }
    }
  }

  async delete<T extends Identifiable>(key: string, id: string): Promise<void> {
    const items = await this.get<T[]>(key);
    if (items) {
      const updatedItems = items.filter(item => item.id !== id); // Filter out the item to be deleted
      await this.set(key, updatedItems); // Save back the updated array
    }
  }

  async reset(): Promise<void> {
    await this.cacheManager.reset();
  }
}

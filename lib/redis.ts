import { Redis } from 'ioredis';
import { LRUCache } from 'lru-cache';

// 環境變量配置
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

// 創建Redis客戶端
let redis: Redis | null = null;

// 創建內存緩存作為備用
const memoryCache = new LRUCache<string, any>({
  max: 500, // 最多緩存500個項目
  ttl: 1000 * 60 * 5, // 5分鐘過期
});

// 初始化Redis連接
export function getRedisClient() {
  if (!redis) {
    try {
      redis = new Redis(redisUrl);
      redis.on('error', (err) => {
        console.error('Redis連接錯誤:', err);
        redis = null;
      });
    } catch (error) {
      console.error('無法連接到Redis:', error);
    }
  }
  return redis;
}

/**
 * 從緩存獲取數據，如果不存在則從數據庫獲取並緩存
 * @param key 緩存鍵
 * @param fetchFn 獲取數據的函數
 * @param ttl 過期時間（秒）
 */
export async function getCachedData<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttl: number = 300 // 默認5分鐘
): Promise<T> {
  // 嘗試從內存緩存獲取
  const memCached = memoryCache.get(key);
  if (memCached) {
    return memCached as T;
  }

  // 嘗試從Redis獲取
  const client = getRedisClient();
  if (client) {
    try {
      const cached = await client.get(key);
      if (cached) {
        const parsedData = JSON.parse(cached) as T;
        // 同時更新內存緩存
        memoryCache.set(key, parsedData);
        return parsedData;
      }
    } catch (error) {
      console.error('Redis獲取數據錯誤:', error);
    }
  }

  // 如果緩存中沒有，從數據庫獲取
  const data = await fetchFn();

  // 存入內存緩存
  memoryCache.set(key, data);

  // 嘗試存入Redis
  if (client) {
    try {
      await client.set(key, JSON.stringify(data), 'EX', ttl);
    } catch (error) {
      console.error('Redis設置數據錯誤:', error);
    }
  }

  return data;
}

/**
 * 使緩存失效
 * @param key 緩存鍵或鍵的模式（使用*作為通配符）
 */
export async function invalidateCache(key: string): Promise<void> {
  // 從內存緩存中刪除
  memoryCache.delete(key);

  // 從Redis中刪除
  const client = getRedisClient();
  if (client) {
    try {
      if (key.includes('*')) {
        // 如果包含通配符，使用scan命令查找匹配的鍵
        const stream = client.scanStream({
          match: key,
          count: 100,
        });

        stream.on('data', (keys: string[]) => {
          if (keys.length) {
            const pipeline = client.pipeline();
            keys.forEach((k) => {
              pipeline.del(k);
            });
            pipeline.exec().catch((err) => {
              console.error('Redis批量刪除錯誤:', err);
            });
          }
        });

        stream.on('error', (err) => {
          console.error('Redis掃描錯誤:', err);
        });
      } else {
        // 直接刪除指定的鍵
        await client.del(key);
      }
    } catch (error) {
      console.error('Redis刪除數據錯誤:', error);
    }
  }
}
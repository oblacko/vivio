/**
 * Redis Client with Vercel KV fallback
 * Используется для rate limiting и кеширования
 * Поддерживает внешний Redis и Vercel KV как fallback
 */

import { createClient, RedisClientType } from 'redis';
import { kv } from "@vercel/kv";

const REDIS_URL = process.env.REDIS_URL;
const KV_REST_API_URL = process.env.KV_REST_API_URL;
const KV_REST_API_TOKEN = process.env.KV_REST_API_TOKEN;

// Redis клиент для внешнего Redis
let externalRedis: any = null;

// Функция для инициализации внешнего Redis клиента
async function initializeExternalRedis() {
  if (!REDIS_URL) {
    console.warn("REDIS_URL is not set. Using Vercel KV as fallback.");
    return null;
  }

  try {
    const client = createClient({
      url: REDIS_URL,
    });

    client.on('error', (err) => {
      console.error('External Redis Client Error:', err);
    });

    await client.connect();
    console.log('Connected to external Redis');
    return client;
  } catch (error) {
    console.error('Failed to connect to external Redis:', error);
    return null;
  }
}

// Инициализируем внешний Redis при импорте
if (REDIS_URL) {
  initializeExternalRedis().then(client => {
    externalRedis = client;
  }).catch(() => {
    console.warn("Failed to initialize external Redis, falling back to Vercel KV");
  });
}

// Основной Redis клиент с fallback логикой
export const redis = {
  // Если внешний Redis доступен, используем его, иначе Vercel KV
  get instance() {
    return externalRedis || kv;
  },

  // Проверяем доступность Redis
  get isExternalRedis() {
    return externalRedis !== null;
  },

  get isVercelKV() {
    return externalRedis === null && KV_REST_API_URL && KV_REST_API_TOKEN;
  }
};

// Экспортируем оригинальный Vercel KV клиент для прямого доступа
export const vercelKV = kv;

/**
 * Rate limiting
 */
export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

export async function checkRateLimit(
  identifier: string,
  limit: number,
  windowSeconds: number = 60
): Promise<RateLimitResult> {
  const redisInstance = redis.instance;

  if (!redisInstance) {
    // Если Redis не настроен, разрешаем запрос (для разработки)
    return {
      success: true,
      limit,
      remaining: limit - 1,
      reset: Date.now() + windowSeconds * 1000,
    };
  }

  const key = `ratelimit:${identifier}`;
  const now = Date.now();
  const window = windowSeconds * 1000;

  try {
    // Получаем текущий счетчик
    const count = await redisInstance.get(key);

    if (count === null) {
      // Первый запрос в окне
      if (redis.isExternalRedis) {
        await redisInstance.setEx(key, windowSeconds, '1');
      } else {
        await redisInstance.set(key, 1, { ex: windowSeconds });
      }
      return {
        success: true,
        limit,
        remaining: limit - 1,
        reset: now + window,
      };
    }

    const numericCount = typeof count === 'string' ? parseInt(count, 10) : count;

    if (numericCount >= limit) {
      // Лимит превышен
      const ttl = await redisInstance.ttl(key);
      return {
        success: false,
        limit,
        remaining: 0,
        reset: now + (ttl * 1000),
      };
    }

    // Увеличиваем счетчик
    await redisInstance.incr(key);
    return {
      success: true,
      limit,
      remaining: limit - numericCount - 1,
      reset: now + window,
    };
  } catch (error) {
    console.error("Redis rate limit error:", error);
    // При ошибке разрешаем запрос
    return {
      success: true,
      limit,
      remaining: limit - 1,
      reset: now + window,
    };
  }
}

/**
 * Кеширование данных
 */
export async function getCache<T>(key: string): Promise<T | null> {
  const redisInstance = redis.instance;

  if (!redisInstance) {
    return null;
  }

  try {
    const data = await redisInstance.get(key);
    if (redis.isExternalRedis && typeof data === 'string') {
      return JSON.parse(data) as T;
    }
    return data as T;
  } catch (error) {
    console.error("Redis get cache error:", error);
    return null;
  }
}

export async function setCache<T>(
  key: string,
  value: T,
  ttlSeconds: number
): Promise<void> {
  const redisInstance = redis.instance;

  if (!redisInstance) {
    return;
  }

  try {
    if (redis.isExternalRedis) {
      await redisInstance.setEx(key, ttlSeconds, JSON.stringify(value));
    } else {
      await redisInstance.set(key, value, { ex: ttlSeconds });
    }
  } catch (error) {
    console.error("Redis set cache error:", error);
  }
}

export async function deleteCache(key: string): Promise<void> {
  const redisInstance = redis.instance;

  if (!redisInstance) {
    return;
  }

  try {
    await redisInstance.del(key);
  } catch (error) {
    console.error("Redis delete cache error:", error);
  }
}

/**
 * Кеширование статусов job'ов (5 минут)
 */
export async function getJobStatusCache(jobId: string) {
  return getCache(`job:status:${jobId}`);
}

export async function setJobStatusCache(jobId: string, status: any) {
  return setCache(`job:status:${jobId}`, status, 5 * 60); // 5 минут
}

/**
 * Кеширование списка челленджей (1 час)
 */
export async function getChallengesCache() {
  return getCache("challenges:list");
}

export async function setChallengesCache(challenges: any[]) {
  return setCache("challenges:list", challenges, 60 * 60); // 1 час
}

/**
 * Кеширование списка вайбов (1 час)
 */
export async function getVibesCache() {
  return getCache("vibes:list");
}

export async function setVibesCache(vibes: any[]) {
  return setCache("vibes:list", vibes, 60 * 60); // 1 час
}

/**
 * Vercel KV (Redis) Client
 * Используется для rate limiting и кеширования
 */

import { kv } from "@vercel/kv";

const KV_REST_API_URL = process.env.KV_REST_API_URL;
const KV_REST_API_TOKEN = process.env.KV_REST_API_TOKEN;

if (!KV_REST_API_URL || !KV_REST_API_TOKEN) {
  console.warn(
    "KV_REST_API_URL and KV_REST_API_TOKEN are not set. Using fallback mode."
  );
}

export const redis = kv;

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
  if (!redis) {
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
    const count = await redis.get<number>(key);

    if (count === null) {
      // Первый запрос в окне
      await redis.set(key, 1, { ex: windowSeconds });
      return {
        success: true,
        limit,
        remaining: limit - 1,
        reset: now + window,
      };
    }

    if (count >= limit) {
      // Лимит превышен
      const ttl = await redis.ttl(key);
      return {
        success: false,
        limit,
        remaining: 0,
        reset: now + (ttl * 1000),
      };
    }

    // Увеличиваем счетчик
    await redis.incr(key);
    return {
      success: true,
      limit,
      remaining: limit - count - 1,
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
  if (!redis) {
    return null;
  }

  try {
    const data = await redis.get<T>(key);
    return data;
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
  if (!redis) {
    return;
  }

  try {
    await redis.set(key, value, { ex: ttlSeconds });
  } catch (error) {
    console.error("Redis set cache error:", error);
  }
}

export async function deleteCache(key: string): Promise<void> {
  if (!redis) {
    return;
  }

  try {
    await redis.del(key);
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

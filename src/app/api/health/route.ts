export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { redis } from "@/lib/redis/client";

/**
 * Health Check Endpoint
 * Проверяет работоспособность критических сервисов приложения
 * 
 * Возвращает:
 * - 200: Все сервисы работают
 * - 503: Один или несколько сервисов недоступны
 */

interface HealthCheckResult {
  status: "healthy" | "unhealthy" | "degraded";
  timestamp: string;
  uptime: number;
  services: {
    database: ServiceStatus;
    redis: ServiceStatus;
    externalApis: ServiceStatus;
  };
  version?: string;
  environment?: string;
}

interface ServiceStatus {
  status: "up" | "down" | "degraded";
  responseTime?: number;
  message?: string;
  details?: any;
}

/**
 * Проверка подключения к базе данных
 */
async function checkDatabase(): Promise<ServiceStatus> {
  const start = Date.now();
  
  try {
    // Простой запрос для проверки соединения
    await prisma.$queryRaw`SELECT 1`;
    
    const responseTime = Date.now() - start;
    
    return {
      status: "up",
      responseTime,
      message: "Database connection OK",
    };
  } catch (error) {
    return {
      status: "down",
      responseTime: Date.now() - start,
      message: "Database connection failed",
      details: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Проверка подключения к Redis
 */
async function checkRedis(): Promise<ServiceStatus> {
  const start = Date.now();
  
  try {
    const redisInstance = redis.instance;
    
    if (!redisInstance) {
      return {
        status: "down",
        message: "Redis not configured",
      };
    }

    // Проверка работоспособности через ping или set/get
    if (redis.isExternalRedis) {
      // Для внешнего Redis используем ping
      await redisInstance.ping();
    } else {
      // Для Vercel KV используем simple set/get
      const testKey = "health:check";
      const testValue = Date.now().toString();
      await redisInstance.set(testKey, testValue, { ex: 10 });
      const result = await redisInstance.get(testKey);
      
      if (result !== testValue) {
        throw new Error("Redis test failed: value mismatch");
      }
    }
    
    const responseTime = Date.now() - start;
    
    return {
      status: "up",
      responseTime,
      message: redis.isExternalRedis ? "External Redis OK" : "Vercel KV OK",
    };
  } catch (error) {
    return {
      status: "down",
      responseTime: Date.now() - start,
      message: "Redis connection failed",
      details: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Проверка внешних API (опционально)
 */
async function checkExternalApis(): Promise<ServiceStatus> {
  // Проверяем доступность критических внешних сервисов
  const checks = [];
  
  // Проверка Grok API (опционально, только проверка переменных)
  if (process.env.GROK_API_KEY && process.env.GROK_API_URL) {
    checks.push({ name: "Grok API", configured: true });
  }
  
  // Проверка Vercel Blob
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    checks.push({ name: "Vercel Blob", configured: true });
  }
  
  if (checks.length === 0) {
    return {
      status: "degraded",
      message: "No external APIs configured",
    };
  }
  
  return {
    status: "up",
    message: `${checks.length} external API(s) configured`,
    details: checks,
  };
}

/**
 * Главный обработчик health check
 */
export async function GET() {
  const timestamp = new Date().toISOString();
  const uptime = process.uptime();
  
  // Параллельная проверка всех сервисов
  const [database, redisCheck, externalApis] = await Promise.all([
    checkDatabase(),
    checkRedis(),
    checkExternalApis(),
  ]);
  
  // Определяем общий статус
  let overallStatus: "healthy" | "unhealthy" | "degraded" = "healthy";
  
  if (database.status === "down") {
    overallStatus = "unhealthy";
  } else if (redisCheck.status === "down" || externalApis.status === "degraded") {
    overallStatus = "degraded";
  }
  
  const result: HealthCheckResult = {
    status: overallStatus,
    timestamp,
    uptime,
    services: {
      database,
      redis: redisCheck,
      externalApis,
    },
    version: process.env.npm_package_version || "unknown",
    environment: process.env.NODE_ENV || "unknown",
  };
  
  // Возвращаем соответствующий статус код
  const statusCode = 
    overallStatus === "unhealthy" ? 503 : 
    overallStatus === "degraded" ? 200 : // Degraded всё ещё возвращает 200, но с предупреждением
    200;
  
  return NextResponse.json(result, { 
    status: statusCode,
    headers: {
      "Cache-Control": "no-store, max-age=0",
    },
  });
}

/**
 * HEAD запрос для быстрой проверки без деталей
 */
export async function HEAD() {
  try {
    // Быстрая проверка только БД
    await prisma.$queryRaw`SELECT 1`;
    return new NextResponse(null, { status: 200 });
  } catch {
    return new NextResponse(null, { status: 503 });
  }
}

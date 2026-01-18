import { NextResponse } from "next/server";
import { deleteCache, redis } from "@/lib/redis/client";

export async function POST(request: Request) {
  try {
    console.log('🧹 Clearing all caches...');

    // Проверяем авторизацию для безопасности (опционально)
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.CACHE_CLEAR_TOKEN;

    if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const redisInstance = redis.instance;

    if (redisInstance) {
      if (redis.isExternalRedis) {
        // Для внешнего Redis очищаем по шаблону
        try {
          const keys = await redisInstance.keys('*');
          if (keys.length > 0) {
            await redisInstance.del(keys);
            console.log(`🗑️  Cleared ${keys.length} Redis cache keys`);
          }
        } catch (error) {
          console.error('❌ Redis clear error:', error);
        }
      } else {
        // Для Vercel KV очищаем конкретные ключи
        try {
          const keys = ['challenges:list', 'challenges:list:v2'];
          for (const key of keys) {
            await redisInstance.del(key);
          }
          console.log('🗑️  Cleared Vercel KV cache keys');
        } catch (error) {
          console.error('❌ Vercel KV clear error:', error);
        }
      }
    }

    // Также очищаем через функцию deleteCache для совместимости
    await deleteCache("challenges:list");

    console.log('✅ All caches cleared successfully');

    return NextResponse.json({
      success: true,
      message: "All caches cleared successfully",
      timestamp: new Date().toISOString(),
      redisType: redis.isExternalRedis ? 'external' : redis.isVercelKV ? 'vercel-kv' : 'none'
    });

  } catch (error) {
    console.error("❌ Cache clear error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to clear cache",
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Use POST method to clear caches",
    usage: "POST /api/cache/clear"
  });
}
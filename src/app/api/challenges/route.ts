export const runtime = 'nodejs';

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { getChallengesCache, setChallengesCache } from "@/lib/redis/client";

// export const revalidate = 60; // ISR: отключено для разработки

export async function GET() {
  try {
    // Проверяем переменную окружения для отключения кеширования
    const disableCache = process.env.DISABLE_CACHE === 'true';

    if (disableCache) {
      console.log('🚫 Cache disabled via DISABLE_CACHE=true');
    } else {
      // Проверка кеша Redis
      const cached = await getChallengesCache();
      if (cached) {
        console.log('✅ Serving from Redis cache');
        return NextResponse.json(cached);
      }
    }

    // Получение из БД
    console.log('🔄 Fetching from database');
    const challenges = await prisma.challenge.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        participantCount: "desc",
      },
      take: 50,
    });

    // Сохранение в кеш, если кеширование не отключено
    if (!disableCache) {
      await setChallengesCache(challenges);
      console.log('💾 Saved to cache');
    }

    return NextResponse.json(challenges);
  } catch (error) {
    console.error("Get challenges error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch challenges",
      },
      { status: 500 }
    );
  }
}

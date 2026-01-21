export const runtime = 'nodejs';

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { getVibesCache, setVibesCache } from "@/lib/redis/client";

// export const revalidate = 60; // ISR: отключено для разработки

export async function GET() {
  try {
    // Проверяем переменную окружения для отключения кеширования
    const disableCache = process.env.DISABLE_CACHE === 'true';

    if (disableCache) {
      console.log('🚫 Cache disabled via DISABLE_CACHE=true');
    } else {
      // Проверка кеша Redis
      const cached = await getVibesCache();
      if (cached) {
        console.log('✅ Serving from Redis cache');
        return NextResponse.json(cached);
      }
    }

    // Получение из БД
    console.log('🔄 Fetching from database');
    const vibes = await prisma.vibe.findMany({
      where: {
        isActive: true,
      },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
      orderBy: {
        participantCount: "desc",
      },
      take: 50,
    });

    // Преобразуем теги в удобный формат
    const vibesWithTags = vibes.map(vibe => ({
      ...vibe,
      tags: vibe.tags.map(vt => vt.tag),
    }));

    // Сохранение в кеш, если кеширование не отключено
    if (!disableCache) {
      await setVibesCache(vibesWithTags);
      console.log('💾 Saved to cache');
    }

    return NextResponse.json(vibesWithTags);
  } catch (error) {
    console.error("Get vibes error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch vibes",
      },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { getChallengesCache, setChallengesCache } from "@/lib/redis/client";

export const revalidate = 60; // ISR: revalidate каждые 60 секунд

export async function GET() {
  try {
    // Проверка кеша Redis
    const cached = await getChallengesCache();
    if (cached) {
      return NextResponse.json(cached);
    }

    // Получение из БД
    const challenges = await prisma.challenge.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        participantCount: "desc",
      },
      take: 50,
    });

    // Сохранение в кеш
    await setChallengesCache(challenges);

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

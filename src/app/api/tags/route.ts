export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";

export async function GET() {
  try {
    // Получаем теги с подсчетом через промежуточную таблицу
    const tags = await prisma.tag.findMany({
      include: {
        vibes: {
          select: {
            vibeId: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    // Преобразуем данные для безопасности и считаем количество вайбов
    const tagsWithCount = tags.map(tag => ({
      id: tag.id,
      name: tag.name,
      createdAt: tag.createdAt.toISOString(),
      _count: {
        vibes: tag.vibes?.length ?? 0,
      },
    }));

    return NextResponse.json(tagsWithCount);
  } catch (error) {
    console.error("Get tags error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch tags";
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error("Error details:", { errorMessage, errorStack });
    
    return NextResponse.json(
      {
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Необходима авторизация" },
        { status: 401 }
      );
    }

    const favorites = await prisma.favoriteVibe.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        vibe: {
          include: {
            tags: {
              include: {
                tag: true,
              },
            },
            _count: {
              select: {
                videos: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Преобразуем теги в удобный формат
    const favoritesWithTags = favorites.map(fav => ({
      ...fav,
      vibe: {
        ...fav.vibe,
        tags: fav.vibe.tags.map(vt => vt.tag),
      },
    }));

    return NextResponse.json(favoritesWithTags);
  } catch (error) {
    console.error("Get favorites error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch favorites",
      },
      { status: 500 }
    );
  }
}

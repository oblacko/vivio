export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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

    // Преобразуем теги в удобный формат и фильтруем удаленные вайбы
    const favoritesWithTags = favorites
      .filter(fav => fav.vibe !== null) // Фильтруем удаленные вайбы
      .map(fav => {
        const vibe = fav.vibe!;
        return {
          id: fav.id,
          userId: fav.userId,
          vibeId: fav.vibeId,
          createdAt: fav.createdAt.toISOString(),
          vibe: {
            id: vibe.id,
            title: vibe.title,
            description: vibe.description,
            category: vibe.category,
            thumbnailUrl: vibe.thumbnailUrl,
            promptTemplate: vibe.promptTemplate,
            participantCount: vibe.participantCount,
            isActive: vibe.isActive,
            createdAt: vibe.createdAt.toISOString(),
            updatedAt: vibe.updatedAt.toISOString(),
            tags: vibe.tags?.map(vt => ({
              id: vt.tag.id,
              name: vt.tag.name,
              createdAt: vt.tag.createdAt.toISOString(),
            })) ?? [],
            _count: {
              videos: vibe._count?.videos ?? 0,
            },
          },
        };
      });

    return NextResponse.json(favoritesWithTags);
  } catch (error) {
    console.error("Get favorites error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch favorites";
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

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    const video = await prisma.video.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        vibe: {
          include: {
            tags: {
              include: {
                tag: true,
              },
            },
          },
        },
      },
    });

    if (!video) {
      return NextResponse.json(
        { error: "Video not found" },
        { status: 404 }
      );
    }

    // Преобразуем теги в удобный формат
    const videoWithTags = {
      ...video,
      vibe: video.vibe ? {
        ...video.vibe,
        tags: video.vibe.tags.map((vt: any) => vt.tag),
      } : undefined,
    };

    // Увеличить счетчик просмотров
    await prisma.video.update({
      where: { id },
      data: {
        viewsCount: {
          increment: 1,
        },
      },
    });

    return NextResponse.json({
      ...videoWithTags,
      viewsCount: videoWithTags.viewsCount + 1,
    });
  } catch (error) {
    console.error("Get video error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch video",
      },
      { status: 500 }
    );
  }
}

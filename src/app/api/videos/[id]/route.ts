export const runtime = 'nodejs';

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = params;

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
          select: {
            id: true,
            title: true,
            category: true,
          },
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

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const body = await request.json();
    const { source, referrer, userAgent } = body;

    // Проверяем существование видео
    const video = await prisma.video.findUnique({
      where: { id },
    });

    if (!video) {
      return NextResponse.json(
        { error: "Video not found" },
        { status: 404 }
      );
    }

    // Создаем запись о шеринге
    await prisma.videoShare.create({
      data: {
        videoId: id,
        source: source || 'direct',
        referrer: referrer || null,
        userAgent: userAgent || null,
      },
    });

    // Обновляем счетчик шерингов
    const updatedVideo = await prisma.video.update({
      where: { id },
      data: {
        shareCount: {
          increment: 1,
        },
      },
    });

    return NextResponse.json({
      success: true,
      shareCount: updatedVideo.shareCount,
    });
  } catch (error) {
    console.error("Share video error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to record share",
      },
      { status: 500 }
    );
  }
}

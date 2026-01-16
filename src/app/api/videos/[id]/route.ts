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
        challenge: {
          select: {
            id: true,
            title: true,
            category: true,
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
      ...video,
      viewsCount: video.viewsCount + 1,
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

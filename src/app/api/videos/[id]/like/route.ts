export const runtime = 'nodejs';

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";

interface RouteParams {
  params: {
    id: string;
  };
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { id } = params;

    const video = await prisma.video.findUnique({
      where: { id },
    });

    if (!video) {
      return NextResponse.json(
        { error: "Video not found" },
        { status: 404 }
      );
    }

    // Увеличить счетчик лайков
    const updated = await prisma.video.update({
      where: { id },
      data: {
        likesCount: {
          increment: 1,
        },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Like video error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to like video",
      },
      { status: 500 }
    );
  }
}

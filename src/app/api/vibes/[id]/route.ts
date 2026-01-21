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

    const vibe = await prisma.vibe.findUnique({
      where: { id },
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
    });

    if (!vibe) {
      return NextResponse.json(
        { error: "Vibe not found" },
        { status: 404 }
      );
    }

    // Преобразуем теги в удобный формат
    const vibeWithTags = {
      ...vibe,
      tags: vibe.tags.map(vt => vt.tag),
    };

    return NextResponse.json(vibeWithTags);
  } catch (error) {
    console.error("Get vibe error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch vibe",
      },
      { status: 500 }
    );
  }
}

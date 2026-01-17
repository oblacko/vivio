export const runtime = 'nodejs';

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";

export const revalidate = 30; // ISR: revalidate каждые 30 секунд

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const challengeId = searchParams.get("challengeId");
    const category = searchParams.get("category");
    const sortBy = searchParams.get("sortBy") || "recent";
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Определяем сортировку
    let orderBy: any = { createdAt: "desc" };
    if (sortBy === "popular") {
      orderBy = { likesCount: "desc" };
    } else if (sortBy === "views") {
      orderBy = { viewsCount: "desc" };
    }

    const videos = await prisma.video.findMany({
      where: {
        isPublic: true,
        ...(challengeId && { challengeId }),
        ...(category && {
          challenge: {
            category: category as any,
          },
        }),
      },
      orderBy,
      take: limit,
      skip: offset,
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

    return NextResponse.json(videos);
  } catch (error) {
    console.error("Get videos error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch videos",
      },
      { status: 500 }
    );
  }
}

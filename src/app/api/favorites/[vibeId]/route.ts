export const runtime = 'nodejs';

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { auth } from "@/lib/auth";

interface RouteParams {
  params: {
    vibeId: string;
  };
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Необходима авторизация" },
        { status: 401 }
      );
    }

    const { vibeId } = params;

    // Проверяем существование вайба
    const vibe = await prisma.vibe.findUnique({
      where: { id: vibeId },
    });

    if (!vibe) {
      return NextResponse.json(
        { error: "Вайб не найден" },
        { status: 404 }
      );
    }

    // Проверяем, не добавлен ли уже в избранное
    const existingFavorite = await prisma.favoriteVibe.findUnique({
      where: {
        userId_vibeId: {
          userId: session.user.id,
          vibeId: vibeId,
        },
      },
    });

    if (existingFavorite) {
      return NextResponse.json(
        { error: "Вайб уже в избранном" },
        { status: 400 }
      );
    }

    // Добавляем в избранное
    const favorite = await prisma.favoriteVibe.create({
      data: {
        userId: session.user.id,
        vibeId: vibeId,
      },
      include: {
        vibe: true,
      },
    });

    return NextResponse.json(favorite, { status: 201 });
  } catch (error) {
    console.error("Add to favorites error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to add to favorites",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Необходима авторизация" },
        { status: 401 }
      );
    }

    const { vibeId } = params;

    // Удаляем из избранного
    const deleted = await prisma.favoriteVibe.deleteMany({
      where: {
        userId: session.user.id,
        vibeId: vibeId,
      },
    });

    if (deleted.count === 0) {
      return NextResponse.json(
        { error: "Вайб не найден в избранном" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Вайб удален из избранного",
    });
  } catch (error) {
    console.error("Remove from favorites error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to remove from favorites",
      },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { deleteCache } from "@/lib/redis/client";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

const addTagSchema = z.object({
  tagId: z.string(),
});

const removeTagSchema = z.object({
  tagId: z.string(),
});

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const resolvedParams = await params;
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Необходима авторизация" },
        { status: 401 }
      );
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Доступ запрещен. Требуется роль администратора" },
        { status: 403 }
      );
    }

    const { id: vibeId } = resolvedParams;
    const body = await request.json();
    const { tagId } = addTagSchema.parse(body);

    // Проверяем существование вайба и тега
    const [vibe, tag] = await Promise.all([
      prisma.vibe.findUnique({ where: { id: vibeId } }),
      prisma.tag.findUnique({ where: { id: tagId } }),
    ]);

    if (!vibe) {
      return NextResponse.json(
        { error: "Вайб не найден" },
        { status: 404 }
      );
    }

    if (!tag) {
      return NextResponse.json(
        { error: "Тег не найден" },
        { status: 404 }
      );
    }

    // Проверяем, не добавлен ли уже тег
    const existingVibeTag = await prisma.vibeTag.findUnique({
      where: {
        vibeId_tagId: {
          vibeId,
          tagId,
        },
      },
    });

    if (existingVibeTag) {
      return NextResponse.json(
        { error: "Этот тег уже добавлен к вайбу" },
        { status: 400 }
      );
    }

    // Добавляем тег к вайбу
    const vibeTag = await prisma.vibeTag.create({
      data: {
        vibeId,
        tagId,
      },
      include: {
        tag: true,
      },
    });

    // Инвалидация кеша
    await deleteCache("vibes:list");

    return NextResponse.json(vibeTag, { status: 201 });
  } catch (error) {
    console.error("Add tag to vibe error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Ошибка валидации", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to add tag to vibe",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const resolvedParams = await params;
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Необходима авторизация" },
        { status: 401 }
      );
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Доступ запрещен. Требуется роль администратора" },
        { status: 403 }
      );
    }

    const { id: vibeId } = resolvedParams;
    const body = await request.json();
    const { tagId } = removeTagSchema.parse(body);

    // Удаляем связь тега с вайбом
    const deleted = await prisma.vibeTag.deleteMany({
      where: {
        vibeId,
        tagId,
      },
    });

    if (deleted.count === 0) {
      return NextResponse.json(
        { error: "Связь тега с вайбом не найдена" },
        { status: 404 }
      );
    }

    // Инвалидация кеша
    await deleteCache("vibes:list");

    return NextResponse.json({
      message: "Тег успешно удален у вайба",
    });
  } catch (error) {
    console.error("Remove tag from vibe error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Ошибка валидации", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to remove tag from vibe",
      },
      { status: 500 }
    );
  }
}

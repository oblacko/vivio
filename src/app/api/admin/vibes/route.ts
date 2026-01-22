export const runtime = 'nodejs';

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { setVibesCache, deleteCache } from "@/lib/redis/client";

const createVibeSchema = z.object({
  title: z.string().min(1, "Название обязательно"),
  description: z.string().optional(),
  category: z.enum(["MONUMENTS", "PETS", "FACES", "SEASONAL"]),
  thumbnailUrl: z.string().url().optional(),
  promptTemplate: z.string().min(1, "Шаблон промпта обязателен"),
  isActive: z.boolean().default(true),
});

export async function POST(request: NextRequest) {
  try {
    // Проверка авторизации и роли
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

    // Валидация данных
    const body = await request.json();
    const validatedData = createVibeSchema.parse(body);

    // Создание вайба
    const vibe = await prisma.vibe.create({
      data: validatedData,
    });

    // Инвалидация кеша
    await deleteCache("vibes:list");

    return NextResponse.json(vibe, { status: 201 });
  } catch (error) {
    console.error("Create vibe error:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Ошибка валидации", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to create vibe",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Проверка авторизации и роли
    const session = await auth();
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Доступ запрещен" },
        { status: 403 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const isActive = searchParams.get("isActive");
    const sortBy = searchParams.get("sortBy") || "createdAt"; // createdAt, participantCount
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const tagId = searchParams.get("tagId");
    const search = searchParams.get("search");

    const skip = (page - 1) * limit;

    // Формируем фильтры
    const where: any = {};
    if (isActive && isActive !== "all") {
      where.isActive = isActive === "true";
    }
    if (tagId && tagId !== "all") {
      where.tags = {
        some: {
          tagId: tagId
        }
      };
    }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Получаем данные и общее количество параллельно
    const [vibes, totalCount] = await Promise.all([
      prisma.vibe.findMany({
        where,
        include: {
          tags: {
            include: {
              tag: true,
            },
          },
        },
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip,
        take: limit,
      }),
      prisma.vibe.count({ where })
    ]);

    // Преобразуем теги в удобный формат
    const vibesWithTags = vibes.map(vibe => ({
      ...vibe,
      tags: vibe.tags.map(vt => vt.tag),
    }));

    return NextResponse.json({
      vibes: vibesWithTags,
      pagination: {
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
        currentPage: page,
        limit
      }
    });
  } catch (error) {
    console.error("Get admin vibes error:", error);
    return NextResponse.json(
      { error: "Не удалось загрузить вайбы" },
      { status: 500 }
    );
  }
}

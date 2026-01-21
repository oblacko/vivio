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

    // Проверка на дубликаты
    const existingVibe = await prisma.vibe.findUnique({
      where: { title: validatedData.title },
    });

    if (existingVibe) {
      return NextResponse.json(
        { error: "Вайб с таким названием уже существует" },
        { status: 400 }
      );
    }

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

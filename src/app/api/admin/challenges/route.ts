export const runtime = 'nodejs';

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { setChallengesCache, deleteCache } from "@/lib/redis/client";

const createChallengeSchema = z.object({
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


    // Валидация данных
    const body = await request.json();
    const validatedData = createChallengeSchema.parse(body);

    // Проверка на дубликаты
    const existingChallenge = await prisma.challenge.findUnique({
      where: { title: validatedData.title },
    });

    if (existingChallenge) {
      return NextResponse.json(
        { error: "Челлендж с таким названием уже существует" },
        { status: 400 }
      );
    }

    // Создание челленджа
    const challenge = await prisma.challenge.create({
      data: validatedData,
    });

    // Инвалидация кеша
    await deleteCache("challenges:list");

    return NextResponse.json(challenge, { status: 201 });
  } catch (error) {
    console.error("Create challenge error:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Ошибка валидации", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to create challenge",
      },
      { status: 500 }
    );
  }
}

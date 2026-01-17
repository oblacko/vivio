export const runtime = 'nodejs';

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { deleteCache } from "@/lib/redis/client";

interface RouteParams {
  params: {
    id: string;
  };
}

const updateChallengeSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  category: z.enum(["MONUMENTS", "PETS", "FACES", "SEASONAL"]).optional(),
  thumbnailUrl: z.string().url().optional(),
  promptTemplate: z.string().min(1).optional(),
  isActive: z.boolean().optional(),
});

export async function PATCH(request: NextRequest, { params }: RouteParams) {
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

    const { id } = params;

    // Проверка существования челленджа
    const existingChallenge = await prisma.challenge.findUnique({
      where: { id },
    });

    if (!existingChallenge) {
      return NextResponse.json(
        { error: "Челлендж не найден" },
        { status: 404 }
      );
    }

    // Валидация данных
    const body = await request.json();
    const validatedData = updateChallengeSchema.parse(body);

    // Проверка на дубликаты названия
    if (validatedData.title && validatedData.title !== existingChallenge.title) {
      const duplicateTitle = await prisma.challenge.findUnique({
        where: { title: validatedData.title },
      });

      if (duplicateTitle) {
        return NextResponse.json(
          { error: "Челлендж с таким названием уже существует" },
          { status: 400 }
        );
      }
    }

    // Обновление челленджа
    const updatedChallenge = await prisma.challenge.update({
      where: { id },
      data: validatedData,
    });

    // Инвалидация кеша
    await deleteCache("challenges:list");

    return NextResponse.json(updatedChallenge);
  } catch (error) {
    console.error("Update challenge error:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Ошибка валидации", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to update challenge",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
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

    const { id } = params;

    // Проверка существования челленджа
    const existingChallenge = await prisma.challenge.findUnique({
      where: { id },
    });

    if (!existingChallenge) {
      return NextResponse.json(
        { error: "Челлендж не найден" },
        { status: 404 }
      );
    }

    // Деактивация вместо удаления (soft delete)
    const deactivatedChallenge = await prisma.challenge.update({
      where: { id },
      data: { isActive: false },
    });

    // Инвалидация кеша
    await deleteCache("challenges:list");

    return NextResponse.json({
      message: "Челлендж деактивирован",
      challenge: deactivatedChallenge,
    });
  } catch (error) {
    console.error("Delete challenge error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to delete challenge",
      },
      { status: 500 }
    );
  }
}

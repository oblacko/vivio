import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/client";
import { auth } from "@/lib/auth";
import { deleteCache } from "@/lib/redis/client";

const updateVibeSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  category: z.enum(["MONUMENTS", "PETS", "FACES", "SEASONAL"]).optional(),
  thumbnailUrl: z.string().url().optional().or(z.literal("")),
  promptTemplate: z.string().min(1).optional(),
  isActive: z.boolean().optional(),
});

interface RouteParams {
  params: {
    id: string;
  };
}

export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
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

    // Проверка существования вайба
    const existingVibe = await prisma.vibe.findUnique({
      where: { id },
    });

    if (!existingVibe) {
      return NextResponse.json(
        { error: "Вайб не найден" },
        { status: 404 }
      );
    }

    // Валидация данных
    const body = await request.json();
    const validatedData = updateVibeSchema.parse(body);

    // Проверка на дубликаты названия при обновлении
    if (validatedData.title && validatedData.title !== existingVibe.title) {
      const duplicateVibe = await prisma.vibe.findUnique({
        where: { title: validatedData.title },
      });

      if (duplicateVibe) {
        return NextResponse.json(
          { error: "Вайб с таким названием уже существует" },
          { status: 400 }
        );
      }
    }

    // Обновление вайба
    const updatedVibe = await prisma.vibe.update({
      where: { id },
      data: {
        ...validatedData,
        thumbnailUrl: validatedData.thumbnailUrl || null,
      },
    });

    // Инвалидация кеша
    await deleteCache("vibes:list");

    console.log(`✅ Вайб "${updatedVibe.title}" обновлен`);

    return NextResponse.json(updatedVibe);
  } catch (error) {
    console.error("❌ Ошибка при обновлении вайба:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Ошибка валидации", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        error: "Не удалось обновить вайб",
        details: error instanceof Error ? error.message : "Неизвестная ошибка"
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
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

    // Проверка существования вайба
    const existingVibe = await prisma.vibe.findUnique({
      where: { id },
    });

    if (!existingVibe) {
      return NextResponse.json(
        { error: "Вайб не найден" },
        { status: 404 }
      );
    }

    // Удаление вайба
    await prisma.vibe.delete({
      where: { id },
    });

    // Инвалидация кеша
    await deleteCache("vibes:list");

    console.log(`✅ Вайб "${existingVibe.title}" удален`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Ошибка при удалении вайба:", error);

    return NextResponse.json(
      { 
        error: "Не удалось удалить вайб",
        details: error instanceof Error ? error.message : "Неизвестная ошибка"
      },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/client";
import { auth } from "@/lib/auth";
import { deleteCache } from "@/lib/redis/client";

const updateVibeSchema = z.object({
  title: z.string().min(1, "Название не должно быть пустым").optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  thumbnailUrl: z.string().optional(),
  promptTemplate: z.string().min(1, "Шаблон промпта не должен быть пустым").optional(),
  isActive: z.boolean().optional(),
});

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const resolvedParams = await params;
    
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

    const { id } = resolvedParams;

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
    
    // Проверка что title и promptTemplate не пустые, если переданы
    if (body.title !== undefined && (!body.title || body.title.trim() === "")) {
      return NextResponse.json(
        { error: "Название не должно быть пустым" },
        { status: 400 }
      );
    }
    
    if (body.promptTemplate !== undefined && (!body.promptTemplate || body.promptTemplate.trim() === "")) {
      return NextResponse.json(
        { error: "Шаблон промпта не должен быть пустым" },
        { status: 400 }
      );
    }
    
    const validatedData = updateVibeSchema.parse(body);

    // Подготовка данных для обновления
    const updateData: any = {};
    
    if (validatedData.title !== undefined) {
      updateData.title = validatedData.title.trim();
    }
    if (validatedData.promptTemplate !== undefined) {
      updateData.promptTemplate = validatedData.promptTemplate.trim();
    }
    if (validatedData.description !== undefined) {
      updateData.description = validatedData.description?.trim() || null;
    }
    if (validatedData.category !== undefined) {
      updateData.category = validatedData.category || null;
    }
    if (validatedData.thumbnailUrl !== undefined) {
      updateData.thumbnailUrl = validatedData.thumbnailUrl?.trim() || null;
    }
    if (validatedData.isActive !== undefined) {
      updateData.isActive = validatedData.isActive;
    }

    // Обновление вайба
    const updatedVibe = await prisma.vibe.update({
      where: { id },
      data: updateData,
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
    const resolvedParams = await params;
    
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

    const { id } = resolvedParams;

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

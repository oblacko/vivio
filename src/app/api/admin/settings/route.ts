export const runtime = 'nodejs';

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { auth } from "@/lib/auth";
import { z } from "zod";

const updateSettingsSchema = z.object({
  generationCost: z.number().positive("Стоимость генерации должна быть положительной"),
});

export async function GET(request: NextRequest) {
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

    // Получение настроек или создание дефолтных
    let settings = await prisma.appSettings.findUnique({
      where: { id: "singleton" },
    });

    if (!settings) {
      // Создание дефолтных настроек
      settings = await prisma.appSettings.create({
        data: {
          id: "singleton",
          generationCost: 20,
        },
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Get settings error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to get settings",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
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
    const validatedData = updateSettingsSchema.parse(body);

    // Обновление или создание настроек
    const settings = await prisma.appSettings.upsert({
      where: { id: "singleton" },
      update: {
        generationCost: validatedData.generationCost,
      },
      create: {
        id: "singleton",
        generationCost: validatedData.generationCost,
      },
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Update settings error:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Ошибка валидации", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to update settings",
      },
      { status: 500 }
    );
  }
}

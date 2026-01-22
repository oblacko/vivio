import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/client";
import { auth } from "@/lib/auth";
import { deepseekClient } from "@/lib/deepseek/client";
import { validateVibes, VIBE_JSON_SCHEMA_TEXT } from "@/lib/deepseek/vibe-schema";

const generateVibesSchema = z.object({
  instruction: z.string().min(1, "Инструкция обязательна"),
  count: z.number().min(1).max(50).optional(),
  title: z.string().optional(),
  jsonSchema: z.string().optional(),
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

    // Валидация входных данных
    const body = await request.json();
    const validatedData = generateVibesSchema.parse(body);

    console.log("🔍 Проверка Prisma моделей:");
    console.log("- vibe:", !!prisma.vibe);
    console.log("- vibeGenerationLog:", !!prisma.vibeGenerationLog);

    if (!prisma.vibeGenerationLog) {
      console.error("❌ Ошибка: prisma.vibeGenerationLog не определен! Попробуйте перезапустить сервер.");
      return NextResponse.json(
        { error: "Внутренняя ошибка конфигурации базы данных. Модель логов не найдена." },
        { status: 500 }
      );
    }

    console.log("🎨 Запуск генерации вайбов:");
    console.log("📝 Instruction:", validatedData.instruction);
    console.log("🔢 Count:", validatedData.count || "auto");

    // Сохранение лога инструкции
    await prisma.vibeGenerationLog.create({
      data: {
        instruction: validatedData.instruction,
        title: validatedData.title,
        count: validatedData.count || 5,
      },
    });

    // Генерация вайбов через DeepSeek
    const generateResponse = await deepseekClient.generateVibes({
      instruction: validatedData.instruction,
      count: validatedData.count,
      jsonSchema: validatedData.jsonSchema || VIBE_JSON_SCHEMA_TEXT,
    });

    console.log(`✅ DeepSeek вернул ${generateResponse.vibes.length} вайбов`);

    // Валидация структуры вайбов
    let validatedVibes;
    try {
      validatedVibes = validateVibes(generateResponse);
    } catch (validationError) {
      console.error("❌ Ошибка валидации вайбов:", validationError);
      return NextResponse.json(
        { error: "Сгенерированные вайбы не прошли валидацию", details: validationError },
        { status: 400 }
      );
    }

    // Сохранение вайбов в БД с isActive: false
    const createdVibes = [];
    const errors = [];

    for (const vibe of validatedVibes.vibes) {
      try {
        // Создание вайба
        const createdVibe = await prisma.vibe.create({
          data: {
            title: vibe.title,
            category: "OTHER", // Дефолтная категория, так как теперь она необязательна для AI
            promptTemplate: vibe.promptTemplate,
            description: vibe.description || null,
            isActive: false, // Важно: создаются как неактивные
            participantCount: 0,
          },
        });

        console.log(`✅ Вайб "${createdVibe.title}" создан с ID: ${createdVibe.id}`);
        createdVibes.push(createdVibe);
      } catch (error) {
        console.error(`❌ Ошибка при создании вайба "${vibe.title}":`, error);
        errors.push({
          title: vibe.title,
          error: error instanceof Error ? error.message : "Неизвестная ошибка",
        });
      }
    }

    console.log(`📊 Итого создано вайбов: ${createdVibes.length}/${validatedVibes.vibes.length}`);

    return NextResponse.json({
      success: true,
      created: createdVibes.length,
      total: validatedVibes.vibes.length,
      vibes: createdVibes,
      errors: errors.length > 0 ? errors : undefined,
    }, { status: 201 });

  } catch (error) {
    console.error("❌ Ошибка при генерации вайбов:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Ошибка валидации данных", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        error: "Не удалось сгенерировать вайбы",
        details: error instanceof Error ? error.message : "Неизвестная ошибка"
      },
      { status: 500 }
    );
  }
}

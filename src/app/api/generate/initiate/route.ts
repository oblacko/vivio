export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/client";
import { grokClient } from "@/lib/grok/client";
import { getPromptForCategory, DEFAULT_PROMPT } from "@/lib/grok/prompts";
import { auth } from "@/lib/auth";

const initiateSchema = z.object({
  vibeId: z.string().min(1).optional(),
  imageUrl: z.string().url(),
  aspectRatio: z.number().optional(),
  userId: z.string().optional(),
}).transform((data) => ({
  ...data,
  vibeId: data.vibeId || undefined, // Нормализуем пустые строки в undefined
}));

export async function POST(request: NextRequest) {
  try {
    // Проверка наличия необходимых переменных окружения
    if (!process.env.AUTH_SECRET) {
      console.error("AUTH_SECRET is not set");
      return NextResponse.json(
        { error: "Серверная конфигурация не завершена" },
        { status: 500 }
      );
    }

    // Проверка авторизации
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Необходима авторизация для создания видео" },
        { status: 401 }
      );
    }

    // Получение пользователя с балансом
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, balance: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Пользователь не найден" },
        { status: 404 }
      );
    }

    // Получение настроек приложения (стоимость генерации)
    let settings = await prisma.appSettings.findUnique({
      where: { id: "singleton" },
    });

    if (!settings) {
      // Создание дефолтных настроек если их нет
      settings = await prisma.appSettings.create({
        data: {
          id: "singleton",
          generationCost: 20,
        },
      });
    }

    // Проверка баланса
    if (user.balance < settings.generationCost) {
      return NextResponse.json(
        { 
          error: "Недостаточно кредитов для генерации видео",
          required: settings.generationCost,
          current: user.balance,
        },
        { status: 402 }
      );
    }

    const body = await request.json();
    console.log("📨 API /generate/initiate received body:", JSON.stringify(body, null, 2));
    console.log("📨 Raw vibeId from request:", body.vibeId, "type:", typeof body.vibeId);

    const validated = initiateSchema.parse(body);
    console.log("✅ Validated data:", JSON.stringify(validated, null, 2));
    console.log("✅ Validated vibeId:", validated.vibeId, "type:", typeof validated.vibeId);

    let promptTemplate;

    if (validated.vibeId) {
      // Получение вайба из БД
      console.log("🔍 Поиск вайба с ID:", validated.vibeId);
      console.log("🔍 VibeId is truthy:", !!validated.vibeId);
      console.log("🔍 VibeId length:", validated.vibeId.length);

      try {
        const vibe = await prisma.vibe.findUnique({
          where: { id: validated.vibeId },
        });

        console.log("✅ Результат запроса:", vibe ? `Найден: ${vibe.title}` : "Вайб не найден");
        console.log("✅ Vibe object:", vibe ? JSON.stringify({
          id: vibe.id,
          title: vibe.title,
          isActive: vibe.isActive,
          promptTemplate: vibe.promptTemplate?.substring(0, 100) + "..."
        }, null, 2) : "null");

        if (!vibe) {
          console.warn("⚠️ Вайб не найден, игнорируем vibeId");
          // Убираем vibeId из валидированных данных
          validated.vibeId = undefined;
          promptTemplate = DEFAULT_PROMPT;
        } else if (!vibe.isActive) {
          console.warn("⚠️ Вайб неактивен, игнорируем vibeId");
          // Убираем vibeId из валидированных данных
          validated.vibeId = undefined;
          promptTemplate = DEFAULT_PROMPT;
        } else {
          // Использование промпта из вайба
          promptTemplate = {
            prompt: vibe.promptTemplate,
          };
          console.log("✅ Используется промпт из вайба ID:", validated.vibeId);
        }
      } catch (dbError) {
        console.error("❌ Ошибка при запросе к БД:", dbError);
        // В случае ошибки БД игнорируем vibeId
        validated.vibeId = undefined;
        promptTemplate = DEFAULT_PROMPT;
        console.log("⚠️ Игнорируем vibeId из-за ошибки БД");
      }
    } else {
      // Использование дефолтного промпта
      promptTemplate = DEFAULT_PROMPT;
    }

    // Создание GenerationJob в БД
    const jobData: any = {
      imageUrl: validated.imageUrl,
      prompt: promptTemplate.prompt,
      aspectRatio: validated.aspectRatio,
      status: "QUEUED" as const,
      progress: 0,
      duration: 6,
      estimatedTime: 30,
    };

    // Добавление userId из сессии
    jobData.userId = user.id;
    if (validated.vibeId && validated.vibeId.trim()) {
      jobData.vibeId = validated.vibeId;
    }

    const job = await prisma.generationJob.create({
      data: jobData,
    });

    try {
      // Вызов Grok API для начала генерации
      const callbackUrl = process.env.WEBHOOK_URL
        ? `${process.env.WEBHOOK_URL}/api/generate/callback`
        : undefined;

      console.log("🎬 Инициация генерации видео:");
      console.log("📸 Image URL:", validated.imageUrl);
      console.log("💬 Prompt:", promptTemplate.prompt);
      console.log("💬 Prompt type:", typeof promptTemplate.prompt);
      console.log("💬 Prompt length:", promptTemplate.prompt.length);
      console.log("💬 Is DEFAULT_PROMPT used:", promptTemplate === DEFAULT_PROMPT);
      console.log("🔔 Callback URL:", callbackUrl || "не указан");

      const grokResponse = await grokClient.generateVideo({
        imageUrl: validated.imageUrl,
        prompt: promptTemplate.prompt,
        mode: "normal",
        callbackUrl,
      });

      // Обновление job с externalJobId и статусом PROCESSING
      try {
        await prisma.generationJob.update({
          where: { id: job.id },
          data: {
            externalJobId: grokResponse.taskId,
            status: "PROCESSING",
          },
        });
        console.log(`✅ Job ${job.id} updated with externalJobId: ${grokResponse.taskId}`);
      } catch (updateError) {
        console.error(`❌ Failed to update job ${job.id} with externalJobId:`, updateError);
        // Job все равно создан, но без externalJobId - webhook fallback должен сработать
        console.warn(`⚠️ Job ${job.id} created but externalJobId not saved - webhook fallback will be used`);
      }

      return NextResponse.json({
        success: true,
        jobId: job.id,
        estimatedTime: 30,
      });
    } catch (grokError) {
      // Если ошибка Grok API, обновляем job на FAILED
      await prisma.generationJob.update({
        where: { id: job.id },
        data: {
          status: "FAILED",
          errorMessage:
            grokError instanceof Error
              ? grokError.message
              : "Failed to initiate generation",
        },
      });

      throw grokError;
    }
  } catch (error) {
    console.error("Initiate generation error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to initiate generation",
      },
      { status: 500 }
    );
  }
}

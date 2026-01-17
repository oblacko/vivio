export const runtime = 'nodejs';

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/client";
import { grokClient } from "@/lib/grok/client";
import { getPromptForCategory, DEFAULT_PROMPT } from "@/lib/grok/prompts";

const initiateSchema = z.object({
  challengeId: z.string().min(1).optional(),
  imageUrl: z.string().url(),
  userId: z.string().optional(),
}).transform((data) => ({
  ...data,
  challengeId: data.challengeId || undefined, // Нормализуем пустые строки в undefined
}));

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = initiateSchema.parse(body);

    let promptTemplate;

    if (validated.challengeId) {
      // Получение челленджа из БД
      console.log("🔍 Поиск челленджа с ID:", validated.challengeId);

      try {
        const challenge = await prisma.challenge.findUnique({
          where: { id: validated.challengeId },
        });

        console.log("✅ Результат запроса:", challenge ? `Найден: ${challenge.title}` : "Челлендж не найден");

        if (!challenge) {
          console.warn("⚠️ Челлендж не найден, игнорируем challengeId");
          // Убираем challengeId из валидированных данных
          validated.challengeId = undefined;
          promptTemplate = DEFAULT_PROMPT;
        } else if (!challenge.isActive) {
          console.warn("⚠️ Челлендж неактивен, игнорируем challengeId");
          // Убираем challengeId из валидированных данных
          validated.challengeId = undefined;
          promptTemplate = DEFAULT_PROMPT;
        } else {
          // Получение промпта для категории
          promptTemplate = getPromptForCategory(
            challenge.category as "MONUMENTS" | "PETS" | "FACES" | "SEASONAL"
          );
          console.log("✅ Используется промпт для категории:", challenge.category);
        }
      } catch (dbError) {
        console.error("❌ Ошибка при запросе к БД:", dbError);
        // В случае ошибки БД игнорируем challengeId
        validated.challengeId = undefined;
        promptTemplate = DEFAULT_PROMPT;
        console.log("⚠️ Игнорируем challengeId из-за ошибки БД");
      }
    } else {
      // Использование дефолтного промпта
      promptTemplate = DEFAULT_PROMPT;
    }

    // Создание GenerationJob в БД
    const jobData: any = {
      imageUrl: validated.imageUrl,
      prompt: promptTemplate.prompt,
      status: "QUEUED" as const,
      progress: 0,
      duration: 6,
      estimatedTime: 30,
    };

    // Добавление опциональных полей с правильной типизацией
    if (validated.userId) {
      jobData.userId = validated.userId;
    }
    if (validated.challengeId && validated.challengeId.trim()) {
      jobData.challengeId = validated.challengeId;
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
      console.log("🔔 Callback URL:", callbackUrl || "не указан");

      const grokResponse = await grokClient.generateVideo({
        imageUrl: validated.imageUrl,
        prompt: promptTemplate.prompt,
        mode: "normal",
        callbackUrl,
      });

      // Обновление job с externalJobId и статусом PROCESSING
      await prisma.generationJob.update({
        where: { id: job.id },
        data: {
          externalJobId: grokResponse.taskId,
          status: "PROCESSING",
        },
      });

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

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/client";
import { grokClient } from "@/lib/grok/client";
import { getPromptForCategory } from "@/lib/grok/prompts";

const initiateSchema = z.object({
  challengeId: z.string().min(1),
  imageUrl: z.string().url(),
  userId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = initiateSchema.parse(body);

    // Получение челленджа из БД
    const challenge = await prisma.challenge.findUnique({
      where: { id: validated.challengeId },
    });

    if (!challenge) {
      return NextResponse.json(
        { error: "Challenge not found" },
        { status: 404 }
      );
    }

    if (!challenge.isActive) {
      return NextResponse.json(
        { error: "Challenge is not active" },
        { status: 400 }
      );
    }

    // Получение промпта для категории
    const promptTemplate = getPromptForCategory(
      challenge.category as "MONUMENTS" | "PETS" | "FACES" | "SEASONAL"
    );

    // Создание GenerationJob в БД
    const job = await prisma.generationJob.create({
      data: {
        userId: validated.userId || null,
        challengeId: validated.challengeId,
        imageUrl: validated.imageUrl,
        prompt: promptTemplate.prompt,
        status: "QUEUED",
        progress: 0,
        duration: 6,
        estimatedTime: 30,
      },
    });

    try {
      // Вызов Grok API для начала генерации
      const callbackUrl = process.env.WEBHOOK_URL
        ? `${process.env.WEBHOOK_URL}/api/generate/callback`
        : undefined;

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

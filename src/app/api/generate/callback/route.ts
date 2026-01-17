export const runtime = 'nodejs';

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("🔄 Webhook received from Grok API:", JSON.stringify(body, null, 2));

    // Извлекаем данные из webhook (Grok API возвращает данные во вложенном объекте data)
    const webhookData = body.data || body;
    const { taskId, state, progress, resultJson, failCode, failMsg, createTime, completeTime, param } = webhookData;

    if (!taskId) {
      console.error("❌ Webhook error: Missing taskId");
      return NextResponse.json({ error: "Missing taskId" }, { status: 400 });
    }

    // Находим job по externalJobId
    let job = await prisma.generationJob.findFirst({
      where: {
        externalJobId: taskId,
      },
    });

    // Если job не найден по externalJobId, попробуем найти по другим критериям
    if (!job && param) {
      try {
        const paramData = JSON.parse(param);
        if (paramData.input && paramData.input.image_urls && paramData.input.image_urls.length > 0) {
          const imageUrl = paramData.input.image_urls[0];

          // Ищем job по imageUrl и времени создания (в пределах последних 5 минут)
          const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
          const recentJobs = await prisma.generationJob.findMany({
            where: {
              imageUrl: imageUrl,
              createdAt: {
                gte: fiveMinutesAgo,
              },
              externalJobId: null, // Только те, у которых externalJobId еще не установлен
            },
            orderBy: {
              createdAt: 'desc',
            },
            take: 1,
          });

          if (recentJobs.length > 0) {
            job = recentJobs[0];
            console.log(`🔍 Found job by imageUrl fallback: ${job.id}`);

            // Обновляем externalJobId для найденного job
            await prisma.generationJob.update({
              where: { id: job.id },
              data: { externalJobId: taskId },
            });
            console.log(`✅ Updated externalJobId for job ${job.id}`);
          }
        }
      } catch (parseError) {
        console.warn("⚠️ Failed to parse param data for fallback search:", parseError);
      }
    }

    if (!job) {
      console.error(`❌ Webhook error: Job not found for taskId ${taskId}`);
      console.error("💡 This might indicate a race condition or database sync issue");
      return NextResponse.json({
        error: "Job not found",
        taskId: taskId,
        suggestion: "Job may have been created but externalJobId not yet synced"
      }, { status: 404 });
    }

    console.log(`📊 Job found: ${job.id}, current status: ${job.status}, externalJobId: ${job.externalJobId}`);

    // Обновляем статус в зависимости от состояния
    let updateData: any = {
      progress: progress || 0,
    };

    switch (state) {
      case "success":
        console.log(`✅ Job ${job.id} completed successfully`);
        updateData.status = "COMPLETED";
        updateData.resultJson = resultJson;
        updateData.completedAt = new Date();
        break;

      case "fail":
        console.log(`❌ Job ${job.id} failed: ${failMsg || failCode}`);
        updateData.status = "FAILED";
        updateData.errorMessage = failMsg || failCode || "Generation failed";
        updateData.completedAt = new Date();
        break;

      case "processing":
        console.log(`⏳ Job ${job.id} processing: ${progress}%`);
        updateData.status = "PROCESSING";
        break;

      case "pending":
        console.log(`⏳ Job ${job.id} pending`);
        updateData.status = "QUEUED";
        break;

      default:
        console.log(`⚠️ Job ${job.id} unknown state: ${state}`);
        break;
    }

    // Добавляем дополнительные данные если они есть
    if (createTime) updateData.createdAt = new Date(createTime);
    if (completeTime) updateData.completedAt = new Date(completeTime);
    // costTime не сохраняется в БД, только логируется

    // Обновляем job в базе данных
    await prisma.generationJob.update({
      where: { id: job.id },
      data: updateData,
    });

    console.log(`✅ Job ${job.id} updated successfully`);

    return NextResponse.json({
      success: true,
      message: `Job ${job.id} status updated to ${state}`,
    });

  } catch (error) {
    console.error("❌ Webhook processing error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Webhook processing failed",
      },
      { status: 500 }
    );
  }
}
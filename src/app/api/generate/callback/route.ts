export const runtime = 'nodejs';

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("🔄 Webhook received from Grok API:", JSON.stringify(body, null, 2));

    // Извлекаем данные из webhook
    const { taskId, state, progress, resultJson, failCode, failMsg, createTime, completeTime, costTime } = body;

    if (!taskId) {
      console.error("❌ Webhook error: Missing taskId");
      return NextResponse.json({ error: "Missing taskId" }, { status: 400 });
    }

    // Находим job по externalJobId
    const job = await prisma.generationJob.findFirst({
      where: {
        externalJobId: taskId,
      },
    });

    if (!job) {
      console.error(`❌ Webhook error: Job not found for taskId ${taskId}`);
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    console.log(`📊 Job found: ${job.id}, current status: ${job.status}`);

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
    if (costTime) updateData.costTime = costTime;

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
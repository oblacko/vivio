export const runtime = 'nodejs';

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { grokClient } from "@/lib/grok/client";
import { uploadVideoFromUrl, generateThumbnailFromVideo } from "@/lib/storage/vercel-blob";

interface RouteParams {
  params: {
    jobId: string;
  };
}

/**
 * Повторная обработка завершенного job для создания видео
 * Используется когда job завершен, но видео не было создано (например, из-за отсутствия challengeId)
 */
export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { jobId } = params;
    const body = await request.json();
    const { challengeId, resultJson } = body;

    // Поиск job в БД
    const job = await prisma.generationJob.findUnique({
      where: { id: jobId },
      include: {
        video: true,
      },
    });

    if (!job) {
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404 }
      );
    }

    // Проверяем, не создано ли уже видео
    if (job.video) {
      return NextResponse.json({
        success: true,
        message: "Video already exists",
        videoId: job.video.id,
        videoUrl: job.video.videoUrl,
      });
    }

    // Получаем challengeId из запроса или из job (может быть null)
    const finalChallengeId = challengeId || job.challengeId || undefined;

    // Получаем resultJson из запроса или из Grok API
    let videoResultJson = resultJson;
    
    if (!videoResultJson && job.externalJobId) {
      try {
        const grokStatus = await grokClient.getJobStatus(job.externalJobId);
        if (grokStatus.data.state === "success" && grokStatus.data.resultJson) {
          videoResultJson = grokStatus.data.resultJson;
        }
      } catch (grokError) {
        console.warn("Failed to fetch resultJson from Grok API:", grokError);
      }
    }

    if (!videoResultJson) {
      return NextResponse.json(
        { error: "No resultJson available. Please provide resultJson in request body or ensure job has externalJobId." },
        { status: 400 }
      );
    }

    // Парсинг результата для получения URL видео
    const videoResult = grokClient.parseVideoResult(videoResultJson);
    
    if (!videoResult.resultUrls || videoResult.resultUrls.length === 0) {
      return NextResponse.json(
        { error: "No video URLs found in resultJson" },
        { status: 400 }
      );
    }

    const videoUrl = videoResult.resultUrls[0];
    console.log(`📹 Processing video for job ${job.id}: ${videoUrl}`);

    // Скачивание видео и загрузка в Vercel Blob Storage
    const filename = `video-${job.id}-${Date.now()}.mp4`;
    console.log(`⬇️ Downloading video from ${videoUrl}...`);
    const blobResult = await uploadVideoFromUrl(videoUrl, filename);
    console.log(`✅ Video uploaded to Vercel Blob: ${blobResult.url}`);

    // Генерация превью из первого кадра видео
    let thumbnailUrl: string | null = null;
    try {
      console.log(`🖼️ Generating thumbnail for video...`);
      thumbnailUrl = await generateThumbnailFromVideo(blobResult.url, job.id);
      if (thumbnailUrl) {
        console.log(`✅ Thumbnail generated: ${thumbnailUrl}`);
      } else {
        console.warn(`⚠️ Thumbnail generation failed, continuing without thumbnail`);
      }
    } catch (thumbnailError) {
      console.error("❌ Thumbnail generation error:", thumbnailError);
      // Продолжаем создание видео даже если превью не удалось сгенерировать
    }

    // Обновляем job с challengeId, если он был передан
    if (challengeId && !job.challengeId) {
      await prisma.generationJob.update({
        where: { id: job.id },
        data: { challengeId },
      });
    }

    // Создание Video записи в БД
    const videoData: any = {
      jobId: job.id,
      userId: job.userId || null,
      videoUrl: blobResult.url,
      thumbnailUrl: thumbnailUrl,
      duration: 6,
      quality: "HD",
    };
    
    if (finalChallengeId) {
      videoData.challengeId = finalChallengeId;
    }
    
    const video = await prisma.video.create({
      data: videoData,
    });
    console.log(`✅ Video record created: ${video.id}`);

    // Обновление job на COMPLETED
    await prisma.generationJob.update({
      where: { id: job.id },
      data: {
        status: "COMPLETED",
        progress: 100,
        completedAt: new Date(),
        errorMessage: null,
      },
    });

    // Увеличение participantCount в Challenge (только если есть challengeId)
    if (finalChallengeId) {
      await prisma.challenge.update({
        where: { id: finalChallengeId },
        data: {
          participantCount: {
            increment: 1,
          },
        },
      });
      console.log(`✅ Challenge participantCount incremented`);
    } else {
      console.log(`ℹ️ Video created without challenge`);
    }

    return NextResponse.json({
      success: true,
      message: "Video processed successfully",
      videoId: video.id,
      videoUrl: blobResult.url,
    });

  } catch (error) {
    console.error("Retry processing error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to process video",
      },
      { status: 500 }
    );
  }
}

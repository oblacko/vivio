import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { grokClient } from "@/lib/grok/client";
import { uploadVideoFromUrl } from "@/lib/storage/railway-storage";

interface RouteParams {
  params: {
    jobId: string;
  };
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { jobId } = params;

    // Поиск job в БД
    const job = await prisma.generationJob.findUnique({
      where: { id: jobId },
      include: {
        video: true,
        challenge: true,
      },
    });

    if (!job) {
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404 }
      );
    }

    // Если статус COMPLETED или FAILED - возвращаем сразу
    if (job.status === "COMPLETED") {
      return NextResponse.json({
        status: "COMPLETED",
        progress: 100,
        videoUrl: job.video?.videoUrl,
        videoId: job.video?.id,
      });
    }

    if (job.status === "FAILED" || job.status === "CANCELLED") {
      return NextResponse.json({
        status: job.status,
        progress: job.progress,
        errorMessage: job.errorMessage,
      });
    }

    // Если нет externalJobId, возвращаем текущий статус
    if (!job.externalJobId) {
      return NextResponse.json({
        status: job.status,
        progress: job.progress,
      });
    }

    // Запрос статуса у Grok API
    try {
      const grokStatus = await grokClient.getJobStatus(job.externalJobId);

      // Обновление прогресса (симуляция: +10% каждый запрос до 90%)
      let newProgress = Math.min(job.progress + 10, 90);

      // Если Grok вернул статус completed
      if (grokStatus.data.state === "success") {
        newProgress = 100;

        // Парсинг результата
        if (grokStatus.data.resultJson) {
          const videoResult = grokClient.parseVideoResult(
            grokStatus.data.resultJson
          );

          if (videoResult.resultUrls && videoResult.resultUrls.length > 0) {
            const videoUrl = videoResult.resultUrls[0];

            try {
              // Скачивание видео и загрузка в Railway Storage
              const filename = `video-${job.id}-${Date.now()}.mp4`;
              const blobResult = await uploadVideoFromUrl(videoUrl, filename);

              // Создание Video записи в БД
              const video = await prisma.video.create({
                data: {
                  jobId: job.id,
                  userId: job.userId || null,
                  challengeId: job.challengeId,
                  videoUrl: blobResult.url,
                  duration: 6,
                  quality: "HD",
                },
              });

              // Обновление job на COMPLETED
              await prisma.generationJob.update({
                where: { id: job.id },
                data: {
                  status: "COMPLETED",
                  progress: 100,
                  completedAt: new Date(),
                },
              });

              // Увеличение participantCount в Challenge
              await prisma.challenge.update({
                where: { id: job.challengeId },
                data: {
                  participantCount: {
                    increment: 1,
                  },
                },
              });

              return NextResponse.json({
                status: "COMPLETED",
                progress: 100,
                videoUrl: blobResult.url,
                videoId: video.id,
              });
            } catch (uploadError) {
              console.error("Video upload error:", uploadError);
              await prisma.generationJob.update({
                where: { id: job.id },
                data: {
                  status: "FAILED",
                  errorMessage: "Failed to upload video to storage",
                },
              });

              return NextResponse.json({
                status: "FAILED",
                progress: job.progress,
                errorMessage: "Failed to upload video",
              });
            }
          }
        }
      }

      // Если Grok вернул статус failed
      if (grokStatus.data.state === "fail") {
        await prisma.generationJob.update({
          where: { id: job.id },
          data: {
            status: "FAILED",
            progress: job.progress,
            errorMessage:
              grokStatus.data.failMsg || "Generation failed on Grok API",
          },
        });

        return NextResponse.json({
          status: "FAILED",
          progress: job.progress,
          errorMessage: grokStatus.data.failMsg || "Generation failed",
        });
      }

      // Обновление прогресса в БД
      if (newProgress !== job.progress) {
        await prisma.generationJob.update({
          where: { id: job.id },
          data: {
            progress: newProgress,
          },
        });
      }

      return NextResponse.json({
        status: grokStatus.data.state === "processing" ? "PROCESSING" : "QUEUED",
        progress: newProgress,
      });
    } catch (grokError) {
      console.error("Grok API error:", grokError);
      // Возвращаем текущий статус из БД при ошибке Grok API
      return NextResponse.json({
        status: job.status,
        progress: job.progress,
      });
    }
  } catch (error) {
    console.error("Get status error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to get job status",
      },
      { status: 500 }
    );
  }
}

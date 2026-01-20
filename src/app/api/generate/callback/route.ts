export const runtime = 'nodejs';

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { grokClient } from "@/lib/grok/client";
import { uploadVideoFromUrl, optimizeAndUploadThumbnail } from "@/lib/storage/vercel-blob";

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
        updateData.completedAt = new Date();
        
        // Обработка видео при успешном завершении
        if (resultJson) {
          try {
            // Парсинг результата для получения URL видео
            const videoResult = grokClient.parseVideoResult(resultJson);
            
            if (videoResult.resultUrls && videoResult.resultUrls.length > 0) {
              const videoUrl = videoResult.resultUrls[0];
              console.log(`📹 Video URL received: ${videoUrl}`);
              
              // Скачивание видео и загрузка в Vercel Blob Storage
              const filename = `video-${job.id}-${Date.now()}.mp4`;
              console.log(`⬇️ Downloading video from ${videoUrl}...`);
              const blobResult = await uploadVideoFromUrl(videoUrl, filename);
              console.log(`✅ Video uploaded to Vercel Blob: ${blobResult.url}`);
              
              // Проверяем, не создана ли уже запись Video для этого job
              const existingVideo = await prisma.video.findUnique({
                where: { jobId: job.id },
              });
              
              if (!existingVideo) {
                // Оптимизация и загрузка thumbnail из исходного изображения
                let thumbnailUrl: string | null = null;
                let ogImageUrl: string | null = null;
                try {
                  // Извлекаем URL исходного изображения из параметров вебхука
                  let originalImageUrl: string | null = null;
                  
                  if (param) {
                    try {
                      const paramData = JSON.parse(param);
                      if (paramData.input?.image_urls?.[0]) {
                        originalImageUrl = paramData.input.image_urls[0];
                      }
                    } catch (parseError) {
                      console.warn("⚠️ Failed to parse param for image URL:", parseError);
                    }
                  }
                  
                  // Если не нашли URL в param, используем job.imageUrl
                  if (!originalImageUrl && job.imageUrl) {
                    originalImageUrl = job.imageUrl;
                  }
                  
                  if (originalImageUrl) {
                    console.log(`🖼️ Optimizing thumbnail from original image: ${originalImageUrl}`);
                    const thumbnailResult = await optimizeAndUploadThumbnail(originalImageUrl, job.id);
                    thumbnailUrl = thumbnailResult.thumbnailUrl;
                    ogImageUrl = thumbnailResult.ogImageUrl;
                    if (thumbnailUrl) {
                      console.log(`✅ Thumbnail optimized and uploaded: ${thumbnailUrl}`);
                    }
                    if (ogImageUrl) {
                      console.log(`✅ OG image optimized and uploaded: ${ogImageUrl}`);
                    }
                    if (!thumbnailUrl && !ogImageUrl) {
                      console.warn(`⚠️ Thumbnail optimization failed, continuing without thumbnail`);
                    }
                  } else {
                    console.warn(`⚠️ No original image URL found, skipping thumbnail generation`);
                  }
                } catch (thumbnailError) {
                  console.error("❌ Thumbnail generation error:", thumbnailError);
                  // Продолжаем создание видео даже если превью не удалось сгенерировать
                }

                // Создание Video записи в БД
                const videoData: any = {
                  jobId: job.id,
                  userId: job.userId || null,
                  videoUrl: blobResult.url,
                  thumbnailUrl: thumbnailUrl,
                  ogImageUrl: ogImageUrl,
                  duration: 6,
                  quality: "HD",
                };
                
                if (job.challengeId) {
                  videoData.challengeId = job.challengeId;
                }
                
                const video = await prisma.video.create({
                  data: videoData,
                });
                console.log(`✅ Video record created: ${video.id}`);
                
                // Списание кредитов при успешной генерации (только если есть userId)
                if (job.userId) {
                  try {
                    // Получение настроек приложения
                    let settings = await prisma.appSettings.findUnique({
                      where: { id: "singleton" },
                    });

                    if (!settings) {
                      settings = await prisma.appSettings.create({
                        data: {
                          id: "singleton",
                          generationCost: 20,
                        },
                      });
                    }

                    // Проверка, не было ли уже списания для этого job
                    const existingTransaction = await prisma.creditTransaction.findFirst({
                      where: {
                        userId: job.userId,
                        description: {
                          contains: `Job ${job.id}`,
                        },
                      },
                    });

                    if (!existingTransaction) {
                      // Атомарное списание кредитов
                      await prisma.$transaction(async (tx) => {
                        // Получение текущего баланса
                        const user = await tx.user.findUnique({
                          where: { id: job.userId! },
                          select: { balance: true },
                        });

                        if (user && user.balance >= settings.generationCost) {
                          // Обновление баланса
                          await tx.user.update({
                            where: { id: job.userId! },
                            data: {
                              balance: {
                                decrement: settings.generationCost,
                              },
                            },
                          });

                          // Создание транзакции
                          await tx.creditTransaction.create({
                            data: {
                              userId: job.userId!,
                              type: "DEBIT",
                              amount: settings.generationCost,
                              description: `Генерация видео (Job ${job.id})`,
                            },
                          });

                          console.log(`✅ Credits debited: ${settings.generationCost} for user ${job.userId}`);
                        } else {
                          console.warn(`⚠️ Insufficient balance for user ${job.userId}, skipping debit`);
                        }
                      });
                    } else {
                      console.log(`ℹ️ Credits already debited for job ${job.id}`);
                    }
                  } catch (creditError) {
                    console.error("❌ Credit debit error:", creditError);
                    // Не прерываем процесс, только логируем ошибку
                  }
                }
                
                // Увеличение participantCount в Challenge (только если есть challengeId)
                if (job.challengeId) {
                  await prisma.challenge.update({
                    where: { id: job.challengeId },
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
              } else {
                console.log(`⚠️ Video record already exists for job ${job.id}`);
              }
            } else {
              console.warn(`⚠️ No video URLs found in resultJson`);
            }
          } catch (videoError) {
            console.error("❌ Video processing error:", videoError);
            // Устанавливаем статус FAILED при ошибке обработки видео
            updateData.status = "FAILED";
            updateData.errorMessage = videoError instanceof Error 
              ? videoError.message 
              : "Failed to process video";
            updateData.completedAt = new Date();
          }
        } else {
          console.warn(`⚠️ No resultJson provided for successful job ${job.id}`);
        }
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
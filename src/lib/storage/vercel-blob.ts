/**
 * Vercel Blob Storage Helper
 * Функции для работы с медиа-файлами в Vercel Blob Storage
 */

import { put, del, head } from "@vercel/blob";

const BLOB_READ_WRITE_TOKEN = process.env.BLOB_VIVIO_READ_WRITE_TOKEN || process.env.BLOB_READ_WRITE_TOKEN;

if (!BLOB_READ_WRITE_TOKEN) {
  console.warn("BLOB_READ_WRITE_TOKEN is not set in environment variables");
}

export interface UploadResult {
  url: string;
  pathname: string;
}

/**
 * Загрузка изображения от пользователя
 */
export async function uploadImage(
  file: File,
  filename?: string
): Promise<UploadResult> {
  if (!BLOB_READ_WRITE_TOKEN) {
    throw new Error("BLOB_READ_WRITE_TOKEN is not configured");
  }

  // Валидация типа файла
  if (!file.type.startsWith("image/")) {
    throw new Error("File must be an image");
  }

  // Валидация размера (макс 10MB)
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB
  if (file.size > MAX_SIZE) {
    throw new Error("File size must be less than 10MB");
  }

  const name = filename || `images/${Date.now()}-${file.name}`;

  const blob = await put(name, file, {
    access: "public",
    token: BLOB_READ_WRITE_TOKEN,
  });

  return {
    url: blob.url,
    pathname: blob.pathname,
  };
}

/**
 * Скачивание видео из внешнего URL и загрузка в Vercel Blob Storage
 */
export async function uploadVideoFromUrl(
  videoUrl: string,
  filename: string
): Promise<UploadResult> {
  if (!BLOB_READ_WRITE_TOKEN) {
    throw new Error("BLOB_READ_WRITE_TOKEN is not configured");
  }

  try {
    // Скачивание видео
    const response = await fetch(videoUrl);
    if (!response.ok) {
      throw new Error(`Failed to download video: ${response.statusText}`);
    }

    const blob = await response.blob();
    const file = new File([blob], filename, { type: "video/mp4" });

    // Загрузка в Vercel Blob Storage
    const uploadedBlob = await put(`videos/${filename}`, file, {
      access: "public",
      token: BLOB_READ_WRITE_TOKEN,
      contentType: "video/mp4",
    });

    return {
      url: uploadedBlob.url,
      pathname: uploadedBlob.pathname,
    };
  } catch (error) {
    throw new Error(`Failed to upload video from URL: ${error}`);
  }
}

/**
 * Удаление файла из Vercel Blob Storage
 */
export async function deleteFile(url: string): Promise<void> {
  if (!BLOB_READ_WRITE_TOKEN) {
    throw new Error("BLOB_READ_WRITE_TOKEN is not configured");
  }

  try {
    await del(url, {
      token: BLOB_READ_WRITE_TOKEN,
    });
  } catch (error) {
    throw new Error(`Failed to delete file: ${error}`);
  }
}

/**
 * Проверка существования файла
 */
export async function fileExists(url: string): Promise<boolean> {
  if (!BLOB_READ_WRITE_TOKEN) {
    return false;
  }

  try {
    await head(url, {
      token: BLOB_READ_WRITE_TOKEN,
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Генерация thumbnail из первого кадра видео
 * Использует @ffmpeg/ffmpeg для извлечения первого кадра
 */
export async function generateThumbnailFromVideo(
  videoUrl: string,
  videoId: string
): Promise<string | null> {
  if (!BLOB_READ_WRITE_TOKEN) {
    console.warn("BLOB_READ_WRITE_TOKEN is not configured, skipping thumbnail generation");
    return null;
  }

  try {
    // Динамический импорт для уменьшения размера bundle
    const { FFmpeg } = await import("@ffmpeg/ffmpeg");
    const { fetchFile, toBlobURL } = await import("@ffmpeg/util");

    const ffmpeg = new FFmpeg();
    
    // Загрузка WASM файлов ffmpeg
    const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
    });

    // Скачивание видео
    console.log(`📥 Downloading video for thumbnail: ${videoUrl}`);
    const videoData = await fetchFile(videoUrl);
    await ffmpeg.writeFile("input.mp4", videoData);

    // Извлечение первого кадра (0 секунда)
    console.log(`🎬 Extracting first frame...`);
    await ffmpeg.exec([
      "-i", "input.mp4",
      "-ss", "00:00:00",
      "-vframes", "1",
      "-vf", "scale=1080:-1", // Масштабирование до максимум 1080px по ширине
      "thumbnail.jpg"
    ]);

    // Чтение сгенерированного изображения
    const thumbnailData = await ffmpeg.readFile("thumbnail.jpg");
    
    // Конвертация в File для загрузки
    const thumbnailBlob = new Blob([Buffer.from(thumbnailData)], { type: "image/jpeg" });
    const thumbnailFile = new File([thumbnailBlob], `thumbnail-${videoId}.jpg`, {
      type: "image/jpeg",
    });

    // Загрузка в Vercel Blob Storage
    const thumbnailFilename = `thumbnails/${videoId}-${Date.now()}.jpg`;
    const uploadedBlob = await put(thumbnailFilename, thumbnailFile, {
      access: "public",
      token: BLOB_READ_WRITE_TOKEN,
      contentType: "image/jpeg",
    });

    console.log(`✅ Thumbnail generated and uploaded: ${uploadedBlob.url}`);

    // Очистка временных файлов
    await ffmpeg.deleteFile("input.mp4");
    await ffmpeg.deleteFile("thumbnail.jpg");

    return uploadedBlob.url;
  } catch (error) {
    console.error("❌ Failed to generate thumbnail:", error);
    // Возвращаем null вместо ошибки, чтобы не блокировать создание видео
    // Превью можно будет сгенерировать позже или на клиенте
    return null;
  }
}

/**
 * Оптимизация и загрузка thumbnail из исходного изображения
 * Использует sharp для сжатия изображения до минимального веса с оптимальным качеством
 */
export async function optimizeAndUploadThumbnail(
  imageUrl: string,
  videoId: string
): Promise<string | null> {
  if (!BLOB_READ_WRITE_TOKEN) {
    console.warn("BLOB_READ_WRITE_TOKEN is not configured, skipping thumbnail optimization");
    return null;
  }

  try {
    // Динамический импорт sharp
    const sharp = (await import("sharp")).default;

    // Скачивание исходного изображения
    console.log(`📥 Downloading original image for thumbnail: ${imageUrl}`);
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.statusText}`);
    }

    const imageBuffer = Buffer.from(await response.arrayBuffer());

    // Получение метаданных изображения для определения формата
    const metadata = await sharp(imageBuffer).metadata();
    console.log(`📊 Original image: ${metadata.width}x${metadata.height}, format: ${metadata.format}, size: ${imageBuffer.length} bytes`);

    // Оптимизация изображения с использованием WebP для лучшего сжатия
    // WebP обеспечивает на 25-35% меньший размер по сравнению с JPEG при том же качестве
    const optimizedBuffer = await sharp(imageBuffer)
      .resize(1080, null, {
        fit: "inside",
        withoutEnlargement: true, // Не увеличивать если изображение меньше
      })
      .webp({
        quality: 80, // Оптимальный баланс между качеством и размером
        effort: 6,   // Максимальное сжатие (0-6, где 6 = лучшее сжатие)
      })
      .toBuffer();

    console.log(`✅ Image optimized: ${optimizedBuffer.length} bytes (${Math.round((1 - optimizedBuffer.length / imageBuffer.length) * 100)}% reduction)`);

    // Создание File для загрузки
    const thumbnailBlob = new Blob([optimizedBuffer as any], { type: "image/webp" });
    const thumbnailFile = new File([thumbnailBlob], `thumbnail-${videoId}.webp`, {
      type: "image/webp",
    });

    // Загрузка в Vercel Blob Storage
    const thumbnailFilename = `thumbnails/${videoId}-${Date.now()}.webp`;
    const uploadedBlob = await put(thumbnailFilename, thumbnailFile, {
      access: "public",
      token: BLOB_READ_WRITE_TOKEN,
      contentType: "image/webp",
    });

    console.log(`✅ Thumbnail optimized and uploaded: ${uploadedBlob.url}`);

    return uploadedBlob.url;
  } catch (error) {
    console.error("❌ Failed to optimize thumbnail:", error);
    // Возвращаем null вместо ошибки, чтобы не блокировать создание видео
    return null;
  }
}

/**
 * Генерация thumbnail из видео (legacy функция для обратной совместимости)
 */
export async function generateThumbnail(
  videoUrl: string
): Promise<string | null> {
  // Используем новую функцию, но нужен videoId
  // Для обратной совместимости возвращаем null
  return null;
}

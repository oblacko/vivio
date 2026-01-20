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
 * Результат оптимизации thumbnail
 */
export interface ThumbnailResult {
  thumbnailUrl: string | null; // Вертикальное превью для видео
  ogImageUrl: string | null;   // Горизонтальное превью 1200x630 для og:image
}

/**
 * Оптимизация и загрузка thumbnail из исходного изображения
 * Создает две версии: вертикальное превью и горизонтальное превью для og:image
 * Использует sharp для сжатия изображения до минимального веса с оптимальным качеством
 */
export async function optimizeAndUploadThumbnail(
  imageUrl: string,
  videoId: string
): Promise<ThumbnailResult> {
  if (!BLOB_READ_WRITE_TOKEN) {
    console.warn("BLOB_READ_WRITE_TOKEN is not configured, skipping thumbnail optimization");
    return { thumbnailUrl: null, ogImageUrl: null };
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

    const timestamp = Date.now();
    let thumbnailUrl: string | null = null;
    let ogImageUrl: string | null = null;

    // 1. Создание вертикального превью (для видео)
    try {
      const verticalBuffer = await sharp(imageBuffer)
        .resize(1080, null, {
          fit: "inside",
          withoutEnlargement: true,
        })
        .webp({
          quality: 80,
          effort: 6,
        })
        .toBuffer();

      const thumbnailBlob = new Blob([verticalBuffer as any], { type: "image/webp" });
      const thumbnailFile = new File([thumbnailBlob], `thumbnail-${videoId}.webp`, {
        type: "image/webp",
      });

      const thumbnailFilename = `thumbnails/${videoId}-${timestamp}.webp`;
      const uploadedThumbnail = await put(thumbnailFilename, thumbnailFile, {
        access: "public",
        token: BLOB_READ_WRITE_TOKEN,
        contentType: "image/webp",
      });

      thumbnailUrl = uploadedThumbnail.url;
      console.log(`✅ Vertical thumbnail uploaded: ${thumbnailUrl}`);
    } catch (error) {
      console.error("❌ Failed to create vertical thumbnail:", error);
    }

    // 2. Создание горизонтального превью для og:image (1200x630)
    try {
      const ogImageBuffer = await sharp(imageBuffer)
        .resize(1200, 630, {
          fit: "cover", // Обрезаем изображение чтобы заполнить весь размер
          position: "center", // Центрируем при обрезке
        })
        .jpeg({
          quality: 85, // JPEG для лучшей совместимости с og:image
          mozjpeg: true, // Используем mozjpeg для лучшего сжатия
        })
        .toBuffer();

      const ogImageBlob = new Blob([ogImageBuffer as any], { type: "image/jpeg" });
      const ogImageFile = new File([ogImageBlob], `og-image-${videoId}.jpg`, {
        type: "image/jpeg",
      });

      const ogImageFilename = `og-images/${videoId}-${timestamp}.jpg`;
      const uploadedOgImage = await put(ogImageFilename, ogImageFile, {
        access: "public",
        token: BLOB_READ_WRITE_TOKEN,
        contentType: "image/jpeg",
      });

      ogImageUrl = uploadedOgImage.url;
      console.log(`✅ OG image (1200x630) uploaded: ${ogImageUrl}`);
    } catch (error) {
      console.error("❌ Failed to create OG image:", error);
    }

    return { thumbnailUrl, ogImageUrl };
  } catch (error) {
    console.error("❌ Failed to optimize thumbnail:", error);
    return { thumbnailUrl: null, ogImageUrl: null };
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

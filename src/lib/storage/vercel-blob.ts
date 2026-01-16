/**
 * Vercel Blob Storage Helper
 * Функции для работы с медиа-файлами в Vercel Blob Storage
 */

import { put, del, head } from "@vercel/blob";

const BLOB_READ_WRITE_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;

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
 * Генерация thumbnail из видео (заглушка для MVP)
 * В будущем можно использовать ffmpeg или другой инструмент
 */
export async function generateThumbnail(
  videoUrl: string
): Promise<string | null> {
  // TODO: Реализовать генерацию thumbnail из первого кадра видео
  // Для MVP возвращаем null, thumbnail будет генерироваться на клиенте
  return null;
}

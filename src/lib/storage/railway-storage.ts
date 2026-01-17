/**
 * Railway S3-Compatible Storage Helper
 * Функции для работы с медиа-файлами в Railway Storage (S3-compatible)
 */

import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  GetObjectCommand
} from "@aws-sdk/client-s3";

const RAILWAY_ENDPOINT = process.env.RAILWAY_ENDPOINT_URL;
const RAILWAY_BUCKET_NAME = process.env.RAILWAY_BUCKET_NAME;
const RAILWAY_ACCESS_KEY_ID = process.env.RAILWAY_ACCESS_KEY_ID;
const RAILWAY_SECRET_ACCESS_KEY = process.env.RAILWAY_SECRET_ACCESS_KEY;

if (!RAILWAY_ENDPOINT || !RAILWAY_BUCKET_NAME || !RAILWAY_ACCESS_KEY_ID || !RAILWAY_SECRET_ACCESS_KEY) {
  console.warn("Railway storage environment variables are not fully configured");
}

const s3Client = new S3Client({
  endpoint: RAILWAY_ENDPOINT,
  region: "auto", // Railway использует "auto" region
  credentials: {
    accessKeyId: RAILWAY_ACCESS_KEY_ID || "",
    secretAccessKey: RAILWAY_SECRET_ACCESS_KEY || "",
  },
  // Railway не требует подписи для некоторых операций, но оставим по умолчанию
  forcePathStyle: true, // Использовать path-style URLs
});

export interface UploadResult {
  url: string;
  pathname: string;
  bucket: string;
  key: string;
}

/**
 * Загрузка изображения от пользователя
 */
export async function uploadImage(
  file: File,
  filename?: string
): Promise<UploadResult> {
  if (!RAILWAY_ENDPOINT || !RAILWAY_BUCKET_NAME || !RAILWAY_ACCESS_KEY_ID || !RAILWAY_SECRET_ACCESS_KEY) {
    throw new Error("Railway storage is not configured");
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

  const key = filename || `images/${Date.now()}-${file.name}`;

  try {
    // Конвертируем File в ArrayBuffer, затем в Buffer для совместимости с AWS SDK
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const command = new PutObjectCommand({
      Bucket: RAILWAY_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: file.type,
      // Railway storage (Tigris) поддерживает публичный доступ через bucket policy
      // ACL: "public-read", // Убираем, поскольку bucket должен быть публичным по умолчанию
    });

    await s3Client.send(command);

    // Railway storage (Tigris) не поддерживает публичный доступ через ACL,
    // поэтому используем API endpoint для проксирования файлов
    // Определяем публичный URL приложения для API endpoint'а
    let baseUrl: string;

    if (process.env.VERCEL_URL) {
      // На Vercel используем VERCEL_URL
      baseUrl = `https://${process.env.VERCEL_URL}`;
    } else if (process.env.NEXT_PUBLIC_BASE_URL) {
      // Используем настроенную переменную окружения
      baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    } else {
      // Fallback для локальной разработки (но это не будет работать для внешних API)
      baseUrl = 'http://localhost:3000';
      console.warn('⚠️ WARNING: Using localhost URL for image access. This will not work with external APIs like Grok!');
    }

    const url = `${baseUrl}/api/upload?key=${key}`;

    console.log('🔗 Generated image URL:', url, 'Base URL:', baseUrl, 'VERCEL_URL:', process.env.VERCEL_URL);

    return {
      url,
      pathname: key,
      bucket: RAILWAY_BUCKET_NAME,
      key,
    };
  } catch (error) {
    throw new Error(`Failed to upload image: ${error}`);
  }
}

/**
 * Скачивание видео из внешнего URL и загрузка в Railway Storage
 */
export async function uploadVideoFromUrl(
  videoUrl: string,
  filename: string
): Promise<UploadResult> {
  if (!RAILWAY_ENDPOINT || !RAILWAY_BUCKET_NAME || !RAILWAY_ACCESS_KEY_ID || !RAILWAY_SECRET_ACCESS_KEY) {
    throw new Error("Railway storage is not configured");
  }

  try {
    // Скачивание видео
    const response = await fetch(videoUrl);
    if (!response.ok) {
      throw new Error(`Failed to download video: ${response.statusText}`);
    }

    const blob = await response.blob();
    const file = new File([blob], filename, { type: "video/mp4" });

    const key = `videos/${filename}`;

    const command = new PutObjectCommand({
      Bucket: RAILWAY_BUCKET_NAME,
      Key: key,
      Body: file,
      ContentType: "video/mp4",
      ACL: "public-read",
    });

    await s3Client.send(command);

    // Формируем публичный URL
    const url = `${RAILWAY_ENDPOINT}/${RAILWAY_BUCKET_NAME}/${key}`;

    return {
      url,
      pathname: key,
      bucket: RAILWAY_BUCKET_NAME,
      key,
    };
  } catch (error) {
    throw new Error(`Failed to upload video from URL: ${error}`);
  }
}

/**
 * Удаление файла из Railway Storage
 */
export async function deleteFile(key: string): Promise<void> {
  if (!RAILWAY_ENDPOINT || !RAILWAY_BUCKET_NAME || !RAILWAY_ACCESS_KEY_ID || !RAILWAY_SECRET_ACCESS_KEY) {
    throw new Error("Railway storage is not configured");
  }

  try {
    const command = new DeleteObjectCommand({
      Bucket: RAILWAY_BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(command);
  } catch (error) {
    throw new Error(`Failed to delete file: ${error}`);
  }
}

/**
 * Проверка существования файла
 */
export async function fileExists(key: string): Promise<boolean> {
  if (!RAILWAY_ENDPOINT || !RAILWAY_BUCKET_NAME || !RAILWAY_ACCESS_KEY_ID || !RAILWAY_SECRET_ACCESS_KEY) {
    return false;
  }

  try {
    const command = new HeadObjectCommand({
      Bucket: RAILWAY_BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(command);
    return true;
  } catch {
    return false;
  }
}

/**
 * Получение файла как blob (для обработки на клиенте)
 */
export async function getFileAsBlob(key: string): Promise<Blob> {
  if (!RAILWAY_ENDPOINT || !RAILWAY_BUCKET_NAME || !RAILWAY_ACCESS_KEY_ID || !RAILWAY_SECRET_ACCESS_KEY) {
    throw new Error("Railway storage is not configured");
  }

  try {
    const command = new GetObjectCommand({
      Bucket: RAILWAY_BUCKET_NAME,
      Key: key,
    });

    const response = await s3Client.send(command);

    if (!response.Body) {
      throw new Error("File body is empty");
    }

    // Преобразуем поток в Blob
    const stream = response.Body as NodeJS.ReadableStream;
    const chunks: Buffer[] = [];

    for await (const chunk of stream) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }

    const buffer = Buffer.concat(chunks);
    const blob = new Blob([buffer]);
    return blob;
  } catch (error) {
    throw new Error(`Failed to get file: ${error}`);
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
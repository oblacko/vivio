import { NextRequest, NextResponse } from "next/server";
import { put, del } from "@vercel/blob";
import { getFileAsBlob } from "@/lib/storage/railway-storage";
import { auth } from "@/lib/auth";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const BLOB_READ_WRITE_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");

    if (!key) {
      return NextResponse.json(
        { error: "Key parameter is required" },
        { status: 400 }
      );
    }

    // Получение файла из Railway storage
    const blob = await getFileAsBlob(key);

    // Определение типа контента на основе расширения файла
    let contentType = "application/octet-stream";
    if (key.toLowerCase().endsWith(".jpg") || key.toLowerCase().endsWith(".jpeg")) {
      contentType = "image/jpeg";
    } else if (key.toLowerCase().endsWith(".png")) {
      contentType = "image/png";
    } else if (key.toLowerCase().endsWith(".gif")) {
      contentType = "image/gif";
    } else if (key.toLowerCase().endsWith(".webp")) {
      contentType = "image/webp";
    }

    // Возвращаем файл как Response
    return new NextResponse(blob, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000", // Кеширование на 1 год
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("File retrieval error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to retrieve file",
      },
      { status: 404 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Проверка авторизации
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Необходима авторизация для загрузки файлов" },
        { status: 401 }
      );
    }

    if (!BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json(
        { error: "Blob storage not configured" },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Валидация типа файла
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "File must be an image" },
        { status: 400 }
      );
    }

    // Валидация размера
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File size must be less than 10MB" },
        { status: 400 }
      );
    }

    // Конвертируем File в Buffer для Vercel Blob
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Загружаем в Vercel Blob
    const blob = await put(`images/${Date.now()}-${file.name}`, buffer, {
      access: 'public',
      contentType: file.type,
      token: BLOB_READ_WRITE_TOKEN,
    });

    // Возвращаем публичный URL
    return NextResponse.json({
      success: true,
      url: blob.url,
      pathname: blob.pathname,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to upload file",
      },
      { status: 500 }
    );
  }
}

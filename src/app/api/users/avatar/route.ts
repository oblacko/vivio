export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { auth } from "@/lib/auth";
import { put } from "@vercel/blob";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Необходима авторизация" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("avatar") as File;

    if (!file) {
      return NextResponse.json(
        { error: "Файл не предоставлен" },
        { status: 400 }
      );
    }

    // Проверка типа файла
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Файл должен быть изображением" },
        { status: 400 }
      );
    }

    // Проверка размера (макс 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Размер файла не должен превышать 5MB" },
        { status: 400 }
      );
    }

    // Загрузка в Vercel Blob
    const blob = await put(`avatars/${session.user.id}-${Date.now()}.${file.name.split('.').pop()}`, file, {
      access: "public",
      addRandomSuffix: true,
    });

    // Обновление URL аватара в БД
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { image: blob.url },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
    });

    return NextResponse.json({
      message: "Аватар обновлен",
      user: updatedUser,
      avatarUrl: blob.url,
    });
  } catch (error) {
    console.error("Upload avatar error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to upload avatar",
      },
      { status: 500 }
    );
  }
}

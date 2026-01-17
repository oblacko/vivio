export const runtime = 'nodejs';

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { auth } from "@/lib/auth";
import { z } from "zod";

interface RouteParams {
  params: {
    id: string;
  };
}

const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  bio: z.string().max(500).optional(),
  socialLinks: z.object({
    twitter: z.string().url().optional().or(z.literal("")),
    instagram: z.string().url().optional().or(z.literal("")),
    tiktok: z.string().url().optional().or(z.literal("")),
    youtube: z.string().url().optional().or(z.literal("")),
  }).optional(),
  isPublic: z.boolean().optional(),
});

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    const session = await auth();

    // Получаем профиль пользователя
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        bio: true,
        socialLinks: true,
        isPublic: true,
        createdAt: true,
        _count: {
          select: {
            videos: {
              where: { isPublic: true },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Пользователь не найден" },
        { status: 404 }
      );
    }

    // Проверка приватности профиля
    const isOwnProfile = session?.user?.id === id;
    if (!user.isPublic && !isOwnProfile) {
      return NextResponse.json(
        { error: "Профиль приватный" },
        { status: 403 }
      );
    }

    // Получаем видео пользователя
    const videos = await prisma.video.findMany({
      where: {
        userId: id,
        isPublic: user.isPublic || isOwnProfile ? undefined : true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 20,
      include: {
        challenge: {
          select: {
            id: true,
            title: true,
            category: true,
          },
        },
      },
    });

    // Считаем общее количество лайков
    const likesCount = await prisma.video.aggregate({
      where: {
        userId: id,
        isPublic: true,
      },
      _sum: {
        likesCount: true,
      },
    });

    return NextResponse.json({
      ...user,
      videos,
      totalLikes: likesCount._sum.likesCount || 0,
      videosCount: user._count.videos,
    });
  } catch (error) {
    console.error("Get user profile error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch user profile",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Необходима авторизация" },
        { status: 401 }
      );
    }

    const { id } = params;

    // Проверка прав доступа - можно редактировать только свой профиль
    if (session.user.id !== id) {
      return NextResponse.json(
        { error: "Вы можете редактировать только свой профиль" },
        { status: 403 }
      );
    }

    // Валидация данных
    const body = await request.json();
    const validatedData = updateProfileSchema.parse(body);

    // Обновление профиля
    const updatedUser = await prisma.user.update({
      where: { id },
      data: validatedData,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        bio: true,
        socialLinks: true,
        isPublic: true,
        createdAt: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Update user profile error:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Ошибка валидации", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to update user profile",
      },
      { status: 500 }
    );
  }
}

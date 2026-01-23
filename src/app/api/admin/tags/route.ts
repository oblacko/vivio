export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { auth } from "@/lib/auth";
import { z } from "zod";

const createTagSchema = z.object({
  name: z.string().min(1, "Название тега обязательно").max(50, "Название тега слишком длинное"),
});

export async function GET(request: NextRequest) {
  try {
    const tags = await prisma.tag.findMany({
      include: {
        _count: {
          select: {
            vibes: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(tags);
  } catch (error) {
    console.error("Get tags error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to fetch tags",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Необходима авторизация" },
        { status: 401 }
      );
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Доступ запрещен. Требуется роль администратора" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = createTagSchema.parse(body);

    // Проверка на дубликаты
    const existingTag = await prisma.tag.findUnique({
      where: { name: validatedData.name },
    });

    if (existingTag) {
      return NextResponse.json(
        { error: "Тег с таким названием уже существует" },
        { status: 400 }
      );
    }

    const tag = await prisma.tag.create({
      data: validatedData,
    });

    return NextResponse.json(tag, { status: 201 });
  } catch (error) {
    console.error("Create tag error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Ошибка валидации", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to create tag",
      },
      { status: 500 }
    );
  }
}

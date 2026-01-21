export const runtime = 'nodejs';

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { auth } from "@/lib/auth";

interface RouteParams {
  params: {
    id: string;
  };
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
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

    const { id } = params;

    const existingTag = await prisma.tag.findUnique({
      where: { id },
    });

    if (!existingTag) {
      return NextResponse.json(
        { error: "Тег не найден" },
        { status: 404 }
      );
    }

    // Удаляем тег (каскадно удалятся связи с вайбами)
    await prisma.tag.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Тег успешно удален",
    });
  } catch (error) {
    console.error("Delete tag error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to delete tag",
      },
      { status: 500 }
    );
  }
}

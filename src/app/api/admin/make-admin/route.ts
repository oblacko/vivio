export const runtime = 'nodejs';

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { auth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    // Проверяем авторизацию
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Необходима авторизация" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    console.log(`Обновляем роль пользователя ${userId} на ADMIN`);

    // Обновляем роль пользователя на ADMIN
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: "ADMIN" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    console.log(`✅ Роль пользователя ${updatedUser.email} успешно обновлена на ADMIN`);

    return NextResponse.json({
      success: true,
      message: "Роль админа успешно добавлена",
      user: updatedUser,
    });

  } catch (error) {
    console.error("Make admin error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to make admin",
      },
      { status: 500 }
    );
  }
}
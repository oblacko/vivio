export const runtime = 'nodejs';

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { auth } from "@/lib/auth";
import { z } from "zod";

const updateBalanceSchema = z.object({
  amount: z.number().positive("Сумма должна быть положительной"),
  type: z.enum(["DEBIT", "CREDIT"]),
  description: z.string().optional(),
});

interface RouteParams {
  params: {
    id: string;
  };
}

export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    // Проверка авторизации и роли
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

    // Валидация данных
    const body = await request.json();
    const validatedData = updateBalanceSchema.parse(body);

    // Проверка существования пользователя
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: { id: true, balance: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Пользователь не найден" },
        { status: 404 }
      );
    }

    // Проверка баланса для списания
    if (validatedData.type === "DEBIT" && user.balance < validatedData.amount) {
      return NextResponse.json(
        { error: "Недостаточно средств на балансе" },
        { status: 400 }
      );
    }

    // Атомарное обновление баланса и создание транзакции
    const result = await prisma.$transaction(async (tx) => {
      // Обновление баланса
      const newBalance = validatedData.type === "CREDIT"
        ? user.balance + validatedData.amount
        : user.balance - validatedData.amount;

      const updatedUser = await tx.user.update({
        where: { id: params.id },
        data: { balance: newBalance },
        select: {
          id: true,
          balance: true,
        },
      });

      // Создание транзакции
      const transaction = await tx.creditTransaction.create({
        data: {
          userId: params.id,
          type: validatedData.type,
          amount: validatedData.amount,
          description: validatedData.description || 
            (validatedData.type === "CREDIT" ? "Зачисление администратором" : "Списание администратором"),
        },
      });

      return { user: updatedUser, transaction };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Update balance error:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Ошибка валидации", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to update balance",
      },
      { status: 500 }
    );
  }
}

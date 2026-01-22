"use server";

import { signIn } from "@/lib/auth";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db/client";
import bcrypt from "bcryptjs";

const signupSchema = z.object({
  name: z.string().min(2, "Имя должно содержать минимум 2 символа"),
  email: z.string().email("Неверный формат email"),
  password: z.string().min(6, "Пароль должен содержать минимум 6 символов"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Пароли не совпадают",
  path: ["confirmPassword"],
});

export async function signupWithCredentials(formData: FormData, callbackUrl?: string) {
  try {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    // Валидация
    const validated = signupSchema.parse({ name, email, password, confirmPassword });

    // Проверяем, существует ли уже пользователь с таким email
    const existingUser = await prisma.user.findUnique({
      where: { email: validated.email },
    });

    if (existingUser) {
      return { error: "Пользователь с таким email уже существует" };
    }

    // Хешируем пароль
    const hashedPassword = await bcrypt.hash(validated.password, 10);

    // Создаем пользователя
    await prisma.user.create({
      data: {
        name: validated.name,
        email: validated.email,
        password: hashedPassword,
        isPublic: true,
        balance: 0,
      },
    });

    // Автоматически входим после регистрации
    const signInResult = await signIn("credentials", {
      email: validated.email,
      password: validated.password,
      redirect: false,
    });

    if (signInResult?.error) {
      return { error: "Аккаунт создан, но не удалось войти. Попробуйте войти вручную." };
    }

    // При успехе возвращаем success, редирект будет на клиенте
    return { success: true, callbackUrl: callbackUrl || "/" };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.issues[0].message };
    }

    if (error instanceof AuthError) {
      return { error: "Произошла ошибка при регистрации" };
    }

    return { error: "Произошла ошибка при регистрации" };
  }
}

export async function signupWithGoogle(callbackUrl?: string) {
  try {
    await signIn("google", {
      redirectTo: callbackUrl || "/",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Произошла ошибка при регистрации через Google" };
    }
    throw error;
  }
}

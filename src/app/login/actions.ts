"use server";

import { signIn } from "@/lib/auth";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Неверный формат email"),
  password: z.string().min(6, "Пароль должен содержать минимум 6 символов"),
});

export async function loginWithCredentials(formData: FormData, callbackUrl?: string) {
  try {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    // Валидация
    const validated = loginSchema.parse({ email, password });

    const result = await signIn("credentials", {
      email: validated.email,
      password: validated.password,
      redirect: false,
    });

    if (result?.error) {
      return { error: "Неверный email или пароль" };
    }

    // При успехе возвращаем success, редирект будет на клиенте
    return { success: true, callbackUrl: callbackUrl || "/" };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Неверный email или пароль" };
        default:
          return { error: "Произошла ошибка при входе" };
      }
    }
    
    if (error instanceof z.ZodError) {
      return { error: error.issues[0].message };
    }

    return { error: "Произошла ошибка при входе" };
  }
}

export async function loginWithGoogle(callbackUrl?: string) {
  try {
    await signIn("google", {
      redirectTo: callbackUrl || "/",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Произошла ошибка при входе через Google" };
    }
    throw error;
  }
}

/**
 * Environment Variables Validation
 * Централизованная валидация критических переменных окружения
 */

import { z } from "zod";

// Схема валидации для переменных окружения
const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url("DATABASE_URL must be a valid URL"),
  
  // Authentication
  AUTH_SECRET: z.string().min(32, "AUTH_SECRET must be at least 32 characters"),
  NEXTAUTH_SECRET: z.string().min(32, "NEXTAUTH_SECRET must be at least 32 characters"),
  AUTH_URL: z.string().url("AUTH_URL must be a valid URL").optional(),
  NEXTAUTH_URL: z.string().url("NEXTAUTH_URL must be a valid URL").optional(),
  
  // Google OAuth
  AUTH_GOOGLE_ID: z.string().min(1, "AUTH_GOOGLE_ID is required"),
  AUTH_GOOGLE_SECRET: z.string().min(1, "AUTH_GOOGLE_SECRET is required"),
  
  // Grok API
  GROK_API_KEY: z.string().min(1, "GROK_API_KEY is required"),
  GROK_API_URL: z.string().url("GROK_API_URL must be a valid URL").default("https://api.kie.ai/api/v1"),
  
  // Vercel Blob Storage
  BLOB_READ_WRITE_TOKEN: z.string().min(1, "BLOB_READ_WRITE_TOKEN is required"),
  
  // Redis (optional - fallback to Vercel KV)
  REDIS_URL: z.string().url().optional(),
  KV_REST_API_URL: z.string().url().optional(),
  KV_REST_API_TOKEN: z.string().optional(),
  
  // DeepSeek API (for vibe generation)
  DEEPSEEK_API_KEY: z.string().optional(),
  DEEPSEEK_API_URL: z.string().url().optional(),
  
  // Webhooks
  WEBHOOK_URL: z.string().url().optional(),
  WEBHOOK_SECRET: z.string().optional(),
  
  // Public URL
  NEXT_PUBLIC_BASE_URL: z.string().url("NEXT_PUBLIC_BASE_URL must be a valid URL").optional(),
  
  // Node Environment
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

export type Env = z.infer<typeof envSchema>;

/**
 * Валидация переменных окружения
 * Выбрасывает ошибку с понятным сообщением при отсутствии обязательных переменных
 */
export function validateEnv(): Env {
  try {
    const env = envSchema.parse(process.env);
    return env;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.issues
        .map((issue) => {
          const path = issue.path.join(".");
          return `  - ${path}: ${issue.message}`;
        })
        .join("\n");

      throw new Error(
        `❌ Invalid environment variables:\n${missingVars}\n\n` +
        `Please check your .env file and ensure all required variables are set.\n` +
        `See env.template for reference.`
      );
    }
    throw error;
  }
}

/**
 * Частичная валидация - проверяет только указанные переменные
 * Полезно для серверных компонентов, которым нужны только некоторые переменные
 */
export function validateEnvPartial(keys: (keyof Env)[]): Partial<Env> {
  const partial = keys.reduce((acc, key) => {
    acc[key] = process.env[key];
    return acc;
  }, {} as any);

  // Создаем объект для pick с явным типом
  const pickObject: any = {};
  keys.forEach(key => {
    pickObject[key] = true;
  });

  const partialSchema = envSchema.pick(pickObject);

  try {
    return partialSchema.parse(partial);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.issues
        .map((issue) => {
          const path = issue.path.join(".");
          return `  - ${path}: ${issue.message}`;
        })
        .join("\n");

      throw new Error(
        `❌ Missing required environment variables:\n${missingVars}`
      );
    }
    throw error;
  }
}

/**
 * Проверка доступности опциональных сервисов
 */
export function checkOptionalServices() {
  const services = {
    externalRedis: !!process.env.REDIS_URL,
    vercelKV: !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN),
    deepseek: !!process.env.DEEPSEEK_API_KEY,
    webhooks: !!process.env.WEBHOOK_URL,
  };

  if (!services.externalRedis && !services.vercelKV) {
    console.warn(
      "⚠️ Neither external Redis nor Vercel KV is configured. " +
      "Rate limiting and caching will not work properly."
    );
  }

  return services;
}

// Экспортируем типобезопасный объект env для использования в приложении
let _env: Env | null = null;

export function getEnv(): Env {
  if (!_env) {
    _env = validateEnv();
  }
  return _env;
}

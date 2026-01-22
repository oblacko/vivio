/**
 * Prisma Client Singleton
 * Предотвращает создание множественных экземпляров Prisma Client в development
 * Оптимизирован для Vercel с правильным connection pooling
 */

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

// Проверка наличия DATABASE_URL
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
};

// Переиспользуем pool для оптимизации соединений
if (!globalForPrisma.pool) {
  globalForPrisma.pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10, // Максимум 10 соединений для Vercel
    idleTimeoutMillis: 30000, // Закрываем неактивные соединения через 30 секунд
    connectionTimeoutMillis: 10000, // Таймаут подключения 10 секунд
  });
}

const adapter = new PrismaPg(globalForPrisma.pool);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

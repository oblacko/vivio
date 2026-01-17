/**
 * Prisma Client Singleton
 * Предотвращает создание множественных экземпляров Prisma Client в development
 */

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// NOTE: Using PrismaPg adapter for PostgreSQL
// Исправляем SSL режим для совместимости с будущими версиями pg-connection-string
const connectionString = process.env.DATABASE_URL?.replace('sslmode=require', 'sslmode=verify-full');
const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: true } // Явно устанавливаем полную верификацию SSL
});
const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

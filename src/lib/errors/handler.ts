/**
 * Centralized Error Handler
 * Стандартизированная обработка ошибок для API routes
 */

import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";

export interface ErrorResponse {
  error: string;
  details?: any;
  code?: string;
  timestamp: string;
}

/**
 * Типы ошибок приложения
 */
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 400, "VALIDATION_ERROR", details);
    this.name = "ValidationError";
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = "Authentication required") {
    super(message, 401, "AUTHENTICATION_ERROR");
    this.name = "AuthenticationError";
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = "Access denied") {
    super(message, 403, "AUTHORIZATION_ERROR");
    this.name = "AuthorizationError";
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = "Resource") {
    super(`${resource} not found`, 404, "NOT_FOUND");
    this.name = "NotFoundError";
  }
}

export class ConflictError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 409, "CONFLICT", details);
    this.name = "ConflictError";
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = "Rate limit exceeded") {
    super(message, 429, "RATE_LIMIT_EXCEEDED");
    this.name = "RateLimitError";
  }
}

/**
 * Форматирование ответа об ошибке
 */
function formatErrorResponse(
  error: unknown,
  includeDetails: boolean = process.env.NODE_ENV === "development"
): ErrorResponse {
  const timestamp = new Date().toISOString();

  // AppError
  if (error instanceof AppError) {
    return {
      error: error.message,
      code: error.code,
      details: includeDetails ? error.details : undefined,
      timestamp,
    };
  }

  // Zod validation errors
  if (error instanceof ZodError) {
    return {
      error: "Validation error",
      code: "VALIDATION_ERROR",
      details: includeDetails
        ? error.issues.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message,
          }))
        : undefined,
      timestamp,
    };
  }

  // Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case "P2002":
        return {
          error: "Unique constraint violation",
          code: "CONFLICT",
          details: includeDetails ? { fields: error.meta?.target } : undefined,
          timestamp,
        };
      case "P2025":
        return {
          error: "Record not found",
          code: "NOT_FOUND",
          timestamp,
        };
      case "P2003":
        return {
          error: "Foreign key constraint violation",
          code: "CONSTRAINT_VIOLATION",
          timestamp,
        };
      default:
        return {
          error: "Database error",
          code: "DATABASE_ERROR",
          details: includeDetails ? { code: error.code } : undefined,
          timestamp,
        };
    }
  }

  // Prisma validation errors
  if (error instanceof Prisma.PrismaClientValidationError) {
    return {
      error: "Invalid database query",
      code: "DATABASE_VALIDATION_ERROR",
      details: includeDetails ? error.message : undefined,
      timestamp,
    };
  }

  // Generic Error
  if (error instanceof Error) {
    return {
      error: error.message || "Internal server error",
      code: "INTERNAL_ERROR",
      details: includeDetails ? { stack: error.stack } : undefined,
      timestamp,
    };
  }

  // Unknown error
  return {
    error: "An unexpected error occurred",
    code: "UNKNOWN_ERROR",
    details: includeDetails ? String(error) : undefined,
    timestamp,
  };
}

/**
 * Получение HTTP статус кода из ошибки
 */
function getStatusCode(error: unknown): number {
  if (error instanceof AppError) {
    return error.statusCode;
  }

  if (error instanceof ZodError) {
    return 400;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case "P2002":
        return 409; // Conflict
      case "P2025":
        return 404; // Not Found
      case "P2003":
        return 400; // Bad Request
      default:
        return 500;
    }
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return 400;
  }

  return 500;
}

/**
 * Логирование ошибки
 */
function logError(error: unknown, context?: string) {
  const timestamp = new Date().toISOString();
  const prefix = context ? `[${context}]` : "";

  if (error instanceof AppError) {
    if (error.statusCode >= 500) {
      console.error(`${timestamp} ${prefix} AppError [${error.statusCode}]:`, error.message, error.details);
    } else {
      console.warn(`${timestamp} ${prefix} AppError [${error.statusCode}]:`, error.message);
    }
    return;
  }

  if (error instanceof Error) {
    console.error(`${timestamp} ${prefix} Error:`, error.message);
    if (process.env.NODE_ENV === "development") {
      console.error(error.stack);
    }
    return;
  }

  console.error(`${timestamp} ${prefix} Unknown error:`, error);
}

/**
 * Главный обработчик ошибок для API routes
 */
export function handleError(error: unknown, context?: string): NextResponse<ErrorResponse> {
  // Логируем ошибку
  logError(error, context);

  // Получаем статус код
  const statusCode = getStatusCode(error);

  // Форматируем ответ
  const errorResponse = formatErrorResponse(error);

  return NextResponse.json(errorResponse, { status: statusCode });
}

/**
 * Wrapper для async API route handlers с автоматической обработкой ошибок
 */
export function withErrorHandler<T extends (...args: any[]) => Promise<NextResponse>>(
  handler: T,
  context?: string
): T {
  return (async (...args: any[]) => {
    try {
      return await handler(...args);
    } catch (error) {
      return handleError(error, context);
    }
  }) as T;
}

/**
 * Try-catch wrapper с типобезопасностью
 */
export async function tryCatch<T>(
  fn: () => Promise<T>,
  errorMessage?: string
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (errorMessage && !(error instanceof AppError)) {
      throw new AppError(errorMessage, 500, undefined, error);
    }
    throw error;
  }
}

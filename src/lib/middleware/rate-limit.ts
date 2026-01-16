/**
 * Rate Limiting Middleware для API Routes
 */

import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/redis/client";

export interface RateLimitConfig {
  limit: number;
  windowSeconds?: number;
  identifier?: (request: NextRequest) => string;
}

const DEFAULT_LIMIT = 3; // Free tier: 3 запроса в минуту
const PRO_LIMIT = 10; // Pro tier: 10 запросов в минуту
const DEFAULT_WINDOW = 60; // 1 минута

/**
 * Получить идентификатор пользователя для rate limiting
 */
function getIdentifier(request: NextRequest): string {
  // Можно использовать IP адрес или user ID из сессии
  const ip = request.headers.get("x-forwarded-for") || 
             request.headers.get("x-real-ip") || 
             "anonymous";
  
  // TODO: В будущем можно добавить проверку user ID из сессии
  // const userId = getUserIdFromSession(request);
  // return userId || ip;
  
  return ip;
}

/**
 * Rate limiting middleware
 */
export async function withRateLimit(
  request: NextRequest,
  handler: (request: NextRequest) => Promise<NextResponse>,
  config?: RateLimitConfig
): Promise<NextResponse> {
  const limit = config?.limit || DEFAULT_LIMIT;
  const windowSeconds = config?.windowSeconds || DEFAULT_WINDOW;
  const identifier = config?.identifier
    ? config.identifier(request)
    : getIdentifier(request);

  const rateLimitResult = await checkRateLimit(identifier, limit, windowSeconds);

  if (!rateLimitResult.success) {
    return NextResponse.json(
      {
        error: "Rate limit exceeded",
        limit: rateLimitResult.limit,
        remaining: rateLimitResult.remaining,
        reset: rateLimitResult.reset,
      },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": rateLimitResult.limit.toString(),
          "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
          "X-RateLimit-Reset": rateLimitResult.reset.toString(),
          "Retry-After": Math.ceil(
            (rateLimitResult.reset - Date.now()) / 1000
          ).toString(),
        },
      }
    );
  }

  // Добавляем заголовки rate limit к ответу
  const response = await handler(request);
  response.headers.set("X-RateLimit-Limit", rateLimitResult.limit.toString());
  response.headers.set(
    "X-RateLimit-Remaining",
    rateLimitResult.remaining.toString()
  );
  response.headers.set("X-RateLimit-Reset", rateLimitResult.reset.toString());

  return response;
}

/**
 * Helper для применения rate limit к API route
 */
export function rateLimit(config?: RateLimitConfig) {
  return (
    handler: (request: NextRequest) => Promise<NextResponse>
  ) => {
    return (request: NextRequest) => withRateLimit(request, handler, config);
  };
}

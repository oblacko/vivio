# Руководство по использованию callbackUrl

## Обзор

В приложении Vivio реализован механизм `callbackUrl`, который позволяет пользователям автоматически возвращаться на страницу, с которой была инициирована авторизация, после успешного входа или регистрации.

## Как это работает

### 1. Инициация авторизации

Когда пользователь пытается выполнить действие, требующее авторизации:

```typescript
// Редирект на страницу входа с callbackUrl
<Link href={`/login?callbackUrl=${encodeURIComponent("/create")}`}>
  Войти
</Link>
```

### 2. Обработка авторизации

На странице `/login` или `/signup`:

```typescript
// Чтение callbackUrl из URL параметров
const searchParams = useSearchParams();
const callbackUrl = searchParams.get("callbackUrl") || undefined;

// Передача в action
const result = await loginWithCredentials(formData, callbackUrl);
```

### 3. Редирект после успеха

В server action:

```typescript
export async function loginWithCredentials(formData: FormData, callbackUrl?: string) {
  // ... логика авторизации
  
  // Редирект на callbackUrl или главную
  redirect(callbackUrl || "/");
}
```

## Реализованные точки входа

### FloatingUploadButton
Автоматически передает текущий путь:

```typescript
const pathname = usePathname();

<Link href={`/login?callbackUrl=${encodeURIComponent(pathname)}`}>
  Войти
</Link>
```

**Пример:**
- Пользователь на странице `/videos/123`
- Кликает FloatingUploadButton
- Видит диалог "Требуется авторизация"
- Кликает "Войти"
- Редиректится на `/login?callbackUrl=/videos/123`
- После успешного входа возвращается на `/videos/123`

### Страница создания видео (/create)
Явно указывает callbackUrl:

```typescript
<Link href={`/login?callbackUrl=${encodeURIComponent("/create")}`}>
  Войти
</Link>
```

**Пример:**
- Пользователь переходит на `/create`
- Видит сообщение "Требуется авторизация"
- Кликает "Войти"
- После авторизации возвращается на `/create`

### Главная страница
Hero секция с кнопкой регистрации:

```typescript
<Link href={`/signup?callbackUrl=${encodeURIComponent("/")}`}>
  Начать бесплатно
</Link>
```

### Переключение между login/signup
Сохраняет callbackUrl при переходе:

```typescript
// В LoginForm
<Link href={callbackUrl ? `/signup?callbackUrl=${encodeURIComponent(callbackUrl)}` : "/signup"}>
  Зарегистрироваться
</Link>

// В SignupForm
<Link href={callbackUrl ? `/login?callbackUrl=${encodeURIComponent(callbackUrl)}` : "/login"}>
  Войти
</Link>
```

## Примеры использования

### Защищенная страница

```typescript
"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(`/login?callbackUrl=${encodeURIComponent("/protected")}`);
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) return <div>Загрузка...</div>;
  if (!isAuthenticated) return null;

  return <div>Защищенный контент</div>;
}
```

### Кнопка с редиректом

```typescript
import Link from "next/link";
import { usePathname } from "next/navigation";

function LoginButton() {
  const pathname = usePathname();
  
  return (
    <Link href={`/login?callbackUrl=${encodeURIComponent(pathname)}`}>
      Войти
    </Link>
  );
}
```

### Server-side редирект

```typescript
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function ProtectedServerPage() {
  const session = await auth();
  
  if (!session) {
    redirect("/login?callbackUrl=/protected-server");
  }

  return <div>Защищенный серверный контент</div>;
}
```

## API

### Actions

#### loginWithCredentials
```typescript
async function loginWithCredentials(
  formData: FormData, 
  callbackUrl?: string
): Promise<{ error?: string } | void>
```

#### signupWithCredentials
```typescript
async function signupWithCredentials(
  formData: FormData, 
  callbackUrl?: string
): Promise<{ error?: string } | void>
```

#### loginWithGoogle
```typescript
async function loginWithGoogle(
  callbackUrl?: string
): Promise<{ error?: string } | void>
```

#### signupWithGoogle
```typescript
async function signupWithGoogle(
  callbackUrl?: string
): Promise<{ error?: string } | void>
```

## Безопасность

### Валидация callbackUrl

Для предотвращения Open Redirect уязвимостей, рекомендуется добавить валидацию:

```typescript
function isValidCallbackUrl(url: string): boolean {
  // Только относительные URL
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return false;
  }
  
  // Только пути начинающиеся с /
  if (!url.startsWith("/")) {
    return false;
  }
  
  // Нет двойных слешей (//example.com)
  if (url.startsWith("//")) {
    return false;
  }
  
  return true;
}

// Использование
export async function loginWithCredentials(formData: FormData, callbackUrl?: string) {
  // Валидация callbackUrl
  const safeCallbackUrl = callbackUrl && isValidCallbackUrl(callbackUrl) 
    ? callbackUrl 
    : "/";
  
  // ... логика авторизации
  
  redirect(safeCallbackUrl);
}
```

## Тестирование

### Сценарии тестирования:

1. **Базовый флоу:**
   - Перейти на `/create`
   - Кликнуть "Войти"
   - URL должен быть `/login?callbackUrl=/create`
   - Войти
   - Должен вернуться на `/create`

2. **Переключение форм:**
   - Перейти на `/login?callbackUrl=/create`
   - Кликнуть "Зарегистрироваться"
   - URL должен быть `/signup?callbackUrl=/create`
   - Зарегистрироваться
   - Должен вернуться на `/create`

3. **Google OAuth:**
   - Перейти на `/login?callbackUrl=/profile/settings`
   - Кликнуть "Войти через Google"
   - После OAuth должен вернуться на `/profile/settings`

4. **Floating button:**
   - Находясь на `/videos/123`
   - Кликнуть FloatingUploadButton
   - Войти
   - Должен вернуться на `/videos/123`

## Известные ограничения

1. **NextAuth redirectTo:**
   - NextAuth может иметь свою логику обработки redirectTo
   - Убедитесь что в `auth.config.ts` правильно настроены `pages`

2. **Server Components:**
   - В Server Components нужно использовать `redirect()` из `next/navigation`
   - Нельзя использовать `useSearchParams()` в Server Components

3. **Middleware:**
   - Если используется middleware для авторизации, убедитесь что он сохраняет callbackUrl

## Отладка

### Включить логирование:

```typescript
// В actions
export async function loginWithCredentials(formData: FormData, callbackUrl?: string) {
  console.log("Login with callbackUrl:", callbackUrl);
  // ... логика
}
```

### Проверка URL:

```typescript
// В компоненте
const searchParams = useSearchParams();
const callbackUrl = searchParams.get("callbackUrl");
console.log("Current callbackUrl:", callbackUrl);
```

---

**Дата создания:** 2026-01-17
**Версия:** v2.0.0

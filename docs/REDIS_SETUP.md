# Настройка Redis (Vercel KV) в Vivio

## Обзор

Проект Vivio использует Vercel KV (Redis) для:
- Rate limiting API запросов
- Кеширования данных (челленджи, статусы задач)
- Оптимизации производительности

## Настройка в Vercel

### 1. Создание Vercel KV Database

1. Перейдите в [Vercel Dashboard](https://vercel.com/dashboard)
2. Выберите ваш проект Vivio
3. Перейдите в раздел **Storage** → **KV**
4. Нажмите **Create Database**
5. Выберите регион (рекомендуется Europe или ближайший к вашим пользователям)
6. Дайте название базе данных (например, `vivio-kv`)

### 2. Получение учетных данных

После создания базы данных:

1. Перейдите в раздел **Settings** вашей KV базы данных
2. Скопируйте значения:
   - **KV_REST_API_URL** - REST API URL
   - **KV_REST_API_TOKEN** - REST API Token

### 3. Настройка переменных окружения

#### В Vercel (Production)

1. В Vercel Dashboard перейдите в проект
2. Раздел **Settings** → **Environment Variables**
3. Добавьте переменные:
   ```
   KV_REST_API_URL=https://your-kv-store.vercel-storage.com
   KV_REST_API_TOKEN=your-kv-token-here
   ```

#### Локально (Development)

1. Создайте файл `.env.local` в корне проекта
2. Добавьте переменные:
   ```
   KV_REST_API_URL=https://your-kv-store.vercel-storage.com
   KV_REST_API_TOKEN=your-kv-token-here
   ```

### 4. Проверка работы

Запустите проект локально:

```bash
npm run dev
```

Если переменные окружения настроены правильно, в консоли не должно быть предупреждений о том, что `KV_REST_API_URL` и `KV_REST_API_TOKEN` не установлены.

## API Использование

### Rate Limiting

```typescript
import { checkRateLimit } from '@/lib/redis/client';

// Проверка rate limit для пользователя/IP
const result = await checkRateLimit('user-123', 10, 60); // 10 запросов в минуту

if (!result.success) {
  // Rate limit exceeded
  return NextResponse.json(
    { error: 'Rate limit exceeded' },
    { status: 429 }
  );
}
```

### Кеширование

```typescript
import {
  getCache,
  setCache,
  deleteCache,
  getChallengesCache,
  setChallengesCache,
  getJobStatusCache,
  setJobStatusCache
} from '@/lib/redis/client';

// Общий кеш
await setCache('key', { data: 'value' }, 3600); // 1 час
const cached = await getCache('key');

// Специфические функции
await setChallengesCache(challenges);
const cachedChallenges = await getChallengesCache();

await setJobStatusCache(jobId, status);
const cachedStatus = await getJobStatusCache(jobId);
```

## Структура ключей Redis

- `ratelimit:{identifier}` - Rate limiting счетчики
- `challenges:list` - Кешированный список челленджей
- `job:status:{jobId}` - Статусы задач генерации

## Мониторинг

### В Vercel Dashboard

1. Перейдите в раздел **Storage** → **KV**
2. Выберите вашу базу данных
3. Просматривайте метрики использования и логи

### Логи приложения

При проблемах с Redis проверяйте логи приложения на наличие предупреждений:
```
KV_REST_API_URL and KV_REST_API_TOKEN are not set. Using fallback mode.
```

## Troubleshooting

### Проблема: Rate limiting не работает
**Решение:** Проверьте, что переменные окружения `KV_REST_API_URL` и `KV_REST_API_TOKEN` установлены правильно.

### Проблема: Кеш не сохраняется
**Решение:** Убедитесь, что Vercel KV база данных создана и доступна. Проверьте права доступа токена.

### Проблема: Высокая латентность
**Решение:** Выберите регион Vercel KV, ближайший к вашим пользователям.

## Безопасность

- Никогда не коммитьте реальные значения токенов в код
- Используйте разные базы данных для development и production
- Регулярно ротируйте токены доступа
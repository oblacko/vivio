# Инструкция по настройке Vivio

## Шаг 1: Установка зависимостей

```bash
npm install
```

## Шаг 2: Настройка базы данных

1. Создайте PostgreSQL базу данных (локально или через Vercel Postgres)
2. Скопируйте `.env.example` в `.env.local`
3. Заполните `POSTGRES_URL` и `POSTGRES_PRISMA_URL`

4. Примените миграции:
```bash
npx prisma generate
npx prisma db push
```

## Шаг 3: Настройка Grok API

1. Получите API ключ от [Kie.ai](https://kie.ai)
2. Добавьте в `.env.local`:
```
GROK_API_KEY=your-api-key-here
GROK_API_URL=https://api.kie.ai/api/v1
```

## Шаг 4: Настройка Vercel Blob Storage

1. Создайте Blob Store в Vercel Dashboard
2. Скопируйте `BLOB_READ_WRITE_TOKEN`
3. Добавьте в `.env.local`:
```
BLOB_READ_WRITE_TOKEN=your-token-here
```

## Шаг 5: Настройка Upstash Redis (опционально)

1. Создайте базу в [Upstash](https://upstash.com)
2. Скопируйте REST URL и Token
3. Добавьте в `.env.local`:
```
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token-here
```

## Шаг 6: Запуск

```bash
npm run dev
```

Приложение будет доступно на http://localhost:3000

## Деплой на Vercel

1. Подключите GitHub репозиторий к Vercel
2. В Vercel Dashboard:
   - Добавьте все переменные окружения
   - Включите Vercel Postgres addon
   - Включите Vercel Blob addon
3. Деплой произойдет автоматически

## Создание начальных данных

Для создания тестовых челленджей можно использовать Prisma Studio:

```bash
npx prisma studio
```

Или создать seed скрипт в `prisma/seed.ts`

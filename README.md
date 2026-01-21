# vibeo.fun - Video Challenge App

Приложение для создания 6-секундных видео с помощью AI (Grok Imagine API).

## Технологии

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **UI**: shadcn/ui, Tailwind CSS, Framer Motion
- **State Management**: Zustand, TanStack Query
- **Database**: PostgreSQL (Prisma ORM)
- **Storage**: Vercel Blob Storage
- **Cache**: Upstash Redis
- **API**: Grok Imagine API (Kie.ai)

## Установка

1. Клонируйте репозиторий
2. Установите зависимости:
```bash
npm install
```

3. Настройте переменные окружения (см. `.env.example`)

4. Настройте базу данных:
```bash
npx prisma generate
npx prisma db push
```

5. Запустите dev сервер:
```bash
npm run dev
```

## Переменные окружения

Создайте `.env.local` файл со следующими переменными:

- `POSTGRES_URL` - Connection string для PostgreSQL
- `POSTGRES_PRISMA_URL` - Prisma connection string
- `GROK_API_KEY` - API ключ от Grok (Kie.ai)
- `GROK_API_URL` - URL API (по умолчанию: https://api.kie.ai/api/v1)
- `BLOB_READ_WRITE_TOKEN` - Token для Vercel Blob Storage
- `UPSTASH_REDIS_REST_URL` - URL для Upstash Redis
- `UPSTASH_REDIS_REST_TOKEN` - Token для Upstash Redis
- `WEBHOOK_URL` - URL для webhook callbacks (опционально)

## Деплой на Vercel

1. Подключите репозиторий к Vercel
2. Добавьте все переменные окружения в Vercel Dashboard
3. Включите Vercel Postgres addon
4. Включите Vercel Blob addon
5. Деплой произойдет автоматически

## Структура проекта

```
src/
├── app/              # Next.js App Router
│   ├── api/         # API Routes
│   └── [routes]/    # Страницы
├── components/      # React компоненты
│   ├── ui/          # shadcn/ui компоненты
│   ├── challenges/  # Компоненты челленджей
│   ├── generation/  # Компоненты генерации
│   └── video/       # Видео плеер
├── lib/             # Утилиты и клиенты
│   ├── grok/        # Grok API клиент
│   ├── storage/     # Vercel Blob helpers
│   ├── redis/       # Redis клиент
│   └── db/          # Prisma клиент
└── store/           # Zustand stores
```

## Основные функции

- Загрузка изображений с кадрированием
- Генерация 6-секундных видео через Grok API
- Просмотр готовых видео с автозацикливанием
- Лайки и шаринг видео
- Rate limiting через Redis
- Кеширование через Redis

## Лицензия

MIT

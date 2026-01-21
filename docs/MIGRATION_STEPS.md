# Шаги для миграции базы данных (Шеринг видео)

## Автоматическая миграция (рекомендуется)

### 1. Локальная разработка

```bash
# Генерация и применение миграции
npx prisma migrate dev --name add_video_sharing_analytics

# Генерация Prisma Client
npx prisma generate
```

### 2. Продакшн (Vercel/другой хостинг)

```bash
# Применение миграций в продакшене
npx prisma migrate deploy
```

## Ручная миграция (если требуется)

Если автоматическая миграция не работает, выполните SQL вручную:

```sql
-- Добавление полей в таблицу videos
ALTER TABLE "videos" 
ADD COLUMN "shareCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "referrerData" JSONB;

-- Создание таблицы video_shares
CREATE TABLE "video_shares" (
    "id" TEXT NOT NULL,
    "videoId" TEXT NOT NULL,
    "source" TEXT,
    "referrer" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "video_shares_pkey" PRIMARY KEY ("id")
);

-- Создание индексов
CREATE INDEX "video_shares_videoId_idx" ON "video_shares"("videoId");
CREATE INDEX "video_shares_source_idx" ON "video_shares"("source");

-- Добавление внешнего ключа
ALTER TABLE "video_shares" 
ADD CONSTRAINT "video_shares_videoId_fkey" 
FOREIGN KEY ("videoId") 
REFERENCES "videos"("id") 
ON DELETE CASCADE 
ON UPDATE CASCADE;
```

## Проверка миграции

После применения миграции проверьте:

```bash
# Проверка схемы
npx prisma db pull

# Просмотр таблиц
npx prisma studio
```

## Откат миграции (если нужно)

```bash
# Откат последней миграции (только для dev)
npx prisma migrate reset

# Внимание: это удалит все данные!
```

## Vercel Deployment

При деплое на Vercel миграции применяются автоматически, если:
1. В `package.json` есть build скрипт с `prisma generate`
2. В настройках проекта указаны правильные ENV переменные для БД

## Переменные окружения

Убедитесь, что установлены:

```env
DATABASE_URL="postgresql://..."
NEXT_PUBLIC_APP_URL="https://your-domain.com"
```

## После миграции

1. Перезапустите сервер разработки
2. Проверьте, что новые поля доступны
3. Протестируйте функцию шеринга
4. Проверьте аналитику

## Возможные проблемы

### Ошибка: "relation already exists"

Таблица уже создана. Проверьте:
```bash
npx prisma db pull
```

### Ошибка подключения к БД

Проверьте `DATABASE_URL` в `.env` файле.

### Prisma Client не обновился

Выполните:
```bash
npx prisma generate
rm -rf node_modules/.prisma
npm install
```

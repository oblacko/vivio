# Руководство по деплою в Vercel

Полное руководство по развертыванию Vivio на платформе Vercel.

## Содержание

- [Предварительные требования](#предварительные-требования)
- [Быстрый старт](#быстрый-старт)
- [Детальная настройка](#детальная-настройка)
- [Переменные окружения](#переменные-окружения)
- [Настройка сервисов](#настройка-сервисов)
- [Troubleshooting](#troubleshooting)
- [Мониторинг](#мониторинг)

## Предварительные требования

### Системные требования

- Node.js 22+ (см. `.nvmrc`)
- npm 10+
- Git
- Аккаунт Vercel

### Необходимые сервисы

1. **Vercel Account** - платформа для деплоя
2. **PostgreSQL Database** - Vercel Postgres или внешний (Supabase, Neon и т.д.)
3. **Vercel Blob Storage** - для медиа файлов
4. **Vercel KV** или **External Redis** - для кеширования и rate limiting
5. **Grok API** - для генерации видео
6. **Google OAuth** - для авторизации

## Быстрый старт

### 1. Подключение к Vercel

```bash
# Установка Vercel CLI
npm install -g vercel

# Логин в Vercel
vercel login

# Инициализация проекта
vercel
```

### 2. Настройка в Vercel Dashboard

1. Перейдите в [Vercel Dashboard](https://vercel.com/dashboard)
2. Выберите проект
3. Перейдите в `Settings` → `Environment Variables`

### 3. Добавление обязательных переменных

Используйте `env.template` как референс. Минимальный набор:

```bash
DATABASE_URL="postgresql://..."
AUTH_SECRET="..."
NEXTAUTH_SECRET="..."
AUTH_URL="https://your-domain.vercel.app"
NEXTAUTH_URL="https://your-domain.vercel.app"
NEXT_PUBLIC_BASE_URL="https://your-domain.vercel.app"
AUTH_GOOGLE_ID="..."
AUTH_GOOGLE_SECRET="..."
GROK_API_KEY="..."
GROK_API_URL="https://api.kie.ai/api/v1"
BLOB_READ_WRITE_TOKEN="..."
```

### 4. Деплой

```bash
# Production деплой
vercel --prod

# Или через Git (автоматический деплой)
git push origin main
```

## Детальная настройка

### Node.js версия

Vercel автоматически определит версию Node.js из `.nvmrc` или `package.json`:

```json
{
  "engines": {
    "node": ">=22.0.0",
    "npm": ">=10.0.0"
  }
}
```

### Build настройки

Vercel использует настройки из `vercel.json`:

```json
{
  "functions": {
    "src/app/api/generate/**": {
      "maxDuration": 60
    }
  }
}
```

### Prisma настройка

Build команда автоматически генерирует Prisma Client:

```json
{
  "scripts": {
    "build": "npx prisma generate && next build"
  }
}
```

## Переменные окружения

### Обязательные переменные

#### Database
```
DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require
```

#### Authentication
```
AUTH_SECRET=generate-with-openssl-rand-base64-32
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32
AUTH_URL=https://your-domain.vercel.app
NEXTAUTH_URL=https://your-domain.vercel.app
NEXT_PUBLIC_BASE_URL=https://your-domain.vercel.app
AUTH_GOOGLE_ID=your-google-client-id
AUTH_GOOGLE_SECRET=your-google-client-secret
```

#### External APIs
```
GROK_API_KEY=your-grok-api-key
GROK_API_URL=https://api.kie.ai/api/v1
```

#### Storage
```
BLOB_READ_WRITE_TOKEN=vercel_blob_token
```

### Опциональные переменные

#### Caching & Rate Limiting
```
# Vercel KV (рекомендуется)
KV_REST_API_URL=https://your-kv.kv.vercel-storage.com
KV_REST_API_TOKEN=your-kv-token

# Или External Redis
REDIS_URL=redis://user:password@host:port
```

#### DeepSeek AI
```
DEEPSEEK_API_KEY=your-deepseek-key
DEEPSEEK_API_URL=https://api.deepseek.com
```

#### Webhooks
```
WEBHOOK_URL=https://your-domain.vercel.app
WEBHOOK_SECRET=your-webhook-secret
```

## Настройка сервисов

### 1. Vercel Postgres

1. В Vercel Dashboard → `Storage` → `Postgres`
2. Нажмите `Create Database`
3. Выберите регион (ближайший к пользователям)
4. Скопируйте `DATABASE_URL` в Environment Variables

### 2. Vercel Blob Storage

1. В Vercel Dashboard → `Storage` → `Blob`
2. Нажмите `Create Store`
3. Скопируйте `BLOB_READ_WRITE_TOKEN` в Environment Variables

### 3. Vercel KV (Redis)

1. В Vercel Dashboard → `Storage` → `KV`
2. Нажмите `Create Database`
3. Выберите регион
4. Скопируйте `KV_REST_API_URL` и `KV_REST_API_TOKEN`

### 4. Google OAuth

1. Перейдите в [Google Cloud Console](https://console.cloud.google.com/)
2. Создайте новый проект или выберите существующий
3. Перейдите в `APIs & Services` → `Credentials`
4. Нажмите `Create Credentials` → `OAuth 2.0 Client ID`
5. Выберите `Web application`
6. Добавьте Authorized redirect URIs:
   ```
   https://your-domain.vercel.app/api/auth/callback/google
   ```
7. Скопируйте `Client ID` и `Client Secret`

### 5. Grok API

1. Зарегистрируйтесь на [Kie.ai](https://kie.ai)
2. Получите API ключ
3. Добавьте в `GROK_API_KEY`

### 6. Генерация секретов

```bash
# AUTH_SECRET и NEXTAUTH_SECRET
openssl rand -base64 32

# WEBHOOK_SECRET
openssl rand -hex 32
```

## Проверка после деплоя

### Health Check

После успешного деплоя проверьте работоспособность:

```bash
curl https://your-domain.vercel.app/api/health
```

Ожидаемый ответ:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-22T...",
  "uptime": 123.456,
  "services": {
    "database": {"status": "up", "responseTime": 50},
    "redis": {"status": "up", "responseTime": 20},
    "externalApis": {"status": "up"}
  }
}
```

### Database Migrations

После первого деплоя выполните миграции:

```bash
# Локально
npx prisma migrate deploy

# Или через Vercel CLI
vercel env pull .env.local
npx prisma migrate deploy
```

### Seed данные (опционально)

```bash
npm run db:seed
```

## Troubleshooting

### Ошибка подключения к БД

**Проблема**: `Error: Can't reach database server`

**Решение**:
1. Проверьте `DATABASE_URL` в Environment Variables
2. Убедитесь что БД доступна извне
3. Проверьте правильность connection string
4. Для Vercel Postgres убедитесь что `?sslmode=require` добавлен

### Ошибка Prisma Client

**Проблема**: `@prisma/client did not initialize yet`

**Решение**:
1. Убедитесь что `prisma generate` выполняется в build команде
2. Проверьте `package.json`:
   ```json
   {
     "scripts": {
       "build": "npx prisma generate && next build"
     }
   }
   ```

### Timeout ошибки для генерации видео

**Проблема**: Функция timeout после 10 секунд

**Решение**:
Увеличьте timeout в `vercel.json`:
```json
{
  "functions": {
    "src/app/api/generate/**": {
      "maxDuration": 60
    }
  }
}
```

### Environment Variables не применяются

**Решение**:
1. Убедитесь что переменные добавлены для правильного environment (Production/Preview/Development)
2. Пересоздайте деплой после добавления переменных
3. Проверьте что переменные не содержат опечаток

### Redis/KV не работает

**Решение**:
1. Проверьте что Vercel KV настроен и переменные правильные
2. Для External Redis убедитесь что он доступен извне
3. Проверьте логи: `vercel logs`

## Мониторинг

### Логи

Просмотр логов в реальном времени:
```bash
vercel logs --follow
```

Логи конкретного деплоя:
```bash
vercel logs [deployment-url]
```

### Метрики

1. В Vercel Dashboard → ваш проект → `Analytics`
2. Смотрите:
   - Response times
   - Error rates
   - Traffic patterns

### Алерты

Настройте уведомления:
1. Dashboard → Project Settings → Notifications
2. Добавьте email или Slack webhook
3. Выберите события: deployments, errors, и т.д.

## Production Checklist

Перед финальным production деплоем:

- [ ] Все обязательные переменные окружения настроены
- [ ] Database миграции выполнены
- [ ] Google OAuth redirect URIs обновлены для production домена
- [ ] Vercel KV или External Redis настроен
- [ ] Vercel Blob Storage создан
- [ ] Health check endpoint возвращает 200
- [ ] Локальный build проходит без ошибок (`npm run build`)
- [ ] Custom domain настроен (если требуется)
- [ ] SSL сертификат активен
- [ ] Rate limiting работает
- [ ] Уведомления настроены
- [ ] Backup стратегия для БД настроена

## Дополнительная настройка

### Custom Domain

1. Dashboard → Project Settings → Domains
2. Добавьте домен
3. Настройте DNS записи
4. Обновите переменные окружения с новым доменом:
   - `AUTH_URL`
   - `NEXTAUTH_URL`
   - `NEXT_PUBLIC_BASE_URL`
   - `WEBHOOK_URL`

### Collaborative Environment

Для работы в команде:
1. Добавьте членов команды: Project Settings → Team
2. Настройте Branch Protection для main
3. Используйте Preview deployments для Pull Requests

### CI/CD

Vercel автоматически деплоит:
- **Production**: при push в `main` branch
- **Preview**: при создании Pull Request
- **Development**: можно настроить для других веток

## Полезные команды

```bash
# Просмотр текущего проекта
vercel ls

# Просмотр переменных окружения
vercel env ls

# Добавление переменной
vercel env add MY_VAR production

# Удаление переменной
vercel env rm MY_VAR production

# Откат к предыдущему деплою
vercel rollback [deployment-url]

# Проверка билда локально
vercel build

# Запуск локально с production настройками
vercel dev --prod
```

## Поддержка

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Project Repository Issues](https://github.com/your-repo/issues)

## Обновления приложения

При обновлении приложения:

1. Проверьте изменения в `env.template`
2. Обновите Environment Variables если требуется
3. Выполните новые миграции БД
4. Пересоздайте деплой: `vercel --prod`
5. Проверьте health check
6. Мониторьте логи на ошибки

---

**Последнее обновление**: 2024-01-22  
**Версия Node.js**: 22+  
**Версия Next.js**: 14.2.0

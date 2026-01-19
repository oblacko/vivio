# Руководство по системе шеринга видео

## Обзор

Реализована полноценная система шеринга 6-секундных видео с поддержкой Open Graph метатегов, аналитикой переходов и короткими ссылками.

## Функциональность

### 1. Короткие ссылки

Каждое видео имеет короткую ссылку для шеринга:
- Формат: `https://your-domain.com/v/{videoId}`
- Автоматический редирект на полную страницу видео `/videos/{videoId}`
- Оптимизированные Open Graph метатеги для соцсетей

### 2. Open Graph метатеги

При шеринге в соцсети (VK, Telegram, Facebook, Twitter/X) отображается:
- Превью изображение (thumbnail или автоматически сгенерированное)
- Название видео (из challenge)
- Описание
- Видео плеер (где поддерживается)

### 3. Аналитика шерингов

Система отслеживает:
- Количество шерингов (`shareCount`)
- Источник перехода (VK, Telegram, Facebook, Twitter, direct, etc.)
- Referrer URL
- User Agent (для определения устройства)

Данные хранятся в таблице `video_shares` для детальной аналитики.

### 4. Web Share API

На мобильных устройствах доступна нативная функция шеринга через систему:
- iOS: Share Sheet
- Android: System Share Dialog

## Использование

### Для пользователей

1. Откройте видео на странице `/videos/{id}`
2. Нажмите кнопку "Поделиться"
3. Выберите платформу или скопируйте короткую ссылку
4. Поделитесь с друзьями!

### Для разработчиков

#### Компонент ShareDialog

```tsx
import { ShareDialog } from "@/components/share/ShareDialog";

<ShareDialog
  videoId={videoId}
  title="Название видео"
>
  <Button>Поделиться</Button>
</ShareDialog>
```

#### API для записи шеринга

```typescript
POST /api/videos/{id}/share

Body:
{
  "source": "vk" | "telegram" | "facebook" | "twitter" | "native" | "copy" | "direct",
  "referrer": "https://...",
  "userAgent": "Mozilla/5.0 ..."
}

Response:
{
  "success": true,
  "shareCount": 42
}
```

#### Аналитика переходов

Автоматически записывается при переходе по короткой ссылке `/v/{id}`:
- Определяется источник по HTTP Referer
- Сохраняется в базу данных
- Инкрементируется счетчик просмотров

## База данных

### Модель Video

Новые поля:
```prisma
shareCount      Int         @default(0)  // Количество шерингов
referrerData    Json?       // Агрегированная статистика
```

### Модель VideoShare

Детальная аналитика каждого перехода:
```prisma
model VideoShare {
  id          String   @id @default(cuid())
  videoId     String
  source      String?  // vk, telegram, facebook, twitter, direct
  referrer    String?  // HTTP Referer
  userAgent   String?  // Для определения устройства
  createdAt   DateTime @default(now())
  
  video       Video    @relation(fields: [videoId], references: [id])
}
```

## Миграция базы данных

После обновления кода выполните:

```bash
npx prisma migrate dev --name add_video_sharing_analytics
npx prisma generate
```

Или в продакшене:

```bash
npx prisma migrate deploy
```

## Тестирование Open Graph

### Инструменты для проверки метатегов:

1. **Facebook Sharing Debugger**
   - URL: https://developers.facebook.com/tools/debug/
   - Вставьте ссылку `https://your-domain.com/v/{videoId}`
   - Проверьте превью и метатеги

2. **Twitter Card Validator**
   - URL: https://cards-dev.twitter.com/validator
   - Проверьте отображение карточки

3. **VK Link Checker**
   - Просто вставьте ссылку в сообщение VK
   - Проверьте превью

4. **Telegram**
   - Отправьте ссылку в любой чат
   - Проверьте превью

### Локальное тестирование

Для локального тестирования Open Graph используйте ngrok или аналог:

```bash
# Запустите приложение
npm run dev

# В другом терминале
ngrok http 3001

# Используйте ngrok URL для тестирования в соцсетях
```

## Переменные окружения

Убедитесь, что установлена переменная для корректных URL в Open Graph:

```env
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## Поддерживаемые платформы

Готовые интеграции для шеринга:
- ✅ VKontakte
- ✅ Telegram
- ✅ Twitter/X
- ✅ Facebook
- ✅ Web Share API (iOS/Android нативный шеринг)
- ✅ Копирование ссылки

Автоматическое определение источника переходов:
- VK
- Telegram
- Facebook
- Twitter/X
- Instagram
- WhatsApp
- Direct (прямой переход)
- Other (прочие источники)

## Примеры использования

### Получение статистики шерингов

```typescript
const video = await prisma.video.findUnique({
  where: { id: videoId },
  include: {
    shares: {
      orderBy: { createdAt: 'desc' },
      take: 10,
    },
  },
});

console.log('Всего шерингов:', video.shareCount);
console.log('Последние переходы:', video.shares);
```

### Анализ источников

```typescript
const sharesBySource = await prisma.videoShare.groupBy({
  by: ['source'],
  where: { videoId },
  _count: { id: true },
});

console.log('Распределение по источникам:', sharesBySource);
```

## Оптимизация

### Кэширование Open Graph изображений

Open Graph изображения генерируются динамически с использованием Next.js Image Generation API и кэшируются автоматически.

### CDN

Рекомендуется использовать CDN (например, Vercel Edge Network) для быстрой доставки метатегов и изображений по всему миру.

## Troubleshooting

### Соцсеть не показывает превью

1. Проверьте, что видео является публичным (`isPublic: true`)
2. Проверьте метатеги через Facebook Debugger
3. Очистите кэш соцсети (обычно кнопка "Scrape Again")

### Аналитика не записывается

1. Проверьте, что миграция БД выполнена
2. Проверьте консоль браузера на ошибки
3. Проверьте логи сервера

### Redirect не работает

1. Убедитесь, что страница `/v/[id]` является Server Component
2. Проверьте, что видео существует в БД

## Roadmap

Возможные улучшения:
- [ ] Дашборд аналитики шерингов для создателей
- [ ] UTM метки для отслеживания кампаний
- [ ] A/B тестирование разных превью
- [ ] Персонализированные Open Graph изображения
- [ ] Интеграция с WhatsApp Business API
- [ ] QR коды для шеринга

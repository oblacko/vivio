# ЧТО ПРОИСХОДИТ ПРИ ПОДЕЛИТЬСЯ

## 1. ГЕНЕРАЦИЯ ССЫЛКИ

**Файл:** `src/components/share/ShareDialog.tsx:71-73`

```tsx
const shareUrl = `${window.location.origin}/v/${videoId}`;
```

**Пример:** `https://vivio.vercel.app/v/clzg7h0g60000lc08oe9w7r0c`

---

## 2. КЛИК НА "TELEGRAM"

**Файл:** `src/components/share/ShareDialog.tsx:40-45`

```tsx
{
  name: "Telegram",
  url: (url, title) =>
    `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
}
```

**Открывается:**
```
https://t.me/share/url?url=https%3A%2F%2Fvivio.vercel.app%2Fv%2FVIDEO_ID&text=Title
```

---

## 3. TELEGRAM БОТ ЗАПРАШИВАЕТ СТРАНИЦУ

**URL:** `GET /v/VIDEO_ID`

**User-Agent:** `TelegramBot (like TwitterBot)`

---

## 4. СЕРВЕР ОТДАЕТ HTML

**Файл:** `src/app/v/[id]/page.tsx`

### Метатеги (generateMetadata):
```html
<meta property="og:title" content="Видео название" />
<meta property="og:description" content="Описание" />
<meta property="og:image" content="https://vivio.vercel.app/thumbnail.webp" />
<meta property="og:video" content="https://vivio.vercel.app/video.mp4" />
<meta property="og:type" content="video.other" />
<meta property="og:url" content="https://vivio.vercel.app/v/VIDEO_ID" />
```

### HTML Body:
```html
<html>
  <head>
    <meta http-equiv="refresh" content="0.5; url=/videos/VIDEO_ID" />
    <script>
      setTimeout(function() { 
        window.location.href = '/videos/VIDEO_ID'; 
      }, 500);
    </script>
  </head>
  <body>
    <h1>Vivio</h1>
    <p>Загрузка видео...</p>
  </body>
</html>
```

---

## 5. ЧТО ВИДИТ TELEGRAM

- ✅ Читает метатеги ИЗ `<head>` (до редиректа)
- ✅ Показывает превью с изображением `og:image`
- ✅ Показывает заголовок `og:title`
- ✅ При клике на превью - открывает `/v/VIDEO_ID`
- ✅ Страница автоматически редиректит на `/videos/VIDEO_ID`

---

## 6. ЧТО ВИДИТ ПОЛЬЗОВАТЕЛЬ

1. Кликает ссылку в Telegram
2. Открывается `https://vivio.vercel.app/v/VIDEO_ID`
3. Видит страницу "Загрузка видео..." (0.5 сек)
4. Автоматически перенаправляется на `/videos/VIDEO_ID`
5. Видит полноценную страницу с видео

---

## ПРОВЕРКА

### Локально (если dev сервер запущен):
```bash
# Получить HTML страницы
curl -H "User-Agent: TelegramBot" http://localhost:3000/v/VIDEO_ID

# Проверить метатеги
curl -H "User-Agent: TelegramBot" http://localhost:3000/v/VIDEO_ID | grep "og:"
```

### На продакшене:
```bash
curl -H "User-Agent: TelegramBot" https://vivio.vercel.app/v/VIDEO_ID
```

---

## ВАЖНО

- `NEXT_PUBLIC_APP_URL` должен быть установлен в `.env`
- У видео должен быть `thumbnailUrl` (генерируется при создании)
- Если `thumbnailUrl` нет - используется fallback `/api/og?id=VIDEO_ID`

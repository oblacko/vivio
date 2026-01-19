# 🚀 Quick Start: Создание Vivio в Figma

> Быстрое руководство для начала работы (15-20 минут)

## Цель

Быстро настроить базовую структуру и начать создавать компоненты.

---

## Шаг 1: Создайте файл (2 мин)

1. Откройте Figma
2. Создайте новый Design File: `Vivio Design System`
3. Создайте 3 страницы:
   - 📐 **Design System**
   - 🧩 **Components**
   - 📱 **Pages**

---

## Шаг 2: Цвета (5 мин)

На странице **Design System**, создайте фреймы для каждого цвета:

### Light Mode (минимальный набор)

1. **Background**: `#FFFFFF`
2. **Foreground**: `#020817`
3. **Primary**: `#0F172A`
4. **Primary Foreground**: `#F8FAFC`
5. **Muted**: `#F1F5F9`
6. **Muted Foreground**: `#64748B`
7. **Border**: `#E2E8F0`
8. **Destructive**: `#EF4444`

Создайте **Color Styles** (правый клик → Create color style).

💡 **Полный список цветов**: см. [design-tokens.json](./design-tokens.json)

---

## Шаг 3: Типографика (5 мин)

Установите шрифт **Inter** (Google Fonts).

Создайте минимальный набор текстовых стилей:

1. **Display/Large**: Inter Bold, 60px, line-height 72px
2. **Heading/H1**: Inter Bold, 36px, line-height 40px
3. **Heading/H2**: Inter Bold, 30px, line-height 36px
4. **Heading/H3**: Inter Semibold, 24px, line-height 32px
5. **Body/Base**: Inter Regular, 16px, line-height 24px
6. **Body/Small**: Inter Regular, 14px, line-height 20px
7. **Caption**: Inter Regular, 12px, line-height 16px

Создайте **Text Styles** (правый клик → Create text style).

💡 **Полный список стилей**: см. [FIGMA_SETUP_GUIDE.md](./FIGMA_SETUP_GUIDE.md#шаг-6-создание-текстовых-стилей)

---

## Шаг 4: Первый компонент - Button (5 мин)

На странице **Components**, создайте кнопку:

### Button/Default/Medium

1. **Frame**: 
   - Width: Auto (hug)
   - Height: 40px
   - Auto Layout: Horizontal
   - Padding: 16px horizontal, 8px vertical
   - Gap: 8px
   - Border radius: 6px
   - Fill: Primary
   
2. **Text**: 
   - Style: Body/Small
   - Color: Primary Foreground
   - Text: "Button"

3. **Создайте Component** (Ctrl/Cmd + Alt/Opt + K)

4. **Добавьте варианты**:
   - Right panel → Add variant
   - Создайте property: `Variant` = Default, Outline, Ghost
   - Создайте property: `Size` = Small, Medium, Large

💡 **Детальная спецификация**: см. [BASE_COMPONENTS.md](./BASE_COMPONENTS.md#button-кнопка)

---

## Шаг 5: Первая карточка - VideoCard (3 мин)

### VideoCard (базовая версия)

1. **Frame**:
   - Width: 280px
   - Height: auto (зависит от aspect ratio)
   - Border radius: 8px
   - Fill: Black

2. **Image placeholder** (9:16 aspect):
   - Width: 280px
   - Height: 498px (280 × 16/9)
   - Fill: Muted
   - Object fit: Cover

3. **Play Icon Overlay** (центр):
   - Circle: 64×64px, White с opacity 90%
   - Icon Play: 32×32px, Black

4. **Создайте Component**

💡 **Полная спецификация**: см. [VIDEO_COMPONENTS.md](./VIDEO_COMPONENTS.md#videocard)

---

## Шаг 6: Первая страница - Home Hero (5 мин)

На странице **Pages**, создайте Hero секцию:

### Hero Section

1. **Frame** (1440px × 600px):
   - Border radius: 16px
   - Border: 1px solid Border

2. **Background Gradient**:
   - Type: Linear, 135°
   - Color 1: Primary (20% opacity) at 0%
   - Color 2: Background (0% opacity) at 100%

3. **Content** (центр, max-width 768px):
   ```
   - Badge: "AI-генерация видео" (с иконкой Sparkles)
   - Heading: "Оживите свои фотографии" (Display/Large)
   - Description: текст (Body/Large, Muted-Foreground)
   - Button: "Начать бесплатно" (Button/Default/Large)
   ```

💡 **Полная спецификация**: см. [PAGE_LAYOUTS.md](./PAGE_LAYOUTS.md#hero-section)

---

## Следующие шаги

После Quick Start:

### 1. Завершите дизайн-систему
- Добавьте остальные цвета (Dark mode)
- Создайте все текстовые стили
- Добавьте shadows и effects

📖 [FIGMA_SETUP_GUIDE.md](./FIGMA_SETUP_GUIDE.md)

### 2. Создайте базовые компоненты
- Card, Input, Badge, Avatar, Progress
- Dialog, Select, Dropdown Menu

📖 [BASE_COMPONENTS.md](./BASE_COMPONENTS.md)

### 3. Добавьте специализированные компоненты
- ChallengeCard
- ImageToVideoUploader (6 состояний)
- Navigation Bar

📖 [VIDEO_COMPONENTS.md](./VIDEO_COMPONENTS.md), [FORM_COMPONENTS.md](./FORM_COMPONENTS.md), [NAVIGATION_COMPONENTS.md](./NAVIGATION_COMPONENTS.md)

### 4. Создайте макеты страниц
- Home (полная версия)
- Create
- Admin
- Auth

📖 [PAGE_LAYOUTS.md](./PAGE_LAYOUTS.md)

---

## 💡 Полезные советы

### Auto Layout
Всегда используйте Auto Layout (Shift + A):
- Кнопки: Hug contents
- Карточки: Fixed или Fill container
- Gap: кратно 4px

### Naming
Структура имен:
- Components: `ComponentName/Variant/Size/State`
- Examples: `Button/Default/Medium/Default`, `VideoCard/Vertical/Hover`

### Plugins
Рекомендуемые плагины:
- **Lucide Icons** - для иконок
- **Content Reel** - для placeholder контента
- **Stark** - для проверки accessibility

---

## 📚 Справочные материалы

### Основные файлы
- [README.md](./README.md) - Полный обзор
- [design-tokens.json](./design-tokens.json) - Все токены
- [ICONS.md](./ICONS.md) - Список иконок

### Детальные спецификации
- [BASE_COMPONENTS.md](./BASE_COMPONENTS.md)
- [VIDEO_COMPONENTS.md](./VIDEO_COMPONENTS.md)
- [FORM_COMPONENTS.md](./FORM_COMPONENTS.md)
- [NAVIGATION_COMPONENTS.md](./NAVIGATION_COMPONENTS.md)
- [PAGE_LAYOUTS.md](./PAGE_LAYOUTS.md)

### Руководства
- [FIGMA_SETUP_GUIDE.md](./FIGMA_SETUP_GUIDE.md) - Пошаговая настройка
- [SUMMARY.md](./SUMMARY.md) - Итоговая сводка

---

## ✅ Checklist первой сессии

После Quick Start вы должны иметь:

- [ ] Файл Figma со структурой страниц
- [ ] 8+ цветовых стилей (минимум)
- [ ] 7+ текстовых стилей
- [ ] Компонент Button с вариантами
- [ ] Компонент VideoCard (базовый)
- [ ] Hero секция главной страницы

**Время**: ~20 минут

**Следующая сессия**: Создание остальных базовых компонентов (Card, Input, Badge)

---

Удачи! 🎨

Если возникнут вопросы, обращайтесь к соответствующим документам или исходному коду в `src/components/`.

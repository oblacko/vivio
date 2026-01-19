# Vivio Design System для Figma

> Полная документация для создания дизайн-системы Vivio в Figma

## 📋 Обзор

Этот репозиторий содержит детальную документацию и спецификации для создания дизайн-системы Vivio в Figma. Vivio - это AI-платформа для генерации 6-секундных видео из статичных изображений.

### Что включено

- ✅ Дизайн-токены (цвета, типографика, spacing, shadows)
- ✅ Подробные спецификации всех компонентов
- ✅ Макеты всех страниц приложения
- ✅ Пошаговое руководство по настройке
- ✅ Responsive дизайн (Desktop, Tablet, Mobile)
- ✅ Light и Dark режимы

---

## 🚀 Начало работы

### Шаг 1: Изучите дизайн-токены

Начните с файла [design-tokens.json](./design-tokens.json) - он содержит все базовые значения:
- Цвета (light/dark режимы)
- Размеры шрифтов
- Отступы (spacing)
- Скругления (border radius)
- Тени (shadows)
- Aspect ratios

### Шаг 2: Следуйте руководству по настройке

Откройте [FIGMA_SETUP_GUIDE.md](./FIGMA_SETUP_GUIDE.md) и следуйте пошаговым инструкциям:
1. Создание структуры файла
2. Настройка цветовых стилей
3. Создание текстовых стилей
4. Настройка эффектов (тени, градиенты)

### Шаг 3: Создайте компоненты

Используйте детальные спецификации:
1. [BASE_COMPONENTS.md](./BASE_COMPONENTS.md) - Button, Card, Input, Badge и др.
2. [VIDEO_COMPONENTS.md](./VIDEO_COMPONENTS.md) - VideoCard, ChallengeCard
3. [FORM_COMPONENTS.md](./FORM_COMPONENTS.md) - ImageToVideoUploader, Progress
4. [NAVIGATION_COMPONENTS.md](./NAVIGATION_COMPONENTS.md) - Navigation bar, Menu

### Шаг 4: Соберите страницы

Создайте макеты страниц используя [PAGE_LAYOUTS.md](./PAGE_LAYOUTS.md):
- Home Page (главная)
- Create Page (создание видео)
- Challenge Detail
- Video Detail
- Profile
- Admin Panel
- Auth Pages (Login/Signup)

---

## 📚 Документация

### Основные документы

| Файл | Описание |
|------|----------|
| [FIGMA_SETUP_GUIDE.md](./FIGMA_SETUP_GUIDE.md) | Пошаговое руководство по настройке Figma файла |
| [design-tokens.json](./design-tokens.json) | JSON файл со всеми токенами дизайна |
| [ICONS.md](./ICONS.md) | Список всех используемых иконок |

### Спецификации компонентов

| Файл | Компоненты |
|------|-----------|
| [BASE_COMPONENTS.md](./BASE_COMPONENTS.md) | Button, Card, Input, Textarea, Select, Badge, Avatar, Progress, Skeleton, Dialog, Sheet, Dropdown Menu |
| [VIDEO_COMPONENTS.md](./VIDEO_COMPONENTS.md) | VideoCard, ChallengeCard, VideoPlayer |
| [FORM_COMPONENTS.md](./FORM_COMPONENTS.md) | ImageToVideoUploader, FileUpload, GenerationProgress, FormField |
| [NAVIGATION_COMPONENTS.md](./NAVIGATION_COMPONENTS.md) | Navigation Bar, Logo, User Menu, Mobile Navigation, Floating Button |

### Макеты страниц

| Файл | Страницы |
|------|---------|
| [PAGE_LAYOUTS.md](./PAGE_LAYOUTS.md) | Home, Create, Challenge Detail, Video Detail, Profile, Admin, Auth |

---

## 🎨 Дизайн-система

### Цветовая палитра

Vivio использует HSL цветовую систему с поддержкой light/dark режимов:

#### Light Mode
- **Primary**: `hsl(222.2, 47.4%, 11.2%)` - темно-синий
- **Background**: `hsl(0, 0%, 100%)` - белый
- **Muted**: `hsl(210, 40%, 96.1%)` - светло-серый

#### Dark Mode
- **Primary**: `hsl(210, 40%, 98%)` - светлый
- **Background**: `hsl(222.2, 84%, 4.9%)` - темно-синий
- **Muted**: `hsl(217.2, 32.6%, 17.5%)` - темно-серый

### Типографика

- **Шрифт**: Inter (Google Fonts)
- **Размеры**: от 12px (text-xs) до 60px (display)
- **Веса**: Regular (400), Medium (500), Semibold (600), Bold (700)

### Spacing

Базовая единица: **4px**

```
4px  → spacing-1
8px  → spacing-2
12px → spacing-3
16px → spacing-4
24px → spacing-6
32px → spacing-8
48px → spacing-12
64px → spacing-16
```

### Border Radius

- **Small**: 6px
- **Medium**: 6px
- **Large**: 8px (default)
- **XL**: 12px
- **2XL**: 16px
- **Full**: 9999px (круглый)

---

## 📐 Ключевые особенности

### 1. Вертикальный формат видео (9:16)

Основной формат контента - вертикальный (как TikTok, Instagram Reels):
- VideoCard: aspect ratio 9:16
- ChallengeCard: aspect ratio 9:16
- VideoPlayer: поддержка вертикального формата

### 2. Hover эффекты

VideoCard при наведении:
- Transform: translateY(-4px)
- Shadow увеличивается
- Превью скрывается
- Видео начинает воспроизводиться

### 3. Состояния загрузки

ImageToVideoUploader имеет 6 состояний:
1. **Idle** - ожидание файла
2. **Uploading** - загрузка файла
3. **File Uploaded** - готов к обработке
4. **Processing** - обработка AI
5. **Completed** - видео готово
6. **Error** - ошибка

### 4. Адаптивный дизайн

Три основных breakpoint:
- **Desktop** (≥1024px): 5-колоночная сетка видео
- **Tablet** (768-1023px): 3-колоночная сетка
- **Mobile** (<768px): 2-колоночная сетка, мобильная навигация

### 5. Hero секция с эффектами

Главная страница включает:
- Градиентный фон (primary с fade out)
- Grid pattern overlay
- Blur эффект на фоне

---

## 🔧 Используемые технологии

### В проекте (для справки)

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS + shadcn/ui
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Fonts**: Inter (Google Fonts)

### В Figma (рекомендуется)

- **Plugins**: 
  - Stark (для проверки accessibility)
  - Content Reel (для генерации контента)
  - Unsplash (для placeholder изображений)
- **Variables**: для переключения light/dark режимов
- **Auto Layout**: для всех компонентов
- **Components**: для переиспользования элементов

---

## 📊 Структура Figma файла

Рекомендуемая организация страниц в Figma:

```
Vivio Design System
│
├── 📐 Design System
│   ├── Colors (Light & Dark)
│   ├── Typography
│   ├── Spacing & Layout
│   └── Effects (Shadows, Gradients, Patterns)
│
├── 🧩 Components
│   ├── Base Components
│   │   ├── Button (все варианты)
│   │   ├── Card
│   │   ├── Input & Forms
│   │   ├── Badge & Avatar
│   │   └── Progress & Skeleton
│   ├── Video Components
│   │   ├── VideoCard
│   │   └── ChallengeCard
│   ├── Form Components
│   │   └── ImageToVideoUploader (все состояния)
│   └── Navigation
│       ├── Desktop Navigation
│       ├── Mobile Navigation
│       └── Floating Button
│
├── 📱 Pages - Desktop (1440px)
│   ├── Home
│   ├── Create Video
│   ├── Challenge Detail
│   ├── Video Detail
│   ├── Profile
│   ├── Admin Panel
│   ├── Login
│   └── Signup
│
├── 📱 Pages - Tablet (768px)
│   └── (адаптированные версии)
│
├── 📱 Pages - Mobile (375px)
│   └── (мобильные версии)
│
└── 🎨 States & Examples
    ├── Loading States
    ├── Empty States
    ├── Error States
    └── Component Variations
```

---

## ✅ Checklist для создания

### 1. Design System ✓
- [ ] Создать цветовые стили (Light + Dark)
- [ ] Создать текстовые стили (все размеры и веса)
- [ ] Создать эффекты (shadows)
- [ ] Создать градиенты
- [ ] Создать grid pattern

### 2. Base Components ✓
- [ ] Button (4 варианта × 3 размера)
- [ ] Card (с Header, Content, Footer)
- [ ] Input & Textarea
- [ ] Select
- [ ] Badge (4 варианта)
- [ ] Avatar (4 размера)
- [ ] Progress
- [ ] Skeleton
- [ ] Dialog
- [ ] Sheet
- [ ] Dropdown Menu

### 3. Video Components ✓
- [ ] VideoCard (default + hover states)
- [ ] ChallengeCard
- [ ] VideoPlayer (inline + full)

### 4. Form Components ✓
- [ ] ImageToVideoUploader (все 6 состояний)
- [ ] FileUpload
- [ ] GenerationProgress
- [ ] FormField wrapper

### 5. Navigation ✓
- [ ] Desktop Navigation
- [ ] Mobile Navigation
- [ ] Logo
- [ ] User Dropdown
- [ ] Floating Upload Button

### 6. Pages - Desktop ✓
- [ ] Home (Hero + Videos + Challenges)
- [ ] Create Video
- [ ] Challenge Detail
- [ ] Video Detail
- [ ] Profile
- [ ] Admin Panel
- [ ] Login
- [ ] Signup

### 7. Responsive Versions ✓
- [ ] Tablet versions (768px)
- [ ] Mobile versions (375px)

### 8. States ✓
- [ ] Loading states (skeletons)
- [ ] Empty states
- [ ] Error states

---

## 💡 Полезные советы

### Auto Layout

Всегда используйте Auto Layout для:
- Кнопок (чтобы подстраивались под текст)
- Карточек (для вертикального стека элементов)
- Навигации (для горизонтального расположения)
- Форм (для вертикального стека полей)

**Настройки**:
- **Padding**: используйте spacing scale (4px единица)
- **Gap**: используйте spacing scale
- **Resizing**: "Hug" для контента, "Fill" для контейнеров

### Naming Convention

Используйте понятные имена:
- Компоненты: `ComponentName/Variant/State`
- Примеры: 
  - `Button/Default/Medium/Default`
  - `VideoCard/Vertical/Hover`
  - `Input/Default/Focus`

### Варианты (Variants)

Создавайте варианты для:
- Размеров (Small, Medium, Large)
- Состояний (Default, Hover, Active, Disabled)
- Типов (Default, Outline, Ghost)
- Режимов (Light, Dark)

### Constraints

Настройте constraints для адаптивности:
- **Left + Right**: для элементов на всю ширину
- **Center**: для центрированных элементов
- **Scale**: для пропорционального изменения

---

## 📞 Контакты и поддержка

Если у вас возникли вопросы при создании дизайна:

1. Проверьте соответствующий документ в этой директории
2. Посмотрите примеры в [design-tokens.json](./design-tokens.json)
3. Обратитесь к коду проекта (исходные компоненты в `src/components/`)

---

## 📄 Лицензия

Этот дизайн создан для проекта Vivio.

---

## 🎯 Следующие шаги

1. **Начните с [FIGMA_SETUP_GUIDE.md](./FIGMA_SETUP_GUIDE.md)** - пошаговое руководство
2. **Импортируйте токены** из [design-tokens.json](./design-tokens.json)
3. **Создайте базовые компоненты** по [BASE_COMPONENTS.md](./BASE_COMPONENTS.md)
4. **Соберите страницы** используя [PAGE_LAYOUTS.md](./PAGE_LAYOUTS.md)

Удачи в создании! 🚀

---

**Vivio** - Оживите свои фотографии с помощью AI

# Макеты страниц Vivio

> Детальная спецификация всех основных страниц приложения

## Содержание

- [Общие принципы](#общие-принципы)
- [Home Page (Главная)](#home-page-главная)
- [Create Page (Создание видео)](#create-page-создание-видео)
- [Challenge Detail Page](#challenge-detail-page)
- [Video Detail Page](#video-detail-page)
- [Profile Page](#profile-page)
- [Admin Panel](#admin-panel)
- [Auth Pages (Login/Signup)](#auth-pages-loginsignup)

---

## Общие принципы

### Layout Structure

Все страницы следуют единой структуре:

```
Page Layout
├── Navigation Bar (fixed top)
├── Main Content (scrollable)
│   └── Container (max-width, centered)
└── Floating Upload Button (опционально)
```

### Container

- **Max width**: 1280px (Desktop)
- **Padding**: 
  - Desktop: 32px horizontal
  - Tablet: 24px horizontal
  - Mobile: 16px horizontal
- **Margin**: 0 auto (center aligned)

### Spacing

- **Between sections**: 64px (Desktop), 48px (Mobile)
- **Between elements**: 24px (стандартный)
- **Between cards**: 16px (в сетке)

---

## Home Page (Главная)

### Назначение

Главная страница приложения с hero секцией, популярными видео и трендами.

### Структура

```
Home Page
├── Navigation Bar
├── Hero Section
├── Videos Section
│   ├── Category Filters
│   └── Video Grid
└── Challenges Section
    ├── Section Header
    └── Challenge Grid
```

---

### Hero Section

#### Container
- **Padding**: 64px vertical (Desktop), 48px vertical (Mobile)
- **Margin bottom**: 48px
- **Background**: Gradient + Grid Pattern
- **Border radius**: `Radius/2XL` (16px)
- **Border**: 1px solid `Border`
- **Overflow**: hidden

#### Background Gradient
- **Type**: Linear
- **Angle**: 135° (top-left to bottom-right)
- **Colors**:
  - 0%: `Primary` с opacity 20%
  - 50%: `Primary` с opacity 10%
  - 100%: `Background` с opacity 0%

#### Grid Pattern Overlay
- **Pattern**: Grid с ячейками 64×64px
- **Line color**: White с opacity 10%
- **Position**: absolute, full size
- **Mask**: linear-gradient fade to bottom

#### Content (центрированный)

```
Hero Content (Auto Layout Vertical, center aligned, max-width 768px)
├── Badge ("AI-генерация видео")
├── Heading
├── Description
├── CTA Buttons
└── Features Row
```

##### Badge
- **Component**: Badge/Outline
- **Icon**: Sparkles (leading), 16px
- **Text**: "AI-генерация видео"
- **Background**: `Primary` с opacity 10%
- **Border**: 1px solid `Primary` с opacity 20%
- **Margin bottom**: 24px

##### Heading
- **Typography**: `Display/Large` (60px на Desktop, 36px на Mobile)
- **Color**: `Foreground`
- **Text**: "Оживите свои фотографии"
- **Text align**: center
- **Margin bottom**: 24px

##### Description
- **Typography**: `Body/Large` (18px)
- **Color**: `Muted-Foreground`
- **Text**: "Создавайте удивительные 6-секундные видео с помощью AI. Превратите статичные изображения в динамические истории."
- **Text align**: center
- **Max width**: 600px
- **Margin bottom**: 32px

##### CTA Buttons

```
CTA Buttons (Auto Layout Horizontal, center, gap 16px)
├── Primary CTA (Button/Default, Size=Large)
│   ├── Icon: Play или Sparkles
│   └── Text: "Начать бесплатно" или "Создать видео"
└── Secondary CTA (Button/Outline, Size=Large)
    └── Text: "Смотреть челленджи"
```

**Responsive**: На mobile переключается на Vertical layout

##### Features Row

```
Features (Auto Layout Horizontal, center, gap 32px)
├── Feature Item ("6 секунд")
├── Feature Item ("AI-powered")
└── Feature Item ("HD качество")
```

**Feature Item**:
```
Auto Layout Horizontal, gap 8px, center aligned
├── Icon (16×16px, Muted-Foreground)
└── Text (Body/Small, Muted-Foreground)
```

**Margin top**: 32px

---

### Videos Section

#### Section Header

```
Section Header (Auto Layout Vertical, gap 8px, margin bottom 24px)
├── Title (Heading/H2, "Популярные видео")
└── Description (Body/Base, Muted-Foreground)
```

#### Category Filters

```
Category Filters (Auto Layout Horizontal, gap 8px, margin bottom 24px)
├── Scrollable container (overflow-x: auto)
└── Filter Buttons
    ├── "Все"
    ├── "Монументы"
    ├── "Питомцы"
    ├── "Лица"
    └── "Сезонные"
```

**Filter Button**:
- **Component**: Button
- **Variant**: Default (active), Outline (inactive)
- **Size**: Small
- **Border radius**: `Radius/Full` (pill shape)
- **Padding**: 12px horizontal, 6px vertical

#### Video Grid

```
Video Grid (CSS Grid)
├── Desktop: 5 columns, gap 16px
├── Tablet: 3 columns, gap 16px
└── Mobile: 2 columns, gap 12px

Each item: VideoCard component (9:16 aspect)
```

**Min items to show**: 10 карточек

---

### Challenges Section

#### Section Header

```
Section Header (Auto Layout Horizontal, space-between, align center)
├── Left: Title + Icon
│   ├── Emoji/Icon: 🔥 или Sparkles
│   ├── Title (Heading/H2, "Горячие тренды")
│   └── Description (Body/Base, Muted-Foreground)
└── Right: "Смотреть все" link (Button/Ghost)
```

**Margin top**: 64px
**Margin bottom**: 24px

#### Challenge Grid

```
Challenge Grid (CSS Grid)
├── Desktop: 4 columns, gap 16px
├── Tablet: 3 columns, gap 16px
└── Mobile: 2 columns, gap 12px

Each item: ChallengeCard component
```

**Items to show**: 4-8 карточек (первые)

---

## Create Page (Создание видео)

### Назначение

Страница для создания видео с выбором челленджа и загрузкой изображения.

### Структура

```
Create Page
├── Navigation Bar
├── Back Button
├── Page Header
├── Challenge Selection (опционально)
│   ├── Select Dropdown
│   └── Selected Challenge Info Card
└── Upload Section
    └── ImageToVideoUploader
```

---

### Layout

#### Page Container
- **Max width**: 896px (уже, чем обычный container)
- **Padding**: 32px vertical

#### Back Button
- **Component**: Button/Ghost
- **Icon**: ArrowLeft (leading)
- **Text**: "Назад"
- **Margin bottom**: 16px

#### Page Header

```
Page Header (Auto Layout Vertical, gap 8px, margin bottom 32px)
├── Title (Heading/H1, "Создать видео")
└── Description (Body/Base, Muted-Foreground)
    "Загрузите изображение, чтобы создать уникальное 
     6-секундное видео с помощью AI"
```

#### Challenge Selection

```
Challenge Section (Auto Layout Vertical, gap 16px, margin bottom 24px)
├── Label (Body/Small-Medium, "Тренд (опционально)")
├── Select Component (full width, max-width 448px)
└── Selected Challenge Info Card (если выбран)
```

**Selected Challenge Info Card**:
```
Info Card (Auto Layout Horizontal, gap 12px, padding 16px)
├── Background: Muted/50 (полупрозрачный)
├── Border radius: Radius/LG
├── Icon: Sparkles (20px, Primary)
└── Text Content (Auto Layout Vertical, gap 4px)
    ├── Title (Body/Base-Medium, Foreground)
    └── Category (Body/Small, Muted-Foreground)
```

#### Upload Section

- **Padding top**: 16px
- **Component**: ImageToVideoUploader (все состояния)
- **Max width**: 640px
- **Center aligned**

---

### Responsive Behavior

#### Mobile (<768px)
- **Padding**: 16px
- **Header font size**: уменьшить до H2
- **Challenge selection**: full width
- **Upload section**: full width

---

## Challenge Detail Page

### Назначение

Страница отдельного челленджа с описанием и видео участников.

### Структура

```
Challenge Detail Page
├── Navigation Bar
├── Challenge Header
│   ├── Back Button
│   ├── Thumbnail/Preview (большой)
│   ├── Title + Description
│   ├── Stats (participants, views)
│   └── CTA Button ("Участвовать")
└── Participants Section
    ├── Section Title ("Участники")
    └── Video Grid (все видео челленджа)
```

---

### Challenge Header

```
Header (Auto Layout, 2 columns на Desktop, 1 на Mobile)
├── Left Column (Preview)
│   └── Large Preview Image/Video (aspect 9:16, max-width 400px)
└── Right Column (Info)
    ├── Badge (Category)
    ├── Title (Heading/H1)
    ├── Description (Body/Base, Muted-Foreground)
    ├── Stats Row
    │   ├── Participants count
    │   ├── Views count
    │   └── Created date
    └── CTA Button (Button/Default, Large, "Участвовать")
```

**Stats Row**:
```
Auto Layout Horizontal, gap 24px, margin 24px vertical
├── Stat Item (Icon + Number + Label)
│   Example: "👥 156 участников"
```

---

### Participants Section

- **Margin top**: 64px
- **Title**: "Участники" (Heading/H2)
- **Grid**: Video Grid (аналогично Home page)

---

## Video Detail Page

### Назначение

Страница просмотра отдельного видео.

### Структура

```
Video Detail Page
├── Navigation Bar
├── Video Player Section (центрированный)
│   └── VideoPlayer (large, with controls)
├── Video Info Section
│   ├── Title (если есть)
│   ├── User Info (Avatar + Name + Date)
│   ├── Stats Row (Views, Likes)
│   └── Actions Row (Like, Share, Download)
├── Challenge Info (если видео part of challenge)
└── Related Videos Section
    └── Video Grid
```

---

### Layout

#### Container
- **Max width**: 896px
- **Center aligned**

#### Video Player Section
- **Max width**: 600px
- **Aspect ratio**: 9:16
- **Margin**: 0 auto 32px
- **Background**: Black
- **Border radius**: `Radius/LG`

#### Video Info Section

```
Info Section (Auto Layout Vertical, gap 16px, padding 24px)
├── User Info Row
│   ├── Avatar (48×48px)
│   ├── User Name + Date (Auto Layout Vertical)
│   └── Follow Button (опционально)
├── Stats Row
│   ├── Views (Eye icon + count)
│   └── Likes (Heart icon + count)
└── Actions Row
    ├── Like Button (Button, with heart icon)
    ├── Share Button (with dropdown)
    └── Download Button
```

#### Challenge Info Card

Если видео является частью челленджа:

```
Challenge Card (Link to challenge, margin 24px vertical)
├── Background: Muted
├── Border: 1px solid Border
├── Border radius: Radius/LG
├── Padding: 16px
├── Auto Layout Horizontal, gap 16px, align center
├── Icon: Sparkles (24px, Primary)
└── Content
    ├── Label (Caption, Muted-Foreground, "Часть челленджа")
    ├── Challenge Title (Body/Base-Medium, Foreground)
    └── Arrow icon (ChevronRight, trailing)
```

#### Related Videos

- **Margin top**: 64px
- **Title**: "Похожие видео" (Heading/H3)
- **Grid**: 3-4 колонки

---

## Profile Page

### Назначение

Страница профиля пользователя с его видео.

### Структура

```
Profile Page
├── Navigation Bar
├── Profile Header
│   ├── Avatar (Large, 96×96px)
│   ├── Name + Username
│   ├── Bio (опционально)
│   ├── Stats Row (Videos, Likes, Followers)
│   └── Edit Button (если own profile)
└── Videos Section
    ├── Tabs (Videos, Liked, Saved) - опционально
    └── Video Grid (user's videos)
```

---

### Profile Header

```
Header (Auto Layout Vertical, center aligned, padding 48px vertical)
├── Avatar (96×96px, centered)
├── Name (Heading/H2, margin top 16px)
├── Username (Body/Base, Muted-Foreground, @username)
├── Bio (Body/Small, margin top 8px, max-width 600px)
├── Stats Row (margin top 24px)
│   ├── Videos count
│   ├── Total likes
│   └── Followers (future)
└── Actions (margin top 24px)
    ├── Edit Profile Button (if own)
    └── Follow Button (if other's profile)
```

**Stats Row**:
```
Auto Layout Horizontal, gap 32px, center aligned
├── Stat Item
│   ├── Number (Heading/H3)
│   └── Label (Body/Small, Muted-Foreground)
```

### Videos Section

- **Margin top**: 48px
- **Grid**: Video Grid (same as Home)
- **Empty state**: показать сообщение "Видео еще не загружены"

---

## Admin Panel

### Назначение

Панель администратора для управления челленджами.

### Структура

```
Admin Panel
├── Navigation Bar
├── Page Header (with shield icon)
├── Create Button
├── Challenges List
│   └── Challenge Cards (в виде списка)
```

---

### Page Header

```
Header (Auto Layout Horizontal, gap 12px, margin bottom 32px)
├── Icon (Shield, 32px, Primary)
├── Content (Auto Layout Vertical, gap 4px)
│   ├── Title (Heading/H1, "Админ-панель")
│   └── Description (Body/Base, Muted-Foreground)
```

### Create Button

- **Component**: Button/Default
- **Icon**: Plus (leading)
- **Text**: "Создать челлендж"
- **onClick**: открыть Dialog с формой
- **Margin bottom**: 24px

### Challenges List

```
List (Auto Layout Vertical, gap 16px)
└── Challenge Item (Card component)
    ├── Card Header
    │   ├── Title + Badges (Active/Inactive, Category)
    │   └── Actions (Edit, Delete buttons)
    ├── Card Content
    │   ├── Description
    │   └── Participants count
```

**Challenge Item Card**:
- **Background**: `Card`
- **Border**: 1px solid `Border`
- **Padding**: 24px
- **Border radius**: `Radius/LG`

**Actions**:
```
Auto Layout Horizontal, gap 8px
├── Edit Button (Button/Outline, Size=Small, Icon only)
└── Delete Button (Button/Outline, Size=Small, Icon only)
```

### Create/Edit Challenge Dialog

```
Dialog (max-width 768px, max-height 90vh)
├── Dialog Header
│   ├── Title ("Создать челлендж" / "Редактировать")
│   └── Description
├── Dialog Content (Form)
│   ├── FormField (Input, "Название" *)
│   ├── FormField (Textarea, "Описание")
│   ├── FormField (Select, "Категория" *)
│   ├── FormField (Input, "URL миниатюры")
│   ├── FormField (Textarea, "Шаблон промпта" *)
│   └── FormField (Switch, "Активен")
└── Dialog Footer
    ├── Cancel Button (Button/Outline)
    └── Submit Button (Button/Default, "Создать"/"Обновить")
```

---

## Auth Pages (Login/Signup)

### Назначение

Страницы авторизации и регистрации.

### Common Structure

```
Auth Page
├── Navigation Bar (minimal, только logo)
├── Auth Card (центрированная)
│   ├── Form
│   └── Alternative Action Link
└── (опционально) Popular Video Showcase
```

---

### Layout

#### Container
- **Max width**: 448px
- **Center aligned (vertical + horizontal)**
- **Padding**: 48px vertical, 16px horizontal

#### Auth Card

```
Card (centered)
├── Card Header
│   ├── Icon/Logo (centered, margin bottom 16px)
│   ├── Title (Heading/H2, "Войти" / "Регистрация")
│   └── Description (Body/Small, Muted-Foreground)
├── Card Content (Form)
│   └── Form Fields + Submit Button
└── Card Footer
    └── Alternative Action Link
```

---

### Login Form

```
Login Form (Auto Layout Vertical, gap 16px)
├── FormField (Input, Email, *)
├── FormField (Input, Password, *, type="password")
├── Forgot Password Link (align right, Caption)
├── Submit Button (Button/Default, Full width, "Войти")
└── Divider + Alternative
    └── "Нет аккаунта? Создать" (link to /signup)
```

### Signup Form

```
Signup Form (Auto Layout Vertical, gap 16px)
├── FormField (Input, Name, *)
├── FormField (Input, Email, *)
├── FormField (Input, Password, *)
├── Terms Checkbox + Text
├── Submit Button (Button/Default, Full width, "Создать аккаунт")
└── Divider + Alternative
    └── "Уже есть аккаунт? Войти" (link to /login)
```

### Auth Card Variant: Требуется авторизация

Показывается на /create если не залогинен:

```
Auth Required Card (centered, max-width 448px)
├── Icon (Lock, 64px, Primary, centered)
├── Title (Heading/H2, "Требуется авторизация")
├── Description (Body/Base, Muted-Foreground)
└── Actions (Auto Layout Vertical, gap 12px, full width)
    ├── Login Button (Button/Default, Large, with LogIn icon)
    └── Signup Button (Button/Outline, Large)
```

---

## Empty States

### Videos Empty State

```
Empty State (centered, padding 64px vertical)
├── Icon (Video, 64px, Muted-Foreground)
├── Title (Heading/H3, "Видео пока не загружены")
├── Description (Body/Base, Muted-Foreground)
└── CTA Button (Button/Default, "Создать первое видео")
```

### Challenges Empty State

```
Empty State
├── Icon (Sparkles, 64px)
├── Title (Heading/H3, "Челленджи не найдены")
└── Description (Body/Small, Muted-Foreground)
```

### Search/Filter No Results

```
No Results State
├── Icon (Search, 48px)
├── Title (Heading/H4, "Ничего не найдено")
├── Description (Body/Small)
└── Clear Filters Button (Button/Ghost)
```

---

## Loading States

### Page Loading

Показывать Skeleton компоненты вместо реального контента:

- **Video Grid**: Grid of Video Skeletons
- **Challenge Grid**: Grid of Challenge Skeletons
- **Profile**: Avatar + Name Skeletons + Video Grid Skeletons

### Infinite Scroll Loading

При подгрузке дополнительного контента:

```
Loading More Indicator (centered)
├── Spinner (24px, Primary)
└── Text (Body/Small, Muted-Foreground, "Загрузка...")
```

---

## Error States

### Page Error

```
Error State (centered, full page)
├── Icon (AlertCircle, 64px, Destructive)
├── Title (Heading/H2, "Что-то пошло не так")
├── Description (Body/Base, Muted-Foreground)
│   (конкретное сообщение об ошибке)
├── Error Code (Caption, Muted-Foreground, "Error: 500")
└── Actions (Auto Layout Horizontal, gap 12px)
    ├── Retry Button (Button/Default, "Попробовать снова")
    └── Home Button (Button/Outline, "На главную")
```

---

## Figma Pages Organization

### Рекомендуемая структура страниц в Figma

```
Vivio Design System
├── 📐 Design System
│   ├── Colors (Light/Dark палитры)
│   ├── Typography (все текстовые стили)
│   ├── Spacing & Layout (примеры spacing)
│   └── Effects (shadows, gradients, patterns)
│
├── 🧩 Components
│   ├── Base Components (Button, Card, Input, etc.)
│   ├── Video Components (VideoCard, ChallengeCard)
│   ├── Form Components (Upload, Progress)
│   └── Navigation (Header, Menu, Floating button)
│
├── 📱 Pages - Desktop
│   ├── Home (все состояния)
│   ├── Create Video (все состояния upload)
│   ├── Challenge Detail
│   ├── Video Detail
│   ├── Profile
│   ├── Admin Panel
│   └── Auth (Login, Signup)
│
├── 📱 Pages - Mobile
│   ├── Home Mobile
│   ├── Create Mobile
│   ├── Video Detail Mobile
│   └── Auth Mobile
│
└── 🎨 States & Examples
    ├── Loading States (Skeletons)
    ├── Empty States
    ├── Error States
    └── Component Variations
```

---

## Responsive Breakpoints Summary

### Desktop (≥1024px)
- **Container**: 1280px max-width
- **Padding**: 32px horizontal
- **Video Grid**: 5 columns
- **Challenge Grid**: 4 columns

### Tablet (768px - 1023px)
- **Container**: Full width с padding
- **Padding**: 24px horizontal
- **Video Grid**: 3 columns
- **Challenge Grid**: 3 columns

### Mobile (<768px)
- **Container**: Full width
- **Padding**: 16px horizontal
- **Video Grid**: 2 columns
- **Challenge Grid**: 2 columns
- **Typography**: уменьшить размеры заголовков
- **Navigation**: переключиться на mobile версию

---

## Финальные шаги

Теперь у вас есть полная спецификация всех страниц. Следующие действия:

1. Используйте все токены из [design-tokens.json](./design-tokens.json)
2. Применяйте компоненты из [BASE_COMPONENTS.md](./BASE_COMPONENTS.md)
3. Интегрируйте видео компоненты из [VIDEO_COMPONENTS.md](./VIDEO_COMPONENTS.md)
4. Используйте формы из [FORM_COMPONENTS.md](./FORM_COMPONENTS.md)
5. Добавьте навигацию из [NAVIGATION_COMPONENTS.md](./NAVIGATION_COMPONENTS.md)

Начните с создания дизайн-системы, затем базовых компонентов, и только потом собирайте страницы.

Удачи в создании дизайна в Figma! 🎨

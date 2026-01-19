# Видео компоненты Vivio

> Специфичные компоненты для работы с видео контентом

## Содержание

- [VideoCard](#videocard)
- [ChallengeCard](#challengecard)
- [VideoPlayer](#videoplayer)

---

## VideoCard

### Назначение

Карточка видео с превью, hover эффектами и автоматическим воспроизведением при наведении.

### Основная структура

```
VideoCard
├── Container (Frame)
│   ├── Thumbnail (Image)
│   ├── Play Overlay
│   │   ├── Background (gradient overlay)
│   │   └── Play Icon
│   └── Video Player (показывается при hover)
```

### Спецификация

#### Container
- **Aspect ratio**: 9:16 (вертикальный формат)
- **Border radius**: `Radius/LG` (8px)
- **Overflow**: hidden
- **Background**: Black
- **Width**: гибкая (обычно в сетке)

Примеры размеров:
- Mobile: полная ширина контейнера
- Desktop grid: 220px - 280px width

#### Thumbnail (Превью)
- **Object fit**: cover
- **Position**: absolute, full size
- **Background**: `Muted` (fallback)

#### Play Overlay (Наложение с кнопкой Play)

**Background gradient**:
- **Type**: Linear
- **Angle**: 0° (сверху вниз)
- **Colors**:
  - 0%: Black, opacity 0%
  - 50%: Black, opacity 10%
  - 100%: Black, opacity 30%

**Play Icon Button**:
- **Size**: 64×64px
- **Position**: Center of card
- **Background**: White с opacity 90%
- **Border radius**: Full (круглая)
- **Icon**: Play (Lucide), 32×32px, Black
- **Padding**: 16px (для центрирования треугольника play)
- **Shadow**: `Shadow/LG`

**Состояния Play Icon**:
- **Default**: scale 0.9, opacity 0.8
- **Hover**: scale 1.0, opacity 1.0, gradient overlay темнее (opacity 40%)

#### Hover State (весь VideoCard)

При наведении:
1. **Transform**: translateY(-4px)
2. **Shadow**: `Shadow/LG`
3. **Thumbnail**: скрывается плавно (opacity 0)
4. **Play Overlay**: скрывается
5. **Video Player**: появляется (opacity 1)
6. **Transition**: 0.2s ease-in-out

### Video Player (при hover)

- **Position**: absolute, full size
- **Background**: Black
- **Controls**: hidden (автовоспроизведение)
- **Muted**: true
- **Loop**: true
- **Autoplay**: true (при hover)

### Metadata Section (под карточкой)

Опциональная секция с информацией о видео:

```
Metadata (Auto Layout Vertical, gap 8px)
├── User Info (Auto Layout Horizontal, gap 8px)
│   ├── Avatar (32×32px)
│   └── Username (Body/Small-Medium, truncate)
├── Stats (Auto Layout Horizontal, gap 16px)
│   ├── Views (Icon + Number)
│   └── Likes (Icon + Number)
└── Badge (если есть challenge)
```

#### User Info
- **Avatar**: 32×32px, круглый
- **Username**: `Body/Small-Medium`, `Foreground`, truncate after 20 chars
- **Hover**: opacity 0.8

#### Stats
- **Icon size**: 16px
- **Color**: `Muted-Foreground`
- **Typography**: `Caption`, `Muted-Foreground`
- **Gap**: 4px между иконкой и числом

### Figma Component Structure

```
VideoCard
├── aspectRatio=vertical, state=default
│   ├── Thumbnail visible
│   ├── Play Overlay visible
│   └── Video Player hidden
├── aspectRatio=vertical, state=hover
│   ├── Thumbnail hidden
│   ├── Play Overlay hidden
│   └── Video Player visible
├── aspectRatio=square, state=default
└── aspectRatio=square, state=hover
```

### Примеры использования

1. **Главная страница**: сетка 2-5 колонок (зависит от breakpoint)
2. **Страница профиля**: сетка 3 колонки
3. **Страница челленджа**: сетка 4-5 колонок

---

## ChallengeCard

### Назначение

Карточка челленджа (тренда) с превью, статистикой и призывом к действию.

### Основная структура

```
ChallengeCard
├── Card Container
│   ├── Preview Section (9:16)
│   │   ├── Thumbnail/Video
│   │   ├── Duration Badge ("6 сек")
│   │   ├── User Avatar (top right)
│   │   └── Stats Overlay (bottom)
│   │       ├── Views
│   │       ├── Likes
│   │       └── Participants Badge
│   └── Content Section
│       ├── Title + Description
│       ├── Category Badge
│       └── Action Buttons
```

### Спецификация

#### Card Container
- **Background**: `Card`
- **Border**: 1px solid `Border`
- **Border radius**: `Radius/LG`
- **Shadow**: `Shadow/SM` (default), `Shadow/LG` (hover)
- **Overflow**: hidden
- **Transition**: transform 0.3s, shadow 0.3s

**Hover state**:
- **Transform**: translateY(-4px)
- **Shadow**: `Shadow/LG`

#### Preview Section
- **Aspect ratio**: 9:16
- **Position**: relative
- **Background**: `Muted` (fallback)
- **Cursor**: pointer

##### Thumbnail/Video
- **Object fit**: cover
- **Position**: absolute, full size

##### Duration Badge ("6 сек")
- **Position**: absolute, top-left
- **Margin**: 8px
- **Background**: Black с opacity 50%
- **Backdrop blur**: 4px
- **Color**: White
- **Padding**: 4px 8px
- **Border radius**: `Radius/SM`
- **Typography**: `Caption/Medium`

##### User Avatar
- **Position**: absolute, top-right
- **Margin**: 8px
- **Size**: 32×32px
- **Border**: 2px solid White
- **Box shadow**: `Shadow/SM`

##### Stats Overlay (нижняя часть превью)
- **Position**: absolute, bottom
- **Full width**
- **Height**: ~60px
- **Background**: Linear gradient
  - 0%: Transparent
  - 100%: Black с opacity 80%
- **Padding**: 16px
- **Color**: White

**Content Stats Overlay**:
```
Auto Layout Horizontal, justify space-between
├── Left Section (Auto Layout Horizontal, gap 16px)
│   ├── Views (Icon 16px + Number)
│   └── Likes (Icon 16px + Number)
└── Right Section
    └── Participants Badge
```

**Participants Badge**:
- **Background**: Black с opacity 50%
- **Border**: 1px solid White с opacity 30%
- **Color**: White
- **Padding**: 4px 8px
- **Border radius**: `Radius/SM`
- **Typography**: `Caption/Medium`
- **Text**: "{count} участников"

#### Content Section
- **Padding**: 16px
- **Auto Layout**: Vertical, gap 12px

##### Title
- **Typography**: `Heading/H4` или `Body/Base-Medium`
- **Color**: `Foreground`
- **Max lines**: 1
- **Truncate**: ellipsis

##### Description
- **Typography**: `Body/Small`
- **Color**: `Muted-Foreground`
- **Max lines**: 2
- **Line clamp**: 2
- **Margin top**: 4px

##### Category Badge
- **Variant**: Badge/Outline
- **Typography**: `Caption/Medium`
- **Examples**: "MONUMENTS", "PETS", "FACES", "SEASONAL"

##### Action Buttons (опционально)
```
Auto Layout Horizontal, justify space-between, gap 8px
├── Like Button (Button/Ghost, Icon only)
└── Share Button (Button/Ghost, Icon only)
```

**Like Button**:
- **Size**: 32×32px
- **Icon**: Heart, 16px
- **Color**: `Muted-Foreground` (default), `Destructive` (liked)
- **Fill**: filled если liked

**Share Button**:
- **Size**: 32×32px
- **Icon**: Share2, 16px
- **Color**: `Muted-Foreground`

### Figma Component Structure

```
ChallengeCard
├── state=default
│   ├── Preview (with all overlays)
│   └── Content
├── state=hover
│   ├── Preview (elevated)
│   └── Content
└── state=liked
    └── Like button filled
```

### Анимации (описание для разработчика)

- **Entry**: fade-in + slide-up, duration 0.3s
- **Hover lift**: translateY(-4px), duration 0.3s
- **Like button**: scale pulse на 1.2x при клике

---

## VideoPlayer

### Назначение

Встроенный видео плеер для воспроизведения 6-секундных видео.

### Спецификация

#### Container
- **Aspect ratio**: 9:16 (или square для некоторых контекстов)
- **Background**: Black
- **Border radius**: `Radius/LG` (если не full-screen)
- **Position**: relative

#### Video Element
- **Object fit**: contain (показать всё видео)
- **Width**: 100%
- **Height**: 100%
- **Background**: Black

#### Controls Overlay (опционально)

Для страницы просмотра видео, показываются контролы:

```
Controls (Auto Layout Vertical, full width)
├── Top Bar (Auto Layout Horizontal)
│   ├── Back Button (Ghost)
│   └── More Options (Ghost)
├── Center
│   └── Play/Pause Button (большая, 80×80px)
└── Bottom Bar
    ├── Progress Bar
    ├── Time (current / total)
    └── Control Buttons
        ├── Volume
        └── Fullscreen
```

##### Progress Bar
- **Track**: height 4px, background White с opacity 30%
- **Filled**: background White, opacity 100%
- **Thumb**: 12×12px circle, White, показывается при hover

##### Play/Pause Button (center)
- **Size**: 80×80px
- **Background**: White с opacity 90%
- **Border radius**: Full
- **Icon**: Play или Pause, 40×40px, Black
- **Shadow**: `Shadow/XL`
- **Transition**: opacity 0.3s (скрывается через 2 секунды без активности)

**Состояния**:
- **Playing**: кнопка скрыта (opacity 0)
- **Paused**: кнопка показана (opacity 1)
- **Hover**: кнопка показана

##### Control Buttons (bottom)
- **Size**: 40×40px
- **Color**: White
- **Background**: Transparent
- **Hover**: Background White с opacity 20%
- **Icon size**: 24px

### Figma Layout

Создайте несколько вариантов:

1. **VideoPlayer/Inline** - встроенный в карточку (без контролов)
2. **VideoPlayer/Full** - с полными контролами
3. **VideoPlayer/Mobile** - адаптированный для мобильных

---

## Использование в макетах

### Сетка видео (Home page)

```
Grid Layout
├── Desktop: 5 колонок, gap 16px
├── Tablet: 3 колонки, gap 16px
└── Mobile: 2 колонки, gap 12px

Каждая карточка:
- Width: Fill container
- Aspect ratio: 9:16
- Component: VideoCard
```

### Сетка челленджей

```
Grid Layout
├── Desktop: 4 колонки, gap 16px
├── Tablet: 3 колонки, gap 16px
└── Mobile: 2 колонки, gap 12px

Каждая карточка:
- Component: ChallengeCard
```

### Страница просмотра видео

```
Layout (Auto Layout Vertical, Center aligned)
├── VideoPlayer/Full (max-width 600px)
├── Video Info Section
│   ├── Title
│   ├── User Info
│   ├── Stats
│   └── Actions (Like, Share, Download)
└── Related Videos (Grid)
```

---

## Состояния загрузки

Для всех видео компонентов создайте Skeleton версии:

### VideoCard Skeleton
- **Container**: aspect 9:16, background `Muted`
- **Animation**: пульсация opacity

### ChallengeCard Skeleton
- **Preview**: Skeleton (aspect 9:16)
- **Title**: Skeleton line (60% width)
- **Description**: 2 Skeleton lines (80%, 50% width)
- **Badge**: Skeleton badge

---

## Специальные состояния

### Error State (ошибка загрузки видео)

```
Error Container (center aligned)
├── Icon (AlertCircle, 48px, Destructive)
├── Message (Body/Base, Muted-Foreground)
└── Retry Button (Button/Outline)
```

### Empty State (нет видео)

```
Empty Container (center aligned)
├── Icon (Video, 64px, Muted-Foreground)
├── Title (Heading/H3)
├── Description (Body/Small, Muted-Foreground)
└── Action Button (Button/Default, "Создать первое видео")
```

---

## Следующие шаги

После создания видео компонентов переходите к:

1. [Компоненты форм](./FORM_COMPONENTS.md) - Upload, Progress
2. [Навигация](./NAVIGATION_COMPONENTS.md) - Header, Menu
3. [Макеты страниц](./PAGE_LAYOUTS.md) - Сборка всего вместе

# Компоненты навигации Vivio

> Спецификация компонентов навигации для desktop и mobile

## Содержание

- [Navigation Bar (Header)](#navigation-bar-header)
- [Logo](#logo)
- [Navigation Menu](#navigation-menu)
- [User Dropdown Menu](#user-dropdown-menu)
- [Mobile Navigation](#mobile-navigation)
- [Floating Upload Button](#floating-upload-button)

---

## Navigation Bar (Header)

### Назначение

Основная навигационная панель приложения, закрепленная вверху страницы.

### Спецификация

#### Container
- **Height**: 64px (fixed)
- **Width**: Full width
- **Background**: `Background` с opacity 95% + backdrop-blur 12px
- **Border bottom**: 1px solid `Border`
- **Position**: sticky top
- **Z-index**: 50
- **Padding**: 0 16px (container внутри)

#### Inner Container
- **Max width**: Container max-width (обычно 1280px)
- **Margin**: 0 auto
- **Padding**: 0 16px
- **Auto Layout**: Horizontal, space-between, align center
- **Height**: 64px

### Структура

```
Navigation Bar
├── Left Section
│   └── Logo + Brand Name
├── Center Section (Desktop only)
│   └── Navigation Links
└── Right Section
    ├── Auth Buttons (если не залогинен)
    └── User Menu (если залогинен)
```

---

## Logo

### Спецификация

#### Logo Container
```
Auto Layout Horizontal, gap 8px, align center
├── Logo Icon (32×32px)
└── Brand Name
```

#### Logo Icon
- **Size**: 32×32px
- **Background**: `Primary`
- **Border radius**: `Radius/LG` (8px)
- **Padding**: внутри для буквы
- **Center aligned**

**Content**:
- **Letter**: "V"
- **Typography**: Inter Bold, 16px
- **Color**: `Primary-Foreground`
- **Position**: centered

#### Brand Name
- **Typography**: `Heading/H4` (20px, Bold)
- **Color**: `Foreground`
- **Text**: "Vivio"

#### Interactive
- **Hover**: opacity 0.8
- **Link**: href="/"
- **Cursor**: pointer

---

## Navigation Menu

### Назначение

Основное меню навигации (Desktop version).

### Спецификация

```
Navigation Menu (Auto Layout Horizontal, gap 4px)
├── Nav Link: "Тренды"
├── Nav Link: "Создать видео"
└── (другие ссылки по необходимости)
```

### Nav Link (Button)

Каждая ссылка - это кнопка с состояниями:

#### Default State
- **Component**: Button/Ghost, Size=Small
- **Padding**: 12px horizontal, 8px vertical
- **Border radius**: `Radius/MD`
- **Typography**: `Body/Small-Medium`
- **Color**: `Foreground`
- **Icon** (optional): 16px, left positioned, gap 8px

**Структура одной ссылки**:
```
Nav Link (Auto Layout Horizontal, gap 8px, center aligned)
├── Icon (16×16px)
└── Label
```

#### Active State
- **Background**: `Primary`
- **Color**: `Primary-Foreground`
- **Icon color**: `Primary-Foreground`

#### Hover State (если не active)
- **Background**: `Accent`
- **Color**: `Accent-Foreground`

### Примеры ссылок

1. **Тренды**
   - Icon: Sparkles
   - Text: "Тренды"
   - href: "/challenges"

2. **Создать видео**
   - Icon: Plus
   - Text: "Создать видео"
   - onClick: открыть Upload Sheet

---

## User Dropdown Menu

### Назначение

Меню пользователя с аватаром и выпадающим списком действий.

### Trigger (Триггер)

#### Avatar Button
- **Size**: 40×40px
- **Component**: Avatar/Medium
- **Border radius**: Full (круглый)
- **Border**: 2px solid transparent (default), 2px solid `Ring` (hover)
- **Cursor**: pointer
- **Transition**: border 0.2s

### Dropdown Content

#### Container
- **Min width**: 224px (14rem)
- **Background**: `Popover`
- **Border**: 1px solid `Border`
- **Border radius**: `Radius/MD`
- **Shadow**: `Shadow/LG`
- **Padding**: 4px vertical
- **Position**: absolute, top-right aligned to trigger

#### Структура

```
Dropdown Menu
├── User Info Section
│   ├── Name
│   └── Email
├── Separator
├── Menu Items
│   ├── Profile
│   ├── Admin Panel (если админ)
├── Separator
└── Logout
```

### User Info Section

```
User Info (не кликабельно)
├── Padding: 12px
├── Margin bottom: 4px
├── Background: Muted (subtle)
├── Auto Layout Vertical, gap 4px
│   ├── Name (Body/Small-Medium, Foreground)
│   └── Email (Caption, Muted-Foreground, truncate)
```

### Menu Item

- **Component**: DropdownMenuItem (см. BASE_COMPONENTS.md)
- **Height**: 40px
- **Padding**: 8px 12px
- **Gap**: 8px (между иконкой и текстом)

**Структура**:
```
Menu Item (Auto Layout Horizontal, gap 8px)
├── Icon (16×16px, Foreground)
└── Label (Body/Small, Foreground)
```

**Примеры**:

1. **Profile**
   - Icon: User
   - Text: "Профиль"
   - href: `/profile/{userId}`

2. **Admin Panel** (только для админов)
   - Icon: Shield
   - Text: "Админ-панель"
   - href: "/admin"

3. **Logout**
   - Icon: LogOut
   - Text: "Выйти"
   - Color: `Destructive` (для иконки и текста)
   - onClick: logout function

### Separator

- **Height**: 1px
- **Background**: `Border`
- **Margin**: 4px vertical

---

## Auth Buttons (не залогинен)

### Спецификация

Показываются вместо User Dropdown, когда пользователь не авторизован.

```
Auth Buttons (Auto Layout Horizontal, gap 8px)
├── Login Button (Button/Outline или Ghost)
└── Signup Button (Button/Default) (опционально)
```

#### Login Button
- **Component**: Button/Default, Size=Small
- **Text**: "Войти"
- **Width**: hug content
- **href**: "/login"

Или использовать Ghost вариант для более минималистичного вида.

---

## Mobile Navigation

### Назначение

Адаптивная навигация для мобильных устройств (< 768px).

### Спецификация

#### Mobile Header
- **Height**: 56px (меньше desktop)
- **Padding**: 0 12px

```
Mobile Header (Auto Layout Horizontal, space-between)
├── Logo (меньший размер)
└── Actions (Auto Layout Horizontal, gap 8px)
    ├── Nav Links (иконки только)
    └── User Avatar / Login Button
```

### Mobile Nav Links (Icon Only)

Показываются как иконки без текста:

- **Size**: 40×40px (Button, Size=Small)
- **Icon**: 20×20px
- **Padding**: 10px
- **Border radius**: `Radius/MD`
- **Background**: transparent (default), `Primary` (active)

**Примеры**:

1. **Тренды**
   - Icon: Sparkles

2. **Создать**
   - Icon: Plus

### Mobile User Avatar

- **Size**: 32×32px (меньше desktop)
- **Border**: 2px solid transparent

### Alternative: Bottom Navigation Bar

Если предпочитаете нижнюю навигацию для mobile:

```
Bottom Navigation Bar (Mobile Only)
├── Height: 64px
├── Position: fixed bottom
├── Background: Background + backdrop-blur
├── Border top: 1px solid Border
├── Safe area inset: bottom (для iOS)
└── Items (Auto Layout Horizontal, space-around)
    ├── Home
    ├── Challenges
    ├── Create (центральная, выделенная)
    ├── Videos
    └── Profile
```

#### Bottom Nav Item

```
Nav Item (Auto Layout Vertical, center aligned, gap 4px)
├── Icon (24×24px)
└── Label (Caption, optional)
```

**States**:
- **Default**: Icon и label цвет `Muted-Foreground`
- **Active**: Icon и label цвет `Primary`

---

## Floating Upload Button

### Назначение

Кнопка быстрого доступа к загрузке, всегда видимая на экране.

### Спецификация

#### Button
- **Size**: 56×56px (Large, круглая)
- **Background**: `Primary`
- **Color**: `Primary-Foreground`
- **Icon**: Plus, 24×24px
- **Border radius**: Full
- **Shadow**: `Shadow/LG`
- **Position**: fixed, bottom-right
- **Offset**: 24px от правого края, 24px от нижнего (Desktop)
- **Offset** (Mobile): 16px от правого, 80px от нижнего (если есть bottom nav)

#### States

- **Default**: Background `Primary`, Shadow/LG
- **Hover**: 
  - Background: `Primary` с opacity 90%
  - Shadow: `Shadow/XL`
  - Transform: scale(1.05)
- **Active/Pressed**: 
  - Transform: scale(0.95)

#### Animation

- **Entry**: scale from 0 to 1, с ease-out, 0.3s
- **Hover**: smooth transition 0.2s
- **Tooltip** (on hover, optional): "Создать видео"

### Tooltip (опционально)

```
Tooltip
├── Background: Foreground (инвертированный)
├── Color: Background
├── Padding: 8px 12px
├── Border radius: Radius/MD
├── Typography: Caption/Medium
├── Position: left center of button, offset -8px
├── Arrow: pointing right
└── Shadow: Shadow/MD
```

---

## Responsive Behavior

### Breakpoints

#### Desktop (≥ 768px)
- Показывать полную навигацию с текстом
- User Dropdown Menu
- Floating Upload Button справа внизу

#### Mobile (< 768px)
- Иконки без текста в header
- Мобильная версия User Menu
- Floating Upload Button (или заменить на Bottom Nav)

### Примеры адаптивности

#### Desktop Layout

```
[Logo + Vivio] [Тренды] [Создать видео] ................ [User Avatar ▼]
```

#### Tablet Layout

```
[Logo + Vivio] [🔥] [➕] .......................... [User Avatar ▼]
```

#### Mobile Layout (с Bottom Nav)

```
Header:
[Logo] ................................................ [Avatar]

Bottom Nav:
[🏠 Home] [🔥 Trends] [➕ Create] [📹 Videos] [👤 Profile]
```

---

## Дополнительные элементы

### Breadcrumbs (для вложенных страниц)

Опционально, для страниц с иерархией:

```
Breadcrumbs (Auto Layout Horizontal, gap 8px)
├── Home
├── Separator (/)
├── Challenges
├── Separator (/)
└── Current Page (bold)
```

**Спецификация**:
- **Typography**: `Body/Small`
- **Color**: `Muted-Foreground` (ссылки), `Foreground` (текущая)
- **Separator**: "/" или ChevronRight icon
- **Hover**: underline на ссылках

### Search Bar (будущее расширение)

Если планируется поиск:

```
Search Bar (в header, center или right)
├── Width: 300px (Desktop), Full (Mobile)
├── Input with Search icon
├── Placeholder: "Поиск видео, челленджей..."
└── Shortcuts: показывать популярные запросы при фокусе
```

---

## Figma Component Structure

```
Navigation
├── Desktop
│   ├── Nav Bar (с auth buttons)
│   ├── Nav Bar (с user menu)
│   └── Nav Bar (разные состояния меню)
├── Mobile
│   ├── Mobile Header
│   ├── Bottom Navigation (optional)
│   └── Mobile User Menu
├── Logo
│   ├── Logo/Full (с текстом)
│   └── Logo/Icon (только иконка)
├── User Dropdown
│   ├── Trigger (Avatar)
│   └── Content (выпадающее меню)
└── Floating Button
    ├── Default
    ├── Hover
    └── With Tooltip
```

---

## Accessibility Notes

### Keyboard Navigation

- Tab order: Logo → Nav Links → User Menu
- Enter/Space: активировать ссылку или меню
- Escape: закрыть dropdown menu
- Arrow keys: навигация по dropdown items

### Screen Readers

- Logo: aria-label="Vivio Home"
- Nav Links: aria-current="page" для активной
- User Menu: aria-expanded="true/false"
- Floating Button: aria-label="Создать видео"

### Focus Indicators

Все интерактивные элементы должны иметь видимый focus indicator:
- **Focus ring**: 2px solid `Ring` с offset 2px
- **Border radius**: соответствует элементу

---

## Следующие шаги

После создания компонентов навигации переходите к:

1. [Макеты страниц](./PAGE_LAYOUTS.md) - Сборка всех компонентов в страницы

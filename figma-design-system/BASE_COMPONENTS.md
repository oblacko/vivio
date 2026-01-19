# Базовые компоненты Vivio

> Детальная спецификация базовых UI компонентов

## Содержание

- [Button (Кнопка)](#button-кнопка)
- [Card (Карточка)](#card-карточка)
- [Input (Поле ввода)](#input-поле-ввода)
- [Textarea](#textarea)
- [Select (Выпадающий список)](#select-выпадающий-список)
- [Badge (Значок)](#badge-значок)
- [Avatar (Аватар)](#avatar-аватар)
- [Progress (Прогресс)](#progress-прогресс)
- [Skeleton (Загрузка)](#skeleton-загрузка)
- [Dialog (Диалог)](#dialog-диалог)
- [Sheet (Боковая панель)](#sheet-боковая-панель)
- [Dropdown Menu](#dropdown-menu)

---

## Button (Кнопка)

### Структура

Кнопка - это базовый интерактивный элемент с поддержкой различных вариантов и размеров.

### Варианты (Variants)

#### 1. Default (По умолчанию)
- **Фон**: `Primary`
- **Текст**: `Primary-Foreground`
- **Padding**: 16px horizontal, 8px vertical (Medium)
- **Border radius**: `Radius/MD`
- **Typography**: `Body/Small-Medium`
- **Height**: 40px (Medium)

**Состояния**:
- **Default**: Фон Primary
- **Hover**: Фон Primary с opacity 90%
- **Active/Pressed**: Фон Primary с opacity 80%
- **Disabled**: Фон Muted, Текст Muted-Foreground, opacity 50%

#### 2. Outline (Обводка)
- **Фон**: Transparent
- **Border**: 1px solid Border
- **Текст**: Foreground
- **Padding**: 16px horizontal, 8px vertical

**Состояния**:
- **Hover**: Фон Accent, Текст Accent-Foreground
- **Active**: Фон Accent с opacity 80%
- **Disabled**: Border и текст с opacity 50%

#### 3. Ghost (Призрачная)
- **Фон**: Transparent
- **Border**: None
- **Текст**: Foreground
- **Padding**: 16px horizontal, 8px vertical

**Состояния**:
- **Hover**: Фон Accent
- **Active**: Фон Accent с opacity 80%

#### 4. Destructive (Деструктивная)
- **Фон**: `Destructive`
- **Текст**: `Destructive-Foreground`
- **Остальное**: как Default

### Размеры (Sizes)

#### Small
- **Height**: 32px
- **Padding**: 12px horizontal, 6px vertical
- **Typography**: `Caption/Medium`
- **Icon size**: 16px

#### Medium (Default)
- **Height**: 40px
- **Padding**: 16px horizontal, 8px vertical
- **Typography**: `Body/Small-Medium`
- **Icon size**: 20px

#### Large
- **Height**: 48px
- **Padding**: 24px horizontal, 12px vertical
- **Typography**: `Body/Base-Medium`
- **Icon size**: 20px

### С иконкой

- **Icon + Text**: иконка слева, отступ 8px между иконкой и текстом
- **Icon only**: квадратная кнопка, иконка по центру, padding равен со всех сторон

### Figma Component Structure

```
Button
├── Variant=Default, Size=Small, State=Default
├── Variant=Default, Size=Small, State=Hover
├── Variant=Default, Size=Small, State=Disabled
├── Variant=Default, Size=Medium, State=Default
├── Variant=Default, Size=Medium, State=Hover
├── Variant=Default, Size=Medium, State=Disabled
├── Variant=Default, Size=Large, State=Default
├── Variant=Outline, Size=Small, State=Default
... (все комбинации)
```

---

## Card (Карточка)

### Основная структура

Карточка - контейнер для группировки контента.

### Спецификация

- **Фон**: `Card`
- **Border**: 1px solid `Border`
- **Border radius**: `Radius/LG` (8px)
- **Padding**: 24px (внутри CardContent)
- **Shadow**: `Shadow/SM` (по умолчанию)

### Составные части

#### CardHeader
- **Padding**: 24px
- **Border bottom**: 1px solid Border (опционально)

#### CardTitle
- **Typography**: `Heading/H3`
- **Color**: `Foreground`
- **Margin bottom**: 8px

#### CardDescription
- **Typography**: `Body/Small`
- **Color**: `Muted-Foreground`

#### CardContent
- **Padding**: 24px
- **Gap между элементами**: 16px (используйте Auto Layout)

#### CardFooter
- **Padding**: 24px
- **Border top**: 1px solid Border (опционально)
- **Flex direction**: Row
- **Justify**: flex-end
- **Gap**: 8px

### Состояния

- **Default**: Shadow/SM
- **Hover**: Shadow/MD, transform Y: -2px
- **Active**: Shadow/LG, transform Y: -4px

### Figma Component

```
Card
├── Component: Card/Base
│   ├── Layer: Background (Rectangle)
│   ├── Layer: Border (Stroke)
│   ├── Auto Layout: Vertical
│   │   ├── CardHeader (Auto Layout)
│   │   ├── CardContent (Auto Layout)
│   │   └── CardFooter (Auto Layout)
```

---

## Input (Поле ввода)

### Спецификация

- **Height**: 40px
- **Padding**: 12px horizontal, 8px vertical
- **Border**: 1px solid `Input`
- **Border radius**: `Radius/MD`
- **Typography**: `Body/Small`
- **Background**: `Background`

### Состояния

- **Default**: Border color `Input`
- **Focus**: Border color `Ring`, outline 2px solid Ring с opacity 20%
- **Error**: Border color `Destructive`
- **Disabled**: Background `Muted`, opacity 50%

### С иконкой

- **Leading icon**: иконка слева, 12px отступ слева, 8px между иконкой и текстом
- **Trailing icon**: иконка справа, аналогично

### Placeholder

- **Color**: `Muted-Foreground`
- **Typography**: `Body/Small`

### Figma Component Structure

```
Input
├── State=Default, hasIcon=false
├── State=Focus, hasIcon=false
├── State=Error, hasIcon=false
├── State=Disabled, hasIcon=false
├── State=Default, hasIcon=leading
├── State=Default, hasIcon=trailing
```

---

## Textarea

### Спецификация

Похож на Input, но с возможностью изменения высоты:

- **Min height**: 80px
- **Padding**: 12px
- **Border**: 1px solid `Input`
- **Border radius**: `Radius/MD`
- **Typography**: `Body/Small`
- **Resize**: Vertical (в коде, в Figma показать разные размеры)

### Состояния

Аналогичны Input

---

## Select (Выпадающий список)

### Trigger (Триггер)

Выглядит как Input с иконкой chevron-down справа:

- **Height**: 40px
- **Padding**: 12px horizontal, 8px vertical
- **Border**: 1px solid `Input`
- **Icon**: ChevronDown, 20px, справа

### Состояния триггера

- **Default**: Border `Input`
- **Open**: Border `Ring`, chevron повернут на 180°
- **Disabled**: opacity 50%

### Content (Выпадающий список)

- **Background**: `Popover`
- **Border**: 1px solid `Border`
- **Border radius**: `Radius/MD`
- **Shadow**: `Shadow/LG`
- **Padding**: 4px vertical
- **Max height**: 300px (scrollable)

### SelectItem (Элемент списка)

- **Height**: 40px
- **Padding**: 12px horizontal, 8px vertical
- **Typography**: `Body/Small`
- **Color**: `Foreground`

**Состояния**:
- **Default**: Background transparent
- **Hover**: Background `Accent`
- **Selected**: Background `Primary`, Color `Primary-Foreground`

---

## Badge (Значок)

### Спецификация

Маленький индикатор статуса или категории.

### Варианты

#### 1. Default
- **Background**: `Primary`
- **Color**: `Primary-Foreground`
- **Padding**: 4px horizontal, 2px vertical
- **Border radius**: `Radius/Full`
- **Typography**: `Caption/Medium`
- **Height**: 20px

#### 2. Secondary
- **Background**: `Secondary`
- **Color**: `Secondary-Foreground`

#### 3. Outline
- **Background**: Transparent
- **Border**: 1px solid `Border`
- **Color**: `Foreground`

#### 4. Destructive
- **Background**: `Destructive`
- **Color**: `Destructive-Foreground`

### Размеры

- **Small**: padding 3px × 2px, font 10px
- **Medium** (default): padding 4px × 2px, font 12px
- **Large**: padding 6px × 4px, font 14px

---

## Avatar (Аватар)

### Спецификация

Круглое изображение профиля пользователя.

- **Shape**: Circle (Border radius: Full)
- **Border**: 2px solid `Border` (опционально)
- **Fallback**: инициалы пользователя на фоне `Primary`

### Размеры

- **Small**: 32×32px
- **Medium**: 40×40px
- **Large**: 48×48px
- **XL**: 64×64px

### Состояния

#### С изображением
- Показывает изображение профиля
- Object-fit: cover

#### Fallback (инициалы)
- **Background**: `Primary`
- **Color**: `Primary-Foreground`
- **Typography**: `Body/Small-Medium` (для medium size)
- **Text**: Первые буквы имени и фамилии

### Figma Component

```
Avatar
├── Size=Small, Type=Image
├── Size=Small, Type=Fallback
├── Size=Medium, Type=Image
├── Size=Medium, Type=Fallback
├── Size=Large, Type=Image
├── Size=Large, Type=Fallback
```

---

## Progress (Прогресс)

### Спецификация

Индикатор прогресса выполнения задачи.

#### Track (Основа)
- **Height**: 8px
- **Width**: 100%
- **Background**: `Secondary`
- **Border radius**: `Radius/Full`
- **Overflow**: hidden

#### Indicator (Индикатор)
- **Height**: 8px
- **Width**: 0-100% (по значению прогресса)
- **Background**: `Primary`
- **Border radius**: `Radius/Full`
- **Transition**: width 0.3s ease

### Варианты

#### Default (с анимацией)
- Заливка слева направо

#### Indeterminate (неопределенный)
- Полоска движется слева направо и обратно
- Width полоски: 30%
- Animation: 2s infinite

### Размеры

- **Small**: height 4px
- **Medium**: height 8px
- **Large**: height 12px

---

## Skeleton (Загрузка)

### Спецификация

Placeholder для загружаемого контента.

- **Background**: `Muted`
- **Border radius**: `Radius/MD`
- **Animation**: пульсация opacity от 100% до 50% и обратно, 2s infinite

### Типы

#### Text Skeleton
- **Height**: соответствует высоте строки текста
- **Width**: 60-100% ширины контейнера

#### Avatar Skeleton
- **Size**: как у Avatar (круглый)

#### Card Skeleton
- **Height**: высота карточки
- **Width**: ширина карточки

#### Video Skeleton
- **Aspect ratio**: 9:16 (вертикальное видео)

### Figma Implementation

Создайте прямоугольники с фоном Muted и добавьте описание анимации в комментариях.

---

## Dialog (Диалог)

### Overlay (Подложка)

- **Background**: Black с opacity 50%
- **Blur**: 4px backdrop-blur
- **Position**: full screen overlay

### Content (Контент диалога)

- **Background**: `Card`
- **Border radius**: `Radius/LG`
- **Shadow**: `Shadow/XL`
- **Max width**: 512px (для обычного диалога), 768px (для большого)
- **Max height**: 90vh
- **Overflow**: scroll (если контент не влезает)

### Структура

#### DialogHeader
- **Padding**: 24px horizontal, 20px top
- **Border bottom**: 1px solid `Border`

#### DialogTitle
- **Typography**: `Heading/H3`
- **Color**: `Foreground`

#### DialogDescription
- **Typography**: `Body/Small`
- **Color**: `Muted-Foreground`
- **Margin top**: 8px

#### DialogContent
- **Padding**: 24px
- **Max height**: calc(90vh - 140px)
- **Overflow-y**: auto

#### DialogFooter
- **Padding**: 16px 24px 24px
- **Border top**: 1px solid `Border`
- **Flex direction**: Row
- **Justify**: flex-end
- **Gap**: 8px

### Close Button

- **Position**: Absolute, top-right
- **Size**: 32×32px
- **Icon**: X (close), 20px
- **Color**: `Muted-Foreground`
- **Hover**: Background `Accent`

---

## Sheet (Боковая панель)

### Overlay

Аналогично Dialog overlay

### Content

Боковая панель, которая выезжает справа или слева:

- **Background**: `Card`
- **Width**: 400px (для обычного), 600px (для широкого)
- **Height**: 100vh
- **Shadow**: `Shadow/XL`
- **Padding**: 24px

### Структура

Аналогична Dialog, но:
- Заголовок выровнен по левому краю
- Кнопка закрытия в правом верхнем углу

### Анимация

- **Entry**: slide-in from right (translateX)
- **Exit**: slide-out to right
- **Duration**: 0.3s ease-out

---

## Dropdown Menu

### Trigger

Обычно кнопка или другой интерактивный элемент.

### Content (Выпадающее меню)

- **Background**: `Popover`
- **Border**: 1px solid `Border`
- **Border radius**: `Radius/MD`
- **Shadow**: `Shadow/LG`
- **Padding**: 4px vertical
- **Min width**: 180px

### DropdownMenuItem (Элемент меню)

- **Height**: 40px
- **Padding**: 8px horizontal, 6px vertical
- **Typography**: `Body/Small`
- **Color**: `Foreground`
- **Gap**: 8px (между иконкой и текстом)

**Структура**:
- Icon (опционально, 20px) - слева
- Text
- Shortcut (опционально) - справа, `Caption`, `Muted-Foreground`

**Состояния**:
- **Default**: Background transparent
- **Hover**: Background `Accent`, Color `Accent-Foreground`
- **Disabled**: opacity 50%, cursor not-allowed

### DropdownMenuSeparator

- **Height**: 1px
- **Background**: `Border`
- **Margin**: 4px vertical

### DropdownMenuLabel

- **Height**: 32px
- **Padding**: 8px horizontal, 6px vertical
- **Typography**: `Caption/Medium`
- **Color**: `Muted-Foreground`
- **Not interactive**: no hover state

---

## Следующие шаги

После создания базовых компонентов переходите к:

1. [Видео компоненты](./VIDEO_COMPONENTS.md) - VideoCard, ChallengeCard
2. [Компоненты форм](./FORM_COMPONENTS.md) - ImageToVideoUploader, FileUpload
3. [Навигация](./NAVIGATION_COMPONENTS.md) - Navigation bar, Mobile menu

# Компоненты форм Vivio

> Специализированные компоненты для работы с формами и загрузкой файлов

## Содержание

- [ImageToVideoUploader](#imagetovideouploader)
- [FileUpload (базовый)](#fileupload-базовый)
- [GenerationProgress](#generationprogress)
- [FormField (обертка)](#formfield-обертка)

---

## ImageToVideoUploader

### Назначение

Основной компонент для загрузки изображений и их преобразования в видео с отображением всех состояний процесса.

### Состояния компонента

1. **Idle** - ожидание загрузки
2. **Uploading** - загрузка файла
3. **File Uploaded** - файл загружен, готов к обработке
4. **Processing** - обработка файла
5. **Completed** - успешное завершение
6. **Error** - ошибка

---

### 1. State: Idle (Ожидание)

#### Структура

```
Idle Container (Auto Layout Vertical, center aligned)
├── Dropzone Area (dashed border)
│   ├── Upload Icon (48px)
│   ├── Primary Text
│   ├── Secondary Text
│   ├── Select Button
│   └── Format Info
```

#### Спецификация

##### Dropzone Area
- **Min height**: 400px
- **Border**: 2px dashed `Border` (default), 2px dashed `Primary` (drag active)
- **Border radius**: `Radius/LG`
- **Padding**: 48px
- **Background**: Transparent (default), `Primary` с opacity 5% (drag active)
- **Cursor**: pointer
- **Transition**: all 0.2s

##### Upload Icon
- **Icon**: Upload (Lucide)
- **Size**: 48×48px
- **Color**: `Muted-Foreground`
- **Margin bottom**: 16px

##### Primary Text
- **Typography**: `Body/Large`
- **Color**: `Foreground`
- **Text**: "Загрузите изображение для создания видео" (default)
- **Text** (drag active): "Отпустите файл здесь"
- **Margin bottom**: 8px

##### Secondary Text
- **Typography**: `Body/Small`
- **Color**: `Muted-Foreground`
- **Text**: "или нажмите для выбора файла"
- **Margin bottom**: 16px

##### Select Button
- **Component**: Button/Outline, Size=Medium
- **Text**: "Выбрать файл"
- **Width**: auto (hug)

##### Format Info
- **Typography**: `Caption`
- **Color**: `Muted-Foreground`
- **Text**: "Поддерживаемые форматы: PNG, JPG, JPEG, WEBP (макс. 10MB)"
- **Margin top**: 16px
- **Text align**: center

---

### 2. State: Uploading (Загрузка)

#### Структура

```
Upload Container (Card)
├── Preview Image (9:16 aspect)
├── File Info
│   ├── Filename
│   └── File Size
├── Progress Section
│   ├── Status Text + Percentage
│   └── Progress Bar
└── Loading Indicator (Spinner)
```

#### Спецификация

##### Card Container
- **Background**: `Card`
- **Border**: 1px solid `Border`
- **Border radius**: `Radius/LG`
- **Padding**: 24px
- **Max width**: 640px
- **Auto Layout**: Vertical, gap 16px

##### Preview Image
- **Aspect ratio**: 9:16
- **Border radius**: `Radius/LG`
- **Object fit**: contain
- **Background**: Black
- **Max height**: 400px

##### File Info
- **Typography**: `Body/Small`
- **Color**: `Muted-Foreground`

**Filename**:
- **Typography**: `Body/Small-Medium`
- **Color**: `Foreground`
- **Truncate**: ellipsis после 50 символов

**File Size**:
- **Typography**: `Caption`
- **Color**: `Muted-Foreground`
- **Format**: "X.XX MB"

##### Progress Section
```
Auto Layout Vertical, gap 8px
├── Top Row (Auto Layout Horizontal, justify space-between)
│   ├── Status Text ("Загрузка...")
│   └── Percentage ("50%")
└── Progress Bar Component
```

**Status Text**:
- **Typography**: `Body/Small-Medium`
- **Color**: `Foreground`

**Percentage**:
- **Typography**: `Body/Small`
- **Color**: `Muted-Foreground`

##### Progress Bar
- **Component**: Progress (см. BASE_COMPONENTS.md)
- **Height**: 8px
- **Value**: 50% (для демонстрации)

##### Loading Indicator
- **Position**: Center (horizontal)
- **Icon**: Loader2 (Lucide)
- **Size**: 24×24px
- **Color**: `Primary`
- **Animation**: rotate 360deg, 1s infinite linear

---

### 3. State: File Uploaded (Готово к обработке)

#### Структура

```
FileUploaded Container (Card)
├── Preview Image (9:16 aspect)
├── File Info (как в Uploading)
├── Action Buttons
│   ├── Process Button (Primary, Large)
│   └── Cancel Button (Outline, Large)
```

#### Спецификация

##### Process Button
- **Component**: Button/Default, Size=Large
- **Text**: "Отправить на обработку"
- **Icon**: Sparkles (leading), 20px
- **Width**: Fill container

##### Cancel Button
- **Component**: Button/Outline, Size=Large
- **Text**: "Отменить"
- **Icon**: X (leading), 20px
- **Width**: Fill container
- **Margin top**: 8px

---

### 4. State: Processing (Обработка)

#### Структура

```
Processing Container (Card)
├── Preview Image (9:16 aspect)
├── File Info
├── Progress Section (расширенная)
│   ├── Status Text (динамический)
│   ├── Percentage
│   ├── Progress Bar (анимированная)
│   └── Time Estimate (опционально)
├── Loading Indicator
└── Blocked Dropzone (ниже, disabled)
```

#### Спецификация

##### Status Text (динамический)

Меняется в зависимости от прогресса:
- 0-30%: "В очереди..." или "Обработка изображения..."
- 30-70%: "Генерация движения..."
- 70-100%: "Финализация..."

**Typography**: `Body/Base-Medium`
**Color**: `Foreground`

##### Time Estimate (опционально)
- **Typography**: `Caption`
- **Color**: `Muted-Foreground`
- **Text**: "Осталось ~XX сек"
- **Margin top**: 4px

##### Blocked Dropzone
```
Disabled Dropzone (ниже основной карточки)
├── Margin top: 16px
├── Border: 2px dashed Border с opacity 30%
├── Background: Muted с opacity 20%
├── Padding: 48px (уменьшенный)
├── Cursor: not-allowed
├── Icon: Upload (16px, opacity 50%)
└── Text: "Обработка файла... Пожалуйста, подождите"
    (Body/Small, Muted-Foreground)
```

---

### 5. State: Completed (Успешно)

#### Структура

```
Completed Container (Card)
├── Video Preview (9:16 aspect, с контролами)
├── File Info (original filename)
├── Success Indicator
│   ├── CheckCircle Icon (green)
│   └── Success Text
├── Action Buttons
│   ├── Download Button (Outline)
│   └── View Button (Default)
└── New Upload Area (ниже)
```

#### Спецификация

##### Video Preview
- **Aspect ratio**: 9:16
- **Border radius**: `Radius/LG`
- **Background**: Black
- **Controls**: показаны (play/pause, volume, fullscreen)
- **Autoplay**: false

##### Success Indicator
```
Auto Layout Horizontal, center aligned, gap 8px
├── CheckCircle Icon (24px, color: green #22C55E)
└── Success Text ("Готово!", Body/Base-Medium)
```

**Colors**:
- **Icon**: `#22C55E` (green-500)
- **Text**: Foreground

##### Action Buttons
```
Auto Layout Horizontal, gap 8px
├── Download Button (Button/Outline)
│   ├── Icon: Download (leading)
│   └── Text: "Скачать видео"
├── View Button (Button/Default)
    ├── Icon: Play (leading)
    └── Text: "Просмотреть"
```

##### New Upload Area
```
Dropzone (ниже, меньшего размера)
├── Margin top: 16px
├── Padding: 32px
├── Border: 2px dashed Border
├── Border radius: Radius/LG
├── Icon: Upload (32px)
├── Text: "Загрузить новое изображение"
    (Body/Small-Medium)
└── Subtext: "или перетащите файл сюда"
    (Caption, Muted-Foreground)
```

---

### 6. State: Error (Ошибка)

#### Структура

```
Error Container (Card with red border)
├── Error Icon (XCircle, red)
├── Error Message
│   ├── Title ("Не удалось обработать файл")
│   └── Description (динамическое сообщение)
├── Action Buttons
│   ├── Cancel Button (Outline)
│   └── Retry Button (Default)
└── New Upload Area (ниже)
```

#### Спецификация

##### Card Container
- **Border**: 2px solid `Destructive`
- **Background**: `Card`
- **Border radius**: `Radius/LG`
- **Padding**: 24px

##### Error Icon
- **Icon**: XCircle (Lucide)
- **Size**: 48×48px
- **Color**: `Destructive`
- **Position**: Center (horizontal)
- **Margin bottom**: 16px

##### Error Message
```
Auto Layout Vertical, center aligned, gap 8px
├── Title (Heading/H4, Foreground)
└── Description (Body/Small, Muted-Foreground)
```

**Description examples**:
- "Файл слишком большой. Максимальный размер: 10MB"
- "Неподдерживаемый формат. Используйте PNG, JPG, JPEG или WEBP"
- "Произошла ошибка сервера. Попробуйте еще раз"

##### Action Buttons
```
Auto Layout Horizontal, gap 8px, margin top 16px
├── Cancel Button (Button/Outline)
│   ├── Icon: X
│   └── Text: "Отмена"
├── Retry Button (Button/Default)
    └── Text: "Попробовать снова"
```

##### New Upload Area
- Аналогично Completed state

---

### Figma Component Structure

```
ImageToVideoUploader
├── State=Idle, DragActive=false
├── State=Idle, DragActive=true
├── State=Uploading, Progress=50
├── State=FileUploaded
├── State=Processing, Progress=30
├── State=Processing, Progress=70
├── State=Completed
└── State=Error
```

---

## FileUpload (базовый)

### Назначение

Упрощенный компонент для загрузки любых файлов (не только изображений).

### Спецификация

#### Compact Version (одна строка)

```
FileUpload Compact (Auto Layout Horizontal)
├── Icon Area
│   ├── Upload Icon (20px) (default)
│   ├── CheckCircle (20px, green) (uploaded)
│   └── XCircle (20px, red) (error)
├── Text Area
│   ├── Label ("Выберите файл" / Filename)
│   └── Helper Text (опционально)
├── Browse Button (Button/Outline, Size=Small)
└── Progress Bar (если загружается)
```

**Height**: 56px
**Border**: 1px solid `Input`
**Border radius**: `Radius/MD`
**Padding**: 12px

#### States

1. **Empty**: показать "Выберите файл" + Browse Button
2. **Uploading**: filename + progress bar
3. **Uploaded**: filename + checkmark + Remove button
4. **Error**: filename + error icon + error message

---

## GenerationProgress

### Назначение

Отдельный компонент для отображения прогресса генерации видео (может использоваться модально или inline).

### Спецификация

```
GenerationProgress (Card)
├── Header
│   ├── Icon (Sparkles, animated)
│   └── Title ("Создаем ваше видео...")
├── Progress Bar (animated)
├── Status Text (динамический)
├── Estimated Time
└── Cancel Button (опционально)
```

#### Header
- **Icon**: Sparkles, 32px, `Primary`, анимация: pulse
- **Title**: `Heading/H4`, `Foreground`
- **Gap**: 12px
- **Align**: center

#### Progress Bar
- **Height**: 12px (крупнее обычного)
- **Border radius**: `Radius/Full`
- **Animation**: плавное заполнение слева направо

#### Status Text
- **Typography**: `Body/Base`
- **Color**: `Muted-Foreground`
- **Text align**: center
- **Margin top**: 16px

**Examples**:
- "Обрабатываем изображение..."
- "Добавляем движение..."
- "Почти готово..."

#### Estimated Time
- **Typography**: `Body/Small`
- **Color**: `Muted-Foreground`
- **Text**: "Примерно 30 секунд"
- **Margin top**: 8px

---

## FormField (обертка)

### Назначение

Стандартная обертка для полей формы с label, helper text и error message.

### Спецификация

```
FormField (Auto Layout Vertical, gap 8px)
├── Label (опционально)
│   ├── Text
│   └── Required indicator (*)
├── Input/Select/Textarea (основной элемент)
├── Helper Text (опционально)
└── Error Message (если есть ошибка)
```

#### Label
- **Typography**: `Body/Small-Medium`
- **Color**: `Foreground`
- **Margin bottom**: 8px

**Required indicator**:
- **Text**: "*"
- **Color**: `Destructive`
- **Margin left**: 4px

#### Helper Text
- **Typography**: `Caption`
- **Color**: `Muted-Foreground`
- **Margin top**: 4px

#### Error Message
- **Typography**: `Caption`
- **Color**: `Destructive`
- **Icon**: AlertCircle (trailing), 12px
- **Gap**: 4px
- **Margin top**: 4px

### States

1. **Default**: обычное поле
2. **Focus**: поле в фокусе, label более яркий
3. **Error**: красная обводка, показать error message
4. **Disabled**: opacity 50%, cursor not-allowed

---

## Паттерны использования

### Challenge Selection (выбор челленджа)

```
Form Section
├── FormField (Select)
│   ├── Label: "Тренд (опционально)"
│   ├── Select Trigger
│   └── Helper: "Выберите тренд или оставьте пустым"
├── Challenge Info Card (если выбран)
│   ├── Icon: Sparkles
│   ├── Title
│   └── Category
└── ImageToVideoUploader
```

### Admin Challenge Form (создание челленджа)

```
Dialog Content
├── FormField (Input)
│   ├── Label: "Название" *
│   └── Input
├── FormField (Textarea)
│   ├── Label: "Описание"
│   └── Textarea
├── FormField (Select)
│   ├── Label: "Категория" *
│   └── Select (MONUMENTS, PETS, FACES, SEASONAL)
├── FormField (Input)
│   ├── Label: "URL миниатюры"
│   └── Input (type=url)
├── FormField (Textarea)
│   ├── Label: "Шаблон промпта" *
│   └── Textarea
├── FormField (Switch)
│   ├── Switch
│   └── Label: "Активен"
└── Actions
    ├── Cancel Button (Outline)
    └── Submit Button (Default)
```

---

## Следующие шаги

После создания компонентов форм переходите к:

1. [Навигация](./NAVIGATION_COMPONENTS.md) - Navigation bar, Mobile menu
2. [Макеты страниц](./PAGE_LAYOUTS.md) - Сборка всех компонентов

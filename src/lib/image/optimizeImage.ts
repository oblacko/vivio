/**
 * Оптимизация изображений перед загрузкой
 * Уменьшает размер изображения до максимальной ширины, сохраняя пропорции
 */

interface OptimizeImageOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  outputFormat?: 'image/jpeg' | 'image/png' | 'image/webp';
}

/**
 * Оптимизирует изображение путем ресайза и сжатия
 * @param file - Исходный файл изображения
 * @param maxWidth - Максимальная ширина в пикселях (по умолчанию 1080)
 * @returns Promise с оптимизированным файлом
 */
export async function optimizeImage(
  file: File,
  maxWidth: number = 1080
): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Failed to get canvas context'));
      return;
    }

    img.onload = () => {
      // Вычисляем новые размеры с сохранением пропорций
      let width = img.width;
      let height = img.height;

      // Если изображение больше maxWidth, масштабируем
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      // Устанавливаем размеры canvas
      canvas.width = width;
      canvas.height = height;

      // Рисуем изображение на canvas
      ctx.drawImage(img, 0, 0, width, height);

      // Конвертируем canvas в Blob
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to create blob from canvas'));
            return;
          }

          // Создаем новый File из Blob
          const optimizedFile = new File(
            [blob],
            file.name.replace(/\.[^/.]+$/, '.jpg'), // Меняем расширение на .jpg
            {
              type: 'image/jpeg',
              lastModified: Date.now(),
            }
          );

          // Очищаем URL объекта
          URL.revokeObjectURL(img.src);
          
          resolve(optimizedFile);
        },
        'image/jpeg',
        0.9 // Качество 90%
      );
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    // Загружаем изображение
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Расширенная оптимизация изображения с дополнительными опциями
 */
export async function optimizeImageAdvanced(
  file: File,
  options: OptimizeImageOptions = {}
): Promise<File> {
  const {
    maxWidth = 1080,
    maxHeight,
    quality = 0.9,
    outputFormat = 'image/jpeg',
  } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Failed to get canvas context'));
      return;
    }

    img.onload = () => {
      let width = img.width;
      let height = img.height;

      // Масштабирование по ширине
      if (maxWidth && width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      // Масштабирование по высоте
      if (maxHeight && height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }

      canvas.width = width;
      canvas.height = height;

      // Улучшение качества рендеринга
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to create blob from canvas'));
            return;
          }

          const extension = outputFormat.split('/')[1];
          const optimizedFile = new File(
            [blob],
            file.name.replace(/\.[^/.]+$/, `.${extension}`),
            {
              type: outputFormat,
              lastModified: Date.now(),
            }
          );

          URL.revokeObjectURL(img.src);
          resolve(optimizedFile);
        },
        outputFormat,
        quality
      );
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    img.src = URL.createObjectURL(file);
  });
}

/**
 * Получает размеры изображения из файла
 */
export async function getImageDimensions(
  file: File
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      const dimensions = {
        width: img.width,
        height: img.height,
      };
      URL.revokeObjectURL(img.src);
      resolve(dimensions);
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    img.src = URL.createObjectURL(file);
  });
}

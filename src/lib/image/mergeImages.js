// src/lib/mergeImages.js
import { createCanvas, loadImage } from 'canvas';

/**
 * Функция объединяет два изображения вертикально
 * @param {Buffer} image1Buffer - первое изображение (сверху)
 * @param {Buffer} image2Buffer - второе изображение (снизу, в зелёной рамке)
 * @returns {Promise<Buffer>} - объединённое изображение
 */
export async function mergeImages(image1Buffer, image2Buffer) {
  // Загружаем изображения из буферов (бинарные данные файлов)
  const image1 = await loadImage(image1Buffer);
  const image2 = await loadImage(image2Buffer);

  // Настройки
  const borderWidth = 10; // толщина зелёной рамки в пикселях
  
  // Ширина итогового изображения: 
  // берём минимум из ширины первого фото и 1080 пикселей
  const targetWidth = Math.min(image1.width, 1080);

  // Вычисляем масштаб для первого изображения
  // Если фото 2000px, а targetWidth 1080, то scale1 = 0.54
  const scale1 = targetWidth / image1.width;
  // Высота первого изображения после масштабирования
  const scaledHeight1 = image1.height * scale1;

  // То же самое для второго изображения
  const scale2 = targetWidth / image2.width;
  const scaledHeight2 = image2.height * scale2;

  // Общая высота canvas = высота первого фото + высота второго + рамка сверху и снизу
  const totalHeight = scaledHeight1 + scaledHeight2 + borderWidth * 2;

  // Создаём холст (canvas) нужного размера
  const canvas = createCanvas(targetWidth, totalHeight);
  // Получаем контекст для рисования (как кисть для рисования)
  const ctx = canvas.getContext('2d');

  // ШАГ 1: Заливаем весь холст белым цветом (фон)
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, targetWidth, totalHeight);

  // ШАГ 2: Рисуем первое изображение сверху
  // drawImage(изображение, x, y, ширина, высота)
  ctx.drawImage(image1, 0, 0, targetWidth, scaledHeight1);

  // ШАГ 3: Рисуем зелёную рамку для второго изображения
  const frameY = scaledHeight1; // начинается сразу после первого фото
  const frameHeight = scaledHeight2 + borderWidth * 2; // высота рамки
  
  ctx.fillStyle = '#22c55e'; // зелёный цвет
  ctx.fillRect(0, frameY, targetWidth, frameHeight);

  // ШАГ 4: Рисуем белый прямоугольник внутри зелёной рамки
  // Это создаёт эффект рамки (зелёный снаружи, белый внутри)
  ctx.fillStyle = 'white';
  ctx.fillRect(
    borderWidth,                           // отступ слева
    frameY + borderWidth,                  // отступ сверху
    targetWidth - borderWidth * 2,         // ширина (минус отступы)
    scaledHeight2                          // высота
  );

  // ШАГ 5: Рисуем второе изображение внутри белого прямоугольника
  ctx.drawImage(
    image2,
    borderWidth,                           // x: отступ слева
    frameY + borderWidth,                  // y: позиция сверху
    targetWidth - borderWidth * 2,         // ширина (вписывается в рамку)
    scaledHeight2                          // высота
  );

  // Конвертируем canvas в PNG и возвращаем как Buffer
  return canvas.toBuffer('image/png');
}
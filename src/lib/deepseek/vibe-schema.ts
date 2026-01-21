import { z } from "zod";

/**
 * JSON Schema для валидации структуры вайба
 */
export const vibeSchema = z.object({
  title: z.string().min(1, "Название вайба обязательно"),
  category: z.enum(["MONUMENTS", "PETS", "FACES", "SEASONAL"]),
  promptTemplate: z.string().min(1, "Шаблон промпта обязателен"),
  description: z.string().optional(),
});

/**
 * Schema для массива вайбов
 */
export const vibesArraySchema = z.object({
  vibes: z.array(vibeSchema).min(1, "Должен быть хотя бы один вайб"),
});

/**
 * TypeScript типы
 */
export type VibeInput = z.infer<typeof vibeSchema>;
export type VibesArrayInput = z.infer<typeof vibesArraySchema>;

/**
 * Валидация одного вайба
 */
export function validateVibe(data: unknown): VibeInput {
  return vibeSchema.parse(data);
}

/**
 * Валидация массива вайбов
 */
export function validateVibes(data: unknown): VibesArrayInput {
  return vibesArraySchema.parse(data);
}

/**
 * JSON Schema в текстовом виде для использования в промптах
 */
export const VIBE_JSON_SCHEMA_TEXT = `{
  "type": "object",
  "properties": {
    "vibes": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "title": {
            "type": "string",
            "description": "Уникальное название вайба на русском языке"
          },
          "category": {
            "type": "string",
            "enum": ["MONUMENTS", "PETS", "FACES", "SEASONAL"],
            "description": "Категория вайба"
          },
          "promptTemplate": {
            "type": "string",
            "description": "Творческий промпт для AI генерации видео"
          },
          "description": {
            "type": "string",
            "description": "Описание вайба (опционально)"
          }
        },
        "required": ["title", "category", "promptTemplate"]
      },
      "minItems": 1
    }
  },
  "required": ["vibes"]
}`;

/**
 * Дефолтная инструкция для генерации вайбов
 */
export const DEFAULT_GENERATION_INSTRUCTION = `Сгенерируй креативные вайбы для видео-челленджа. 
Каждый вайб должен быть уникальным и интересным.
Промпты должны быть креативными и подходить для генерации AI видео.`;

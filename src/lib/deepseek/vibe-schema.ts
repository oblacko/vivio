import { z } from "zod";

/**
 * JSON Schema для валидации структуры вайба
 */
export const vibeSchema = z.object({
  title: z.string().min(1, "Название вайба обязательно"),
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
          "promptTemplate": {
            "type": "string",
            "description": "Творческий промпт для генерации видео на основе вашей инструкции"
          },
          "description": {
            "type": "string",
            "description": "Описание вайба (опционально)"
          }
        },
        "required": ["title", "promptTemplate"]
      },
      "minItems": 1
    }
  },
  "required": ["vibes"]
}`;

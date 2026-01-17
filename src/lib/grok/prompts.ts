/**
 * Prompt templates для разных категорий челленджей
 * Каждый промпт оптимизирован для генерации 6-секундных видео
 */

export type ChallengeCategory = "MONUMENTS" | "PETS" | "FACES" | "SEASONAL";

export interface PromptTemplate {
  prompt: string;
  negativePrompt?: string;
}

const PROMPT_TEMPLATES: Record<ChallengeCategory, PromptTemplate> = {
  MONUMENTS: {
    prompt: `Cinematic video of a monument coming to life with subtle, natural movements. The monument should have gentle, breathing-like motion, with soft lighting changes creating depth. The camera should slowly orbit around the monument, revealing its details. The movement should be elegant and respectful, as if the monument is awakening from a long sleep. Professional cinematography, 6 seconds, smooth transitions, vertical format 9:16.`,
    negativePrompt: `fast movements, jerky motion, distortion, artifacts, blur, low quality, pixelated, unnatural colors, excessive motion, shaky camera`,
  },

  PETS: {
    prompt: `Cute and natural pet video with authentic animal movements. The pet should blink naturally, tilt its head slightly, maybe wag its tail or move its ears. The pet looks happy and playful, with natural expressions. The lighting should be warm and inviting, highlighting the pet's fur and eyes. The movement should be gentle and realistic, capturing the pet's personality. Professional pet photography style, 6 seconds, smooth motion, vertical format 9:16.`,
    negativePrompt: `unnatural movements, robotic motion, distorted features, blur, artifacts, low quality, pixelated, scary expressions, aggressive behavior, fast jerky motion`,
  },

  FACES: {
    prompt: `Portrait video with natural facial expressions. The person should have subtle, natural movements: gentle blinking, slight head movements, a warm smile appearing naturally. The lighting should be soft and flattering, creating depth in the face. The expression should be genuine and engaging, as if the person is having a pleasant conversation. Professional portrait style, cinematic quality, 6 seconds, smooth transitions, vertical format 9:16.`,
    negativePrompt: `exaggerated expressions, unnatural movements, distorted face, blur, artifacts, low quality, pixelated, scary expressions, robotic motion, fast jerky movements`,
  },

  SEASONAL: {
    prompt: `Seasonal video with natural environmental effects. Add gentle seasonal elements: soft snowflakes falling, autumn leaves drifting, spring petals floating, or summer sunlight filtering through. The main subject should have subtle movements that complement the seasonal atmosphere. The overall mood should match the season - cozy for winter, fresh for spring, warm for summer, nostalgic for autumn. Cinematic seasonal atmosphere, 6 seconds, smooth motion, vertical format 9:16.`,
    negativePrompt: `harsh weather, extreme effects, unnatural elements, blur, artifacts, low quality, pixelated, distorted colors, excessive motion, chaotic effects`,
  },
};

/**
 * Получить промпт для категории челленджа
 */
export function getPromptForCategory(
  category: ChallengeCategory
): PromptTemplate {
  return PROMPT_TEMPLATES[category];
}

/**
 * Дефолтный промпт для генерации видео без челленджа
 */
export const DEFAULT_PROMPT: PromptTemplate = {
  prompt: `Cinematic video with natural, subtle movements. The subject should have gentle, organic motion that brings it to life naturally. Professional cinematography style with smooth transitions, warm lighting, and authentic expressions. The movement should feel real and engaging, creating a captivating 6-second video experience. Vertical format 9:16, cinematic quality.`,
  negativePrompt: `unnatural movements, robotic motion, distorted features, blur, artifacts, low quality, pixelated, jerky motion, fast movements, shaky camera`,
};

/**
 * Генерация кастомного промпта с дополнительными деталями
 */
export function generateCustomPrompt(
  category: ChallengeCategory,
  additionalDetails?: string
): string {
  const template = getPromptForCategory(category);
  if (additionalDetails) {
    return `${template.prompt} Additional details: ${additionalDetails}`;
  }
  return template.prompt;
}

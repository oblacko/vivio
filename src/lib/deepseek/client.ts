/**
 * DeepSeek API Client
 * API Documentation: https://api-docs.deepseek.com/
 */

const DEEPSEEK_API_URL = process.env.DEEPSEEK_API_URL || "https://api.deepseek.com";
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

if (!DEEPSEEK_API_KEY) {
  console.warn("DEEPSEEK_API_KEY is not set in environment variables");
}

export interface GenerateVibesOptions {
  instruction: string;
  count?: number;
  jsonSchema?: string;
}

export interface GeneratedVibe {
  title: string;
  category: "MONUMENTS" | "PETS" | "FACES" | "SEASONAL";
  promptTemplate: string;
  description?: string;
}

export interface GenerateVibesResponse {
  vibes: GeneratedVibe[];
}

class DeepSeekClient {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = DEEPSEEK_API_KEY || "";
    this.baseUrl = DEEPSEEK_API_URL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    if (!this.apiKey) {
      throw new Error("DEEPSEEK_API_KEY is not configured");
    }

    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `HTTP ${response.status}`;

      console.error("❌ DeepSeek API ошибка:");
      console.error("📊 Status:", response.status, response.statusText);
      console.error("📄 Response body:", errorText);

      try {
        const errorData = JSON.parse(errorText);
        console.error("📋 Parsed error data:", JSON.stringify(errorData, null, 2));
        if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = typeof errorData.error === 'string' 
            ? errorData.error 
            : errorData.error.message || JSON.stringify(errorData.error);
        }
      } catch {
        if (errorText) {
          errorMessage = errorText;
        } else {
          errorMessage = response.statusText || 'Unknown error';
        }
      }

      throw new Error(`DeepSeek API error: ${errorMessage}`);
    }

    const data = await response.json();
    return data as T;
  }

  /**
   * Генерация списка вайбов с помощью DeepSeek API
   */
  async generateVibes(
    options: GenerateVibesOptions
  ): Promise<GenerateVibesResponse> {
    const { instruction, count, jsonSchema } = options;

    // Системный промпт с JSON Schema
    const systemPrompt = `You are a creative assistant that generates video vibe challenges.

${jsonSchema || `Generate vibes in the following JSON format:
{
  "vibes": [
    {
      "title": "string",
      "category": "MONUMENTS" | "PETS" | "FACES" | "SEASONAL",
      "promptTemplate": "string",
      "description": "string (optional)"
    }
  ]
}`}

Rules:
- Each vibe must have a unique, creative title
- Category must be one of: MONUMENTS, PETS, FACES, SEASONAL
- promptTemplate should be a creative prompt for AI video generation
- description is optional but recommended
- All text should be in Russian
${count ? `- Generate exactly ${count} vibes` : '- Generate between 3-10 vibes'}
- Ensure all JSON is valid and properly formatted`;

    const userPrompt = instruction;

    const payload = {
      model: "deepseek-chat",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: {
        type: "json_object"
      },
      temperature: 0.8,
      max_tokens: 4000
    };

    console.log("🚀 Отправка запроса в DeepSeek API:");
    console.log("📋 Instruction:", instruction);
    console.log("📊 Count:", count || "auto");
    console.log("🔗 URL:", `${this.baseUrl}/chat/completions`);
    console.log("🔑 API Key:", this.apiKey ? `${this.apiKey.substring(0, 10)}...` : "НЕ УСТАНОВЛЕН");

    try {
      const response = await this.request<{
        choices: Array<{
          message: {
            content: string;
          };
        }>;
      }>("/chat/completions", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      console.log("✅ Ответ от DeepSeek API получен");

      if (!response.choices || response.choices.length === 0) {
        throw new Error("DeepSeek API returned no choices");
      }

      const content = response.choices[0].message.content;
      console.log("📄 Raw content:", content);

      // Парсинг JSON ответа
      let parsedContent: GenerateVibesResponse;
      try {
        parsedContent = JSON.parse(content);
      } catch (parseError) {
        console.error("❌ Failed to parse JSON response:", parseError);
        console.error("📄 Content:", content);
        throw new Error(`Failed to parse DeepSeek response as JSON: ${parseError}`);
      }

      // Валидация структуры
      if (!parsedContent.vibes || !Array.isArray(parsedContent.vibes)) {
        throw new Error("DeepSeek response missing 'vibes' array");
      }

      console.log(`✅ Сгенерировано вайбов: ${parsedContent.vibes.length}`);
      
      return parsedContent;
    } catch (error) {
      console.error("❌ Ошибка при вызове DeepSeek API:", error);
      throw error;
    }
  }
}

export const deepseekClient = new DeepSeekClient();

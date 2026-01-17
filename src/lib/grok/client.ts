/**
 * Grok Imagine API Client
 * API Documentation: https://api.kie.ai/api/v1/jobs/createTask
 */

const GROK_API_URL = process.env.GROK_API_URL || "https://api.kie.ai/api/v1";
const GROK_API_KEY = process.env.GROK_API_KEY;

if (!GROK_API_KEY) {
  console.warn("GROK_API_KEY is not set in environment variables");
}

export interface GenerateVideoOptions {
  imageUrl: string;
  prompt: string;
  mode?: "normal" | "fun" | "spicy";
  callbackUrl?: string;
}

export interface GenerateVideoResponse {
  taskId: string;
}

export interface JobStatusResponse {
  code: number;
  message: string;
  data: {
    taskId: string;
    state: "waiting" | "queuing" | "generating" | "success" | "fail" | "pending" | "processing";
    progress?: number;
    resultJson?: string; // JSON string with resultUrls array
    failCode?: string | null;
    failMsg?: string | null;
    createTime?: number;
    completeTime?: number;
    costTime?: number;
  };
}

export interface VideoResult {
  resultUrls: string[];
}

class GrokClient {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = GROK_API_KEY || "";
    this.baseUrl = GROK_API_URL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    if (!this.apiKey) {
      throw new Error("GROK_API_KEY is not configured");
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

      console.error("❌ Grok API ошибка:");
      console.error("📊 Status:", response.status, response.statusText);
      console.error("📄 Response body:", errorText);

      try {
        const errorData = JSON.parse(errorText);
        console.error("📋 Parsed error data:", JSON.stringify(errorData, null, 2));
        if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        } else if (errorData.code) {
          errorMessage = `API returned code ${errorData.code}: ${errorData.message || errorData.error || 'Unknown error'}`;
        }
      } catch {
        // If not JSON, use the raw text
        if (errorText) {
          errorMessage = errorText;
        } else {
          errorMessage = response.statusText || 'Unknown error';
        }
      }

      throw new Error(`Grok API error: ${errorMessage}`);
    }

    const data = await response.json();
    return data as T;
  }

  /**
   * Запуск генерации видео из изображения
   */
  async generateVideo(
    options: GenerateVideoOptions
  ): Promise<GenerateVideoResponse> {
    const { imageUrl, prompt, mode = "normal", callbackUrl } = options;

    const payload = {
      model: "grok-imagine/image-to-video",
      ...(callbackUrl && { callBackUrl: callbackUrl }),
      input: {
        image_urls: [imageUrl],
        prompt,
        mode,
        index: 0,
      },
    };

    console.log("🚀 Отправка запроса в Grok API:");
    console.log("📋 Payload:", JSON.stringify(payload, null, 2));
    console.log("🔗 URL:", `${this.baseUrl}/jobs/createTask`);
    console.log("🔑 API Key:", this.apiKey ? `${this.apiKey.substring(0, 10)}...` : "НЕ УСТАНОВЛЕН");

    try {
      const response = await this.request<{
        code: number;
        message: string;
        data: { taskId: string };
      }>("/jobs/createTask", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      console.log("✅ Ответ от Grok API:", JSON.stringify(response, null, 2));

      if (response.code !== 200) {
        console.error("❌ Grok API вернул ошибку:", response);
        throw new Error(`Grok API error: ${response.message || `API returned code ${response.code}`}`);
      }

      console.log("✅ Task ID получен:", response.data.taskId);
      return {
        taskId: response.data.taskId,
      };
    } catch (error) {
      console.error("❌ Ошибка при вызове Grok API:", error);
      throw error;
    }
  }

  /**
   * Проверка статуса задачи генерации
   */
  async getJobStatus(taskId: string): Promise<JobStatusResponse> {
    const response = await this.request<JobStatusResponse>(
      `/jobs/recordInfo?taskId=${taskId}`,
      {
        method: "GET",
      }
    );

    return response;
  }

  /**
   * Отмена задачи генерации
   */
  async cancelJob(taskId: string): Promise<void> {
    await this.request(`/jobs/cancelTask`, {
      method: "POST",
      body: JSON.stringify({ taskId }),
    });
  }

  /**
   * Парсинг результата из resultJson
   */
  parseVideoResult(resultJson: string): VideoResult {
    try {
      return JSON.parse(resultJson) as VideoResult;
    } catch (error) {
      throw new Error(`Failed to parse video result: ${error}`);
    }
  }
}

export const grokClient = new GrokClient();

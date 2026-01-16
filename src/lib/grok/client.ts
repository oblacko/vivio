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
    state: "pending" | "processing" | "success" | "fail";
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
      throw new Error(
        `Grok API error (${response.status}): ${errorText || response.statusText}`
      );
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

    const response = await this.request<{
      code: number;
      message: string;
      data: { taskId: string };
    }>("/jobs/createTask", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (response.code !== 200) {
      throw new Error(`Grok API error: ${response.message}`);
    }

    return {
      taskId: response.data.taskId,
    };
  }

  /**
   * Проверка статуса задачи генерации
   */
  async getJobStatus(taskId: string): Promise<JobStatusResponse> {
    const response = await this.request<JobStatusResponse>(
      `/jobs/getTaskStatus?taskId=${taskId}`,
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

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, Sparkles, CheckCircle, XCircle } from "lucide-react";
import { DEFAULT_GENERATION_INSTRUCTION } from "@/lib/deepseek/vibe-schema";

interface GeneratedVibe {
  id: string;
  title: string;
  category: string;
  promptTemplate: string;
  description?: string;
  isActive: boolean;
}

interface GenerationResult {
  success: boolean;
  created: number;
  total: number;
  vibes: GeneratedVibe[];
  errors?: Array<{ title: string; error: string }>;
}

export function VibeGenerator() {
  const [instruction, setInstruction] = useState(DEFAULT_GENERATION_INSTRUCTION);
  const [count, setCount] = useState<number>(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<GenerationResult | null>(null);

  const handleGenerate = async () => {
    if (!instruction.trim()) {
      toast.error("Введите инструкцию для генерации");
      return;
    }

    setIsGenerating(true);
    setResult(null);

    try {
      const response = await fetch("/api/admin/vibes/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          instruction,
          count,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Ошибка при генерации вайбов");
      }

      const data: GenerationResult = await response.json();
      setResult(data);

      if (data.created > 0) {
        toast.success(`Создано вайбов: ${data.created}`, {
          description: `Все вайбы сохранены как неактивные и требуют модерации`,
        });
      }

      if (data.errors && data.errors.length > 0) {
        toast.warning(`Ошибки: ${data.errors.length}`, {
          description: "Некоторые вайбы не удалось создать",
        });
      }
    } catch (error) {
      console.error("Ошибка генерации:", error);
      toast.error(error instanceof Error ? error.message : "Произошла ошибка");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Генерация вайбов через AI</CardTitle>
          <CardDescription>
            Используйте DeepSeek AI для автоматической генерации вайбов на основе инструкции
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="instruction">Инструкция для AI</Label>
            <Textarea
              id="instruction"
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              rows={6}
              placeholder="Например: Создай 5 вайбов на тему природы и животных"
              className="mt-1"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Опишите, какие вайбы вы хотите сгенерировать. AI создаст структурированный список.
            </p>
          </div>

          <div>
            <Label htmlFor="count">Количество вайбов (необязательно)</Label>
            <Input
              id="count"
              type="number"
              min={1}
              max={50}
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value) || 5)}
              className="mt-1"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Укажите желаемое количество вайбов (1-50)
            </p>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !instruction.trim()}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Генерация...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Сгенерировать вайбы
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Результат генерации</CardTitle>
            <CardDescription>
              Создано вайбов: {result.created} из {result.total}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {result.vibes.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium">Созданные вайбы (неактивные):</h3>
                {result.vibes.map((vibe) => (
                  <Card key={vibe.id} className="border-green-200 dark:border-green-900">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <CardTitle className="text-base">{vibe.title}</CardTitle>
                          </div>
                          <div className="flex gap-2 mt-2">
                            <Badge variant="outline">{vibe.category}</Badge>
                            <Badge variant="secondary">Неактивен</Badge>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      {vibe.description && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {vibe.description}
                        </p>
                      )}
                      <div className="text-sm">
                        <span className="font-medium">Промпт:</span>
                        <p className="text-muted-foreground mt-1">{vibe.promptTemplate}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {result.errors && result.errors.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-red-600 dark:text-red-400">
                  Ошибки ({result.errors.length}):
                </h3>
                {result.errors.map((error, index) => (
                  <Card key={index} className="border-red-200 dark:border-red-900">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <XCircle className="w-4 h-4 text-red-600" />
                        <CardTitle className="text-base">{error.title}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm text-red-600 dark:text-red-400">{error.error}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

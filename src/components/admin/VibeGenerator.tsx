"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Loader2, Sparkles, CheckCircle, XCircle, RotateCcw, Clock } from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

interface GeneratedVibe {
  id: string;
  title: string;
  category?: string;
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

interface GenerationLog {
  id: string;
  title: string | null;
  instruction: string;
  count: number;
  createdAt: string;
}

export function VibeGenerator() {
  const [instruction, setInstruction] = useState("");
  const [title, setTitle] = useState("");
  const [count, setCount] = useState<string>("5");
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [logs, setLogs] = useState<GenerationLog[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(true);

  const fetchLogs = async () => {
    try {
      const response = await fetch("/api/admin/vibes/generation-logs");
      if (response.ok) {
        const data = await response.json();
        setLogs(data);
      }
    } catch (error) {
      console.error("Error fetching logs:", error);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleGenerate = async (params?: { instruction: string; count: number; title?: string }) => {
    const currentInstruction = params?.instruction || instruction;
    const currentCount = params?.count || parseInt(count);
    const currentTitle = params?.title || title;

    if (!currentInstruction.trim()) {
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
          instruction: currentInstruction,
          count: currentCount,
          title: currentTitle,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Ошибка при генерации вайбов");
      }

      const data: GenerationResult = await response.json();
      setResult(data);
      fetchLogs(); // Обновляем историю

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
      
      // Очищаем форму при успехе (если не повторный запуск)
      if (!params) {
        setInstruction("");
        setTitle("");
      }
    } catch (error) {
      console.error("Ошибка генерации:", error);
      toast.error(error instanceof Error ? error.message : "Произошла ошибка");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRepeat = (log: GenerationLog) => {
    handleGenerate({
      instruction: log.instruction,
      count: log.count,
      title: log.title || undefined,
    });
    // Скроллим вверх к форме
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Параметры генерации</CardTitle>
          <CardDescription>
            Настройте параметры и отправьте инструкцию AI для создания новых вайбов
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Название генерации (необязательно)</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Например: Птицы леса"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="count">Количество вайбов</Label>
              <Select value={count} onValueChange={setCount}>
                <SelectTrigger id="count">
                  <SelectValue placeholder="Выберите количество" />
                </SelectTrigger>
                <SelectContent>
                  {[3, 5, 10, 15, 20].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="instruction">Инструкция для AI</Label>
            <Textarea
              id="instruction"
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              rows={4}
              placeholder="Например: Создай 5 вайбов на тему природы и животных"
            />
            <p className="text-sm text-muted-foreground">
              Опишите, какие вайбы вы хотите сгенерировать. AI создаст структурированный список.
            </p>
          </div>

          <Button
            onClick={() => handleGenerate()}
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
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Результат последней генерации
            </CardTitle>
            <CardDescription>
              Создано вайбов: {result.created} из {result.total}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {result.vibes.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {result.vibes.map((vibe) => (
                  <Badge key={vibe.id} variant="outline" className="bg-background">
                    {vibe.title}
                  </Badge>
                ))}
              </div>
            )}
            {result.errors && result.errors.length > 0 && (
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-md">
                <p className="text-sm font-medium text-red-600 dark:text-red-400 mb-1">
                  Ошибки ({result.errors.length}):
                </p>
                <ul className="text-xs text-red-500 list-disc list-inside">
                  {result.errors.slice(0, 3).map((err, i) => (
                    <li key={i}>{err.title}: {err.error}</li>
                  ))}
                  {result.errors.length > 3 && <li>... и еще {result.errors.length - 3}</li>}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="w-5 h-5" />
            История инструкций
          </CardTitle>
          <CardDescription>
            Список всех ранее использованных инструкций для генерации
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingLogs ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : logs.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">История пуста</p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[150px]">Дата</TableHead>
                    <TableHead>Название / Инструкция</TableHead>
                    <TableHead className="w-[100px] text-center">Кол-во</TableHead>
                    <TableHead className="w-[120px] text-right">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(log.createdAt), "dd MMM HH:mm", { locale: ru })}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {log.title && (
                            <div className="font-medium text-sm">{log.title}</div>
                          )}
                          <div className="text-xs text-muted-foreground line-clamp-2 italic">
                            &ldquo;{log.instruction}&rdquo;
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary">{log.count}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRepeat(log)}
                          disabled={isGenerating}
                        >
                          <RotateCcw className="w-4 h-4 mr-2" />
                          Повторить
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

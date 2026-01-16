"use client";

import { useEffect } from "react";
import { useGenerationStatus } from "@/lib/queries/generation";
import { useGenerationStore } from "@/store/useGenerationStore";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface GenerationProgressProps {
  jobId: string | null;
  onComplete?: (videoUrl: string, videoId: string) => void;
  onError?: (error: string) => void;
}

export function GenerationProgress({
  jobId,
  onComplete,
  onError,
}: GenerationProgressProps) {
  const { progress, status, videoUrl, videoId, errorMessage } =
    useGenerationStore();
  const { data, isLoading } = useGenerationStatus(jobId);

  useEffect(() => {
    if (status === "completed" && videoUrl && videoId && onComplete) {
      onComplete(videoUrl, videoId);
    }
  }, [status, videoUrl, videoId, onComplete]);

  useEffect(() => {
    if (status === "failed" && errorMessage && onError) {
      onError(errorMessage);
    }
  }, [status, errorMessage, onError]);

  if (!jobId) {
    return null;
  }

  const getStatusText = () => {
    switch (status) {
      case "queued":
        return "В очереди...";
      case "processing":
        if (progress < 30) return "Обработка изображения...";
        if (progress < 70) return "Генерация движения...";
        return "Финализация...";
      case "completed":
        return "Готово!";
      case "failed":
        return "Ошибка генерации";
      default:
        return "Генерируем видео... (~30 секунд)";
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="p-6">
        <div className="flex flex-col items-center space-y-4">
          {/* Круговой прогресс */}
          <div className="relative w-24 h-24">
            <svg className="w-24 h-24 transform -rotate-90">
              <circle
                cx="48"
                cy="48"
                r="44"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
                className="text-muted"
              />
              <motion.circle
                cx="48"
                cy="48"
                r="44"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 44}`}
                initial={{ strokeDashoffset: 2 * Math.PI * 44 }}
                animate={{
                  strokeDashoffset:
                    2 * Math.PI * 44 * (1 - progress / 100),
                }}
                transition={{ duration: 0.3 }}
                className={cn(
                  "text-primary",
                  status === "completed" && "text-green-500",
                  status === "failed" && "text-destructive"
                )}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <AnimatePresence mode="wait">
                {status === "processing" || status === "queued" ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                  >
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </motion.div>
                ) : status === "completed" ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                  >
                    <CheckCircle2 className="w-8 h-8 text-green-500" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                  >
                    <XCircle className="w-8 h-8 text-destructive" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Текст статуса */}
          <div className="text-center space-y-2">
            <p className="text-lg font-medium">{getStatusText()}</p>
            <p className="text-sm text-muted-foreground">
              {progress}% завершено
            </p>
          </div>

          {/* Прогресс-бар */}
          <div className="w-full">
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

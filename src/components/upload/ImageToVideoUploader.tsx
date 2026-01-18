"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { toast } from "sonner";
import {
  Upload,
  X,
  CheckCircle2,
  XCircle,
  Loader2,
  Download,
  Play,
  Sparkles,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useUploadImage } from "@/lib/queries/upload";
import { useInitiateGeneration, useGenerationStatus } from "@/lib/queries/generation";
import { useGenerationStore } from "@/store/useGenerationStore";
import { cn } from "@/lib/utils";

type UploadState = "idle" | "uploading" | "file-uploaded" | "processing" | "completed" | "error";

interface ImageToVideoUploaderProps {
  challengeId?: string;
  onComplete?: (videoUrl: string, videoId: string) => void;
}

export function ImageToVideoUploader({
  challengeId,
  onComplete,
}: ImageToVideoUploaderProps) {
  const [state, setState] = useState<UploadState>("idle");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadMutation = useUploadImage();
  const initiateMutation = useInitiateGeneration();
  const { currentJobId, progress, status, videoUrl, videoId, reset } =
    useGenerationStore();
  const { data: generationStatus } = useGenerationStatus(currentJobId);

  // Отслеживание изменений статуса генерации
  useEffect(() => {
    if (currentJobId && state === "file-uploaded") {
      setState("processing");
    }
  }, [currentJobId, state]);

  useEffect(() => {
    if (generationStatus) {
      if (generationStatus.status === "completed" && generationStatus.videoUrl) {
        setState("completed");
        toast.success("Видео успешно создано!", {
          description: "Ваше видео готово к просмотру",
        });
        if (onComplete && generationStatus.videoUrl && generationStatus.videoId) {
          onComplete(generationStatus.videoUrl, generationStatus.videoId);
        }
      } else if (generationStatus.status === "failed") {
        setState("error");
        setErrorMessage(
          generationStatus.errorMessage || "Не удалось обработать файл"
        );
        toast.error("Ошибка генерации", {
          description: generationStatus.errorMessage || "Попробуйте еще раз",
        });
      }
    }
  }, [generationStatus, onComplete]);

  // Загрузка файла на сервер
  const handleFileUpload = useCallback(async (file: File) => {
    try {
      setState("uploading");

      // Загрузка изображения
      const uploadResult = await uploadMutation.mutateAsync(file);
      setUploadedImageUrl(uploadResult.url);
      
      setState("file-uploaded");
      toast.success("Изображение загружено", {
        description: "Нажмите кнопку для начала обработки",
      });
    } catch (error) {
      console.error("Upload error:", error);
      setState("error");
      setErrorMessage(
        error instanceof Error ? error.message : "Не удалось загрузить файл"
      );
      toast.error("Ошибка загрузки", {
        description: error instanceof Error ? error.message : "Попробуйте еще раз",
      });
    }
  }, [uploadMutation]);

  // Отправка на обработку
  const handleStartGeneration = useCallback(async () => {
    if (!uploadedImageUrl) return;

    const payload = {
      challengeId: challengeId || undefined,
      imageUrl: uploadedImageUrl,
    };

    console.log("🚀 Отправка на обработку:", JSON.stringify(payload, null, 2));
    console.log("📋 Детали:", {
      challengeId: challengeId || "не указан",
      challengeIdType: typeof challengeId,
      challengeIdLength: challengeId?.length,
      imageUrl: uploadedImageUrl,
      fileName: selectedFile?.name,
      fileSize: selectedFile ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB` : "неизвестно",
    });
    console.log("🔍 Props challengeId:", challengeId);
    console.log("🔍 Component state challengeId context:", "checking if challengeId prop is consistent");

    try {
      setState("processing");

      // Инициация генерации
      const result = await initiateMutation.mutateAsync(payload);
      
      console.log("✅ Ответ от сервера:", result);

      toast.info("Генерация началась", {
        description: "Обработка займет около 30 секунд",
      });

      // Состояние изменится на processing через useEffect
    } catch (error) {
      console.error("❌ Ошибка генерации:", error);
      setState("error");
      setErrorMessage(
        error instanceof Error ? error.message : "Не удалось начать обработку"
      );
      toast.error("Ошибка генерации", {
        description: error instanceof Error ? error.message : "Попробуйте еще раз",
      });
    }
  }, [challengeId, uploadedImageUrl, selectedFile, initiateMutation]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (state !== "idle" && state !== "completed" && state !== "error") {
      return;
    }

    const file = acceptedFiles[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setErrorMessage(null);
      handleFileUpload(file);
    }
  }, [state, handleFileUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".webp"],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false,
    disabled: state === "uploading" || state === "processing" || state === "file-uploaded",
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && (state === "idle" || state === "completed" || state === "error")) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setErrorMessage(null);
      handleFileUpload(file);
    }
  };

  const handleReset = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setUploadedImageUrl(null);
    setErrorMessage(null);
    setState("idle");
    reset();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRetry = () => {
    if (uploadedImageUrl) {
      handleStartGeneration();
    } else if (selectedFile) {
      handleFileUpload(selectedFile);
    }
  };

  const getStatusText = () => {
    if (state === "uploading") {
      return "Загрузка...";
    }
    if (state === "processing") {
      if (status === "queued") {
        return "В очереди...";
      }
      if (progress < 30) {
        return "Обработка изображения...";
      }
      if (progress < 70) {
        return "Генерация движения...";
      }
      return "Финализация...";
    }
    if (state === "completed") {
      return "Готово!";
    }
    if (state === "error") {
      return "Ошибка";
    }
    return "";
  };

  const currentProgress = state === "uploading" ? 50 : progress;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      {/* Основная область загрузки */}
      <AnimatePresence mode="wait">
        {state === "idle" && (
          <motion.div
            key="idle"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div
              {...getRootProps()}
              className={cn(
                "border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors",
                isDragActive
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-primary/50"
              )}
            >
              <input {...getInputProps()} />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium mb-2">
                {isDragActive
                  ? "Отпустите файл здесь"
                  : "Загрузите изображение для создания видео"}
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                или нажмите для выбора файла
              </p>
              <Button
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
              >
                Выбрать файл
              </Button>
              <p className="text-xs text-muted-foreground mt-4">
                Поддерживаемые форматы: PNG, JPG, JPEG, WEBP (макс. 10MB)
              </p>
            </div>
          </motion.div>
        )}

        {state === "uploading" && (
          <motion.div
            key="uploading"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Превью изображения */}
                  {previewUrl && (
                    <div className="relative w-full aspect-[9/16] bg-black rounded-lg overflow-hidden">
                      <Image
                        src={previewUrl}
                        alt="Preview"
                        fill
                        className="object-contain"
                      />
                    </div>
                  )}

                  {/* Информация о файле */}
                  {selectedFile && (
                    <div className="text-sm text-muted-foreground">
                      <p className="font-medium text-foreground truncate">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  )}

                  {/* Индикатор загрузки */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">Загрузка...</p>
                    </div>
                    <Progress value={50} className="h-2" />
                  </div>

                  {/* Иконка загрузки */}
                  <div className="flex justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {state === "file-uploaded" && uploadedImageUrl && (
          <motion.div
            key="file-uploaded"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Превью изображения */}
                  {previewUrl && (
                    <div className="relative w-full aspect-[9/16] bg-black rounded-lg overflow-hidden">
                      <Image
                        src={previewUrl}
                        alt="Preview"
                        fill
                        className="object-contain"
                      />
                    </div>
                  )}

                  {/* Информация о файле */}
                  {selectedFile && (
                    <div className="text-sm text-muted-foreground">
                      <p className="font-medium text-foreground truncate">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  )}

                  {/* Кнопка отправки на обработку */}
                  <div className="space-y-2">
                    <Button
                      onClick={handleStartGeneration}
                      disabled={initiateMutation.isPending}
                      className="w-full"
                      size="lg"
                    >
                      {initiateMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Отправка...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Отправить на обработку
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleReset}
                      className="w-full"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Отменить
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {state === "processing" && (
          <motion.div
            key="processing"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Превью изображения */}
                  {previewUrl && (
                    <div className="relative w-full aspect-[9/16] bg-black rounded-lg overflow-hidden">
                      <Image
                        src={previewUrl}
                        alt="Preview"
                        fill
                        className="object-contain"
                      />
                    </div>
                  )}

                  {/* Информация о файле */}
                  {selectedFile && (
                    <div className="text-sm text-muted-foreground">
                      <p className="font-medium text-foreground truncate">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  )}

                  {/* Индикатор прогресса */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{getStatusText()}</p>
                      <p className="text-sm text-muted-foreground">
                        {currentProgress}%
                      </p>
                    </div>
                    <Progress value={currentProgress} className="h-2" />
                  </div>

                  {/* Иконка загрузки */}
                  <div className="flex justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Заблокированная область загрузки */}
            <div className="mt-4 relative">
              <div
                className={cn(
                  "border-2 border-dashed rounded-lg p-12 text-center transition-colors",
                  "border-muted-foreground/10 bg-muted/20 cursor-not-allowed"
                )}
              >
                <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">
                  Обработка файла... Пожалуйста, подождите
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {state === "completed" && videoUrl && (
          <motion.div
            key="completed"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Превью видео */}
                  <div className="relative w-full aspect-[9/16] bg-black rounded-lg overflow-hidden">
                    <video
                      src={videoUrl}
                      className="w-full h-full object-contain"
                      controls
                      preload="metadata"
                    />
                  </div>

                  {/* Информация */}
                  {selectedFile && (
                    <div className="text-sm text-muted-foreground">
                      <p className="font-medium text-foreground truncate">
                        {selectedFile.name}
                      </p>
                    </div>
                  )}

                  {/* Статус готово */}
                  <div className="flex items-center justify-center gap-2 text-green-600">
                    <CheckCircle2 className="w-5 h-5" />
                    <p className="font-medium">Готово!</p>
                  </div>

                  {/* Кнопки действий */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        const link = document.createElement("a");
                        link.href = videoUrl;
                        link.download = `video-${Date.now()}.mp4`;
                        link.click();
                      }}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Скачать видео
                    </Button>
                    {videoId && (
                      <Button
                        variant="default"
                        className="flex-1"
                        onClick={() => {
                          window.location.href = `/videos/${videoId}`;
                        }}
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Просмотреть
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Разблокированная область загрузки */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-4"
            >
              <div
                {...getRootProps()}
                className={cn(
                  "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
                  isDragActive
                    ? "border-primary bg-primary/5"
                    : "border-muted-foreground/25 hover:border-primary/50"
                )}
              >
                <input {...getInputProps()} />
                <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm font-medium mb-1">
                  Загрузить новое изображение
                </p>
                <p className="text-xs text-muted-foreground">
                  или перетащите файл сюда
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}

        {state === "error" && (
          <motion.div
            key="error"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-destructive">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Иконка ошибки */}
                  <div className="flex items-center justify-center gap-2 text-destructive">
                    <XCircle className="w-8 h-8" />
                  </div>

                  {/* Сообщение об ошибке */}
                  <div className="text-center space-y-2">
                    <p className="font-medium">Не удалось обработать файл</p>
                    {errorMessage && (
                      <p className="text-sm text-muted-foreground">
                        {errorMessage}
                      </p>
                    )}
                  </div>

                  {/* Кнопка повтора */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={handleReset}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Отмена
                    </Button>
                    <Button
                      variant="default"
                      className="flex-1"
                      onClick={handleRetry}
                    >
                      Попробовать снова
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Разблокированная область загрузки */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-4"
            >
              <div
                {...getRootProps()}
                className={cn(
                  "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
                  isDragActive
                    ? "border-primary bg-primary/5"
                    : "border-muted-foreground/25 hover:border-primary/50"
                )}
              >
                <input {...getInputProps()} />
                <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm font-medium mb-1">
                  Загрузить новое изображение
                </p>
                <p className="text-xs text-muted-foreground">
                  или перетащите файл сюда
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

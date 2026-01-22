"use client";

import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import NextImage from "next/image";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileUpload as FileUploadUI, GridPattern } from "@/components/ui/file-upload";
import {
  X,
  FileIcon,
  Check,
  Download,
  Share2,
  RotateCcw,
  Crop,
  Loader2,
  Sparkles,
} from "lucide-react";
import Cropper from "react-easy-crop";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useUploadImage } from "@/lib/queries/upload";
import { useInitiateGeneration, useGenerationStatus } from "@/lib/queries/generation";
import { useVibes } from "@/lib/queries/vibes";
import { useAuth } from "@/lib/hooks/useAuth";
import { cn } from "@/lib/utils";
import { Stepper } from "@/components/ui/stepper";

interface FileUploadProps {
  onClose?: () => void;
  defaultChallengeId?: string | null;
}

type AspectRatio = {
  label: string;
  value: number;
};

const ASPECT_RATIOS: AspectRatio[] = [
  { label: "Instagram Post", value: 1 / 1 },
  { label: "Instagram Story", value: 9 / 16 },
  { label: "Facebook Cover", value: 820 / 312 },
  { label: "Twitter Post", value: 16 / 9 },
  { label: "Свободное", value: 0 },
];

export function FileUpload({ onClose, defaultChallengeId }: FileUploadProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  // Cropping state
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [selectedAspect, setSelectedAspect] = useState<number>(1 / 1);
  const [croppedImage, setCroppedImage] = useState<string>("");

  // Upload state
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>("");
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Generation state
  const [jobId, setJobId] = useState<string | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);

  // Challenge state
  const [selectedChallengeId, setSelectedChallengeId] = useState<string | null>(null);

  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadMutation = useUploadImage();
  const initiateMutation = useInitiateGeneration();
  const { data: generationStatus } = useGenerationStatus(jobId);
  const { data: vibesData } = useVibes();
  const vibes = useMemo(() => vibesData?.vibes || [], [vibesData?.vibes]);

  const handleFileSelection = (file: File) => {
    // Блокируем загрузку во время генерации
    if (jobId && generationStatus?.status !== "completed" && generationStatus?.status !== "failed") {
      toast.error("Дождитесь завершения генерации");
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Пожалуйста, выберите изображение");
      return;
    }

    setUploadedFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
      setStep(2);
    };
    reader.readAsDataURL(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelection(files[0]);
    }
  };

  const handleCancel = () => {
    setUploadedFile(null);
    setImagePreview("");
    setStep(1);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setSelectedAspect(1 / 1);
    setCroppedImage("");
    setUploadedImageUrl("");
    setUploadError(null);
    setJobId(null);
    setGenerationError(null);
    setSelectedChallengeId(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Отслеживание статуса генерации
  useEffect(() => {
    if (generationStatus) {
      if (generationStatus.status === "completed" && generationStatus.videoUrl) {
        toast.success("Видео успешно создано!", {
          description: "Ваше видео готово к просмотру",
        });
      } else if (generationStatus.status === "failed") {
        setGenerationError(
          generationStatus.errorMessage || "Не удалось обработать файл"
        );
        toast.error("Ошибка генерации", {
          description: generationStatus.errorMessage || "Попробуйте еще раз",
        });
      }
    }
  }, [generationStatus]);

  // Установка дефолтного вайба при монтировании компонента
  useEffect(() => {
    if (defaultChallengeId && vibes.length > 0) {
      const vibeExists = vibes.some(v => v.id === defaultChallengeId);
      if (vibeExists) {
        setSelectedChallengeId(defaultChallengeId);
      }
    }
  }, [defaultChallengeId, vibes]);

  // Запуск генерации
  const handleStartGeneration = async () => {
    if (!uploadedImageUrl) return;

    try {
      setGenerationError(null);
      const result = await initiateMutation.mutateAsync({
        imageUrl: uploadedImageUrl,
        vibeId: selectedChallengeId || undefined,
        aspectRatio: selectedAspect,
        userId: user?.id,
      });

      setJobId(result.jobId);
      toast.info("Генерация началась", {
        description: "Обработка займет около 30 секунд",
      });
    } catch (error) {
      console.error("Generation error:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Не удалось начать обработку";
      setGenerationError(errorMessage);
      toast.error("Ошибка генерации", {
        description: errorMessage,
      });
    }
  };

  const onCropComplete = useCallback(
    (croppedArea: any, croppedAreaPixels: any) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    [],
  );

  const createCroppedImage = async (): Promise<Blob | null> => {
    if (!croppedAreaPixels || !imagePreview) return null;

    const image = new Image();
    image.src = imagePreview;

    return new Promise<Blob | null>((resolve) => {
      image.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          resolve(null);
          return;
        }

        canvas.width = croppedAreaPixels.width;
        canvas.height = croppedAreaPixels.height;

        ctx.drawImage(
          image,
          croppedAreaPixels.x,
          croppedAreaPixels.y,
          croppedAreaPixels.width,
          croppedAreaPixels.height,
          0,
          0,
          croppedAreaPixels.width,
          croppedAreaPixels.height,
        );

        canvas.toBlob((blob) => {
          resolve(blob);
        }, "image/jpeg", 0.9);
      };
    });
  };

  const handleConfirmCrop = async () => {
    try {
      setUploadError(null);
      setStep(3);

      // Создаем кадрированное изображение
      const croppedBlob = await createCroppedImage();
      if (!croppedBlob) {
        throw new Error("Не удалось создать кадрированное изображение");
      }

      // Конвертируем Blob в File для загрузки
      const croppedFile = new File(
        [croppedBlob],
        uploadedFile?.name || "cropped-image.jpg",
        {
          type: "image/jpeg",
        },
      );

      // Создаем превью кадрированного изображения
      const croppedPreview = URL.createObjectURL(croppedBlob);
      setCroppedImage(croppedPreview);

      // Загружаем кадрированное изображение на сервер
      const result = await uploadMutation.mutateAsync(croppedFile);
      setUploadedImageUrl(result.url);

      toast.success("Изображение успешно загружено!");
    } catch (error) {
      console.error("Upload error:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Не удалось загрузить изображение";
      setUploadError(errorMessage);
      toast.error("Ошибка загрузки", {
        description: errorMessage,
      });
    }
  };

  const handleDownload = () => {
    if (croppedImage) {
      const link = document.createElement("a");
      link.href = croppedImage;
      link.download = "cropped-image.png";
      link.click();
      toast.success("Изображение загружено");
    }
  };

  const handleShare = () => {
    if (uploadedImageUrl) {
      navigator.clipboard.writeText(uploadedImageUrl);
      toast.success("Ссылка скопирована в буфер обмена");
    } else {
      toast.success("Функция «Поделиться» будет доступна скоро");
    }
  };

  const handleRepeat = () => {
    handleCancel();
  };

  const steps = [
    { id: 1, label: "Загрузка", description: "Выберите файл" },
    { id: 2, label: "Кадрирование", description: "Настройте изображение" },
    { id: 3, label: "Обработка", description: "Генерация видео" },
  ];

  return (
    <div className="space-y-6 w-full flex flex-col h-full">
        {/* Stepper */}
        <Stepper steps={steps} currentStep={step} className="mb-4" />
        
        <div className="flex items-center justify-between w-full">
          <h2 className="text-3xl font-bold">
            {step === 1 && "Загрузка файла"}
            {step === 2 && "Кадрирование изображения"}
            {step === 3 && "Обработка"}
          </h2>

          {step === 2 && (
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="lg"
                onClick={handleCancel}
                disabled={!!(jobId && generationStatus?.status !== "completed" && generationStatus?.status !== "failed")}
                className="min-w-[120px]"
              >
                <X className="size-4 mr-2" />
                Отменить
              </Button>
              <Button
                size="lg"
                onClick={handleConfirmCrop}
                disabled={!!(jobId && generationStatus?.status !== "completed" && generationStatus?.status !== "failed")}
                className="min-w-[120px] shadow-md"
              >
                <Check className="size-4 mr-2" />
                Подтвердить
              </Button>
            </div>
          )}

          {step === 3 && uploadMutation.isSuccess && !jobId && (
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={handleCancel}>
                Отменить
              </Button>
              <Button onClick={handleStartGeneration} disabled={initiateMutation.isPending}>
                {initiateMutation.isPending ? (
                  <>
                    <Loader2 className="size-4 mr-2 animate-spin" />
                    Запуск...
                  </>
                ) : (
                  <>
                    <Sparkles className="size-4 mr-2" />
                    Генерировать
                  </>
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Step 1: File Upload */}
        <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="space-y-4 flex-1 flex flex-col w-full">
              <FileUploadUI
                onChange={handleFileSelection}
                onError={(error) => toast.error(error)}
                accept="image/*"
                disabled={!!(jobId && generationStatus?.status !== "completed" && generationStatus?.status !== "failed")}
                file={uploadedFile}
                isDragging={isDragging}
              />

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileInput}
                disabled={!!(jobId && generationStatus?.status !== "completed" && generationStatus?.status !== "failed")}
              />
            </div>
          </motion.div>
        )}

        {/* Step 2: Image Cropping */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="space-y-4">
              {/* Crop Area */}
              <div className="relative h-96 bg-gray-900 rounded-xl overflow-hidden shadow-lg border-2 border-muted">
                {imagePreview && (
                  <Cropper
                    image={imagePreview}
                    crop={crop}
                    zoom={zoom}
                    aspect={selectedAspect || undefined}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={onCropComplete}
                    objectFit="contain"
                  />
                )}
                {/* Overlay с подсказками */}
                <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm text-white px-3 py-2 rounded-lg text-sm z-50 flex items-center gap-2">
                  <Crop className="size-4" />
                  Перетащите изображение для позиционирования
                </div>
              </div>

              {/* Aspect Ratio Buttons */}
              <div className="space-y-3">
                <label className="text-base font-semibold flex items-center gap-2">
                  <Crop className="size-5 text-primary" />
                  Формат кадрирования
                </label>
                <div className="flex flex-wrap gap-2">
                  {ASPECT_RATIOS.map((ratio) => (
                    <Button
                      key={ratio.label}
                      variant={
                        selectedAspect === ratio.value ? "default" : "outline"
                      }
                      size="default"
                      onClick={() => setSelectedAspect(ratio.value)}
                      className={cn(
                        "transition-all duration-200",
                        selectedAspect === ratio.value 
                          ? "shadow-md ring-2 ring-primary ring-offset-2" 
                          : "hover:border-primary/50"
                      )}
                    >
                      {ratio.label}
                    </Button>
                  ))}
                </div>
                {selectedAspect !== 0 && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Check className="size-3" />
                    Выбрано: {ASPECT_RATIOS.find(r => r.value === selectedAspect)?.label}
                  </p>
                )}
              </div>

              {/* Zoom Control */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-base font-semibold">Масштаб</label>
                  <span className="text-sm font-mono bg-primary/10 px-3 py-1 rounded-full text-primary">
                    {zoom.toFixed(1)}x
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="range"
                    min={1}
                    max={3}
                    step={0.1}
                    value={zoom}
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:shadow-lg"
                  />
                  <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                    <span>1x</span>
                    <span>2x</span>
                    <span>3x</span>
                  </div>
                </div>
              </div>
            </div>

          </motion.div>
        )}

        {/* Step 3: Final Upload & Result */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            {uploadMutation.isSuccess && uploadedImageUrl && !jobId && (
              <div className="space-y-2 mb-6">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Sparkles className="size-4" />
                  Выберите челлендж (опционально)
                </label>
                <Select
                  value={selectedChallengeId || "none"}
                  onValueChange={(value) =>
                    setSelectedChallengeId(value === "none" ? null : value)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Без челленджа" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Без вайба</SelectItem>
                    {vibes.map((vibe) => (
                      <SelectItem key={vibe.id} value={vibe.id}>
                        {vibe.title} ({vibe.participantCount} участников)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedChallengeId && (
                  <p className="text-sm text-muted-foreground pl-7">
                    {vibes.find((v) => v.id === selectedChallengeId)?.description}
                  </p>
                )}
              </div>
            )}

            <Card className="p-4 border-0 shadow-none bg-transparent">
              {croppedImage && (
                <div className="relative aspect-square max-w-md mx-auto bg-white rounded-lg overflow-hidden shadow-sm">
                  <NextImage
                    src={croppedImage}
                    alt="Cropped"
                    width={400}
                    height={400}
                    className="w-full h-full object-contain"
                  />
                </div>
              )}
            </Card>

            {uploadMutation.isPending && (
              <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-background shadow-md">
                <div className="p-6">
                  <div className="flex items-center gap-4">
                    <Loader2 className="size-6 animate-spin text-primary flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <p className="font-medium text-lg">Загрузка изображения...</p>
                      <Progress value={50} className="h-2" />
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {uploadError && (
              <Card className="border-2 border-destructive/20 bg-gradient-to-br from-destructive/5 to-background shadow-md">
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-destructive/10 rounded-full">
                      <X className="size-5 text-destructive" />
                    </div>
                    <p className="font-semibold text-lg text-destructive">Ошибка загрузки</p>
                  </div>
                  <p className="text-sm text-muted-foreground pl-11">{uploadError}</p>
                </div>
              </Card>
            )}


            {/* Генерация в процессе */}
            {jobId && generationStatus && generationStatus.status !== "completed" && generationStatus.status !== "failed" && (
              <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-background shadow-lg">
                <div className="p-6 space-y-4">
                  <div className="flex items-center gap-4">
                    <Loader2 className="size-7 animate-spin text-primary flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-semibold text-lg mb-1">
                        {generationStatus.status === "queued" && "В очереди..."}
                        {generationStatus.status === "processing" && "Генерация видео..."}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Это займет около 30 секунд
                      </p>
                    </div>
                  </div>
                  {generationStatus.progress !== undefined && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">Прогресс</span>
                        <span className="font-mono text-primary font-semibold">
                          {generationStatus.progress}%
                        </span>
                      </div>
                      <Progress value={generationStatus.progress} className="h-3 shadow-inner" />
                      <div className="flex gap-3 text-xs">
                        <span className={cn(
                          "transition-colors",
                          generationStatus.progress > 0 ? "text-primary font-medium" : "text-muted-foreground"
                        )}>
                          Загрузка
                        </span>
                        <span className={cn(
                          "transition-colors",
                          generationStatus.progress > 30 ? "text-primary font-medium" : "text-muted-foreground"
                        )}>
                          Обработка
                        </span>
                        <span className={cn(
                          "transition-colors",
                          generationStatus.progress > 70 ? "text-primary font-medium" : "text-muted-foreground"
                        )}>
                          Генерация
                        </span>
                        <span className={cn(
                          "transition-colors",
                          generationStatus.progress === 100 ? "text-primary font-medium" : "text-muted-foreground"
                        )}>
                          Готово
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Генерация завершена успешно */}
            {generationStatus?.status === "completed" && generationStatus.videoUrl && (
              <Card className="border-2 border-green-500/20 bg-gradient-to-br from-green-50 to-background dark:from-green-950/20 shadow-lg animate-in fade-in duration-500">
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-500/10 rounded-full animate-pulse">
                        <Check className="size-7 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-xl text-green-700 dark:text-green-400">
                          Видео успешно создано!
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Готово к скачиванию и просмотру
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={handleRepeat}>
                        <RotateCcw className="size-4 mr-2" />
                        Повторить
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => {
                        if (generationStatus.videoUrl) {
                          const link = document.createElement("a");
                          link.href = generationStatus.videoUrl;
                          link.download = `video-${Date.now()}.mp4`;
                          link.click();
                          toast.success("Видео скачано");
                        }
                      }}>
                        <Download className="size-4 mr-2" />
                        Скачать
                      </Button>
                      <Button size="sm" onClick={() => {
                        if (generationStatus.videoUrl) {
                          navigator.clipboard.writeText(generationStatus.videoUrl);
                          toast.success("Ссылка скопирована в буфер обмена");
                        }
                      }}>
                        <Share2 className="size-4 mr-2" />
                        Поделиться
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Ошибка генерации */}
            {generationError && (
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-center gap-2 text-red-700">
                  <X className="size-5" />
                  <p className="font-medium">Ошибка генерации</p>
                </div>
                <p className="text-sm text-red-600 mt-2">{generationError}</p>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-6 border-t border-border">
              {uploadMutation.isPending && (
                <Button variant="outline" onClick={handleCancel} disabled>
                  Отменить
                </Button>
              )}

              {/* Во время генерации */}
              {jobId && generationStatus && generationStatus.status !== "completed" && generationStatus.status !== "failed" && (
                <Button variant="outline" onClick={handleCancel} disabled>
                  Отменить
                </Button>
              )}


              {/* Ошибка генерации */}
              {generationError && (
                <>
                  <Button variant="outline" onClick={handleCancel}>
                    Отменить
                  </Button>
                  <Button onClick={handleStartGeneration}>
                    Попробовать снова
                  </Button>
                </>
              )}

              {/* Ошибка загрузки */}
              {uploadError && (
                <>
                  <Button variant="outline" onClick={handleCancel}>
                    Отменить
                  </Button>
                  <Button onClick={handleConfirmCrop}>Повторить</Button>
                </>
              )}
            </div>
          </motion.div>
        )}
        </AnimatePresence>
    </div>
  );
}

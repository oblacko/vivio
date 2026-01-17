"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import NextImage from "next/image";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  X,
  Upload,
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
import { useUploadImage } from "@/lib/queries/upload";
import { useInitiateGeneration, useGenerationStatus } from "@/lib/queries/generation";
import { useChallenges } from "@/lib/queries/challenges";

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

  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadMutation = useUploadImage();
  const initiateMutation = useInitiateGeneration();
  const { data: generationStatus } = useGenerationStatus(jobId);
  const { data: challenges = [] } = useChallenges();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelection(files[0]);
    }
  };

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

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
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

  // Установка дефолтного челленджа при монтировании компонента
  useEffect(() => {
    if (defaultChallengeId && challenges.length > 0) {
      const challengeExists = challenges.some(c => c.id === defaultChallengeId);
      if (challengeExists) {
        setSelectedChallengeId(defaultChallengeId);
      }
    }
  }, [defaultChallengeId, challenges]);

  // Запуск генерации
  const handleStartGeneration = async () => {
    if (!uploadedImageUrl) return;

    try {
      setGenerationError(null);
      const result = await initiateMutation.mutateAsync({
        imageUrl: uploadedImageUrl,
        challengeId: selectedChallengeId || undefined,
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

  return (
    <div className="space-y-4 max-w-[980px] mx-auto flex flex-col h-full">
        <h2 className="text-2xl font-semibold">
          {step === 1 && "Загрузка файла"}
          {step === 2 && "Кадрирование изображения"}
          {step === 3 && "Обработка"}
        </h2>

        {/* Step 1: File Upload */}
        {step === 1 && (
          <>
            <div className="space-y-4 flex-1 flex flex-col w-full">
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`
                  border-2 border-dashed rounded-lg p-8 text-center transition-colors flex flex-col items-center justify-center min-h-[400px] w-full self-stretch
                  ${
                    jobId && generationStatus?.status !== "completed" && generationStatus?.status !== "failed"
                      ? "border-gray-200 bg-gray-50 cursor-not-allowed opacity-50"
                      : isDragging
                      ? "border-blue-500 bg-blue-50 cursor-pointer"
                      : "border-gray-300 hover:border-gray-400 cursor-pointer"
                  }
                `}
              onClick={
                jobId && generationStatus?.status !== "completed" && generationStatus?.status !== "failed"
                  ? undefined
                  : handleBrowseClick
              }
            >
              <Upload
                className={`size-12 mx-auto mb-4 ${isDragging ? "text-blue-500" : "text-gray-400"}`}
              />

              <p className="text-lg mb-2">
                {isDragging
                  ? "Отпустите файл для загрузки"
                  : "Перетащите файл сюда"}
              </p>
              <p className="text-sm text-gray-500 mb-4">или</p>
              <Button
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  if (!(jobId && generationStatus?.status !== "completed" && generationStatus?.status !== "failed")) {
                    handleBrowseClick();
                  }
                }}
                disabled={!!(jobId && generationStatus?.status !== "completed" && generationStatus?.status !== "failed")}
              >
                Выбрать файл
              </Button>
            </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileInput}
                disabled={!!(jobId && generationStatus?.status !== "completed" && generationStatus?.status !== "failed")}
              />

              {uploadedFile && (
                <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileIcon className="size-8 text-blue-500" />
                      <div>
                        <p className="font-medium">{uploadedFile.name}</p>
                        <p className="text-sm text-gray-500">
                          {(uploadedFile.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Step 2: Image Cropping */}
        {step === 2 && (
          <>
            <div className="space-y-4">
              {/* Crop Area */}
              <div className="relative h-96 bg-gray-900 rounded-lg overflow-hidden">
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
              </div>

              {/* Aspect Ratio Buttons */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Crop className="size-4" />
                  Формат кадрирования
                </label>
                <div className="flex flex-wrap gap-2">
                  {ASPECT_RATIOS.map((ratio) => (
                    <Button
                      key={ratio.label}
                      variant={
                        selectedAspect === ratio.value ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => setSelectedAspect(ratio.value)}
                    >
                      {ratio.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Zoom Control */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Масштаб: {zoom.toFixed(1)}x
                </label>
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.1}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={!!(jobId && generationStatus?.status !== "completed" && generationStatus?.status !== "failed")}
              >
                Отменить
              </Button>
              <Button
                onClick={handleConfirmCrop}
                disabled={!!(jobId && generationStatus?.status !== "completed" && generationStatus?.status !== "failed")}
              >
                Подтвердить
              </Button>
            </div>
          </>
        )}

        {/* Step 3: Final Upload & Result */}
        {step === 3 && (
          <>
            <Card className="p-4 bg-gray-50">
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
              <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="size-5 animate-spin text-blue-500" />
                    <p className="text-sm text-gray-600">
                      Загрузка изображения...
                    </p>
                  </div>
                </div>
              </div>
            )}

            {uploadError && (
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-center gap-2 text-red-700">
                  <X className="size-5" />
                  <p className="font-medium">Ошибка загрузки</p>
                </div>
                <p className="text-sm text-red-600 mt-2">{uploadError}</p>
              </div>
            )}

            {uploadMutation.isSuccess && uploadedImageUrl && !jobId && (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 text-green-700">
                    <Check className="size-5" />
                    <p className="font-medium">
                      Изображение успешно загружено!
                    </p>
                  </div>
                </div>

                {/* Выбор челленджа */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Sparkles className="size-4" />
                    Выберите челлендж (опционально)
                  </label>
                  <Select 
                    value={selectedChallengeId || "none"} 
                    onValueChange={(value) => setSelectedChallengeId(value === "none" ? null : value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Без челленджа" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Без челленджа</SelectItem>
                      {challenges.map((challenge) => (
                        <SelectItem key={challenge.id} value={challenge.id}>
                          {challenge.title} ({challenge.participantCount} участников)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedChallengeId && (
                    <p className="text-xs text-gray-500">
                      {challenges.find(c => c.id === selectedChallengeId)?.description}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Генерация в процессе */}
            {jobId && generationStatus && generationStatus.status !== "completed" && generationStatus.status !== "failed" && (
              <div className="space-y-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 text-blue-700">
                  <Loader2 className="size-5 animate-spin" />
                  <p className="font-medium">
                    {generationStatus.status === "queued" && "В очереди..."}
                    {generationStatus.status === "processing" && "Генерация видео..."}
                  </p>
                </div>
                {generationStatus.progress !== undefined && (
                  <div className="space-y-2">
                    <Progress value={generationStatus.progress} className="h-2" />
                    <p className="text-sm text-blue-600 text-center">
                      {generationStatus.progress}%
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Генерация завершена успешно */}
            {generationStatus?.status === "completed" && generationStatus.videoUrl && (
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 text-green-700">
                  <Check className="size-5" />
                  <p className="font-medium">
                    Видео успешно создано!
                  </p>
                </div>
              </div>
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

            <div className="flex justify-end gap-3 pt-4">
              {uploadMutation.isPending && (
                <Button variant="outline" onClick={handleCancel} disabled>
                  Отменить
                </Button>
              )}

              {/* После успешной загрузки - кнопка Генерировать */}
              {uploadMutation.isSuccess && !jobId && (
                <>
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
                </>
              )}

              {/* Во время генерации */}
              {jobId && generationStatus && generationStatus.status !== "completed" && generationStatus.status !== "failed" && (
                <Button variant="outline" onClick={handleCancel} disabled>
                  Отменить
                </Button>
              )}

              {/* После успешной генерации */}
              {generationStatus?.status === "completed" && generationStatus.videoUrl && (
                <>
                  <Button variant="outline" onClick={handleRepeat}>
                    <RotateCcw className="size-4 mr-2" />
                    Повторить
                  </Button>
                  <Button variant="outline" onClick={() => {
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
                  <Button onClick={() => {
                    if (generationStatus.videoUrl) {
                      navigator.clipboard.writeText(generationStatus.videoUrl);
                      toast.success("Ссылка скопирована в буфер обмена");
                    }
                  }}>
                    <Share2 className="size-4 mr-2" />
                    Поделиться
                  </Button>
                </>
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
          </>
        )}
    </div>
  );
}

"use client";

import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import NextImage from "next/image";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileUpload as FileUploadUI } from "@/components/ui/file-upload";
import {
  X,
  Download,
  Share2,
  RotateCcw,
  Crop,
  Loader2,
  Sparkles,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import Cropper from "react-easy-crop";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useUploadImage } from "@/lib/queries/upload";
import { useInitiateGeneration, useGenerationStatus } from "@/lib/queries/generation";
import { useVibes } from "@/lib/queries/vibes";
import { useAuth } from "@/lib/hooks/useAuth";
import { cn } from "@/lib/utils";
import { optimizeImage } from "@/lib/image/optimizeImage";

interface FileUploadProps {
  onClose?: () => void;
  defaultChallengeId?: string | null;
}

type AspectRatio = {
  label: string;
  value: number;
};

const ASPECT_RATIOS: AspectRatio[] = [
  { label: "2:3", value: 2 / 3 },
  { label: "3:2", value: 3 / 2 },
  { label: "1:1", value: 1 / 1 },
  { label: "9:16", value: 9 / 16 },
  { label: "16:9", value: 16 / 9 },
];

export function FileUpload({ onClose, defaultChallengeId }: FileUploadProps) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [showCropper, setShowCropper] = useState(false);

  // Cropping state
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [selectedAspect, setSelectedAspect] = useState<number>(2 / 3);

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
  const { data: vibesData, isLoading: vibesLoading, error: vibesError } = useVibes();
  const vibes = useMemo(() => vibesData?.vibes || [], [vibesData?.vibes]);

  const isGenerating = jobId && generationStatus?.status !== "completed" && generationStatus?.status !== "failed";
  const isCompleted = generationStatus?.status === "completed" && generationStatus?.videoUrl;

  const handleFileSelection = async (file: File) => {
    if (isGenerating) {
      toast.error("Дождитесь завершения генерации");
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Пожалуйста, выберите изображение");
      return;
    }

    try {
      toast.info("Оптимизация изображения...");
      const optimizedFile = await optimizeImage(file, 1080);
      
      setUploadedFile(optimizedFile);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
        setShowCropper(true);
        toast.success("Готово к кадрированию");
      };
      reader.readAsDataURL(optimizedFile);
    } catch (error) {
      console.error("Image optimization error:", error);
      setUploadedFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
        setShowCropper(true);
      };
      reader.readAsDataURL(file);
    }
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
    setShowCropper(false);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setSelectedAspect(2 / 3);
    setUploadedImageUrl("");
    setUploadError(null);
    setJobId(null);
    setGenerationError(null);
    setSelectedChallengeId(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  useEffect(() => {
    if (generationStatus) {
      console.log("📹 Generation Status:", generationStatus);
      if (generationStatus.status === "completed" && generationStatus.videoUrl) {
        toast.success("Видео готово!");
      } else if (generationStatus.status === "failed") {
        setGenerationError(generationStatus.errorMessage || "Ошибка генерации");
        toast.error("Ошибка генерации");
      }
    }
  }, [generationStatus]);

  useEffect(() => {
    if (defaultChallengeId && vibes.length > 0) {
      const vibeExists = vibes.some(v => v.id === defaultChallengeId);
      if (vibeExists) {
        setSelectedChallengeId(defaultChallengeId);
      }
    }
  }, [defaultChallengeId, vibes]);

  const handleStartGeneration = async () => {
    if (!uploadedImageUrl) {
      toast.error("Сначала загрузите изображение");
      return;
    }

    try {
      setGenerationError(null);
      const result = await initiateMutation.mutateAsync({
        imageUrl: uploadedImageUrl,
        vibeId: selectedChallengeId || undefined,
        aspectRatio: selectedAspect,
        userId: user?.id,
      });

      setJobId(result.jobId);
      toast.info("Генерация началась");
    } catch (error) {
      console.error("Generation error:", error);
      const errorMessage = error instanceof Error ? error.message : "Ошибка";
      setGenerationError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

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

  const handleApplyCrop = async () => {
    try {
      setUploadError(null);
      toast.info("Загрузка...");

      const croppedBlob = await createCroppedImage();
      if (!croppedBlob) {
        throw new Error("Ошибка кадрирования");
      }

      const croppedFile = new File(
        [croppedBlob],
        uploadedFile?.name || "image.jpg",
        { type: "image/jpeg" }
      );

      const result = await uploadMutation.mutateAsync(croppedFile);
      setUploadedImageUrl(result.url);
      setShowCropper(false);
      toast.success("Изображение загружено!");
    } catch (error) {
      console.error("Upload error:", error);
      const errorMessage = error instanceof Error ? error.message : "Ошибка загрузки";
      setUploadError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleRepeat = async () => {
    if (!uploadedImageUrl) return;

    try {
      setGenerationError(null);
      setJobId(null);
      
      const result = await initiateMutation.mutateAsync({
        imageUrl: uploadedImageUrl,
        vibeId: selectedChallengeId || undefined,
        aspectRatio: selectedAspect,
        userId: user?.id,
      });

      setJobId(result.jobId);
      toast.success("Новая генерация началась");
    } catch (error) {
      console.error("Repeat error:", error);
      toast.error("Ошибка повтора");
    }
  };

  return (
    <div className="w-full h-full flex flex-col gap-3 md:gap-4">
      {/* Компактный Header с Вайбом */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-stretch sm:items-center">
        <div className="flex-1">
          <Select
            value={selectedChallengeId || "none"}
            onValueChange={(value) => setSelectedChallengeId(value === "none" ? null : value)}
          >
            <SelectTrigger className="h-9 text-sm">
              <div className="flex items-center gap-2">
                <Sparkles className="size-3 text-primary" />
                <SelectValue placeholder="Вайб" />
              </div>
            </SelectTrigger>
            <SelectContent 
              position="popper" 
              className="z-[10000] max-h-[200px]"
              sideOffset={4}
            >
              <SelectItem value="none">Без вайба</SelectItem>
              {vibesLoading ? (
                <SelectItem value="loading" disabled>
                  Загрузка вайбов...
                </SelectItem>
              ) : vibesError ? (
                <SelectItem value="error" disabled>
                  Ошибка загрузки
                </SelectItem>
              ) : vibes.length === 0 ? (
                <SelectItem value="empty" disabled>
                  Нет доступных вайбов
                </SelectItem>
              ) : (
                vibes.map((vibe) => (
                  <SelectItem key={vibe.id} value={vibe.id}>
                    {vibe.title}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        {uploadedImageUrl && !isGenerating && !isCompleted && (
          <Button size="sm" onClick={handleStartGeneration} disabled={initiateMutation.isPending}>
            {initiateMutation.isPending ? (
              <><Loader2 className="size-3 mr-1 animate-spin" /> Запуск</>
            ) : (
              <><Sparkles className="size-3 mr-1" /> Генерировать</>
            )}
          </Button>
        )}

        {(showCropper || uploadedImageUrl || isGenerating || isCompleted) && (
          <Button size="sm" variant="outline" onClick={handleCancel}>
            <X className="size-3 mr-1" /> Сбросить
          </Button>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-0">
        <AnimatePresence mode="wait">
          {/* Dropzone */}
          {!imagePreview && (
            <motion.div
              key="dropzone"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1"
            >
              <FileUploadUI
                onChange={handleFileSelection}
                onError={(error) => toast.error(error)}
                accept="image/*"
                disabled={!!isGenerating}
                file={uploadedFile}
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileInput}
                disabled={!!isGenerating}
              />
            </motion.div>
          )}

          {/* Cropper */}
          {showCropper && imagePreview && (
            <motion.div
              key="cropper"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-3"
            >
              {/* Crop Area */}
              <div className="relative h-[50vh] md:h-[60vh] bg-black rounded-lg overflow-hidden">
                <Cropper
                  image={imagePreview}
                  crop={crop}
                  zoom={zoom}
                  aspect={selectedAspect}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                  objectFit="contain"
                />
              </div>

              {/* Compact Controls */}
              <div className="flex flex-col gap-2">
                {/* Aspect Ratios */}
                <div className="flex gap-1 overflow-x-auto pb-1">
                  {ASPECT_RATIOS.map((ratio) => (
                    <Button
                      key={ratio.label}
                      variant={selectedAspect === ratio.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedAspect(ratio.value)}
                      className="h-7 px-3 text-xs flex-shrink-0"
                    >
                      {ratio.label}
                    </Button>
                  ))}
                </div>

                {/* Zoom */}
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 w-7 p-0"
                    onClick={() => setZoom(Math.max(1, zoom - 0.1))}
                  >
                    <ZoomOut className="size-3" />
                  </Button>
                  <input
                    type="range"
                    min={1}
                    max={3}
                    step={0.1}
                    value={zoom}
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="flex-1 h-1 bg-muted rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 w-7 p-0"
                    onClick={() => setZoom(Math.min(3, zoom + 0.1))}
                  >
                    <ZoomIn className="size-3" />
                  </Button>
                  <span className="text-xs font-mono w-10 text-right">{zoom.toFixed(1)}x</span>
                </div>

                {/* Apply Button */}
                <Button onClick={handleApplyCrop} disabled={uploadMutation.isPending} className="w-full h-9">
                  {uploadMutation.isPending ? (
                    <><Loader2 className="size-4 mr-2 animate-spin" /> Загрузка...</>
                  ) : (
                    <><Crop className="size-4 mr-2" /> Применить</>
                  )}
                </Button>
              </div>
            </motion.div>
          )}

          {/* Preview with Progress */}
          {uploadedImageUrl && !showCropper && (
            <motion.div
              key="preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-3"
            >
              {/* Image with Progress Overlay */}
              <div className="relative h-[50vh] md:h-[60vh] bg-black rounded-lg overflow-hidden">
                {/* Progress Bar - тонкая полоска сверху */}
                {isGenerating && generationStatus && (
                  <div className="absolute top-0 left-0 right-0 z-10">
                    <Progress 
                      value={generationStatus.progress || 0} 
                      className="h-1 rounded-none"
                    />
                  </div>
                )}

                {/* Видео или изображение */}
                {isCompleted ? (
                  <video
                    src={generationStatus!.videoUrl}
                    controls
                    autoPlay
                    loop
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <NextImage
                    src={uploadedImageUrl}
                    alt="Preview"
                    fill
                    className="object-contain"
                  />
                )}

                {/* Generating Overlay */}
                {isGenerating && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                    <div className="text-center text-white space-y-2">
                      <Loader2 className="size-8 animate-spin mx-auto" />
                      <p className="text-sm font-medium">
                        {generationStatus?.status === "queued" && "В очереди..."}
                        {generationStatus?.status === "processing" && "Генерация..."}
                      </p>
                      {generationStatus?.progress !== undefined && (
                        <p className="text-xs opacity-75">{generationStatus.progress}%</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Success Actions */}
              {isCompleted && (
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={handleRepeat} className="flex-1">
                    <RotateCcw className="size-3 mr-1" /> Повторить
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const link = document.createElement("a");
                      link.href = generationStatus!.videoUrl!;
                      link.download = `video-${Date.now()}.mp4`;
                      link.click();
                      toast.success("Скачивание...");
                    }}
                    className="flex-1"
                  >
                    <Download className="size-3 mr-1" /> Скачать
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(generationStatus!.videoUrl!);
                      toast.success("Ссылка скопирована");
                    }}
                    className="flex-1"
                  >
                    <Share2 className="size-3 mr-1" /> Поделиться
                  </Button>
                </div>
              )}

              {/* Error */}
              {(generationError || uploadError) && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
                  {generationError || uploadError}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

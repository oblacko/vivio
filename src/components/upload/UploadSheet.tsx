"use client";

import { useState, useCallback, useRef } from "react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X, Crop } from "lucide-react";
import { useUploadImage } from "@/lib/queries/upload";
import { useDropzone } from "react-dropzone";
import Cropper, { Area } from "react-easy-crop";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface UploadSheetProps {
  onUploadComplete: (imageUrl: string) => void;
  trigger?: React.ReactNode;
  challengeId?: string;
}

export function UploadSheet({
  onUploadComplete,
  trigger,
  challengeId,
}: UploadSheetProps) {
  const [open, setOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showCrop, setShowCrop] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadMutation = useUploadImage();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setShowCrop(true);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".webp"],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false,
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setShowCrop(true);
    }
  };

  const onCropComplete = useCallback(
    (croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const createCroppedImage = async (): Promise<Blob> => {
    if (!previewUrl || !croppedAreaPixels) {
      throw new Error("No image or crop area");
    }

    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = document.createElement("img");
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = previewUrl;
    });

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("Failed to get canvas context");
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
      croppedAreaPixels.height
    );

    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Failed to create blob"));
          }
        },
        "image/jpeg",
        0.9
      );
    });
  };

  const handleUpload = async () => {
    if (!selectedFile || !croppedAreaPixels) return;

    try {
      let fileToUpload = selectedFile;

      // Если было кадрирование, создаем обрезанное изображение
      if (showCrop && croppedAreaPixels) {
        const croppedBlob = await createCroppedImage();
        fileToUpload = new File([croppedBlob], selectedFile.name, {
          type: "image/jpeg",
        });
      }

      const result = await uploadMutation.mutateAsync(fileToUpload);
      onUploadComplete(result.url);
      setOpen(false);
      reset();
    } catch (error) {
      console.error("Upload error:", error);
    }
  };

  const reset = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setShowCrop(false);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
  };

  const handleClose = () => {
    reset();
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {trigger && <SheetTrigger asChild>{trigger}</SheetTrigger>}
      <SheetContent side="bottom" className="h-[90vh]">
        <SheetHeader>
          <SheetTitle>Загрузить изображение</SheetTitle>
          <SheetDescription>
            Выберите изображение для генерации видео (макс. 10MB)
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {!previewUrl ? (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25"
              }`}
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
                  : "Перетащите изображение сюда"}
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                или нажмите для выбора файла
              </p>
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                Выбрать файл
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {showCrop ? (
                <div className="relative w-full h-[400px] bg-black rounded-lg overflow-hidden">
                  <Cropper
                    image={previewUrl}
                    crop={crop}
                    zoom={zoom}
                    aspect={9 / 16}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={onCropComplete}
                    cropShape="rect"
                    showGrid={false}
                  />
                </div>
              ) : (
                <div className="relative w-full aspect-[9/16] bg-black rounded-lg overflow-hidden">
                  <Image
                    src={previewUrl}
                    alt="Preview"
                    fill
                    className="object-contain"
                  />
                </div>
              )}

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCrop(!showCrop);
                  }}
                >
                  <Crop className="w-4 h-4 mr-2" />
                  {showCrop ? "Отменить кадрирование" : "Кадрировать"}
                </Button>

                <Button variant="outline" onClick={reset}>
                  <X className="w-4 h-4 mr-2" />
                  Удалить
                </Button>
              </div>

              <Button
                onClick={handleUpload}
                disabled={uploadMutation.isPending}
                className="w-full"
              >
                {uploadMutation.isPending ? "Загрузка..." : "Загрузить"}
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

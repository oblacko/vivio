import { cn } from "@/lib/utils";
import React, { useRef } from "react";
import { motion } from "framer-motion";
import { IconUpload } from "@tabler/icons-react";
import { useDropzone } from "react-dropzone";
import { Badge } from "@/components/ui/badge";

const mainVariant = {
  initial: {
    x: 0,
    y: 0,
  },
  animate: {
    x: 20,
    y: -20,
    opacity: 0.9,
  },
};

const secondaryVariant = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
  },
};

interface FileUploadProps {
  onChange?: (file: File) => void;
  onError?: (error: string) => void;
  accept?: string;
  disabled?: boolean;
  file?: File | null;
  isDragging?: boolean;
}

export const FileUpload = ({
  onChange,
  onError,
  accept = "image/*",
  disabled = false,
  file = null,
  isDragging: externalIsDragging,
}: FileUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (newFiles: File[]) => {
    if (disabled) return;
    
    const selectedFile = newFiles[0];
    if (!selectedFile) return;

    // Validate file type
    if (!selectedFile.type.startsWith("image/")) {
      onError?.("Пожалуйста, выберите изображение");
      return;
    }

    onChange?.(selectedFile);
  };

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  const { getRootProps, isDragActive } = useDropzone({
    multiple: false,
    noClick: true,
    onDrop: handleFileChange,
    onDropRejected: (fileRejections) => {
      onError?.("Файл не подходит по требованиям");
    },
    accept: accept ? { [accept]: [] } : undefined,
    disabled,
  });

  const currentIsDragging = externalIsDragging ?? isDragActive;

  return (
    <div className="w-full h-full" {...getRootProps()}>
      <motion.div
        onClick={handleClick}
        whileHover={!disabled ? { scale: 1.01 } : {}}
        transition={{ duration: 0.2 }}
        className={cn(
          "p-10 group/file block rounded-xl w-full h-full relative overflow-hidden transition-all duration-500",
          disabled 
            ? "bg-muted/30 cursor-not-allowed opacity-50 border-2 border-dashed border-muted"
            : currentIsDragging
            ? "border-2 border-dashed border-primary bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 cursor-pointer shadow-lg animate-pulse"
            : "cursor-pointer bg-gradient-to-br from-primary/10 via-background to-primary/5 border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 hover:shadow-md hover:from-primary/15 hover:to-primary/8"
        )}
      >
        <input
          ref={fileInputRef}
          id="file-upload-handle"
          type="file"
          onChange={(e) => handleFileChange(Array.from(e.target.files || []))}
          className="hidden"
          accept={accept}
          disabled={disabled}
        />
        <div className="flex flex-col items-center justify-center h-full">
          <div className="relative w-full max-w-xl mx-auto">
            {file ? (
              <motion.div
                key="file-info"
                layoutId="file-upload"
                className={cn(
                  "relative overflow-hidden z-40 bg-gray-50 dark:bg-neutral-800 flex flex-col items-start justify-start p-4 w-full mx-auto rounded-md",
                  "shadow-sm border border-gray-200 dark:border-neutral-700"
                )}
              >
                <div className="flex justify-between w-full items-center gap-4">
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    layout
                    className="text-base text-gray-700 dark:text-gray-300 truncate max-w-xs"
                  >
                    {file.name}
                  </motion.p>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    layout
                    className="rounded-lg px-2 py-1 w-fit flex-shrink-0 text-sm text-gray-600 dark:bg-neutral-700 dark:text-white"
                  >
                    {(file.size / 1024).toFixed(2)} KB
                  </motion.p>
                </div>
              </motion.div>
            ) : (
              <>
                <motion.div
                  layoutId="file-upload"
                  variants={mainVariant}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 20,
                  }}
                  className={cn(
                    "relative group-hover/file:shadow-2xl z-40 bg-white dark:bg-neutral-900 flex items-center justify-center h-32 w-full max-w-[8rem] mx-auto rounded-md",
                    "shadow-[0px_10px_50px_rgba(0,0,0,0.1)]"
                  )}
                >
                  {currentIsDragging ? (
                    <motion.p
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-primary flex flex-col items-center text-base font-medium"
                    >
                      Отпустите файл
                      <IconUpload className="h-6 w-6 mt-2" />
                    </motion.p>
                  ) : (
                    <IconUpload className="h-8 w-8 text-primary" />
                  )}
                </motion.div>

                {!currentIsDragging && (
                  <motion.div
                    variants={secondaryVariant}
                    className="absolute opacity-0 border border-dashed border-sky-400 inset-0 z-30 bg-transparent flex items-center justify-center h-32 w-full max-w-[8rem] mx-auto rounded-md"
                  ></motion.div>
                )}
              </>
            )}
          </div>
          
          <div className="relative z-20 mt-8 text-center">
            <motion.h3 
              className="text-2xl mb-3 font-semibold"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              {currentIsDragging
                ? "Отпустите файл для загрузки"
                : file 
                ? "Файл выбран"
                : "Загрузите изображение"}
            </motion.h3>
            {!file && (
              <>
                <motion.p 
                  className="text-sm text-muted-foreground mb-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  Перетащите файл сюда или выберите с устройства
                </motion.p>
                <motion.button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClick();
                  }}
                  disabled={disabled}
                  whileHover={!disabled ? { scale: 1.05 } : {}}
                  whileTap={!disabled ? { scale: 0.95 } : {}}
                  className={cn(
                    "px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                    disabled
                      ? "bg-muted text-muted-foreground cursor-not-allowed"
                      : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-lg"
                  )}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  Выбрать файл
                </motion.button>
                <motion.div 
                  className="flex gap-2 mt-6 justify-center flex-wrap"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <Badge variant="outline" className="text-xs">PNG</Badge>
                  <Badge variant="outline" className="text-xs">JPG</Badge>
                  <Badge variant="outline" className="text-xs">JPEG</Badge>
                  <Badge variant="outline" className="text-xs">WEBP</Badge>
                </motion.div>
                <motion.p 
                  className="text-xs text-muted-foreground mt-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  Максимальный размер файла: 10MB
                </motion.p>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};


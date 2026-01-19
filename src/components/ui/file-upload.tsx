import { cn } from "@/lib/utils";
import React, { useRef } from "react";
import { motion } from "framer-motion";
import { IconUpload } from "@tabler/icons-react";
import { useDropzone } from "react-dropzone";

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
        className={cn(
          "p-8 group/file block rounded-lg w-full h-full relative overflow-hidden",
          disabled 
            ? "bg-gray-50 cursor-not-allowed opacity-50"
            : currentIsDragging
            ? "border-2 border-dashed border-blue-500 bg-blue-50 cursor-pointer"
            : "cursor-pointer"
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
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-blue-600 dark:text-blue-400 flex flex-col items-center text-sm"
                    >
                      Отпустите файл
                      <IconUpload className="h-4 w-4 mt-1" />
                    </motion.p>
                  ) : (
                    <IconUpload className="h-5 w-5 text-gray-400 dark:text-neutral-400" />
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
          
          <div className="relative z-20 mt-6 text-center">
            <p className="text-lg mb-2 font-medium text-gray-700 dark:text-gray-300">
              {currentIsDragging
                ? "Отпустите файл для загрузки"
                : file 
                ? "Файл выбран"
                : "Перетащите файл сюда"}
            </p>
            {!file && (
              <>
                <p className="text-sm text-gray-500 mb-4">или</p>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClick();
                  }}
                  disabled={disabled}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Выбрать файл
                </button>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export function GridPattern() {
  const columns = 41;
  const rows = 25;
  return (
    <div className="flex bg-gray-100 dark:bg-neutral-900 flex-shrink-0 flex-wrap justify-center items-center gap-x-px gap-y-px scale-105">
      {Array.from({ length: rows }).map((_, row) =>
        Array.from({ length: columns }).map((_, col) => {
          const isEven = (row + col) % 2 === 0;
          return (
            <div
              key={`${col}-${row}`}
              className={`w-10 h-10 flex flex-shrink-0 rounded-[2px] ${
                isEven
                  ? "bg-gray-50 dark:bg-neutral-950"
                  : "bg-gray-50 dark:bg-neutral-950 shadow-[0px_0px_1px_3px_rgba(255,255,255,1)_inset] dark:shadow-[0px_0px_1px_3px_rgba(0,0,0,1)_inset]"
              }`}
            />
          );
        })
      )}
    </div>
  );
}

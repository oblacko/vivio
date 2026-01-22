"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import { FileUpload } from "./FileUpload";
import { Plus } from "lucide-react";
import { useUpload } from "@/lib/contexts/upload-context";
import { useAuth } from "@/lib/hooks/useAuth";
import { usePathname } from "next/navigation";

export default function FloatingUploadButton() {
  const { isOpen, openUpload, closeUpload } = useUpload();
  const { isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();

  const handleClick = () => {
    openUpload();
  };

  if (isLoading) {
    return null;
  }

  // Скрываем кнопку для неавторизованных пользователей
  if (!isAuthenticated) {
    return null;
  }

  // Скрываем кнопку в админ панели
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <>
      {!isOpen && (
        <Button
          size="icon"
          onClick={handleClick}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all z-50"
          aria-label="Загрузить файл"
        >
          <Plus className="h-6 w-6" />
        </Button>
      )}
      
      <Sheet open={isOpen} onOpenChange={(open) => open ? openUpload() : closeUpload()}>
          <SheetContent 
            side="bottom" 
            className="h-[95vh] max-h-screen overflow-y-auto p-0 flex flex-col"
          >
            {/* Скрытый заголовок для доступности */}
            <SheetTitle className="sr-only">Создание видео</SheetTitle>
            
            {/* Градиентный фон */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-purple-500/5 to-pink-500/5 pointer-events-none" />
            
            <div className="p-4 md:p-6 flex-1 flex flex-col relative z-10">
              <FileUpload onClose={closeUpload} />
            </div>
          </SheetContent>
        </Sheet>
    </>
  );
}

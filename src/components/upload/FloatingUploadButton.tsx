"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FileUpload } from "./FileUpload";
import { Plus, LogIn, Lock } from "lucide-react";
import { useUpload } from "@/lib/contexts/upload-context";
import { useAuth } from "@/lib/hooks/useAuth";
import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

export function FloatingUploadButton() {
  const { isOpen, openUpload, closeUpload } = useUpload();
  const { isAuthenticated, isLoading } = useAuth();
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const pathname = usePathname();

  const handleClick = () => {
    if (!isAuthenticated) {
      setShowAuthDialog(true);
    } else {
      openUpload();
    }
  };

  if (isLoading) {
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
      
      {isAuthenticated && (
        <Sheet open={isOpen} onOpenChange={(open) => open ? openUpload() : closeUpload()}>
          <SheetContent 
            side="bottom" 
            className="h-[90vh] overflow-y-auto p-0 flex flex-col"
          >
            <div className="p-6 flex-1 flex flex-col">
              <FileUpload onClose={closeUpload} />
            </div>
          </SheetContent>
        </Sheet>
      )}

      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent>
          <DialogHeader>
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <DialogTitle className="text-center">Требуется авторизация</DialogTitle>
            <DialogDescription className="text-center">
              Для загрузки и создания видео необходимо войти в систему
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-4">
            <Link href={`/login?callbackUrl=${encodeURIComponent(pathname)}`} onClick={() => setShowAuthDialog(false)}>
              <Button className="w-full" size="lg">
                <LogIn className="w-4 h-4 mr-2" />
                Войти
              </Button>
            </Link>
            <Link href={`/signup?callbackUrl=${encodeURIComponent(pathname)}`} onClick={() => setShowAuthDialog(false)}>
              <Button variant="outline" className="w-full" size="lg">
                Создать аккаунт
              </Button>
            </Link>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

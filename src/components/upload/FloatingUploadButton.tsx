"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";
import { FileUpload } from "./FileUpload";
import { Plus } from "lucide-react";
import { useUpload } from "@/lib/contexts/upload-context";

export function FloatingUploadButton() {
  const { isOpen, openUpload, closeUpload } = useUpload();

  return (
    <>
      {!isOpen && (
        <Button
          size="icon"
          onClick={openUpload}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all z-50"
          aria-label="Загрузить файл"
        >
          <Plus className="h-6 w-6" />
        </Button>
      )}
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
    </>
  );
}

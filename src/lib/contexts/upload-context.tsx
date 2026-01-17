"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface UploadContextType {
  isOpen: boolean;
  openUpload: () => void;
  closeUpload: () => void;
}

const UploadContext = createContext<UploadContextType | undefined>(undefined);

export function UploadProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openUpload = () => setIsOpen(true);
  const closeUpload = () => setIsOpen(false);

  return (
    <UploadContext.Provider value={{ isOpen, openUpload, closeUpload }}>
      {children}
    </UploadContext.Provider>
  );
}

export function useUpload() {
  const context = useContext(UploadContext);
  if (context === undefined) {
    throw new Error("useUpload must be used within an UploadProvider");
  }
  return context;
}

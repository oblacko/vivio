"use client";

import { WavyBackground } from "@/components/ui/wavy-background";
import { usePathname } from "next/navigation";

export function WavyBackgroundWrapper() {
  const pathname = usePathname();
  
  // Отключаем волны для админ-панели
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <div className="fixed inset-0 -z-10">
      <WavyBackground 
        containerClassName="w-full h-full"
        backgroundFill="hsl(var(--background))"
        colors={["#8b5cf6", "#6366f1", "#3b82f6", "#06b6d4", "#14b8a6"]}
        waveOpacity={0.3}
        speed="fast"
        blur={8}
      />
    </div>
  );
}

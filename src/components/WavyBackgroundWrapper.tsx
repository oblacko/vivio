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
        backgroundFill="#1c1831"
        colors={["#8b5cf6", "#6366f126", "#3b82f626", "#06b6d426", "#14b8a626"]}
        waveOpacity={0.5}
        speed="fast"
        blur={0}
        waveWidth={1}
      />
    </div>
  );
}

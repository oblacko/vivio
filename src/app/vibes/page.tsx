"use client";

import { VibeCard } from "@/components/vibe/VibeCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useVibes } from "@/lib/queries/vibes";

function VibesList() {
  const { data: vibes, isLoading, error } = useVibes();

  // Debug logging
  console.log("VibesPage state:", { isLoading, error, vibesCount: vibes?.vibes?.length });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {[...Array(9)].map((_, i) => (
          <Skeleton key={i} className="aspect-[9/16] w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (error) {
    console.error("VibesPage error:", error);
    // Продолжаем с пустым массивом вайбов, чтобы показать интерфейс
  }

  // Используем vibes или пустой массив
  const vibesList = vibes?.vibes || [];

  if (vibesList.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Вайбы загружаются...</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mt-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="aspect-[9/16] w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
      {vibesList.map((vibe) => (
        <VibeCard
          key={vibe.id}
          id={vibe.id}
          title={vibe.title}
          description={vibe.description}
          thumbnailUrl={vibe.thumbnailUrl}
          participantCount={vibe.participantCount}
          category={vibe.category}
          tags={vibe.tags}
        />
      ))}
    </div>
  );
}

export default function VibesPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
          ✨ Вайбы
        </h1>
        <p className="text-muted-foreground text-lg">
          Загрузи фото, выбери вайб — стань частью флешмоба! Просто, быстро, круто 🚀
        </p>
      </div>

      <VibesList />
    </main>
  );
}

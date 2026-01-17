"use client";

import { ChallengeCard } from "@/components/challenges/ChallengeCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useChallenges } from "@/lib/queries/challenges";

function ChallengesList() {
  const { data: challenges, isLoading, error } = useChallenges();

  // Debug logging
  console.log("ChallengesPage state:", { isLoading, error, challengesCount: challenges?.length });

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
    console.error("ChallengesPage error:", error);
    // Продолжаем с пустым массивом челленджей, чтобы показать интерфейс
  }

  // Используем challenges или пустой массив
  const challengesList = challenges || [];

  if (challengesList.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Тренды загружаются...</p>
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
      {challengesList.map((challenge) => (
        <ChallengeCard
          key={challenge.id}
          id={challenge.id}
          title={challenge.title}
          description={challenge.description}
          thumbnailUrl={challenge.thumbnailUrl}
          participantCount={challenge.participantCount}
          category={challenge.category}
        />
      ))}
    </div>
  );
}

export default function ChallengesPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
          🔥 Тренды
        </h1>
        <p className="text-muted-foreground text-lg">
          Загрузи фото, выбери тренд — стань частью флешмоба! Просто, быстро, круто 🚀
        </p>
      </div>

      <ChallengesList />
    </main>
  );
}
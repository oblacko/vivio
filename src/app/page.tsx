"use client";

import { ChallengeCard } from "@/components/challenges/ChallengeCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useChallenges } from "@/lib/queries/challenges";

function ChallengesList() {
  const { data: challenges, isLoading, error } = useChallenges();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="aspect-[9/16] w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Ошибка загрузки челленджей</p>
      </div>
    );
  }

  if (!challenges || challenges.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Челленджи не найдены</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {challenges.map((challenge) => (
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

export default function HomePage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Vivio</h1>
        <p className="text-muted-foreground">
          Создавайте удивительные 6-секундные видео с помощью AI
        </p>
      </div>

      <ChallengesList />
    </main>
  );
}

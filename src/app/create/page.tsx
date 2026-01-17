"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UploadSheet } from "@/components/upload/UploadSheet";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useChallenges } from "@/lib/queries/challenges";
import { useInitiateGeneration } from "@/lib/queries/generation";
import { ArrowLeft, Sparkles } from "lucide-react";
import Link from "next/link";
import { useGenerationStore } from "@/store/useGenerationStore";

export default function CreatePage() {
  const [selectedChallengeId, setSelectedChallengeId] = useState<string | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);

  const router = useRouter();
  const { data: challenges, isLoading, error } = useChallenges();
  const { currentJobId, reset } = useGenerationStore();
  const initiateMutation = useInitiateGeneration();

  const handleUploadComplete = async (imageUrl: string) => {
    setUploadedImageUrl(imageUrl);

    try {
      const result = await initiateMutation.mutateAsync({
        challengeId: selectedChallengeId || undefined,
        imageUrl,
      });
      // jobId уже сохранен в store через mutation
      router.push("/"); // Перенаправляем на главную, где пользователь увидит прогресс
    } catch (error) {
      console.error("Failed to initiate generation:", error);
    }
  };

  // Debug logging
  console.log("CreatePage state:", { isLoading, error, challengesCount: challenges?.length });

  if (error) {
    console.error("CreatePage error:", error);
    // Продолжаем с пустым массивом челленджей
  }

  // Используем challenges или пустой массив
  const challengesList = challenges || [];

  return (
    <main className="container mx-auto px-4 py-8">
      <Link href="/">
        <Button variant="ghost" className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Назад
        </Button>
      </Link>

      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Создать видео</h1>
        <p className="text-muted-foreground">
          Загрузите изображение, чтобы создать уникальное 6-секундное видео с помощью AI
        </p>
      </div>

      <div className="mb-6">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Челлендж (опционально)
            </label>
            <Select
              value={selectedChallengeId || "none"}
              onValueChange={(value) => setSelectedChallengeId(value === "none" ? null : value)}
            >
              <SelectTrigger className="w-full max-w-md">
                <SelectValue placeholder="Выберите челлендж или оставьте пустым" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Без челленджа</SelectItem>
                {isLoading ? (
                  <SelectItem value="loading" disabled>
                    Загрузка челленджей...
                  </SelectItem>
                ) : (
                  challengesList.map((challenge) => (
                    <SelectItem key={challenge.id} value={challenge.id}>
                      {challenge.title} ({challenge.category})
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {selectedChallengeId && (() => {
            const selectedChallenge = challengesList.find(c => c.id === selectedChallengeId);
            return selectedChallenge ? (
              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">{selectedChallenge.title}</p>
                    <p className="text-sm text-muted-foreground">
                      Категория: {selectedChallenge.category}
                    </p>
                  </div>
                </div>
              </div>
            ) : null;
          })()}

          <div className="pt-4">
            <UploadSheet
              onUploadComplete={handleUploadComplete}
              challengeId={selectedChallengeId ?? undefined}
              trigger={
                <Button size="lg" className="w-full max-w-md">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Загрузить изображение
                </Button>
              }
            />
          </div>
        </div>
      </div>
    </main>
  );
}
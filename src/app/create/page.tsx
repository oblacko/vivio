"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ImageToVideoUploader } from "@/components/upload/ImageToVideoUploader";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useChallenges } from "@/lib/queries/challenges";
import { ArrowLeft, Sparkles } from "lucide-react";
import Link from "next/link";

export default function CreatePage() {
  const [selectedChallengeId, setSelectedChallengeId] = useState<string | null>(null);
  const router = useRouter();
  const { data: challenges, isLoading, error } = useChallenges();

  const handleComplete = (videoUrl: string, videoId: string) => {
    // Опционально: перенаправить на страницу видео
    // router.push(`/videos/${videoId}`);
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
        <div className="space-y-6">
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
              <div className="bg-muted/50 p-4 rounded-lg max-w-md">
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
            <ImageToVideoUploader
              challengeId={selectedChallengeId ?? undefined}
              onComplete={handleComplete}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
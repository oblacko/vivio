"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ImageToVideoUploader } from "@/components/upload/ImageToVideoUploader";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useChallenges } from "@/lib/queries/challenges";
import { useAuth } from "@/lib/hooks/useAuth";
import { ArrowLeft, Sparkles, Lock, LogIn } from "lucide-react";
import Link from "next/link";

export default function CreatePage() {
  const [selectedChallengeId, setSelectedChallengeId] = useState<string | null>(null);
  const router = useRouter();
  const { data: challenges, isLoading, error } = useChallenges();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const handleComplete = (videoUrl: string, videoId: string) => {
    // Опционально: перенаправить на страницу видео
    // router.push(`/videos/${videoId}`);
  };

  // Debug logging
  console.log("CreatePage state:", { isLoading, error, challengesCount: challenges?.length });

  if (error) {
    console.error("CreatePage error:", error);
    // Продолжаем с пустым массивом трендов
  }

  // Используем challenges или пустой массив
  const challengesList = challenges || [];

  // Проверка авторизации
  if (authLoading) {
    return (
      <main className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Загрузка...</p>
        </div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="container mx-auto px-4 py-8">
        <Link href="/">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад
          </Button>
        </Link>

        <div className="max-w-md mx-auto mt-12">
          <Card>
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-primary" />
              </div>
              <CardTitle>Требуется авторизация</CardTitle>
              <CardDescription>
                Для создания видео необходимо войти в систему
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href={`/login?callbackUrl=${encodeURIComponent("/create")}`}>
                <Button className="w-full" size="lg">
                  <LogIn className="w-4 h-4 mr-2" />
                  Войти
                </Button>
              </Link>
              <Link href={`/signup?callbackUrl=${encodeURIComponent("/create")}`}>
                <Button variant="outline" className="w-full" size="lg">
                  Создать аккаунт
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

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
              Тренд (опционально)
            </label>
            <Select
              value={selectedChallengeId || "none"}
              onValueChange={(value) => setSelectedChallengeId(value === "none" ? null : value)}
            >
              <SelectTrigger className="w-full max-w-md">
                <SelectValue placeholder="Выберите тренд или оставьте пустым" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Без тренда</SelectItem>
                {isLoading ? (
                  <SelectItem value="loading" disabled>
                    Загрузка трендов...
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
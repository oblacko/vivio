"use client";

import { useState } from "react";
import { VideoCard } from "@/components/video/VideoCard";
import { ChallengeCard } from "@/components/challenges/ChallengeCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useChallenges } from "@/lib/queries/challenges";
import { useVideos } from "@/lib/queries/videos";
import { useAuth } from "@/lib/hooks/useAuth";
import { useUpload } from "@/lib/contexts/upload-context";
import { Sparkles, TrendingUp, Clock, Eye, Play } from "lucide-react";
import Link from "next/link";

type CategoryFilter = "ALL" | "MONUMENTS" | "PETS" | "FACES" | "SEASONAL";

const categories = [
  { value: "ALL" as CategoryFilter, label: "Все" },
  { value: "MONUMENTS" as CategoryFilter, label: "Монументы" },
  { value: "PETS" as CategoryFilter, label: "Питомцы" },
  { value: "FACES" as CategoryFilter, label: "Лица" },
  { value: "SEASONAL" as CategoryFilter, label: "Сезонные" },
];

function HeroSection() {
  const { isAuthenticated } = useAuth();
  const { openUpload } = useUpload();

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-background border mb-12">
      <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.5))]" />
      <div className="relative px-8 py-16 md:py-24">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">AI-генерация видео</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Оживите свои фотографии
          </h1>
          
          <p className="text-xl text-muted-foreground">
            Создавайте удивительные 6-секундные видео с помощью AI.
            Превратите статичные изображения в динамические истории.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            {isAuthenticated ? (
              <Button size="lg" onClick={openUpload} className="gap-2">
                <Play className="w-5 h-5" />
                Создать видео
              </Button>
            ) : (
              <Link href={`/signup?callbackUrl=${encodeURIComponent("/")}`}>
                <Button size="lg" className="gap-2">
                  <Sparkles className="w-5 h-5" />
                  Начать бесплатно
                </Button>
              </Link>
            )}
            <Link href="/challenges">
              <Button size="lg" variant="outline">
                Смотреть челленджи
              </Button>
            </Link>
          </div>

          <div className="flex items-center justify-center gap-8 pt-8 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">6 секунд</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">AI-powered</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">HD качество</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function VideosList() {
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>("ALL");
  const { data: videos, isLoading, error } = useVideos();

  // Фильтрация видео по категории
  const filteredVideos = videos?.filter((video) => {
    if (selectedCategory === "ALL") return true;
    return video.challenge?.category === selectedCategory;
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <Skeleton key={cat.value} className="h-10 w-24 rounded-full" />
          ))}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {[...Array(10)].map((_, i) => (
            <Skeleton key={i} className="aspect-[9/16] w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 border rounded-lg">
        <p className="text-destructive mb-2">Ошибка загрузки видео</p>
        <p className="text-sm text-muted-foreground">Попробуйте обновить страницу</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Category Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <Button
            key={cat.value}
            variant={selectedCategory === cat.value ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(cat.value)}
            className="rounded-full whitespace-nowrap"
          >
            {cat.label}
          </Button>
        ))}
      </div>

      {/* Videos Grid */}
      {filteredVideos && filteredVideos.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredVideos.map((video) => (
            <div key={video.id} className="group">
              <Link href={`/videos/${video.id}`}>
                <VideoCard
                  id={video.id}
                  videoUrl={video.videoUrl}
                  thumbnailUrl={video.thumbnailUrl}
                  aspectRatio="vertical"
                  autoPlayOnHover={true}
                />
              </Link>

              <div className="mt-2 space-y-1">
                {video.user && (
                  <Link href={`/profile/${video.user.id}`}>
                    <div className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={video.user.image || undefined} />
                        <AvatarFallback className="text-xs">
                          {video.user.name?.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs font-medium truncate">
                        {video.user.name || "Пользователь"}
                      </span>
                    </div>
                  </Link>
                )}

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {video.viewsCount}
                  </div>
                  <div className="flex items-center gap-1">
                    <span>❤️</span>
                    {video.likesCount}
                  </div>
                </div>

                {video.challenge && (
                  <Badge variant="outline" className="text-xs">
                    {video.challenge.category}
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border rounded-lg">
          <p className="text-muted-foreground">
            {selectedCategory === "ALL" 
              ? "Видео пока не загружены" 
              : `Видео в категории "${categories.find(c => c.value === selectedCategory)?.label}" не найдены`}
          </p>
        </div>
      )}
    </div>
  );
}

function ChallengesSection() {
  const { data: challenges, isLoading } = useChallenges();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="aspect-[9/16] w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (!challenges || challenges.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {challenges.slice(0, 4).map((challenge) => (
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
      {/* Hero Section */}
      <HeroSection />

      {/* Main Videos Section */}
      <div className="mb-16">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold mb-2">Популярные видео</h2>
            <p className="text-muted-foreground">
              Откройте для себя удивительные видео, созданные нашим сообществом
            </p>
          </div>
        </div>

        <VideosList />
      </div>

      {/* Challenges Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
              🔥 Горячие тренды
            </h2>
            <p className="text-muted-foreground">
              Загрузи фото, стань частью тренда за пару кликов
            </p>
          </div>
          <Link href="/challenges">
            <Button variant="ghost">Смотреть все</Button>
          </Link>
        </div>

        <ChallengesSection />
      </div>
    </main>
  );
}

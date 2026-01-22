"use client";

import { useState } from "react";
import { VideoCard } from "@/components/video/VideoCard";
import { VideoGallery } from "@/components/video/VideoGallery";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useVideos } from "@/lib/queries/videos";
import { useToggleFavorite, useFavorites } from "@/lib/queries/favorites";
import { useAuth } from "@/lib/hooks/useAuth";
import { useUpload } from "@/lib/contexts/upload-context";
import { Sparkles, TrendingUp, Clock, Eye, Play } from "lucide-react";
import { toast } from "sonner";
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
    <div className="relative py-20 md:py-32 mb-16">
      <div className="max-w-4xl mx-auto text-center space-y-8 px-6">
        <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-primary/10 border border-primary/20 mb-2 backdrop-blur-sm">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-foreground">AI-генерация видео</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight text-white">
          Оживите свои<br />фотографии
        </h1>
        
        <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Создавайте удивительные 6-секундные видео с помощью AI.
          Превратите статичные изображения в динамические истории.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-6">
          {isAuthenticated ? (
            <Button size="lg" onClick={openUpload} className="gap-2 h-12 px-8 text-base rounded-xl backdrop-blur-sm">
              <Play className="w-5 h-5" />
              Создать видео
            </Button>
          ) : (
            <Link href={`/signup?callbackUrl=${encodeURIComponent("/")}`}>
              <Button size="lg" className="gap-2 h-12 px-8 text-base rounded-xl backdrop-blur-sm">
                <Sparkles className="w-5 h-5" />
                Начать бесплатно
              </Button>
            </Link>
          )}
          <Link href="/challenges">
            <Button size="lg" variant="outline" className="h-12 px-8 text-base rounded-xl backdrop-blur-sm">
              Смотреть челленджи
            </Button>
          </Link>
        </div>

        <div className="flex items-center justify-center gap-10 pt-12 text-sm flex-wrap">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center backdrop-blur-sm">
              <Clock className="w-4 h-4 text-primary" />
            </div>
            <span className="text-foreground font-medium">6 секунд</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center backdrop-blur-sm">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <span className="text-foreground font-medium">AI-powered</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center backdrop-blur-sm">
              <TrendingUp className="w-4 h-4 text-primary" />
            </div>
            <span className="text-foreground font-medium">HD качество</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function VideosList() {
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>("ALL");
  const { data: videos, isLoading, error } = useVideos();
  const { data: favorites } = useFavorites();
  const { isAuthenticated } = useAuth();
  const toggleFavorite = useToggleFavorite();

  // Создаем Set из ID избранных вайбов для быстрой проверки
  const favoriteVibeIds = new Set(favorites?.map(f => f.vibeId) || []);

  // Фильтрация видео по категории
  const filteredVideos = videos?.filter((video) => {
    if (selectedCategory === "ALL") return true;
    return video.vibe?.category === selectedCategory;
  });

  // Если нужно перемешать видео для "рандомности"
  // const shuffledVideos = [...(filteredVideos || [])].sort(() => Math.random() - 0.5);
  const displayVideos = filteredVideos;

  const handleToggleFavorite = async (vibeId: string, isFavorite: boolean) => {
    if (!isAuthenticated) {
      toast.error("Необходима авторизация");
      return;
    }
    
    try {
      await toggleFavorite.mutateAsync({ vibeId, isFavorite });
      toast.success(isFavorite ? "Удалено из избранного" : "Добавлено в избранное");
    } catch (error) {
      toast.error("Произошла ошибка");
    }
  };

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

      {/* Videos Gallery */}
      {filteredVideos && filteredVideos.length > 0 ? (
        <VideoGallery
          videos={filteredVideos.map((video) => ({
            id: video.id,
            videoUrl: video.videoUrl,
            thumbnailUrl: video.thumbnailUrl,
            viewsCount: video.viewsCount,
            likesCount: video.likesCount,
            aspectRatio: video.aspectRatio,
            user: video.user,
            vibe: video.vibe ? {
              ...video.vibe,
              participantCount: video.vibe.participantCount || 0,
            } : undefined,
            isFavorite: video.vibe ? favoriteVibeIds.has(video.vibe.id) : false,
          }))}
          onToggleFavorite={handleToggleFavorite}
        />
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


export default function HomePage() {
  return (
    <main className="container mx-auto px-4 py-10">
      {/* Hero Section */}
      <HeroSection />

      {/* Main Videos Section */}
      <div className="mb-20">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight text-white">Популярные видео</h2>
            <p className="text-slate-400 text-lg">
              Откройте для себя удивительные видео, созданные нашим сообществом
            </p>
          </div>
        </div>

        <VideosList />
      </div>

    </main>
  );
}

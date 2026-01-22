"use client";

import { useState, useMemo } from "react";
import { VideoCard } from "@/components/video/VideoCard";
import { VideoGallery } from "@/components/video/VideoGallery";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useVideos } from "@/lib/queries/videos";
import { useTags } from "@/lib/queries/tags";
import { useToggleFavorite, useFavorites } from "@/lib/queries/favorites";
import { useAuth } from "@/lib/hooks/useAuth";
import { useUpload } from "@/lib/contexts/upload-context";
import { Sparkles, TrendingUp, Clock, Eye, Play } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

function HeroSection() {
  const { isAuthenticated } = useAuth();
  const { openUpload } = useUpload();

  return (
    <div className="relative py-16 md:py-28 mb-16 overflow-hidden">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-purple-500/10 to-pink-500/20 bg-[length:200%_200%] animate-gradient-shift" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
      
      <div className="relative max-w-5xl mx-auto text-center space-y-6 md:space-y-8 px-4 md:px-6">
        {/* Badge */}
        <div className="inline-flex items-center gap-2.5 px-4 md:px-5 py-2 md:py-2.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md shadow-lg hover:bg-white/15 transition-all duration-300">
          <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-primary animate-pulse" />
          <span className="text-xs md:text-sm font-semibold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
            AI-генерация видео
          </span>
        </div>
        
        {/* Main Heading */}
        <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight leading-[1.1] md:leading-tight">
          <span className="bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent">
            Оживите свои
          </span>
          <br />
          <span className="bg-gradient-to-r from-primary via-purple-400 to-pink-400 bg-clip-text text-transparent bg-[length:200%_200%] animate-gradient-text">
            фотографии
          </span>
        </h1>
        
        {/* Description */}
        <p className="text-base md:text-lg lg:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed font-medium">
          Создавайте удивительные 6-секундные видео с помощью AI.
          <br className="hidden sm:block" />
          <span className="text-slate-400">Превратите статичные изображения в динамические истории.</span>
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center pt-4 md:pt-6">
          {isAuthenticated ? (
            <Button 
              size="lg" 
              onClick={openUpload} 
              className="gap-2 h-12 md:h-14 px-6 md:px-10 text-base md:text-lg font-semibold rounded-2xl bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <Play className="w-4 h-4 md:w-5 md:h-5" />
              Создать видео
            </Button>
          ) : (
            <Link href={`/signup?callbackUrl=${encodeURIComponent("/")}`}>
              <Button 
                size="lg" 
                className="gap-2 h-12 md:h-14 px-6 md:px-10 text-base md:text-lg font-semibold rounded-2xl bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <Sparkles className="w-4 h-4 md:w-5 md:h-5" />
                Начать бесплатно
              </Button>
            </Link>
          )}
        </div>

        {/* Features Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 pt-8 md:pt-12 max-w-3xl mx-auto">
          <div className="group relative p-4 md:p-5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105 hover:shadow-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
            <div className="relative flex flex-col items-center gap-3 text-center">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Clock className="w-5 h-5 md:w-6 md:h-6 text-primary" />
              </div>
              <div>
                <div className="font-bold text-base md:text-lg text-white mb-1">6 секунд</div>
                <div className="text-xs md:text-sm text-slate-400">Идеальная длина</div>
              </div>
            </div>
          </div>

          <div className="group relative p-4 md:p-5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105 hover:shadow-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
            <div className="relative flex flex-col items-center gap-3 text-center">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-500/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-purple-400" />
              </div>
              <div>
                <div className="font-bold text-base md:text-lg text-white mb-1">AI-powered</div>
                <div className="text-xs md:text-sm text-slate-400">Умная генерация</div>
              </div>
            </div>
          </div>

          <div className="group relative p-4 md:p-5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105 hover:shadow-xl sm:col-span-1 col-span-1">
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
            <div className="relative flex flex-col items-center gap-3 text-center">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-pink-500/20 to-pink-500/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-pink-400" />
              </div>
              <div>
                <div className="font-bold text-base md:text-lg text-white mb-1">HD качество</div>
                <div className="text-xs md:text-sm text-slate-400">Четкая картинка</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function VideosList() {
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null);
  const { data: videos, isLoading, error } = useVideos();
  const { data: tags, isLoading: isLoadingTags } = useTags();
  const { data: favorites } = useFavorites();
  const { isAuthenticated } = useAuth();
  const toggleFavorite = useToggleFavorite();

  // Создаем Set из ID избранных вайбов для быстрой проверки
  const favoriteVibeIds = new Set(favorites?.map(f => f.vibeId) || []);

  // Получаем уникальные теги из всех видео
  const availableTags = useMemo(() => {
    if (!videos) return [];
    const tagMap = new Map<string, { id: string; name: string; count: number }>();
    
    videos.forEach((video) => {
      video.vibe?.tags?.forEach((tag) => {
        const existing = tagMap.get(tag.id);
        if (existing) {
          existing.count++;
        } else {
          tagMap.set(tag.id, { id: tag.id, name: tag.name, count: 1 });
        }
      });
    });
    
    return Array.from(tagMap.values()).sort((a, b) => b.count - a.count);
  }, [videos]);

  // Фильтрация видео по тегу
  const filteredVideos = videos?.filter((video) => {
    if (!selectedTagId) return true;
    return video.vibe?.tags?.some((tag) => tag.id === selectedTagId);
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

  if (isLoading || isLoadingTags) {
    return (
      <div className="space-y-6">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-10 w-24 rounded-full" />
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
    <div className="space-y-6 md:space-y-8">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent mb-2">
            Галерея видео
          </h2>
          <p className="text-sm md:text-base text-muted-foreground">
            Изучайте созданные сообществом AI-видео
          </p>
        </div>
      </div>

      {/* Tag Filters */}
      <div className="relative">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <Button
            variant={selectedTagId === null ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedTagId(null)}
            className="rounded-full whitespace-nowrap shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105"
          >
            Все
          </Button>
          {availableTags.map((tag) => (
            <Button
              key={tag.id}
              variant={selectedTagId === tag.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedTagId(tag.id)}
              className="rounded-full whitespace-nowrap shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105"
            >
              {tag.name}
            </Button>
          ))}
        </div>
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
            {selectedTagId === null 
              ? "Видео пока не загружены" 
              : `Видео с тегом "${availableTags.find(t => t.id === selectedTagId)?.name}" не найдены`}
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
        <VideosList />
      </div>

    </main>
  );
}

"use client";

import { VideoCard } from "@/components/video/VideoCard";
import { VibeBadge } from "@/components/vibe/VibeBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useVideos } from "@/lib/queries/videos";
import { useToggleFavorite, useFavorites } from "@/lib/queries/favorites";
import { useAuth } from "@/lib/hooks/useAuth";
import { toast } from "sonner";
import Link from "next/link";

function VideosList() {
  const { data: videos, isLoading, error } = useVideos();
  const { data: favorites } = useFavorites();
  const { isAuthenticated } = useAuth();
  const toggleFavorite = useToggleFavorite();

  // Создаем Set из ID избранных вайбов для быстрой проверки
  const favoriteVibeIds = new Set(favorites?.map(f => f.vibeId) || []);

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {[...Array(9)].map((_, i) => (
          <Skeleton key={i} className="aspect-[9/16] w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Ошибка загрузки видео</p>
      </div>
    );
  }

  if (!videos || videos.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Видео не найдены</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
      {videos.map((video) => {
        const isFavorite = video.vibe ? favoriteVibeIds.has(video.vibe.id) : false;
        
        return (
          <div key={video.id} className="group">
            <VideoCard
              id={video.id}
              videoUrl={video.videoUrl}
              thumbnailUrl={video.thumbnailUrl}
              aspectRatio="vertical"
              href={`/videos/${video.id}`}
              autoPlayOnHover={true}
            />

            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-xs">
                  {video.vibe?.category || "Без категории"}
                </Badge>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>👁 {video.viewsCount}</span>
                  <span>❤️ {video.likesCount}</span>
                </div>
              </div>

              {video.vibe && (
                <VibeBadge
                  vibeId={video.vibe.id}
                  vibeName={video.vibe.title}
                  tags={video.vibe.tags}
                  isFavorite={isFavorite}
                  onToggleFavorite={() => handleToggleFavorite(video.vibe!.id, isFavorite)}
                />
              )}

              {video.user?.name && (
                <p className="text-xs text-muted-foreground">
                  {video.user.name}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function VideosPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Видео</h1>
        <p className="text-muted-foreground">
          Откройте для себя удивительные видео, созданные участниками трендов
        </p>
      </div>

      <VideosList />
    </main>
  );
}
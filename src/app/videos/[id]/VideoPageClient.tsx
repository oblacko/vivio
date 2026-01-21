"use client";

import { useVideo, useLikeVideo } from "@/lib/queries/videos";
import { VideoPlayer } from "@/components/video/VideoPlayer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, Share2, Eye, ArrowLeft, Forward } from "lucide-react";
import Link from "next/link";
import { useVideoStore } from "@/store/useVideoStore";
import { useAuth } from "@/lib/hooks/useAuth";
import { ShareDialog } from "@/components/share/ShareDialog";

interface VideoPageClientProps {
  videoId: string;
}

export function VideoPageClient({ videoId }: VideoPageClientProps) {
  const { data: video, isLoading } = useVideo(videoId);
  const { likedVideos, toggleLike } = useVideoStore();
  const likeMutation = useLikeVideo();
  const { isAuthenticated, user } = useAuth();

  const isLiked = likedVideos.has(videoId);

  const handleLike = () => {
    if (!isAuthenticated) {
      alert('Необходимо авторизоваться для лайка видео');
      return;
    }

    if (isLiked) {
      alert('Вы уже лайкнули это видео');
      return;
    }

    toggleLike(videoId);
    likeMutation.mutate(videoId);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="aspect-[9/16] w-full max-w-md mx-auto mb-8" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!video) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-destructive">Видео не найдено</p>
        <Link href="/">
          <Button variant="outline" className="mt-4">
            Вернуться на главную
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Link href={video.vibeId ? `/vibes/${video.vibeId}` : "/"}>
        <Button variant="ghost" className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Назад к тренду
        </Button>
      </Link>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Видео плеер */}
        <div className="w-full">
          <VideoPlayer
            src={video.videoUrl}
            aspectRatio="vertical"
            showControls={true}
            className="w-full"
          />
        </div>

        {/* Информация о видео */}
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              {video.vibe?.title || "Видео"}
            </h1>
            <Badge variant="outline" className="mb-4">
              {video.vibe?.category || "Без категории"}
            </Badge>
          </div>

          {/* Статистика */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-muted-foreground" />
              <span className="font-medium">{video.viewsCount}</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart
                className={`w-5 h-5 ${
                  isLiked ? "text-red-500 fill-current" : "text-muted-foreground"
                }`}
              />
              <span className="font-medium">{video.likesCount}</span>
            </div>
            <div className="flex items-center gap-2">
              <Forward className="w-5 h-5 text-muted-foreground" />
              <span className="font-medium">{video.shareCount || 0}</span>
            </div>
          </div>

          {/* Пользователь */}
          {video.user && (
            <Link href={`/profile/${video.user.id}`}>
              <div className="flex items-center gap-3 p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer">
                <Avatar>
                  <AvatarImage src={video.user.image || undefined} />
                  <AvatarFallback>
                    {video.user.name?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{video.user.name || "Пользователь"}</p>
                </div>
              </div>
            </Link>
          )}

          {/* Действия */}
          <div className="flex items-center gap-2">
            <Button
              variant={isLiked ? "default" : "outline"}
              onClick={handleLike}
              disabled={!isAuthenticated || isLiked}
              className="flex-1"
            >
              <Heart
                className={`w-4 h-4 mr-2 ${
                  isLiked ? "fill-current" : ""
                }`}
              />
              {!isAuthenticated
                ? "Войдите для лайка"
                : isLiked
                ? "Лайкнуто"
                : "Лайкнуть"}
            </Button>

            <ShareDialog
              videoId={videoId}
              title={video?.vibe?.title || "Vivio Video"}
            >
              <Button variant="outline" className="flex-1">
                <Share2 className="w-4 h-4 mr-2" />
                Поделиться
              </Button>
            </ShareDialog>
          </div>

          {/* Метаданные */}
          <div className="text-sm text-muted-foreground">
            <p>Длительность: {video.duration} секунд</p>
            <p>Качество: {video.quality}</p>
            <p>
              Создано:{" "}
              {new Date(video.createdAt).toLocaleDateString("ru-RU")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

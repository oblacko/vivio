"use client";

import { useParams } from "next/navigation";
import { useVideo, useLikeVideo } from "@/lib/queries/videos";
import { VideoPlayer } from "@/components/video/VideoPlayer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, Share2, Eye, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useVideoStore } from "@/store/useVideoStore";

export default function VideoPage() {
  const params = useParams();
  const videoId = params.id as string;

  const { data: video, isLoading } = useVideo(videoId);
  const { likedVideos, toggleLike } = useVideoStore();
  const likeMutation = useLikeVideo();

  const isLiked = likedVideos.has(videoId);

  const handleLike = () => {
    toggleLike(videoId);
    likeMutation.mutate(videoId);
  };

  const handleShare = async () => {
    if (navigator.share && video) {
      try {
        await navigator.share({
          title: video.challenge?.title || "Vivio Video",
          text: "Посмотрите это видео!",
          url: window.location.href,
        });
      } catch (error) {
        // Пользователь отменил шаринг
      }
    } else {
      // Fallback: копирование в буфер обмена
      navigator.clipboard.writeText(window.location.href);
    }
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
      <Link href={`/challenges/${video.challengeId}`}>
        <Button variant="ghost" className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Назад к челленджу
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
              {video.challenge?.title || "Видео"}
            </h1>
            <Badge variant="outline" className="mb-4">
              {video.challenge?.category}
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
              className="flex-1"
            >
              <Heart
                className={`w-4 h-4 mr-2 ${
                  isLiked ? "fill-current" : ""
                }`}
              />
              {isLiked ? "Лайкнуто" : "Лайкнуть"}
            </Button>

            <Button variant="outline" onClick={handleShare} className="flex-1">
              <Share2 className="w-4 h-4 mr-2" />
              Поделиться
            </Button>
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

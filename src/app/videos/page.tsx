"use client";

import { VideoCard } from "@/components/video/VideoCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useVideos } from "@/lib/queries/videos";
import Link from "next/link";

function VideosList() {
  const { data: videos, isLoading, error } = useVideos();

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
      {videos.map((video) => (
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
                {video.challenge?.category}
              </Badge>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span>👁 {video.viewsCount}</span>
                <span>❤️ {video.likesCount}</span>
              </div>
            </div>

            {video.challenge?.title && (
              <h3 className="font-medium line-clamp-2 text-sm">
                {video.challenge.title}
              </h3>
            )}

            {video.user?.name && (
              <p className="text-xs text-muted-foreground">
                {video.user.name}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function VideosPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Видео</h1>
        <p className="text-muted-foreground">
          Откройте для себя удивительные видео, созданные участниками челленджей
        </p>
      </div>

      <VideosList />
    </main>
  );
}
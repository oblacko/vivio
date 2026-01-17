"use client";

import { useEffect, useState } from "react";
import { VideoPlayer } from "@/components/video/VideoPlayer";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, Play } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";

interface Video {
  id: string;
  videoUrl: string;
  thumbnailUrl?: string | null;
  user?: {
    name?: string | null;
  } | null;
  challenge?: {
    title?: string;
  } | null;
  likesCount: number;
  viewsCount: number;
}

export function PopularVideoShowcase() {
  const [video, setVideo] = useState<Video | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    async function fetchPopularVideo() {
      try {
        // Получаем топ-10 популярных видео
        const response = await fetch("/api/videos?sortBy=popular&limit=10");
        if (response.ok) {
          const videos = await response.json();
          if (videos.length > 0) {
            // Выбираем случайное видео из топ-10
            const randomIndex = Math.floor(Math.random() * videos.length);
            setVideo(videos[randomIndex]);
          }
        }
      } catch (error) {
        console.error("Failed to fetch popular video:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchPopularVideo();
  }, []);

  if (isLoading) {
    return (
      <div className="relative h-full w-full bg-gradient-to-br from-primary/20 to-primary/5">
        <Skeleton className="absolute inset-0" />
      </div>
    );
  }

  if (!video) {
    return (
      <div className="relative h-full w-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <Sparkles className="w-16 h-16 mx-auto text-primary opacity-50" />
          <div className="space-y-2">
            <h3 className="text-2xl font-bold">Создавайте удивительные видео</h3>
            <p className="text-muted-foreground">
              Используйте AI для превращения фотографий в видео
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="relative h-full w-full bg-black group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Превью изображение */}
      {!isHovered && video.thumbnailUrl && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0"
        >
          <Image
            src={video.thumbnailUrl}
            alt="Video preview"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          
          {/* Overlay с иконкой Play */}
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0.6 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                repeat: Infinity,
                repeatType: "reverse",
                duration: 1.5,
              }}
              className="bg-white/90 rounded-full p-6"
            >
              <Play className="w-12 h-12 text-black fill-black ml-1" />
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* Видео плеер - показывается при наведении */}
      {isHovered && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0"
        >
          <VideoPlayer
            src={video.videoUrl}
            aspectRatio="vertical"
            showControls={false}
            autoPlay={true}
            muted={true}
            loop={true}
            className="w-full h-full rounded-none"
          />
        </motion.div>
      )}

      {/* Оверлей с информацией */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="absolute bottom-0 left-0 right-0 p-6 space-y-2">
          <div className="flex items-center gap-2 text-white/80 text-sm">
            <Sparkles className="w-4 h-4" />
            <span>Популярное видео</span>
          </div>
          
          {video.challenge?.title && (
            <h3 className="text-white font-semibold text-lg">
              {video.challenge.title}
            </h3>
          )}
          
          {video.user?.name && (
            <p className="text-white/60 text-sm">
              От {video.user.name}
            </p>
          )}

          <div className="flex items-center gap-4 text-white/60 text-sm">
            <span>❤️ {video.likesCount}</span>
            <span>👁 {video.viewsCount}</span>
          </div>
        </div>
      </div>

      {/* Бейдж "Живой пример" */}
      <div className="absolute top-4 left-4 bg-primary/90 backdrop-blur-sm text-primary-foreground text-xs font-medium px-3 py-1.5 rounded-full z-10">
        Живой пример
      </div>
    </div>
  );
}

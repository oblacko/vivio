"use client";

import React, { useRef, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useInView } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Play, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface VideoGalleryItem {
  id: string;
  videoUrl: string;
  thumbnailUrl?: string | null;
  viewsCount: number;
  likesCount: number;
  aspectRatio?: number | null;
  user?: {
    id: string;
    name: string | null;
    image: string | null;
  } | null;
  vibe?: {
    id: string;
    title: string;
    category?: string;
    participantCount: number;
    tags?: Array<{ id: string; name: string }>;
  } | null;
  isFavorite?: boolean;
}

interface VideoGalleryProps {
  videos: VideoGalleryItem[];
  onToggleFavorite?: (vibeId: string, isFavorite: boolean) => void;
}

export function VideoGallery({ videos, onToggleFavorite }: VideoGalleryProps) {
  return (
    <div className="relative w-full">
      <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4 space-y-4">
        {videos.map((video) => (
          <div key={video.id} className="break-inside-avoid mb-4">
            <AnimatedVideo
              video={video}
              onToggleFavorite={onToggleFavorite}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

interface AnimatedVideoProps {
  video: VideoGalleryItem;
  onToggleFavorite?: (vibeId: string, isFavorite: boolean) => void;
}

function AnimatedVideo({ video, onToggleFavorite }: AnimatedVideoProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const isInView = useInView(containerRef, { once: true, amount: 0.3 });

  
  const [isHovered, setIsHovered] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [thumbnailError, setThumbnailError] = useState(false);

  // Функция для получения CSS класса aspect ratio на основе данных
  const getAspectRatioClass = (aspectRatio: number | null | undefined): string => {
    if (!aspectRatio || aspectRatio === 0) {
      return "aspect-[9/16]"; // дефолтный вертикальный формат
    }

    if (Math.abs(aspectRatio - 1) < 0.1) {
      return "aspect-square"; // квадрат
    }

    if (Math.abs(aspectRatio - (16/9)) < 0.1) {
      return "aspect-video"; // горизонтальный видео формат
    }

    // Для широких форматов (> 1.5)
    if (aspectRatio > 1.5) {
      return "aspect-[16/9]"; // широкий формат
    }

    // Для вертикальных форматов (< 0.8)
    if (aspectRatio < 0.8) {
      return "aspect-[9/16]"; // вертикальный формат
    }

    // Для квадратных и близких форматов
    return "aspect-square";
  };

  const aspectRatioClass = getAspectRatioClass(video.aspectRatio);

  // Определяем мобильное устройство
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.matchMedia("(max-width: 768px)").matches);
    };
    
    checkMobile();
    window.addEventListener("resize", checkMobile);
    
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Intersection Observer для автоплея на мобильных
  useEffect(() => {
    if (!isMobile || !videoRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            videoRef.current?.play().catch(console.error);
            setIsPlaying(true);
          } else {
            videoRef.current?.pause();
            setIsPlaying(false);
          }
        });
      },
      { threshold: 0.5 }
    );

    const currentContainer = containerRef.current;
    if (currentContainer) {
      observer.observe(currentContainer);
    }

    return () => {
      if (currentContainer) {
        observer.unobserve(currentContainer);
      }
    };
  }, [isMobile]);

  // Hover эффект для десктопа
  const handleMouseEnter = () => {
    if (!isMobile) {
      setIsHovered(true);
      videoRef.current?.play().catch(console.error);
      setIsPlaying(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isMobile) {
      setIsHovered(false);
      videoRef.current?.pause();
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
      }
      setIsPlaying(false);
    }
  };

  const shouldShowVideo = isPlaying || isHovered;
  const displayThumbnail = video.thumbnailUrl;

  return (
    <div 
      ref={containerRef}
      className={cn(
        "group transition-all duration-300",
        isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      )}
    >
      {/* Video Card */}
      <Link href={`/videos/${video.id}`}>
        <div
          className={cn(
            "relative overflow-hidden rounded-lg bg-black cursor-pointer hover:shadow-xl transition-shadow",
            aspectRatioClass
          )}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Thumbnail */}
          {displayThumbnail && !shouldShowVideo && !thumbnailError && (
            <div className="absolute inset-0">
              <Image
                src={displayThumbnail}
                alt="Video thumbnail"
                fill
                className="object-cover"
                onError={() => setThumbnailError(true)}
              />
              {/* Play Overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0.8 }}
                  whileHover={{ scale: 1, opacity: 1 }}
                  className="bg-white/90 rounded-full p-4"
                >
                  <Play className="w-8 h-8 text-black fill-black ml-1" />
                </motion.div>
              </div>
            </div>
          )}

          {/* Video Player */}
          {shouldShowVideo && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0"
            >
              <video
                ref={videoRef}
                src={video.videoUrl}
                className="w-full h-full object-cover"
                loop
                muted
                playsInline
              />
            </motion.div>
          )}

          {/* Fallback */}
          {!displayThumbnail && !shouldShowVideo && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted">
              <div className="text-center text-slate-400">
                <Play className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Видео</p>
              </div>
            </div>
          )}

          {/* Hover Overlay - Generation Counter & Create Button */}
          {video.vibe && (
            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 via-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-between">
              {/* Left: Sparkles Icon + Counter */}
              <div className="flex items-center gap-2 text-white">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">
                  {video.vibe.participantCount}
                </span>
              </div>

              {/* Right: Create Button */}
              <Link
                href={`/create?vibeId=${video.vibe?.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (video.vibe?.id) {
                    window.location.href = `/create?vibeId=${video.vibe.id}`;
                  }
                }}
              >
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-8 px-3 text-xs font-medium"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  Создать
                </Button>
              </Link>
            </div>
          )}
        </div>
      </Link>
    </div>
  );
}

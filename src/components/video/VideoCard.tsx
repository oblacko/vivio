"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Play } from "lucide-react";
import { VideoPlayer } from "./VideoPlayer";
import { cn } from "@/lib/utils";

interface VideoCardProps {
  id: string;
  videoUrl: string;
  thumbnailUrl?: string | null;
  aspectRatio?: "vertical" | "square";
  className?: string;
  href?: string;
  showControls?: boolean;
  autoPlayOnHover?: boolean;
}

export function VideoCard({
  id,
  videoUrl,
  thumbnailUrl,
  aspectRatio = "vertical",
  className,
  href,
  showControls = false,
  autoPlayOnHover = true,
}: VideoCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [thumbnailError, setThumbnailError] = useState(false);

  // Генерация превью на клиенте, если нет thumbnailUrl
  const [clientThumbnail, setClientThumbnail] = useState<string | null>(null);
  const thumbnailGeneratedRef = useRef(false);

  useEffect(() => {
    // Если нет превью и еще не генерировали, создаем его из первого кадра видео
    if (!thumbnailUrl && !clientThumbnail && !thumbnailGeneratedRef.current) {
      thumbnailGeneratedRef.current = true;
      const video = document.createElement("video");
      video.crossOrigin = "anonymous";
      video.preload = "metadata";
      
      video.onloadedmetadata = () => {
        video.currentTime = 0.1; // Первый кадр
      };

      video.onseeked = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(video, 0, 0);
            const thumbnailDataUrl = canvas.toDataURL("image/jpeg", 0.8);
            setClientThumbnail(thumbnailDataUrl);
          }
        } catch (error) {
          console.error("Failed to generate client thumbnail:", error);
        }
      };

      video.onerror = () => {
        console.error("Failed to load video for thumbnail generation");
      };

      video.src = videoUrl;
    }
  }, [videoUrl, thumbnailUrl, clientThumbnail]);

  const displayThumbnail = thumbnailUrl || clientThumbnail;
  const shouldShowVideo = isHovered || isPlaying;

  const handleMouseEnter = () => {
    if (autoPlayOnHover) {
      setIsHovered(true);
    }
  };

  const handleMouseLeave = () => {
    if (autoPlayOnHover && !isPlaying) {
      setIsHovered(false);
    }
  };

  const handleClick = () => {
    setIsPlaying(true);
    setIsHovered(true);
  };

  const cardContent = (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg bg-black group cursor-pointer",
        aspectRatio === "vertical" && "aspect-[9/16]",
        aspectRatio === "square" && "aspect-square",
        className
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      {/* Превью */}
      {displayThumbnail && !shouldShowVideo && !thumbnailError && (
        <div className="absolute inset-0">
          <Image
            src={displayThumbnail}
            alt="Video thumbnail"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onError={() => setThumbnailError(true)}
          />
          {/* Overlay с иконкой Play */}
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

      {/* Видео плеер */}
      {shouldShowVideo && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0"
        >
          <VideoPlayer
            src={videoUrl}
            aspectRatio={aspectRatio}
            showControls={showControls}
            autoPlay={true}
            muted={true}
            loop={true}
            className="w-full h-full"
          />
        </motion.div>
      )}

      {/* Fallback если нет превью и видео не загружено */}
      {!displayThumbnail && !shouldShowVideo && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <div className="text-center text-muted-foreground">
            <Play className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Видео</p>
          </div>
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {cardContent}
      </Link>
    );
  }

  return cardContent;
}

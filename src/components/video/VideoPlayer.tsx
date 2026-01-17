"use client";

import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Play, Pause, Volume2, VolumeX, Maximize } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface VideoPlayerProps {
  src: string;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  className?: string;
  showControls?: boolean;
  aspectRatio?: "vertical" | "square";
}

export function VideoPlayer({
  src,
  autoPlay = true,
  loop = true,
  muted = true,
  className,
  showControls = true,
  aspectRatio = "vertical",
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(muted);
  const [showControlsOverlay, setShowControlsOverlay] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.play().catch(console.error);
    } else {
      video.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = isMuted;
  }, [isMuted]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const toggleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;

    if (!document.fullscreenElement) {
      video.requestFullscreen().then(() => setIsFullscreen(true));
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false));
    }
  };

  const handleVideoEnd = () => {
    if (loop) {
      // Seamless loop - перезапуск без паузы
      const video = videoRef.current;
      if (video) {
        video.currentTime = 0;
        video.play();
      }
    }
  };

  return (
    <div
      className={cn(
        "relative group overflow-hidden bg-black",
        aspectRatio === "vertical" && "aspect-[9/16]",
        aspectRatio === "square" && "aspect-square",
        !className?.includes("rounded-") && "rounded-lg",
        className
      )}
      onMouseEnter={() => setShowControlsOverlay(true)}
      onMouseLeave={() => setShowControlsOverlay(false)}
    >
      <video
        ref={videoRef}
        src={src}
        className="w-full h-full object-cover"
        autoPlay={autoPlay}
        loop={loop}
        muted={muted}
        playsInline
        onEnded={handleVideoEnd}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      {/* Controls Overlay */}
      {showControls && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end justify-center pb-4"
          initial={{ opacity: 0 }}
          animate={{
            opacity: showControlsOverlay || !isPlaying ? 1 : 0,
          }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="icon"
              onClick={togglePlay}
              className="rounded-full"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
            </Button>

            <Button
              variant="secondary"
              size="icon"
              onClick={toggleMute}
              className="rounded-full"
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </Button>

            <Button
              variant="secondary"
              size="icon"
              onClick={toggleFullscreen}
              className="rounded-full"
            >
              <Maximize className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>
      )}

      {/* Watermark (опционально) */}
      <div className="absolute top-2 right-2 opacity-50 text-white text-xs">
        Vivio
      </div>
    </div>
  );
}

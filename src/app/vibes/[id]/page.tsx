"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useVibe } from "@/lib/queries/vibes";
import { useVideos } from "@/lib/queries/videos";
import { useInitiateGeneration } from "@/lib/queries/generation";
import { useUploadImage } from "@/lib/queries/upload";
import { UploadSheet } from "@/components/upload/UploadSheet";
import { GenerationProgress } from "@/components/generation/GenerationProgress";
import { VideoCard } from "@/components/video/VideoCard";
import { VibeCard } from "@/components/vibe/VibeCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Upload, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useGenerationStore } from "@/store/useGenerationStore";

export default function VibePage() {
  const params = useParams();
  const router = useRouter();
  const vibeId = params.id as string;

  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [showUpload, setShowUpload] = useState(false);

  const { data: vibe, isLoading: vibeLoading } = useVibe(vibeId);
  const { data: videos, isLoading: videosLoading } = useVideos(vibeId);
  const { currentJobId, reset } = useGenerationStore();

  const uploadMutation = useUploadImage();
  const initiateMutation = useInitiateGeneration();

  const handleUploadComplete = async (imageUrl: string) => {
    setUploadedImageUrl(imageUrl);
    setShowUpload(false);

    try {
      const result = await initiateMutation.mutateAsync({
        vibeId,
        imageUrl,
      });
      // jobId уже сохранен в store через mutation
    } catch (error) {
      console.error("Failed to initiate generation:", error);
    }
  };

  const handleGenerationComplete = (videoUrl: string, videoId: string) => {
    router.push(`/videos/${videoId}`);
    reset();
  };

  if (vibeLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-64 w-full mb-8" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!vibe) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-destructive">Вайб не найден</p>
        <Link href="/vibes">
          <Button variant="outline" className="mt-4">
            Вернуться к вайбам
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/">
        <Button variant="ghost" className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Назад
        </Button>
      </Link>

      <div className="mb-8">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold mb-2">{vibe.title}</h1>
            {vibe.description && (
              <p className="text-muted-foreground">{vibe.description}</p>
            )}
          </div>
          <Badge>{vibe.category}</Badge>
        </div>

        {vibe.tags && vibe.tags.length > 0 && (
          <div className="flex gap-2 mb-4">
            {vibe.tags.map((tag) => (
              <Badge key={tag.id} variant="secondary">
                {tag.name}
              </Badge>
            ))}
          </div>
        )}

        <div className="flex items-center gap-4 mb-6">
          <p className="text-sm text-muted-foreground">
            {vibe.participantCount} участников
          </p>
        </div>

        {!currentJobId && !uploadedImageUrl && (
          <UploadSheet
            onUploadComplete={handleUploadComplete}
            vibeId={vibeId}
            trigger={
              <Button size="lg" className="font-semibold">
                <Upload className="w-4 h-4 mr-2" />
                Участвовать в вайбе ✨
              </Button>
            }
          />
        )}

        {currentJobId && (
          <div className="my-8">
            <GenerationProgress
              jobId={currentJobId}
              onComplete={handleGenerationComplete}
            />
          </div>
        )}
      </div>

      {/* Лента готовых видео */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Участники вайба</h2>
        {videosLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="aspect-[9/16] w-full rounded-lg" />
            ))}
          </div>
        ) : videos && videos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {videos.map((video) => (
              <VideoCard
                key={video.id}
                id={video.id}
                videoUrl={video.videoUrl}
                thumbnailUrl={video.thumbnailUrl}
                aspectRatio="vertical"
                href={`/videos/${video.id}`}
                autoPlayOnHover={true}
              />
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-12">
            Пока нет готовых видео
          </p>
        )}
      </div>
    </div>
  );
}

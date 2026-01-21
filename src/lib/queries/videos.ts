import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useVideoStore } from "@/store/useVideoStore";

export interface Video {
  id: string;
  videoUrl: string;
  thumbnailUrl: string | null;
  duration: number;
  quality: string;
  likesCount: number;
  viewsCount: number;
  shareCount: number;
  userId: string | null;
  vibeId: string | null;
  createdAt: string;
  vibe?: {
    id: string;
    title: string;
    category: string;
    tags?: Array<{ id: string; name: string }>;
  };
  user?: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

export function useVideos(vibeId?: string) {
  const { setVideos } = useVideoStore();

  return useQuery<Video[]>({
    queryKey: vibeId ? ["videos", vibeId] : ["videos"],
    queryFn: async () => {
      const url = vibeId
        ? `/api/videos?vibeId=${vibeId}`
        : "/api/videos";
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch videos");
      }
      const data = await response.json();
      setVideos(data);
      return data;
    },
    staleTime: 30 * 1000, // 30 seconds
  });
}

export function useVideo(id: string) {
  const { setCurrentVideo, incrementViews } = useVideoStore();

  return useQuery<Video>({
    queryKey: ["video", id],
    queryFn: async () => {
      const response = await fetch(`/api/videos/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch video");
      }
      const data = await response.json();
      setCurrentVideo(data);
      // Увеличить счетчик просмотров
      incrementViews(id);
      return data;
    },
  });
}

export function useLikeVideo() {
  const queryClient = useQueryClient();
  const { toggleLike } = useVideoStore();

  return useMutation({
    mutationFn: async (videoId: string) => {
      const response = await fetch(`/api/videos/${videoId}/like`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to like video");
      }

      return response.json();
    },
    onSuccess: (data, videoId) => {
      toggleLike(videoId);
      queryClient.invalidateQueries({ queryKey: ["video", videoId] });
      queryClient.invalidateQueries({ queryKey: ["videos"] });
    },
  });
}

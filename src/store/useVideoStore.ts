import { create } from "zustand";

export interface Video {
  id: string;
  videoUrl: string;
  thumbnailUrl: string | null;
  duration: number;
  likesCount: number;
  viewsCount: number;
  userId: string | null;
  vibeId: string | null;
  createdAt: Date;
}

interface VideoState {
  videos: Video[];
  currentVideo: Video | null;
  likedVideos: Set<string>;
}

interface VideoActions {
  setVideos: (videos: Video[]) => void;
  setCurrentVideo: (video: Video | null) => void;
  addVideo: (video: Video) => void;
  updateVideo: (id: string, updates: Partial<Video>) => void;
  toggleLike: (videoId: string) => void;
  incrementViews: (videoId: string) => void;
}

export const useVideoStore = create<VideoState & VideoActions>((set) => ({
  videos: [],
  currentVideo: null,
  likedVideos: new Set(),
  setVideos: (videos) => set({ videos }),
  setCurrentVideo: (currentVideo) => set({ currentVideo }),
  addVideo: (video) =>
    set((state) => ({
      videos: [video, ...state.videos],
    })),
  updateVideo: (id, updates) =>
    set((state) => ({
      videos: state.videos.map((video) =>
        video.id === id ? { ...video, ...updates } : video
      ),
    })),
  toggleLike: (videoId) =>
    set((state) => {
      const newLikedVideos = new Set(state.likedVideos);
      if (newLikedVideos.has(videoId)) {
        newLikedVideos.delete(videoId);
      } else {
        newLikedVideos.add(videoId);
      }
      return {
        likedVideos: newLikedVideos,
        videos: state.videos.map((video) =>
          video.id === videoId
            ? {
                ...video,
                likesCount: newLikedVideos.has(videoId)
                  ? video.likesCount + 1
                  : Math.max(0, video.likesCount - 1),
              }
            : video
        ),
      };
    }),
  incrementViews: (videoId) =>
    set((state) => ({
      videos: state.videos.map((video) =>
        video.id === videoId
          ? { ...video, viewsCount: video.viewsCount + 1 }
          : video
      ),
    })),
}));

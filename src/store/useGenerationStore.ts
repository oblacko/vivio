import { create } from "zustand";

export interface GenerationState {
  currentJobId: string | null;
  progress: number;
  status: "idle" | "queued" | "processing" | "completed" | "failed";
  videoUrl: string | null;
  videoId: string | null;
  errorMessage: string | null;
}

interface GenerationActions {
  setJobId: (jobId: string | null) => void;
  setProgress: (progress: number) => void;
  setStatus: (status: GenerationState["status"]) => void;
  setVideoUrl: (url: string | null) => void;
  setVideoId: (id: string | null) => void;
  setErrorMessage: (message: string | null) => void;
  reset: () => void;
}

const initialState: GenerationState = {
  currentJobId: null,
  progress: 0,
  status: "idle",
  videoUrl: null,
  videoId: null,
  errorMessage: null,
};

export const useGenerationStore = create<GenerationState & GenerationActions>(
  (set) => ({
    ...initialState,
    setJobId: (jobId) => set({ currentJobId: jobId }),
    setProgress: (progress) => set({ progress }),
    setStatus: (status) => set({ status }),
    setVideoUrl: (videoUrl) => set({ videoUrl }),
    setVideoId: (videoId) => set({ videoId }),
    setErrorMessage: (errorMessage) => set({ errorMessage }),
    reset: () => set(initialState),
  })
);

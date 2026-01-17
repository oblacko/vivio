import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useGenerationStore } from "@/store/useGenerationStore";

export interface GenerationStatus {
  status: "idle" | "queued" | "processing" | "completed" | "failed";
  progress: number;
  videoUrl?: string;
  videoId?: string;
  errorMessage?: string;
}

export function useGenerationStatus(jobId: string | null) {
  const { setProgress, setStatus, setVideoUrl, setVideoId, setErrorMessage } =
    useGenerationStore();

  return useQuery<GenerationStatus>({
    queryKey: ["generation-status", jobId],
    queryFn: async () => {
      if (!jobId) {
        throw new Error("Job ID is required");
      }
      const response = await fetch(`/api/generate/status/${jobId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch generation status");
      }
      const data = await response.json();

      // Обновление store
      setProgress(data.progress || 0);
      setStatus(data.status.toLowerCase() as GenerationStatus["status"]);
      if (data.videoUrl) setVideoUrl(data.videoUrl);
      if (data.videoId) setVideoId(data.videoId);
      if (data.errorMessage) setErrorMessage(data.errorMessage);

      return data;
    },
    enabled: !!jobId && jobId !== null,
    refetchInterval: (query) => {
      const data = query.state.data as GenerationStatus | undefined;
      if (data?.status === "completed" || data?.status === "failed") {
        return false; // Остановить polling
      }
      return 2000; // Polling каждые 2 секунды
    },
  });
}

export function useInitiateGeneration() {
  const queryClient = useQueryClient();
  const { setJobId, reset } = useGenerationStore();

  return useMutation({
    mutationFn: async (data: { challengeId?: string; imageUrl: string; userId?: string }) => {
      const response = await fetch("/api/generate/initiate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to initiate generation");
      }

      return response.json();
    },
    onSuccess: (data) => {
      setJobId(data.jobId);
      // Инвалидация queries для обновления статуса
      queryClient.invalidateQueries({ queryKey: ["generation-status", data.jobId] });
    },
    onError: () => {
      reset();
    },
  });
}

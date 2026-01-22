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

      // Нормализуем статус к нижнему регистру
      const normalizedStatus = (data.status || "").toString().toLowerCase().trim() as GenerationStatus["status"];
      
      console.log("📊 Generation Status Update:", {
        originalStatus: data.status,
        normalizedStatus,
        progress: data.progress,
        hasVideoUrl: !!data.videoUrl,
        hasVideoId: !!data.videoId,
      });

      // Обновление store
      setProgress(data.progress || 0);
      setStatus(normalizedStatus);
      if (data.videoUrl) setVideoUrl(data.videoUrl);
      if (data.videoId) setVideoId(data.videoId);
      if (data.errorMessage) setErrorMessage(data.errorMessage);

      // Возвращаем данные с нормализованным статусом
      return {
        ...data,
        status: normalizedStatus,
      };
    },
    enabled: !!jobId && jobId !== null,
    refetchInterval: (query) => {
      const data = query.state.data as GenerationStatus | undefined;
      const status = data?.status?.toString().toLowerCase().trim();
      
      console.log("🔄 Polling check:", {
        status,
        shouldStop: status === "completed" || status === "failed",
      });
      
      if (status === "completed" || status === "failed") {
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
    mutationFn: async (data: { vibeId?: string; imageUrl: string; aspectRatio?: number; userId?: string }) => {
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

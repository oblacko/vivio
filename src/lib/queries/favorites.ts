import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Vibe } from "./vibes";

export interface FavoriteVibe {
  id: string;
  userId: string;
  vibeId: string;
  createdAt: string;
  vibe: Vibe;
}

export function useFavorites() {
  return useQuery<FavoriteVibe[]>({
    queryKey: ["favorites"],
    queryFn: async () => {
      const response = await fetch("/api/favorites");
      if (!response.ok) {
        throw new Error("Failed to fetch favorites");
      }
      return response.json();
    },
  });
}

export function useToggleFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ vibeId, isFavorite }: { vibeId: string; isFavorite: boolean }) => {
      const method = isFavorite ? "DELETE" : "POST";
      const response = await fetch(`/api/favorites/${vibeId}`, {
        method,
      });

      if (!response.ok) {
        throw new Error(`Failed to ${isFavorite ? "remove from" : "add to"} favorites`);
      }

      return response.json();
    },
    onSuccess: () => {
      // Инвалидируем кеш избранного для обновления данных
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
  });
}

export function useIsFavorite(vibeId: string) {
  const { data: favorites } = useFavorites();
  return favorites?.some((fav) => fav.vibeId === vibeId) ?? false;
}

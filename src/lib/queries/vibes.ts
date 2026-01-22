import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useVibeStore, type Tag } from "@/store/useVibeStore";

export interface Vibe {
  id: string;
  title: string;
  description: string | null;
  category: string;
  thumbnailUrl: string | null;
  promptTemplate: string;
  participantCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  tags?: Tag[];
}

export interface VibesResponse {
  vibes: Vibe[];
  pagination: {
    total: number;
    pages: number;
    currentPage: number;
    limit: number;
  };
}

export interface VibesFilters {
  page?: number;
  limit?: number;
  isActive?: string;
  sortBy?: string;
  tagId?: string;
  search?: string;
}

export function useVibes(options: { isAdmin?: boolean; filters?: VibesFilters } = {}) {
  const { setVibes } = useVibeStore();
  const isAdmin = options.isAdmin ?? false;
  const filters = options.filters || {};

  return useQuery<VibesResponse>({
    queryKey: ["vibes", isAdmin, filters],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          queryParams.append(key, value.toString());
        }
      });

      const endpoint = isAdmin 
        ? `/api/admin/vibes?${queryParams.toString()}` 
        : `/api/vibes?${queryParams.toString()}`;
        
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error("Failed to fetch vibes");
      }
      const data = await response.json();
      
      // Обработка разного формата ответа для админки и пользователя
      const vibesList = isAdmin ? data.vibes : data;
      setVibes(vibesList);
      
      return isAdmin ? data : { vibes: data, pagination: { total: data.length, pages: 1, currentPage: 1, limit: 50 } };
    },
    staleTime: 0,
    retry: 1,
    retryDelay: 1000,
  });
}

export function useVibe(id: string) {
  return useQuery<Vibe>({
    queryKey: ["vibe", id],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/vibes/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch vibe");
        }
        return response.json();
      } catch (error) {
        console.warn("API not available for vibe:", id);
        throw error;
      }
    },
  });
}

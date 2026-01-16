import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useChallengeStore } from "@/store/useChallengeStore";

export interface Challenge {
  id: string;
  title: string;
  description: string | null;
  category: string;
  thumbnailUrl: string | null;
  participantCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export function useChallenges() {
  const { setChallenges } = useChallengeStore();

  return useQuery<Challenge[]>({
    queryKey: ["challenges"],
    queryFn: async () => {
      const response = await fetch("/api/challenges");
      if (!response.ok) {
        throw new Error("Failed to fetch challenges");
      }
      const data = await response.json();
      setChallenges(data);
      return data;
    },
    staleTime: 60 * 1000, // 1 minute
  });
}

export function useChallenge(id: string) {
  return useQuery<Challenge>({
    queryKey: ["challenge", id],
    queryFn: async () => {
      const response = await fetch(`/api/challenges/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch challenge");
      }
      return response.json();
    },
  });
}

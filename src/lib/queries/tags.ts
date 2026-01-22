import { useQuery } from "@tanstack/react-query";

export interface Tag {
  id: string;
  name: string;
  createdAt: string;
  _count?: {
    vibes: number;
  };
}

export function useTags() {
  return useQuery<Tag[]>({
    queryKey: ["tags"],
    queryFn: async () => {
      const response = await fetch("/api/tags");
      if (!response.ok) {
        throw new Error("Failed to fetch tags");
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

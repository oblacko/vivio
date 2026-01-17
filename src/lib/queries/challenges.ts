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

// Mock challenges for development
const mockChallenges: Challenge[] = [
  {
    id: "1",
    title: "Мои любимые питомцы",
    description: "Создайте забавное видео с вашим питомцем в главной роли!",
    category: "PETS",
    thumbnailUrl: "https://images.unsplash.com/photo-1544568100-847a948585b9?w=400&h=711&fit=crop",
    participantCount: 42,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    title: "Памятники оживают",
    description: "Оживите исторические памятники в вашем городе!",
    category: "MONUMENTS",
    thumbnailUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=711&fit=crop",
    participantCount: 28,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "3",
    title: "Лица с характером",
    description: "Преобразите портреты в динамичные истории!",
    category: "FACES",
    thumbnailUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=711&fit=crop",
    participantCount: 35,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "4",
    title: "Сезонные чудеса",
    description: "Празднуйте времена года с волшебством!",
    category: "SEASONAL",
    thumbnailUrl: "https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=400&h=711&fit=crop",
    participantCount: 19,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export function useChallenges() {
  const { setChallenges } = useChallengeStore();

  return useQuery<Challenge[]>({
    queryKey: ["challenges"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/challenges");
        if (!response.ok) {
          throw new Error("Failed to fetch challenges");
        }
        const data = await response.json();
        // Если API вернул данные, используем их, иначе mock данные
        const challenges = data.length > 0 ? data : mockChallenges;
        setChallenges(challenges);
        return challenges;
      } catch (error) {
        console.warn("API not available, using mock data:", error);
        // Возвращаем mock данные при ошибке API
        setChallenges(mockChallenges);
        return mockChallenges;
      }
    },
    staleTime: 60 * 1000, // 1 minute
    // Увеличиваем время ожидания
    retry: 1,
    retryDelay: 1000,
    // Добавляем начальные данные
    initialData: mockChallenges,
  });
}

export function useChallenge(id: string) {
  return useQuery<Challenge>({
    queryKey: ["challenge", id],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/challenges/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch challenge");
        }
        return response.json();
      } catch (error) {
        console.warn("API not available, using mock data for challenge:", id);
        // Возвращаем mock данные для конкретного челленджа
        const challenge = mockChallenges.find(c => c.id === id);
        if (!challenge) {
          throw new Error("Challenge not found");
        }
        return challenge;
      }
    },
  });
}

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

// Mock vibes for development
const mockVibes: Vibe[] = [
  {
    id: "1",
    title: "Мои любимые питомцы",
    description: "Создайте забавное видео с вашим питомцем в главной роли!",
    category: "PETS",
    thumbnailUrl: "https://images.unsplash.com/photo-1544568100-847a948585b9?w=400&h=711&fit=crop",
    promptTemplate: "Transform this image of a pet into a magical animated scene where the pet becomes the star of an adventure. Make it fun and whimsical with dynamic movements.",
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
    promptTemplate: "Transform this monument into a living, breathing scene where the statue comes to life. Add dynamic movements, lighting effects, and historical context.",
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
    promptTemplate: "Transform this portrait into a dynamic scene where the person comes to life with expressive movements, emotions, and storytelling elements.",
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
    promptTemplate: "Transform this scene into a magical seasonal wonderland with dynamic weather effects, festive elements, and celebratory atmosphere.",
    participantCount: 19,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export function useVibes() {
  const { setVibes } = useVibeStore();

  return useQuery<Vibe[]>({
    queryKey: ["vibes"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/vibes");
        if (!response.ok) {
          throw new Error("Failed to fetch vibes");
        }
        const data = await response.json();
        // Если API вернул данные, используем их, иначе mock данные
        const vibes = data.length > 0 ? data : mockVibes;
        setVibes(vibes);
        return vibes;
      } catch (error) {
        console.warn("API not available, using mock data:", error);
        // Возвращаем mock данные при ошибке API
        setVibes(mockVibes);
        return mockVibes;
      }
    },
    staleTime: 0, // Отключаем кеширование для разработки
    // Увеличиваем время ожидания
    retry: 1,
    retryDelay: 1000,
    // Добавляем начальные данные
    initialData: mockVibes,
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
        console.warn("API not available, using mock data for vibe:", id);
        // Возвращаем mock данные для конкретного вайба
        const vibe = mockVibes.find(v => v.id === id);
        if (!vibe) {
          throw new Error("Vibe not found");
        }
        return vibe;
      }
    },
  });
}

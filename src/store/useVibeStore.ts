import { create } from "zustand";

export interface Tag {
  id: string;
  name: string;
}

export interface Vibe {
  id: string;
  title: string;
  description: string | null;
  category: string;
  thumbnailUrl: string | null;
  promptTemplate: string;
  participantCount: number;
  isActive: boolean;
  tags?: Tag[];
}

interface VibeState {
  vibes: Vibe[];
  selectedVibe: Vibe | null;
}

interface VibeActions {
  setVibes: (vibes: Vibe[]) => void;
  setSelectedVibe: (vibe: Vibe | null) => void;
  updateVibe: (id: string, updates: Partial<Vibe>) => void;
}

export const useVibeStore = create<VibeState & VibeActions>(
  (set) => ({
    vibes: [],
    selectedVibe: null,
    setVibes: (vibes) => set({ vibes }),
    setSelectedVibe: (selectedVibe) => set({ selectedVibe }),
    updateVibe: (id, updates) =>
      set((state) => ({
        vibes: state.vibes.map((vibe) =>
          vibe.id === id ? { ...vibe, ...updates } : vibe
        ),
      })),
  })
);

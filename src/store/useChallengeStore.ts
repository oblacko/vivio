import { create } from "zustand";

export interface Challenge {
  id: string;
  title: string;
  description: string | null;
  category: string;
  thumbnailUrl: string | null;
  promptTemplate: string;
  participantCount: number;
  isActive: boolean;
}

interface ChallengeState {
  challenges: Challenge[];
  selectedChallenge: Challenge | null;
}

interface ChallengeActions {
  setChallenges: (challenges: Challenge[]) => void;
  setSelectedChallenge: (challenge: Challenge | null) => void;
  updateChallenge: (id: string, updates: Partial<Challenge>) => void;
}

export const useChallengeStore = create<ChallengeState & ChallengeActions>(
  (set) => ({
    challenges: [],
    selectedChallenge: null,
    setChallenges: (challenges) => set({ challenges }),
    setSelectedChallenge: (selectedChallenge) => set({ selectedChallenge }),
    updateChallenge: (id, updates) =>
      set((state) => ({
        challenges: state.challenges.map((challenge) =>
          challenge.id === id ? { ...challenge, ...updates } : challenge
        ),
      })),
  })
);

import { create } from 'zustand';

export interface Risk {
  id: string;
  type: string;
  level: 'low' | 'medium' | 'high' | 'critical';
  message_zh: string;
  message_en: string;
}

interface RiskState {
  risks: Risk[];
  hasUnacknowledged: boolean;
  addRisks: (incoming: Risk[]) => void;
  acknowledgeAll: () => void;
}

export const useRiskStore = create<RiskState>((set) => ({
  risks: [],
  hasUnacknowledged: false,
  addRisks: (incoming) =>
    set((state) => {
      if (!incoming.length) return state;
      // Dedupe by id — don't re-add risks already in the list
      const existingIds = new Set(state.risks.map((r) => r.id));
      const newRisks = incoming.filter((r) => !existingIds.has(r.id));
      if (!newRisks.length) return state;
      return {
        risks: [...state.risks, ...newRisks],
        hasUnacknowledged: true,
      };
    }),
  acknowledgeAll: () => set({ risks: [], hasUnacknowledged: false }),
}));

import { create } from 'zustand';
import { ShoeReading } from '../sensors/types';

interface ShoeState {
  current: ShoeReading | null;
  fallDetected: boolean;
  lastFallTime: number | null;
  updateReading: (r: ShoeReading) => void;
  acknowledgeFall: () => void;
}

export const useShoeStore = create<ShoeState>((set) => ({
  current: null,
  fallDetected: false,
  lastFallTime: null,
  updateReading: (r) =>
    set((state) => {
      const isFall = r.gaitStatus === 'fall';
      return {
        current: r,
        fallDetected: isFall || state.fallDetected,
        lastFallTime: isFall ? r.timestamp : state.lastFallTime,
      };
    }),
  acknowledgeFall: () => set({ fallDetected: false }),
}));

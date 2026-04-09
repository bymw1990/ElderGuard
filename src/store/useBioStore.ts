import { create } from 'zustand';
import { BioMarkerReading } from '../sensors/types';
import { HISTORY_BUFFER_SIZE } from '../utils/constants';

interface BioState {
  current: BioMarkerReading | null;
  history: BioMarkerReading[];
  status: 'idle' | 'streaming' | 'error';
  updateReading: (r: BioMarkerReading) => void;
}

export const useBioStore = create<BioState>((set) => ({
  current: null,
  history: [],
  status: 'idle',
  updateReading: (r) =>
    set((state) => ({
      current: r,
      status: 'streaming',
      history:
        state.history.length >= HISTORY_BUFFER_SIZE
          ? [...state.history.slice(1), r]
          : [...state.history, r],
    })),
}));

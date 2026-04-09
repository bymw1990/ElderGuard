import { create } from 'zustand';
import { useSettingsStore } from './useSettingsStore';

export type EmergencyStatus = 'idle' | 'triggered' | 'executing' | 'cancelled' | 'completed';
export type EmergencyTrigger = 'fall' | 'biomarker';
export type EmergencyStep = 'alarm' | 'notify' | 'sms' | 'call';

interface EmergencyState {
  status: EmergencyStatus;
  trigger: EmergencyTrigger | null;
  triggerDetail: string;
  countdownSecondsRemaining: number;
  totalCountdownSeconds: number;
  stepsCompleted: Record<EmergencyStep, boolean>;
  triggerEmergency: (t: EmergencyTrigger, detail: string) => void;
  cancel: () => void;
  tick: () => void;
  startExecuting: () => void;
  markStepDone: (step: EmergencyStep) => void;
  reset: () => void;
}

const initialSteps: Record<EmergencyStep, boolean> = {
  alarm: false,
  notify: false,
  sms: false,
  call: false,
};

export const useEmergencyStore = create<EmergencyState>((set, get) => ({
  status: 'idle',
  trigger: null,
  triggerDetail: '',
  countdownSecondsRemaining: 30,
  totalCountdownSeconds: 30,
  stepsCompleted: { ...initialSteps },

  triggerEmergency: (t, detail) => {
    if (get().status !== 'idle') return;
    const secs = useSettingsStore.getState().countdownSeconds;
    set({
      status: 'triggered',
      trigger: t,
      triggerDetail: detail,
      countdownSecondsRemaining: secs,
      totalCountdownSeconds: secs,
      stepsCompleted: { ...initialSteps },
    });
  },

  cancel: () => {
    if (get().status !== 'triggered') return;
    set({ status: 'cancelled' });
    setTimeout(() => {
      if (get().status === 'cancelled') get().reset();
    }, 3000);
  },

  tick: () => {
    const { status, countdownSecondsRemaining, startExecuting } = get();
    if (status !== 'triggered') return;
    if (countdownSecondsRemaining <= 1) {
      startExecuting();
    } else {
      set({ countdownSecondsRemaining: countdownSecondsRemaining - 1 });
    }
  },

  startExecuting: () => set({ status: 'executing', countdownSecondsRemaining: 0 }),

  markStepDone: (step) => {
    const steps = { ...get().stepsCompleted, [step]: true };
    const allDone = Object.values(steps).every(Boolean);
    set({ stepsCompleted: steps });
    if (allDone) {
      set({ status: 'completed' });
      setTimeout(() => {
        if (get().status === 'completed') get().reset();
      }, 10000);
    }
  },

  reset: () => {
    const secs = useSettingsStore.getState().countdownSeconds;
    set({
      status: 'idle',
      trigger: null,
      triggerDetail: '',
      countdownSecondsRemaining: secs,
      totalCountdownSeconds: secs,
      stepsCompleted: { ...initialSteps },
    });
  },
}));

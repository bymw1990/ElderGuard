import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AlertThresholds, DEFAULT_THRESHOLDS } from '../utils/thresholds';

interface SettingsState {
  emergencyContact: { name: string; phone: string };
  fallSensitivity: number; // 1-5
  thresholds: AlertThresholds;
  language: 'zh' | 'en';
  countdownSeconds: number;
  webhookUrl: string;
  setEmergencyContact: (c: { name: string; phone: string }) => void;
  setFallSensitivity: (n: number) => void;
  setThreshold: (key: keyof AlertThresholds, value: number) => void;
  setLanguage: (lang: 'zh' | 'en') => void;
  setCountdownSeconds: (n: number) => void;
  setWebhookUrl: (url: string) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      emergencyContact: { name: '', phone: '' },
      fallSensitivity: 3,
      thresholds: { ...DEFAULT_THRESHOLDS },
      language: 'zh',
      countdownSeconds: 30,
      webhookUrl: '',
      setEmergencyContact: (c) => set({ emergencyContact: c }),
      setFallSensitivity: (n) => set({ fallSensitivity: n }),
      setThreshold: (key, value) =>
        set({ thresholds: { ...get().thresholds, [key]: value } }),
      setLanguage: (lang) => set({ language: lang }),
      setCountdownSeconds: (n) => set({ countdownSeconds: n }),
      setWebhookUrl: (url) => set({ webhookUrl: url }),
    }),
    {
      name: 'elderguard-settings',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

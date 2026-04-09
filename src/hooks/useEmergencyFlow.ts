import { useEffect, useRef } from 'react';
import { useShoeStore } from '../store/useShoeStore';
import { useBioStore } from '../store/useBioStore';
import { useEmergencyStore } from '../store/useEmergencyStore';
import { useSettingsStore } from '../store/useSettingsStore';

export function useEmergencyFlow() {
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Watch for fall detection
  useEffect(() => {
    const unsub = useShoeStore.subscribe((state, prev) => {
      if (state.fallDetected && !prev.fallDetected) {
        useEmergencyStore.getState().triggerEmergency('fall', 'Fall detected by shoe sensor');
        useShoeStore.getState().acknowledgeFall();
      }
    });
    return unsub;
  }, []);

  // Watch biomarker thresholds
  useEffect(() => {
    const unsub = useBioStore.subscribe((state, prev) => {
      if (!state.current || state.current === prev.current) return;
      if (useEmergencyStore.getState().status !== 'idle') return;

      const r = state.current;
      const t = useSettingsStore.getState().thresholds;

      if (r.heartRate < t.heartRateMin)
        return useEmergencyStore.getState().triggerEmergency('biomarker', `Heart rate low: ${Math.round(r.heartRate)} bpm`);
      if (r.heartRate > t.heartRateMax)
        return useEmergencyStore.getState().triggerEmergency('biomarker', `Heart rate high: ${Math.round(r.heartRate)} bpm`);
      if (r.spo2 < t.spo2Min)
        return useEmergencyStore.getState().triggerEmergency('biomarker', `SpO2 low: ${Math.round(r.spo2)}%`);
      if (r.temperature < t.temperatureMin || r.temperature > t.temperatureMax)
        return useEmergencyStore.getState().triggerEmergency('biomarker', `Temperature abnormal: ${r.temperature.toFixed(1)}°C`);
      if (r.systolic > t.systolicMax || r.diastolic > t.diastolicMax)
        return useEmergencyStore.getState().triggerEmergency('biomarker', `Blood pressure high: ${Math.round(r.systolic)}/${Math.round(r.diastolic)}`);
    });
    return unsub;
  }, []);

  // Countdown ticker — starts when status becomes 'triggered'
  useEffect(() => {
    const unsub = useEmergencyStore.subscribe((state, prev) => {
      if (state.status === 'triggered' && prev.status !== 'triggered') {
        countdownRef.current = setInterval(() => {
          useEmergencyStore.getState().tick();
        }, 1000);
      }
      if (state.status !== 'triggered' && prev.status === 'triggered') {
        if (countdownRef.current) {
          clearInterval(countdownRef.current);
          countdownRef.current = null;
        }
      }
    });
    return () => {
      unsub();
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);
}

import { useEffect, useRef } from 'react';
import { useBioStore } from '../store/useBioStore';
import { useShoeStore } from '../store/useShoeStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { useRiskStore } from '../store/useRiskStore';

const SYNC_INTERVAL_MS = 30_000;
const MAX_READINGS = 30;

export function useDataSync() {
  const lastFallRef = useRef<number | null>(null);

  useEffect(() => {
    const sync = async () => {
      const { webhookUrl } = useSettingsStore.getState();
      if (!webhookUrl.trim()) return;

      // Derive base URL from the /emergency webhook URL saved in settings
      const baseUrl = webhookUrl.trim().replace(/\/emergency\/?$/, '');

      const history = useBioStore.getState().history;
      const readings = history.slice(-MAX_READINGS);

      const { lastFallTime } = useShoeStore.getState();
      const falls: { timestamp: number }[] = [];
      if (lastFallTime !== null && lastFallTime !== lastFallRef.current) {
        falls.push({ timestamp: lastFallTime });
        lastFallRef.current = lastFallTime;
      }

      if (readings.length === 0) return;

      try {
        const res = await fetch(`${baseUrl}/readings`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ readings, falls }),
        });
        if (!res.ok) return;
        const data = await res.json();
        if (Array.isArray(data.risks) && data.risks.length > 0) {
          useRiskStore.getState().addRisks(data.risks);
        }
      } catch {
        // Network errors are silent — data sync is best-effort
      }
    };

    // Sync immediately on mount, then every 30 s
    sync();
    const id = setInterval(sync, SYNC_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);
}

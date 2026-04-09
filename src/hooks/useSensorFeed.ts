import { useEffect } from 'react';
import { sensorManager } from '../sensors/SensorManager';
import { useBioStore } from '../store/useBioStore';
import { useShoeStore } from '../store/useShoeStore';

export function useSensorFeed() {
  const updateBio = useBioStore((s) => s.updateReading);
  const updateShoe = useShoeStore((s) => s.updateReading);

  useEffect(() => {
    const stop = sensorManager.start(updateBio, updateShoe);
    return stop;
  }, []);
}

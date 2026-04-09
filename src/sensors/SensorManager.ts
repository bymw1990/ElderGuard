import { bandAdapter, shoeAdapter } from './index';
import { BioMarkerReading, ShoeReading } from './types';

type BioCallback = (r: BioMarkerReading) => void;
type ShoeCallback = (r: ShoeReading) => void;

class SensorManager {
  private running = false;

  start(onBio: BioCallback, onShoe: ShoeCallback): () => void {
    if (this.running) return () => {};
    this.running = true;

    const unsubBio = bandAdapter.onReading(onBio);
    const unsubShoe = shoeAdapter.onReading(onShoe);

    bandAdapter.start();
    shoeAdapter.start();

    return () => {
      bandAdapter.stop();
      shoeAdapter.stop();
      unsubBio();
      unsubShoe();
      this.running = false;
    };
  }
}

export const sensorManager = new SensorManager();

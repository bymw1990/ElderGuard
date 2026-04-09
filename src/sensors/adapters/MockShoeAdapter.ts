import { SensorAdapter, ShoeReading } from '../types';
import { SHOE_SAMPLE_INTERVAL_MS, MOCK_FALL_INTERVAL_MS } from '../../utils/constants';

export class MockShoeAdapter implements SensorAdapter<ShoeReading> {
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private fallTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private callbacks: ((r: ShoeReading) => void)[] = [];
  private isFalling = false;
  private fallTicksRemaining = 0;
  private gaitTickCount = 0;

  start() {
    this.intervalId = setInterval(() => this.tick(), SHOE_SAMPLE_INTERVAL_MS);
    this.scheduleFall();
  }

  stop() {
    if (this.intervalId) clearInterval(this.intervalId);
    if (this.fallTimeoutId) clearTimeout(this.fallTimeoutId);
    this.intervalId = null;
    this.fallTimeoutId = null;
  }

  onReading(cb: (r: ShoeReading) => void) {
    this.callbacks.push(cb);
    return () => {
      this.callbacks = this.callbacks.filter((c) => c !== cb);
    };
  }

  private scheduleFall() {
    this.fallTimeoutId = setTimeout(() => {
      this.isFalling = true;
      this.fallTicksRemaining = 15; // ~1.5s of fall readings
      this.scheduleFall(); // reschedule next fall
    }, MOCK_FALL_INTERVAL_MS);
  }

  private tick() {
    this.gaitTickCount++;

    let gaitStatus: ShoeReading['gaitStatus'] = 'normal';
    let accel = {
      x: (Math.random() - 0.5) * 0.2,
      y: (Math.random() - 0.5) * 0.2,
      z: 9.8 + (Math.random() - 0.5) * 0.4,
    };

    if (this.isFalling && this.fallTicksRemaining > 0) {
      gaitStatus = 'fall';
      accel = {
        x: (Math.random() - 0.5) * 20,
        y: (Math.random() - 0.5) * 20,
        z: (Math.random() - 0.5) * 20,
      };
      this.fallTicksRemaining--;
      if (this.fallTicksRemaining === 0) this.isFalling = false;
    } else if (this.gaitTickCount % 300 < 30) {
      // Occasional uneven ground window
      gaitStatus = 'uneven';
    } else if (this.gaitTickCount % 500 < 20) {
      gaitStatus = 'shuffle';
    }

    const reading: ShoeReading = {
      timestamp: Date.now(),
      leftPressure: Array.from({ length: 4 }, () => Math.random()),
      rightPressure: Array.from({ length: 4 }, () => Math.random()),
      accelerometer: accel,
      gaitStatus,
      source: 'mock',
    };

    this.callbacks.forEach((cb) => cb(reading));
  }
}

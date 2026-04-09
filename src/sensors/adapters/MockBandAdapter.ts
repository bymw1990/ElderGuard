import { SensorAdapter, BioMarkerReading } from '../types';
import { BIO_SAMPLE_INTERVAL_MS } from '../../utils/constants';

export class MockBandAdapter implements SensorAdapter<BioMarkerReading> {
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private callbacks: ((r: BioMarkerReading) => void)[] = [];

  // Running state for bounded random walk
  private hr = 72;
  private spo2 = 98;
  private temp = 36.8;
  private systolic = 120;
  private diastolic = 80;
  private steps = 0;
  private tickCount = 0;

  private clamp(v: number, min: number, max: number) {
    return Math.min(Math.max(v, min), max);
  }

  private walk(v: number, delta: number, min: number, max: number) {
    return this.clamp(v + (Math.random() - 0.5) * delta * 2, min, max);
  }

  start() {
    this.intervalId = setInterval(() => this.tick(), BIO_SAMPLE_INTERVAL_MS);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  onReading(cb: (r: BioMarkerReading) => void) {
    this.callbacks.push(cb);
    return () => {
      this.callbacks = this.callbacks.filter((c) => c !== cb);
    };
  }

  private tick() {
    this.tickCount++;

    // Simulate a bradycardia dip every 120 ticks
    const hrTarget = this.tickCount % 120 < 5 ? 42 : 72;
    this.hr = this.clamp(this.hr + (hrTarget - this.hr) * 0.1 + (Math.random() - 0.5) * 4, 40, 140);
    this.spo2 = this.walk(this.spo2, 0.3, 90, 100);
    this.temp = this.walk(this.temp, 0.05, 35, 40);
    this.systolic = this.walk(this.systolic, 3, 90, 200);
    this.diastolic = this.walk(this.diastolic, 2, 60, 120);
    this.steps += Math.floor(Math.random() * 3);

    const reading: BioMarkerReading = {
      timestamp: Date.now(),
      heartRate: this.hr,
      spo2: this.spo2,
      temperature: this.temp,
      systolic: this.systolic,
      diastolic: this.diastolic,
      stepCount: this.steps,
      source: 'mock',
    };

    this.callbacks.forEach((cb) => cb(reading));
  }
}

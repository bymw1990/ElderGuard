export interface BioMarkerReading {
  timestamp: number;
  heartRate: number;       // bpm
  spo2: number;            // percent
  temperature: number;     // Celsius
  systolic: number;        // mmHg
  diastolic: number;       // mmHg
  stepCount: number;       // cumulative
  source: 'mock' | 'ble';
}

export interface ShoeReading {
  timestamp: number;
  leftPressure: number[];  // normalized 0-1
  rightPressure: number[];
  accelerometer: { x: number; y: number; z: number };
  gaitStatus: 'normal' | 'shuffle' | 'uneven' | 'fall';
  source: 'mock' | 'ble';
}

export type SensorReading = BioMarkerReading | ShoeReading;

export interface SensorAdapter<T extends SensorReading> {
  start(): void;
  stop(): void;
  onReading(cb: (reading: T) => void): () => void;
}

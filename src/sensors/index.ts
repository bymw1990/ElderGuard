import { MockBandAdapter } from './adapters/MockBandAdapter';
import { MockShoeAdapter } from './adapters/MockShoeAdapter';
import { BleBandAdapter } from './adapters/BleBandAdapter';
import { BleShoeAdapter } from './adapters/BleShoeAdapter';
import { SensorAdapter, BioMarkerReading, ShoeReading } from './types';

const USE_REAL_BLE = process.env.EXPO_PUBLIC_USE_REAL_BLE === 'true';

export const bandAdapter: SensorAdapter<BioMarkerReading> = USE_REAL_BLE
  ? new BleBandAdapter()
  : new MockBandAdapter();

export const shoeAdapter: SensorAdapter<ShoeReading> = USE_REAL_BLE
  ? new BleShoeAdapter()
  : new MockShoeAdapter();

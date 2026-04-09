// Stubs — implement with react-native-ble-plx when switching to real hardware
import { SensorAdapter, ShoeReading } from '../types';

export class BleShoeAdapter implements SensorAdapter<ShoeReading> {
  start() { throw new Error('BleShoeAdapter not implemented'); }
  stop() {}
  onReading(_cb: (r: ShoeReading) => void) { return () => {}; }
}

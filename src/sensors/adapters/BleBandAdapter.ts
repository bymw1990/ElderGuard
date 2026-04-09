// Stubs — implement with react-native-ble-plx when switching to real hardware
import { SensorAdapter, BioMarkerReading } from '../types';

export class BleBandAdapter implements SensorAdapter<BioMarkerReading> {
  start() { throw new Error('BleBandAdapter not implemented'); }
  stop() {}
  onReading(_cb: (r: BioMarkerReading) => void) { return () => {}; }
}

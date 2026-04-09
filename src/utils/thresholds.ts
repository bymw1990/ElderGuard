export interface AlertThresholds {
  heartRateMin: number;
  heartRateMax: number;
  spo2Min: number;
  temperatureMin: number;
  temperatureMax: number;
  systolicMax: number;
  diastolicMax: number;
}

export const DEFAULT_THRESHOLDS: AlertThresholds = {
  heartRateMin: 50,
  heartRateMax: 120,
  spo2Min: 92,
  temperatureMin: 35.5,
  temperatureMax: 38.5,
  systolicMax: 180,
  diastolicMax: 110,
};

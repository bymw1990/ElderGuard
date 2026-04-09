export const fmtHeartRate = (v: number) => `${Math.round(v)} bpm`;
export const fmtSpo2 = (v: number) => `${Math.round(v)}%`;
export const fmtTemp = (v: number) => `${v.toFixed(1)}°C`;
export const fmtBP = (sys: number, dia: number) =>
  `${Math.round(sys)}/${Math.round(dia)} mmHg`;
export const fmtSteps = (v: number) => `${Math.round(v)} steps`;

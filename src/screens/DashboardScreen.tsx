import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useBioStore } from '../store/useBioStore';
import { useSettingsStore } from '../store/useSettingsStore';
import MetricCard from '../components/common/MetricCard';
import SectionHeader from '../components/common/SectionHeader';
import { useTranslation } from '../i18n/useTranslation';
import {
  fmtHeartRate,
  fmtSpo2,
  fmtTemp,
  fmtBP,
  fmtSteps,
} from '../utils/formatters';

type Status = 'normal' | 'warning' | 'critical' | 'unknown';

function heartRateStatus(hr: number, min: number, max: number): Status {
  if (hr < min - 10 || hr > max + 20) return 'critical';
  if (hr < min || hr > max) return 'warning';
  return 'normal';
}

export default function DashboardScreen() {
  const { t } = useTranslation();
  const current = useBioStore((s) => s.current);
  const status = useBioStore((s) => s.status);
  const thresholds = useSettingsStore((s) => s.thresholds);

  if (!current) {
    return (
      <View style={styles.centered}>
        <Text style={styles.waitText}>{t('connecting_sensors')}</Text>
      </View>
    );
  }

  const hrStatus = heartRateStatus(current.heartRate, thresholds.heartRateMin, thresholds.heartRateMax);
  const spo2Status: Status = current.spo2 < thresholds.spo2Min ? (current.spo2 < thresholds.spo2Min - 3 ? 'critical' : 'warning') : 'normal';
  const tempStatus: Status =
    current.temperature < thresholds.temperatureMin || current.temperature > thresholds.temperatureMax
      ? 'warning' : 'normal';
  const bpStatus: Status =
    current.systolic > thresholds.systolicMax || current.diastolic > thresholds.diastolicMax
      ? 'critical' : 'normal';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.banner}>
        <Text style={styles.bannerText}>
          {status === 'streaming' ? t('status_simulated') : t('status_idle')}
        </Text>
      </View>
      <SectionHeader title={t('vital_signs')} />
      <MetricCard label={t('heart_rate')} value={fmtHeartRate(current.heartRate)} status={hrStatus} />
      <MetricCard label={t('blood_oxygen')} value={fmtSpo2(current.spo2)} status={spo2Status} />
      <MetricCard label={t('body_temperature')} value={fmtTemp(current.temperature)} status={tempStatus} />
      <MetricCard label={t('blood_pressure')} value={fmtBP(current.systolic, current.diastolic)} status={bpStatus} />
      <SectionHeader title={t('activity')} />
      <MetricCard label={t('step_count')} value={fmtSteps(current.stepCount)} status="normal" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d0d23' },
  content: { padding: 16, paddingBottom: 40 },
  centered: { flex: 1, backgroundColor: '#0d0d23', alignItems: 'center', justifyContent: 'center' },
  waitText: { color: '#888', fontSize: 16 },
  banner: {
    backgroundColor: '#16213e',
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
  bannerText: { color: '#00c896', fontSize: 12, fontWeight: '600', letterSpacing: 1 },
});

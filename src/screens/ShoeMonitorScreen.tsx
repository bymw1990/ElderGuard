import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useShoeStore } from '../store/useShoeStore';
import SectionHeader from '../components/common/SectionHeader';
import MetricCard from '../components/common/MetricCard';
import { useTranslation } from '../i18n/useTranslation';
import { TranslationKeys } from '../i18n/translations';

const gaitKeyMap: Record<string, TranslationKeys> = {
  normal: 'gait_normal',
  shuffle: 'gait_shuffle',
  uneven: 'gait_uneven',
  fall: 'gait_fall',
};

const gaitStatus = (g: string) => {
  if (g === 'fall') return 'critical' as const;
  if (g === 'shuffle' || g === 'uneven') return 'warning' as const;
  return 'normal' as const;
};

export default function ShoeMonitorScreen() {
  const { t } = useTranslation();
  const current = useShoeStore((s) => s.current);
  const lastFallTime = useShoeStore((s) => s.lastFallTime);

  if (!current) {
    return (
      <View style={styles.centered}>
        <Text style={styles.waitText}>{t('connecting_shoe_sensors')}</Text>
      </View>
    );
  }

  const accel = current.accelerometer;
  const accelMag = Math.sqrt(accel.x ** 2 + accel.y ** 2 + accel.z ** 2);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {current.gaitStatus === 'fall' && (
        <View style={styles.alert}>
          <Text style={styles.alertText}>{t('gait_fall')}</Text>
        </View>
      )}
      <SectionHeader title={t('gait_status')} />
      <MetricCard
        label={t('current_gait')}
        value={gaitKeyMap[current.gaitStatus] ? t(gaitKeyMap[current.gaitStatus]) : current.gaitStatus}
        status={gaitStatus(current.gaitStatus)}
      />
      <SectionHeader title={t('accelerometer')} />
      <MetricCard label={t('accel_magnitude')} value={accelMag.toFixed(2)} status={accelMag > 15 ? 'critical' : 'normal'} />
      <MetricCard label={t('accel_x')} value={accel.x.toFixed(2)} status="normal" />
      <MetricCard label={t('accel_y')} value={accel.y.toFixed(2)} status="normal" />
      <MetricCard label={t('accel_z')} value={accel.z.toFixed(2)} status="normal" />
      <SectionHeader title={t('pressure_avg')} />
      <MetricCard
        label={t('left_foot')}
        value={`${(current.leftPressure.reduce((a, b) => a + b, 0) / current.leftPressure.length * 100).toFixed(0)}%`}
        status="normal"
      />
      <MetricCard
        label={t('right_foot')}
        value={`${(current.rightPressure.reduce((a, b) => a + b, 0) / current.rightPressure.length * 100).toFixed(0)}%`}
        status="normal"
      />
      {lastFallTime && (
        <Text style={styles.lastFall}>
          {t('last_fall', { time: new Date(lastFallTime).toLocaleTimeString() })}
        </Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d0d23' },
  content: { padding: 16, paddingBottom: 40 },
  centered: { flex: 1, backgroundColor: '#0d0d23', alignItems: 'center', justifyContent: 'center' },
  waitText: { color: '#888', fontSize: 16 },
  alert: {
    backgroundColor: '#e63946',
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    alignItems: 'center',
  },
  alertText: { color: '#fff', fontSize: 18, fontWeight: '800', letterSpacing: 2 },
  lastFall: { color: '#888', fontSize: 12, textAlign: 'center', marginTop: 16 },
});

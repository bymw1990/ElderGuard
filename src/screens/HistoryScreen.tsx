import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useBioStore } from '../store/useBioStore';
import { LineChart } from 'react-native-gifted-charts';
import SectionHeader from '../components/common/SectionHeader';
import { useTranslation } from '../i18n/useTranslation';
import { fmtHeartRate } from '../utils/formatters';

export default function HistoryScreen() {
  const { t } = useTranslation();
  const history = useBioStore((s) => s.history);

  if (history.length < 2) {
    return (
      <View style={styles.centered}>
        <Text style={styles.waitText}>{t('collecting_data')}</Text>
      </View>
    );
  }

  const chartData = history.slice(-60).map((r) => ({ value: r.heartRate }));
  const recent = history.slice(-10).reverse();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <SectionHeader title={t('heart_rate_chart')} />
      <View style={styles.chartContainer}>
        <LineChart
          data={chartData}
          width={320}
          height={160}
          color="#e63946"
          thickness={2}
          dataPointsColor="#e63946"
          hideDataPoints
          curved
          yAxisColor="#333"
          xAxisColor="#333"
          yAxisTextStyle={{ color: '#888', fontSize: 10 }}
          noOfSections={4}
          initialSpacing={0}
          backgroundColor="#16213e"
        />
      </View>

      <SectionHeader title={t('recent_readings')} />
      {recent.map((r, i) => (
        <View key={i} style={styles.row}>
          <Text style={styles.time}>{new Date(r.timestamp).toLocaleTimeString()}</Text>
          <Text style={styles.hrVal}>{fmtHeartRate(r.heartRate)}</Text>
          <Text style={styles.spo2Val}>{t('spo2_value', { value: Math.round(r.spo2) })}</Text>
          <Text style={styles.tempVal}>{r.temperature.toFixed(1)}°C</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d0d23' },
  content: { padding: 16, paddingBottom: 40 },
  centered: { flex: 1, backgroundColor: '#0d0d23', alignItems: 'center', justifyContent: 'center' },
  waitText: { color: '#888', fontSize: 16 },
  chartContainer: { borderRadius: 12, overflow: 'hidden', marginBottom: 8 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#16213e',
    borderRadius: 8,
    padding: 10,
    marginBottom: 6,
  },
  time: { color: '#888', fontSize: 12, width: 70 },
  hrVal: { color: '#e63946', fontSize: 14, fontWeight: '600' },
  spo2Val: { color: '#00c896', fontSize: 13 },
  tempVal: { color: '#f4a261', fontSize: 13 },
});

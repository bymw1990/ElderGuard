import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type Status = 'normal' | 'warning' | 'critical' | 'unknown';

interface Props {
  label: string;
  value: string;
  status?: Status;
}

const statusColor: Record<Status, string> = {
  normal: '#00c896',
  warning: '#f4a261',
  critical: '#e63946',
  unknown: '#888',
};

export default function MetricCard({ label, value, status = 'unknown' }: Props) {
  const color = statusColor[status];
  return (
    <View style={[styles.card, { borderLeftColor: color }]}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, { color }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    borderLeftWidth: 4,
    padding: 16,
    marginBottom: 12,
  },
  label: {
    color: '#aaa',
    fontSize: 13,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  value: {
    fontSize: 26,
    fontWeight: '700',
  },
});

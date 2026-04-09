import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function SectionHeader({ title }: { title: string }) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 8, marginTop: 16 },
  text: { color: '#00b4d8', fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
});

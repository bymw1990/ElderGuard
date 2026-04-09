import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useRiskStore, Risk } from '../store/useRiskStore';
import { useTranslation } from '../i18n/useTranslation';
import { useSettingsStore } from '../store/useSettingsStore';
import { TranslationKeys } from '../i18n/translations';

const LEVEL_COLORS: Record<Risk['level'], string> = {
  low: '#f4a261',
  medium: '#e07b00',
  high: '#e63946',
  critical: '#9b0000',
};

const LEVEL_KEYS: Record<Risk['level'], TranslationKeys> = {
  low: 'risk_level_low',
  medium: 'risk_level_medium',
  high: 'risk_level_high',
  critical: 'risk_level_critical',
};

function RiskCard({ risk }: { risk: Risk }) {
  const { t } = useTranslation();
  const language = useSettingsStore((s) => s.language);
  const color = LEVEL_COLORS[risk.level] ?? '#e63946';

  return (
    <View style={[styles.card, { borderLeftColor: color }]}>
      <Text style={[styles.levelBadge, { color }]}>{t(LEVEL_KEYS[risk.level])}</Text>
      <Text style={styles.message}>
        {language === 'zh' ? risk.message_zh : risk.message_en}
      </Text>
    </View>
  );
}

export default function RiskWarningScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const risks = useRiskStore((s) => s.risks);
  const acknowledgeAll = useRiskStore((s) => s.acknowledgeAll);

  const handleAcknowledge = () => {
    acknowledgeAll();
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('risk_warning_title')}</Text>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {risks.map((risk) => (
          <RiskCard key={risk.id} risk={risk} />
        ))}
      </ScrollView>
      <TouchableOpacity style={styles.button} onPress={handleAcknowledge} activeOpacity={0.8}>
        <Text style={styles.buttonText}>{t('acknowledge_all')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d0d0d',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 24,
  },
  scroll: {
    gap: 14,
    paddingBottom: 16,
  },
  card: {
    backgroundColor: '#1c1c1e',
    borderRadius: 12,
    borderLeftWidth: 5,
    padding: 16,
  },
  levelBadge: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  message: {
    fontSize: 15,
    color: '#e5e5e7',
    lineHeight: 22,
  },
  button: {
    backgroundColor: '#e63946',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
  },
});

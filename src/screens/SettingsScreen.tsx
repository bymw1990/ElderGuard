import React, { useState } from 'react';
import {
  ScrollView, View, Text, TextInput, StyleSheet,
  TouchableOpacity, Alert
} from 'react-native';
import { useSettingsStore } from '../store/useSettingsStore';
import { useEmergencyStore } from '../store/useEmergencyStore';
import { useRiskStore } from '../store/useRiskStore';
import SectionHeader from '../components/common/SectionHeader';
import { useTranslation } from '../i18n/useTranslation';

export default function SettingsScreen() {
  const { t } = useTranslation();
  const { emergencyContact, setEmergencyContact, fallSensitivity, setFallSensitivity, language, setLanguage, countdownSeconds, setCountdownSeconds, webhookUrl, setWebhookUrl } =
    useSettingsStore();
  const [name, setName] = useState(emergencyContact.name);
  const [phone, setPhone] = useState(emergencyContact.phone);
  const [webhookInput, setWebhookInput] = useState(webhookUrl);

  const save = () => {
    setEmergencyContact({ name, phone });
    setWebhookUrl(webhookInput.trim());
    Alert.alert(t('saved_title'), t('saved_body'));
  };

  const testAlert = () => {
    useEmergencyStore.getState().triggerEmergency('fall', 'Test alert from Settings');
  };

  const testRiskWarning = () => {
    const now = Date.now();
    useRiskStore.getState().addRisks([
      {
        id: `hr_decline_${now}`,
        type: 'hr_decline',
        level: 'medium',
        message_zh: '心率持续下降（每次读数 -0.8 bpm），请注意监测。',
        message_en: 'Heart rate trending downward (-0.8 bpm/reading). Monitor closely.',
      },
      {
        id: `fall_frequency_${now}`,
        type: 'fall_frequency',
        level: 'high',
        message_zh: '过去 24 小时内检测到 3 次跌倒，跌倒风险较高，请注意安全。',
        message_en: '3 falls detected in the past 24 hours. High fall risk — please take precautions.',
      },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <SectionHeader title={t('emergency_contact')} />
      <View style={styles.field}>
        <Text style={styles.label}>{t('name_label')}</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder={t('name_placeholder')}
          placeholderTextColor="#555"
        />
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>{t('phone_label')}</Text>
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          placeholder={t('phone_placeholder')}
          placeholderTextColor="#555"
          keyboardType="phone-pad"
        />
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>{t('webhook_url_label')}</Text>
        <TextInput
          style={styles.input}
          value={webhookInput}
          onChangeText={setWebhookInput}
          placeholder={t('webhook_url_placeholder')}
          placeholderTextColor="#555"
          keyboardType="url"
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>
      <TouchableOpacity style={styles.saveBtn} onPress={save}>
        <Text style={styles.saveBtnText}>{t('save_contact')}</Text>
      </TouchableOpacity>

      <SectionHeader title={t('fall_sensitivity')} />
      <Text style={styles.sensitivityLabel}>
        {t('sensitivity_level', { n: fallSensitivity })}
      </Text>
      <View style={styles.sensitivityRow}>
        {[1, 2, 3, 4, 5].map((n) => (
          <TouchableOpacity
            key={n}
            style={[styles.sensitivityBtn, fallSensitivity === n && styles.sensitivityBtnActive]}
            onPress={() => setFallSensitivity(n)}
          >
            <Text style={[styles.sensitivityBtnText, fallSensitivity === n && styles.sensitivityBtnTextActive]}>
              {n}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <SectionHeader title={t('countdown_duration')} />
      <View style={styles.countdownRow}>
        <TouchableOpacity
          style={[styles.countdownBtn, countdownSeconds <= 10 && styles.countdownBtnDisabled]}
          onPress={() => setCountdownSeconds(Math.max(10, countdownSeconds - 5))}
          disabled={countdownSeconds <= 10}
        >
          <Text style={styles.countdownBtnText}>−5</Text>
        </TouchableOpacity>
        <Text style={styles.countdownValue}>{t('countdown_value', { n: countdownSeconds })}</Text>
        <TouchableOpacity
          style={[styles.countdownBtn, countdownSeconds >= 120 && styles.countdownBtnDisabled]}
          onPress={() => setCountdownSeconds(Math.min(120, countdownSeconds + 5))}
          disabled={countdownSeconds >= 120}
        >
          <Text style={styles.countdownBtnText}>+5</Text>
        </TouchableOpacity>
      </View>

      <SectionHeader title={t('language_section')} />
      <View style={styles.langRow}>
        <TouchableOpacity
          style={[styles.langBtn, language === 'en' && styles.langBtnActive]}
          onPress={() => setLanguage('en')}
        >
          <Text style={[styles.langBtnText, language === 'en' && styles.langBtnTextActive]}>
            {t('lang_en')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.langBtn, language === 'zh' && styles.langBtnActive]}
          onPress={() => setLanguage('zh')}
        >
          <Text style={[styles.langBtnText, language === 'zh' && styles.langBtnTextActive]}>
            {t('lang_zh')}
          </Text>
        </TouchableOpacity>
      </View>

      <SectionHeader title={t('test_section')} />
      <TouchableOpacity style={styles.testBtn} onPress={testAlert}>
        <Text style={styles.testBtnText}>{t('trigger_test_alert')}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.testBtn, styles.testRiskBtn]} onPress={testRiskWarning}>
        <Text style={styles.testBtnText}>{t('trigger_test_risk')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d0d23' },
  content: { padding: 16, paddingBottom: 40 },
  field: { marginBottom: 12 },
  label: { color: '#aaa', fontSize: 13, marginBottom: 4 },
  input: {
    backgroundColor: '#16213e',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  saveBtn: {
    backgroundColor: '#00b4d8',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  sensitivityLabel: { color: '#aaa', marginBottom: 12 },
  sensitivityRow: { flexDirection: 'row', gap: 10 },
  sensitivityBtn: {
    flex: 1,
    backgroundColor: '#16213e',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  sensitivityBtnActive: { backgroundColor: '#00b4d8', borderColor: '#00b4d8' },
  sensitivityBtnText: { color: '#888', fontSize: 16, fontWeight: '600' },
  sensitivityBtnTextActive: { color: '#fff' },
  langRow: { flexDirection: 'row', gap: 10, marginTop: 8 },
  langBtn: {
    flex: 1,
    backgroundColor: '#16213e',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  langBtnActive: { backgroundColor: '#00b4d8', borderColor: '#00b4d8' },
  langBtnText: { color: '#888', fontSize: 16, fontWeight: '600' },
  langBtnTextActive: { color: '#fff' },
  countdownRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 8 },
  countdownBtn: {
    backgroundColor: '#16213e',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  countdownBtnDisabled: { opacity: 0.35 },
  countdownBtnText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  countdownValue: { flex: 1, textAlign: 'center', color: '#fff', fontSize: 18, fontWeight: '600' },
  testBtn: {
    backgroundColor: '#e63946',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  testRiskBtn: {
    backgroundColor: '#e07b00',
    marginTop: 10,
  },
  testBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});

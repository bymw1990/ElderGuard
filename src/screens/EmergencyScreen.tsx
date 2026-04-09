import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Svg, { Circle } from 'react-native-svg';
import { useEmergencyStore } from '../store/useEmergencyStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { EmergencyService } from '../services/EmergencyService';
import { useTranslation } from '../i18n/useTranslation';
import { TranslationKeys } from '../i18n/translations';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../navigation/types';

const RADIUS = 80;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

type EmergencyStep = 'alarm' | 'notify' | 'sms' | 'call';

const stepKeyMap: Record<EmergencyStep, TranslationKeys> = {
  alarm: 'step_alarm',
  notify: 'step_notify',
  sms: 'step_sms',
  call: 'step_call',
};

export default function EmergencyScreen() {
  const { t } = useTranslation();
  const nav = useNavigation<StackNavigationProp<RootStackParamList>>();
  const status = useEmergencyStore((s) => s.status);
  const triggerDetail = useEmergencyStore((s) => s.triggerDetail);
  const countdown = useEmergencyStore((s) => s.countdownSecondsRemaining);
  const totalCountdown = useEmergencyStore((s) => s.totalCountdownSeconds);
  const stepsCompleted = useEmergencyStore((s) => s.stepsCompleted);
  const cancel = useEmergencyStore((s) => s.cancel);
  const contact = useSettingsStore((s) => s.emergencyContact);

  // Execute emergency when status transitions to executing
  useEffect(() => {
    if (status === 'executing') {
      EmergencyService.execute(contact, triggerDetail);
    }
  }, [status]);

  // Stop alarm and dismiss when cancelled/completed
  useEffect(() => {
    if (status === 'cancelled' || status === 'completed' || status === 'idle') {
      EmergencyService.stopAlarm();
      if (nav.canGoBack()) nav.goBack();
    }
  }, [status]);

  const progress = totalCountdown > 0 ? countdown / totalCountdown : 0;
  const strokeDashoffset = CIRCUMFERENCE * (1 - progress);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>
        {status === 'executing' ? t('emergency_in_progress') : t('emergency_detected')}
      </Text>
      <Text style={styles.detail}>{triggerDetail}</Text>

      {status === 'triggered' && (
        <>
          <View style={styles.ringContainer}>
            <Svg width={200} height={200} viewBox="0 0 200 200">
              <Circle cx={100} cy={100} r={RADIUS} stroke="#333" strokeWidth={12} fill="none" />
              <Circle
                cx={100} cy={100} r={RADIUS}
                stroke="#e63946"
                strokeWidth={12}
                fill="none"
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                rotation="-90"
                origin="100,100"
              />
            </Svg>
            <View style={styles.countdownOverlay}>
              <Text style={styles.countdownNumber}>{countdown}</Text>
              <Text style={styles.countdownSub}>{t('seconds')}</Text>
            </View>
          </View>
          <Text style={styles.hint}>{t('tap_cancel_hint')}</Text>
          <TouchableOpacity style={styles.cancelBtn} onPress={cancel}>
            <Text style={styles.cancelText}>{t('cancel')}</Text>
          </TouchableOpacity>
        </>
      )}

      {status === 'executing' && (
        <View style={styles.stepsContainer}>
          {(Object.entries(stepsCompleted) as [EmergencyStep, boolean][]).map(([step, done]) => (
            <View key={step} style={styles.stepRow}>
              <Text style={[styles.stepDot, done ? styles.stepDone : styles.stepPending]}>
                {done ? '✓' : '...'}
              </Text>
              <Text style={[styles.stepLabel, done && styles.stepLabelDone]}>
                {t(stepKeyMap[step])}
              </Text>
            </View>
          ))}
          {contact.phone ? (
            <Text style={styles.contactLine}>{t('contacting', { name: contact.name || contact.phone })}</Text>
          ) : (
            <Text style={styles.noContact}>{t('no_contact_set')}</Text>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d0d0d',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    color: '#e63946',
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 2,
    marginBottom: 8,
  },
  detail: {
    color: '#ccc',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
  },
  ringContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  countdownOverlay: {
    position: 'absolute',
    alignItems: 'center',
  },
  countdownNumber: {
    color: '#fff',
    fontSize: 56,
    fontWeight: '800',
  },
  countdownSub: {
    color: '#888',
    fontSize: 14,
  },
  hint: {
    color: '#888',
    fontSize: 14,
    marginBottom: 16,
  },
  cancelBtn: {
    backgroundColor: '#e63946',
    borderRadius: 40,
    paddingVertical: 20,
    paddingHorizontal: 60,
  },
  cancelText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 2,
  },
  stepsContainer: {
    width: '100%',
    marginTop: 16,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  stepDot: {
    fontSize: 20,
    width: 36,
    textAlign: 'center',
  },
  stepDone: { color: '#00c896' },
  stepPending: { color: '#888' },
  stepLabel: { color: '#888', fontSize: 16 },
  stepLabelDone: { color: '#fff' },
  contactLine: { color: '#aaa', fontSize: 14, marginTop: 24, textAlign: 'center' },
  noContact: { color: '#e63946', fontSize: 14, marginTop: 24, textAlign: 'center' },
});

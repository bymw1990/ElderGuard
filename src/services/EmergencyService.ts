import { Linking } from 'react-native';
import * as SMS from 'expo-sms';
import * as Haptics from 'expo-haptics';
import { AlarmService } from './AlarmService';
import { NotificationService } from './NotificationService';
import { LocationService } from './LocationService';
import { useEmergencyStore } from '../store/useEmergencyStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { getTranslation } from '../i18n/useTranslation';

export const EmergencyService = {
  async execute(contact: { name: string; phone: string }, detail: string) {
    const mark = (step: 'alarm' | 'notify' | 'sms' | 'call') =>
      useEmergencyStore.getState().markStepDone(step);

    // 1. Alarm + haptics
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    await AlarmService.play();
    mark('alarm');

    // 2. Push notification
    await NotificationService.sendEmergency(detail).catch(() => {});
    mark('notify');

    // 3. SMS + 4. Call — via webhook (automatic) or fallback (shows UI)
    const coords = await LocationService.getCurrentCoords();
    const smsBody = coords
      ? getTranslation('sms_body', {
          detail,
          url: `https://maps.google.com/?q=${coords.lat},${coords.lon}`,
        })
      : getTranslation('sms_body_no_location', { detail });

    const { webhookUrl, language } = useSettingsStore.getState();
    const callMessage = getTranslation('call_message', { detail });

    if (webhookUrl.trim() && contact.phone) {
      // Automatic: backend sends SMS and places call via Twilio
      await fetch(webhookUrl.trim(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: contact.phone, smsBody, callMessage, language }),
      }).catch((err) => console.warn('EmergencyService: webhook failed', err));
      mark('sms');
      mark('call');
    } else {
      // Fallback: shows compose UI / dialer (requires user interaction on iOS)
      const smsAvailable = await SMS.isAvailableAsync();
      if (smsAvailable && contact.phone) {
        await SMS.sendSMSAsync([contact.phone], smsBody).catch(() => {});
      }
      mark('sms');

      if (contact.phone) {
        await Linking.openURL(`tel:${contact.phone}`).catch(() => {});
      }
      mark('call');
    }
  },

  async stopAlarm() {
    await AlarmService.stop();
  },
};

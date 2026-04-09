import * as Notifications from 'expo-notifications';
import { getTranslation } from '../i18n/useTranslation';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const NotificationService = {
  async requestPermissions() {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  },

  async sendEmergency(detail: string) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: getTranslation('notification_title'),
        body: detail,
        sound: true,
      },
      trigger: null,
    });
  },
};

import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { useSettingsStore } from '../store/useSettingsStore';
import { Lang } from '../i18n/translations';

type ManualSection = { title: string; body: string };

const MANUAL_CONTENT: Record<Lang, ManualSection[]> = {
  zh: [
    {
      title: '什么是 ElderGuard？',
      body: 'ElderGuard 是一款专为老年人设计的实时健康监测应用。它通过可穿戴传感器持续追踪生命体征，包括心率、血氧饱和度（SpO2）、体温和血压，同时通过智能鞋垫传感器分析步态，检测跌倒事件。一旦检测到危险状况，ElderGuard 将自动通过推送通知、短信和电话联系您设定的紧急联系人。',
    },
    {
      title: '传感器工作原理',
      body: '本应用连接两类传感器。生物体征传感器（佩戴于手腕或胸部）每秒测量一次心率、血氧、体温和血压。鞋垫压力传感器每秒采集 10 次足底压力和运动数据，用于步态分析。\n\n当前版本使用模拟数据进行演示，仪表盘显示"模拟 — 实时"表示应用正在运行。接入真实蓝牙传感器后，标识将变为"实时"。',
    },
    {
      title: '紧急流程',
      body: '当检测到跌倒或生命体征异常时，系统将开始 30 秒倒计时。在此期间，您可以点击"取消"按钮中止警报，例如您只是绊了一下但无大碍。\n\n若倒计时结束前未取消，ElderGuard 将自动执行以下操作：\n① 鸣响警报并触发震动反馈\n② 向设备发送推送通知\n③ 向紧急联系人发送含 GPS 位置的短信\n④ 自动拨打紧急联系人电话',
    },
    {
      title: '设置指南',
      body: '紧急联系人：填写紧急情况下需要联系的人员姓名和电话号码，电话请使用国际格式（例如：+86 138 0000 0000）。填写完成后请点击"保存联系人"。\n\n跌倒检测灵敏度：1 至 5 级控制跌倒检测的灵敏程度。1 级仅在严重跌倒时触发，5 级在轻微碰撞时也会触发。建议大多数用户选择 3 级。\n\n测试警报：点击"触发测试警报"可模拟紧急情况，用于验证联系人是否可以接收到通知和来电。您可以在 30 秒倒计时期间点击取消来中止测试。',
    },
    {
      title: '故障排查',
      body: '传感器无法连接：当前版本使用模拟数据，无需实际传感器设备。在正式版本中，请确保蓝牙已开启，传感器已充电且在 10 米范围内。\n\n短信未发送：请确认紧急联系人的电话号码格式正确（国际格式）。发送短信需要蜂窝网络连接，仅有 Wi-Fi 时无法发送。\n\n推送通知未显示：请进入设备设置 → 通知 → ElderGuard，确认已允许通知权限。\n\n误报频繁：若频繁收到误报，请在设置中降低跌倒检测灵敏度（建议调至 2 级或 1 级）。生命体征警报的阈值出于安全考虑设置较为保守，如需调整请咨询医护人员。',
    },
  ],
  en: [
    {
      title: 'What is ElderGuard?',
      body: 'ElderGuard is a real-time health monitoring app for elderly individuals. It continuously tracks vital signs — heart rate, blood oxygen (SpO2), body temperature, and blood pressure — using wearable sensors. It also monitors walking patterns via smart shoe insoles to detect falls. If a dangerous event is detected, ElderGuard automatically alerts your emergency contact by notification, SMS, and phone call.',
    },
    {
      title: 'How Sensors Work',
      body: 'The app connects to two types of sensors. Biometric sensors (worn on the wrist or chest) measure heart rate, SpO2, temperature, and blood pressure once per second. Shoe insole sensors measure foot pressure and movement 10 times per second to analyze gait.\n\nIn the current version, sensor data is simulated for demonstration — the Dashboard shows "SIMULATED — Live" when running. When real Bluetooth sensors are connected, the label will change to "Live".',
    },
    {
      title: 'Emergency Flow',
      body: 'When a fall or dangerous vital sign is detected, a 30-second countdown begins. You have this window to cancel the alert by tapping CANCEL — for example, if you simply tripped but are fine.\n\nIf the countdown reaches zero without being cancelled, ElderGuard automatically:\n① Sounds an alarm and triggers haptic feedback\n② Sends a push notification to the device\n③ Sends an SMS with your GPS location to your emergency contact\n④ Dials your emergency contact\'s phone number',
    },
    {
      title: 'Settings Guide',
      body: 'Emergency Contact: Enter the name and phone number of the person to be contacted in an emergency. Use international format for the phone number (e.g. +1 555 000 1234). Tap Save Contact after entering details.\n\nFall Detection Sensitivity: Levels 1–5 control how sensitive the fall detector is. Level 1 only triggers on severe falls; level 5 triggers on milder impacts. We recommend level 3 for most users.\n\nTest Alert: Tap "Trigger Test Alert" to simulate an emergency. This is useful to verify your contact is reachable and notifications work correctly. You can cancel it during the 30-second countdown.',
    },
    {
      title: 'Troubleshooting',
      body: 'Sensors not connecting: The current version uses simulated data — no physical sensor connection is required. In a production build, ensure Bluetooth is enabled and the sensor devices are charged and in range (within 10 metres).\n\nSMS not sent: Ensure the emergency contact phone number is correct and in international format. SMS requires a cellular data connection — Wi-Fi alone is insufficient.\n\nNotifications not appearing: Go to your device Settings → Notifications → ElderGuard and ensure notifications are allowed.\n\nFalse alarms: If you are getting frequent false alarms, reduce the fall detection sensitivity in Settings (try level 2 or 1). For vital sign alerts, the thresholds are set conservatively for safety — contact your care provider before adjusting them.',
    },
  ],
};

export default function ManualScreen() {
  const language = useSettingsStore((s) => s.language);
  const sections = MANUAL_CONTENT[language];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {sections.map((section, i) => (
        <View key={i} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <Text style={styles.sectionBody}>{section.body}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d0d23',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    color: '#00b4d8',
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 10,
  },
  sectionBody: {
    color: '#ccc',
    fontSize: 15,
    lineHeight: 24,
  },
});

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
      title: '健康风险分析',
      body: 'ElderGuard 会每 30 秒将生命体征数据上传至后台服务器，服务器通过统计算法对数据进行分析，并在检测到潜在风险时主动弹出提醒。\n\n目前支持以下六类风险检测：\n• 心率上升趋势（持续走高）\n• 心率下降趋势（持续走低）\n• 血氧偏低（近期平均低于 94%）\n• 心率变异性偏低（自律性下降信号）\n• 血压上升趋势（收缩压持续升高）\n• 跌倒频率过高（24 小时内 ≥2 次）\n\n提醒以弹窗形式出现，按严重程度分为低风险（橙色）、中等风险（深橙）、高风险（红色）和高度风险（深红）。确认后点击"我知道了"关闭弹窗。\n\n注意：风险分析功能需要在设置中填写服务器地址，否则数据将不会上传，也不会产生提醒。',
    },
    {
      title: '免责声明',
      body: 'ElderGuard 的所有健康风险提醒均为纯辅助性质，仅供参考，不构成任何医疗建议、诊断或治疗依据。\n\n本应用基于统计规律进行预测，无法保证预测结果的准确性。漏报（未检测到实际风险）和误报（无实际风险时触发提醒）均属正常情况。\n\n若出现身体不适，请直接联系医护人员或拨打急救电话，不要仅依赖本应用的提醒。本应用及其开发者对因使用或未使用本应用的提醒功能而导致的任何健康事件或损失不承担任何法律或道义责任。',
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
      title: 'Health Risk Analysis',
      body: 'ElderGuard uploads vital sign data to a backend server every 30 seconds. The server applies statistical algorithms to the readings and proactively shows a popup when a potential risk pattern is detected.\n\nSix risk checks are currently supported:\n• Heart rate rising trend (sustained increase)\n• Heart rate declining trend (sustained decrease)\n• Low SpO2 (recent average below 94%)\n• Low heart rate variability (signal of reduced autonomic function)\n• Rising blood pressure trend (systolic increasing)\n• High fall frequency (≥2 falls within 24 hours)\n\nAlerts appear as a modal popup, colour-coded by severity: Low Risk (amber), Medium Risk (dark orange), High Risk (red), Critical Risk (deep red). Tap Acknowledge to dismiss.\n\nNote: risk analysis requires a server URL to be configured in Settings. Without it, no data is uploaded and no risk alerts will appear.',
    },
    {
      title: 'Disclaimer',
      body: 'All health risk warnings from ElderGuard are purely advisory and for informational purposes only. They do not constitute medical advice, diagnosis, or treatment recommendations.\n\nThis app uses statistical pattern detection, which cannot guarantee accuracy. Both false negatives (a real risk going undetected) and false positives (an alert firing when nothing is wrong) are normal and expected.\n\nIf you feel unwell, contact a healthcare professional or call emergency services directly — do not rely solely on this app. The app and its creator accept no legal or moral responsibility for any health events or losses arising from the use or non-use of the app\'s alert features.',
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

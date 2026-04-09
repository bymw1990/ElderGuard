export type Lang = 'en' | 'zh';

const en = {
  // Dashboard
  connecting_sensors: 'Connecting to sensors...',
  status_simulated: 'SIMULATED — Live',
  status_idle: 'Idle',
  vital_signs: 'Vital Signs',
  heart_rate: 'Heart Rate',
  blood_oxygen: 'Blood Oxygen (SpO2)',
  body_temperature: 'Body Temperature',
  blood_pressure: 'Blood Pressure',
  activity: 'Activity',
  step_count: 'Step Count',

  // ShoeMonitor
  gait_normal: 'Normal',
  gait_shuffle: 'Shuffling',
  gait_uneven: 'Uneven Ground',
  gait_fall: 'FALL DETECTED',
  connecting_shoe_sensors: 'Connecting to shoe sensors...',
  gait_status: 'Gait Status',
  current_gait: 'Current Gait',
  accelerometer: 'Accelerometer',
  accel_magnitude: 'Magnitude (m/s²)',
  accel_x: 'X axis',
  accel_y: 'Y axis',
  accel_z: 'Z axis',
  pressure_avg: 'Pressure (avg)',
  left_foot: 'Left Foot',
  right_foot: 'Right Foot',
  last_fall: 'Last fall: {time}',

  // Emergency
  step_alarm: 'Sounding alarm',
  step_notify: 'Sending notification',
  step_sms: 'Sending SMS',
  step_call: 'Dialing contact',
  emergency_in_progress: 'EMERGENCY IN PROGRESS',
  emergency_detected: 'EMERGENCY DETECTED',
  seconds: 'seconds',
  tap_cancel_hint: 'Tap CANCEL to stop the alert',
  cancel: 'CANCEL',
  contacting: 'Contacting: {name}',
  no_contact_set: 'No emergency contact set. Add one in Settings.',

  // History
  collecting_data: 'Collecting data...',
  heart_rate_chart: 'Heart Rate — Last 60 Readings',
  recent_readings: 'Recent Readings',
  spo2_value: 'SpO2: {value}%',

  // Settings
  emergency_contact: 'Emergency Contact',
  name_label: 'Name',
  name_placeholder: 'e.g. Jane Doe',
  phone_label: 'Phone Number',
  phone_placeholder: 'e.g. +1 555 000 1234',
  save_contact: 'Save Contact',
  fall_sensitivity: 'Fall Detection Sensitivity',
  sensitivity_level: 'Level: {n} / 5',
  test_section: 'Test',
  trigger_test_alert: 'Trigger Test Alert',
  saved_title: 'Saved',
  saved_body: 'Emergency contact saved.',
  language_section: 'Language',
  lang_en: 'English',
  lang_zh: '中文',
  countdown_duration: 'Alert Countdown Duration',
  countdown_value: '{n} seconds',
  webhook_url_label: 'Emergency Server URL',
  webhook_url_placeholder: 'https://your-server.com/emergency',
  call_message: 'Emergency alert. {detail}. Please respond immediately.',

  // Tabs
  tab_dashboard: 'Band',
  tab_shoes: 'Shoes',
  tab_history: 'History',
  tab_settings: 'Settings',
  tab_manual: 'Manual',

  // Services
  sms_body: 'EMERGENCY: {detail}. Location: {url}',
  sms_body_no_location: 'EMERGENCY: {detail}. Location unavailable',
  notification_title: '🚨 Emergency Alert',
} as const;

const zh = {
  // Dashboard
  connecting_sensors: '正在连接传感器...',
  status_simulated: '模拟 — 实时',
  status_idle: '空闲',
  vital_signs: '生命体征',
  heart_rate: '心率',
  blood_oxygen: '血氧饱和度 (SpO2)',
  body_temperature: '体温',
  blood_pressure: '血压',
  activity: '活动',
  step_count: '步数',

  // ShoeMonitor
  gait_normal: '正常',
  gait_shuffle: '拖步',
  gait_uneven: '地面不平',
  gait_fall: '检测到跌倒',
  connecting_shoe_sensors: '正在连接鞋垫传感器...',
  gait_status: '步态状态',
  current_gait: '当前步态',
  accelerometer: '加速度计',
  accel_magnitude: '合加速度 (m/s²)',
  accel_x: 'X 轴',
  accel_y: 'Y 轴',
  accel_z: 'Z 轴',
  pressure_avg: '压力（平均）',
  left_foot: '左脚',
  right_foot: '右脚',
  last_fall: '上次跌倒：{time}',

  // Emergency
  step_alarm: '正在鸣响警报',
  step_notify: '正在发送通知',
  step_sms: '正在发送短信',
  step_call: '正在拨打联系人',
  emergency_in_progress: '紧急情况处理中',
  emergency_detected: '检测到紧急情况',
  seconds: '秒',
  tap_cancel_hint: '点击取消以停止警报',
  cancel: '取消',
  contacting: '正在联系：{name}',
  no_contact_set: '未设置紧急联系人，请在设置中添加。',

  // History
  collecting_data: '正在收集数据...',
  heart_rate_chart: '心率 — 最近 60 次读数',
  recent_readings: '最近读数',
  spo2_value: '血氧：{value}%',

  // Settings
  emergency_contact: '紧急联系人',
  name_label: '姓名',
  name_placeholder: '例：张三',
  phone_label: '电话号码',
  phone_placeholder: '例：+86 138 0000 0000',
  save_contact: '保存联系人',
  fall_sensitivity: '跌倒检测灵敏度',
  sensitivity_level: '等级：{n} / 5',
  test_section: '测试',
  trigger_test_alert: '触发测试警报',
  saved_title: '已保存',
  saved_body: '紧急联系人已保存。',
  language_section: '语言',
  lang_en: 'English',
  lang_zh: '中文',
  countdown_duration: '警报倒计时时长',
  countdown_value: '{n} 秒',
  webhook_url_label: '紧急服务器地址',
  webhook_url_placeholder: 'https://您的服务器地址/emergency',
  call_message: '紧急警报。{detail}。请立即回应。',

  // Tabs
  tab_dashboard: '指环',
  tab_shoes: '鞋垫',
  tab_history: '历史',
  tab_settings: '设置',
  tab_manual: '手册',

  // Services
  sms_body: '紧急情况：{detail}。位置：{url}',
  sms_body_no_location: '紧急情况：{detail}。位置不可用',
  notification_title: '🚨 紧急警报',
} satisfies typeof en;

export type TranslationKeys = keyof typeof en;
export const translations: Record<Lang, typeof en> = { en, zh };

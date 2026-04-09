# ElderGuard

A real-time health monitoring app for elderly individuals. Monitors vital signs and gait via wearable sensors, and automatically contacts an emergency contact (SMS + phone call) when a dangerous event is detected.

---

## Features

- **Vital signs monitoring** — heart rate, blood oxygen (SpO2), body temperature, blood pressure, step count (1 Hz)
- **Fall detection** — shoe insole pressure + accelerometer sensors (10 Hz)
- **Automatic emergency response** — configurable countdown (10–120 s) → alarm → push notification → SMS → phone call, all without user interaction
- **Background monitoring** — keeps running when the screen is off or app is switched away
- **English / Simplified Chinese UI** — instant language switching, defaults to Chinese
- **User manual** built into the app (5th tab)

---

## Tech Stack

| Layer | Technology |
|---|---|
| App framework | Expo SDK 54 / React Native 0.81.5 |
| Language | TypeScript |
| State management | Zustand + AsyncStorage (persisted) |
| Navigation | React Navigation (bottom tabs + stack) |
| Sensors | Mock BLE adapters (real BLE adapters stubbed) |
| SMS + calls | Express server + Twilio SDK |
| Background execution | `expo-av` silent audio session |
| Notifications | `expo-notifications` |
| Location | `expo-location` |

---

## Project Structure

```
ElderGuard/
├── App.tsx                        # Entry point — audio session, keep-awake, permissions
├── app.json                       # Expo config — background modes, permissions
├── src/
│   ├── i18n/
│   │   ├── translations.ts        # All EN + ZH strings
│   │   └── useTranslation.ts      # useTranslation() hook + getTranslation() for services
│   ├── screens/
│   │   ├── DashboardScreen.tsx    # "指环/Band" tab — live vitals
│   │   ├── ShoeMonitorScreen.tsx  # Gait + accelerometer + pressure
│   │   ├── HistoryScreen.tsx      # Heart rate chart + recent readings table
│   │   ├── SettingsScreen.tsx     # Emergency contact, countdown, language, server URL
│   │   ├── EmergencyScreen.tsx    # Countdown modal + step-by-step progress
│   │   └── ManualScreen.tsx       # Bilingual user manual
│   ├── sensors/
│   │   ├── adapters/
│   │   │   ├── MockBandAdapter.ts # Simulated vitals with bradycardia dip every 2 min
│   │   │   ├── MockShoeAdapter.ts # Simulated gait with fall every 45 s
│   │   │   ├── BleBandAdapter.ts  # Real BLE stub (not yet implemented)
│   │   │   └── BleShoeAdapter.ts  # Real BLE stub (not yet implemented)
│   │   └── SensorManager.ts       # Starts/stops adapters, fans out readings
│   ├── services/
│   │   ├── EmergencyService.ts    # Orchestrates alarm → notify → SMS/call
│   │   ├── AlarmService.ts        # Plays alarm.mp3 (overrides silent mode on iOS)
│   │   ├── NotificationService.ts # Push notifications via expo-notifications
│   │   └── LocationService.ts     # GPS coords for SMS
│   ├── store/
│   │   ├── useBioStore.ts         # Current + history of bio readings
│   │   ├── useShoeStore.ts        # Current shoe reading + last fall time
│   │   ├── useEmergencyStore.ts   # Emergency FSM (idle → triggered → executing → done)
│   │   └── useSettingsStore.ts    # All user settings, persisted
│   ├── hooks/
│   │   ├── useSensorFeed.ts       # Starts SensorManager, wires readings to stores
│   │   └── useEmergencyFlow.ts    # Watches stores, triggers emergency on threshold breach
│   └── utils/
│       ├── thresholds.ts          # Default alert thresholds
│       ├── constants.ts           # Timing constants
│       └── formatters.ts          # Display formatting for metrics
└── server/
    ├── index.js                   # Express + Twilio — POST /emergency endpoint
    ├── package.json
    └── .env.example               # Copy to .env and fill in Twilio credentials
```

---

## Running the App

### Option A — Expo Go (quickest, limited)

Expo Go works for UI testing but **does not support background monitoring** or the full audio session.

```bash
cd ElderGuard
npm install
npx expo start
```

Scan the QR code with the **Expo Go** app on your iPhone (both devices on the same Wi-Fi).

> If you see a "gradient package not found" error, run:
> `npx expo install expo-linear-gradient`

### Option B — Development Build (recommended for real use)

Required for background monitoring (silent audio session) and full SMS/call flow.

**Prerequisites:** Xcode installed, Apple ID (free developer account is enough for device builds).

```bash
npx expo install expo-dev-client
npx expo run:ios --device
```

The first build takes a few minutes. After that, JS changes load instantly via Metro (no rebuild needed).

---

## Emergency Backend (Twilio)

The backend sends SMS and places an automated voice call **without requiring user interaction** — essential when the user may be unconscious.

### Setup

**1. Get a Twilio account**
Sign up at [twilio.com](https://www.twilio.com) (free trial available). You need:
- Account SID
- Auth Token
- A Twilio phone number (buy one in the Twilio console, ~$1/month)

**2. Configure the server**

```bash
cd ElderGuard/server
npm install
cp .env.example .env
```

Edit `.env`:
```
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_FROM_NUMBER=+1XXXXXXXXXX
PORT=3000
```

**3. Start the server**
```bash
npm start
# ElderGuard server running on port 3000
```

**4. Expose to your phone (local testing)**

Install [ngrok](https://ngrok.com) and run:
```bash
ngrok http 3000
```

Copy the `https://xxxx.ngrok.io` URL.

**5. Configure in the app**

Settings → Emergency Server URL → paste the ngrok URL + `/emergency`

Example: `https://abc123.ngrok.io/emergency`

Tap **Save Contact** to save.

### How it works

When an emergency executes, the app POSTs to your server:

```json
{
  "to": "+8613800000000",
  "smsBody": "紧急情况：心率过低。位置：https://maps.google.com/?q=...",
  "callMessage": "紧急警报。心率过低。请立即回应。",
  "language": "zh"
}
```

The server sends the SMS and places a voice call. The call reads the message aloud twice in the configured language (Chinese or English) using Twilio's text-to-speech.

**If no server URL is configured**, the app falls back to opening the SMS compose sheet and phone dialer — these require user interaction on iOS.

---

## Background Monitoring

The app plays a silent WAV file on loop using `expo-av` with `staysActiveInBackground: true`. This keeps the iOS JavaScript engine running when the app is backgrounded (screen off, app switched away), so sensor timers and emergency detection continue uninterrupted.

**Requires a development build** — Expo Go does not honour `UIBackgroundModes`.

> **Note:** If the user force-quits the app (swipe up in the app switcher), monitoring stops. The app must be running (even backgrounded) to detect emergencies.

---

## Settings Reference

| Setting | Description | Default |
|---|---|---|
| Emergency Contact | Name + phone of person to call/SMS | — |
| Emergency Server URL | Backend endpoint for automatic SMS + call | — |
| Alert Countdown Duration | Seconds before emergency executes (adjustable in −5/+5 steps) | 30 s |
| Fall Detection Sensitivity | 1 (severe falls only) → 5 (mild impacts) | 3 |
| Language | English / 中文 | 中文 |

---

## Alert Thresholds (defaults)

| Metric | Alert condition |
|---|---|
| Heart rate | < 50 bpm or > 120 bpm |
| SpO2 | < 92% |
| Temperature | < 35.5°C or > 38.5°C |
| Systolic BP | > 180 mmHg |
| Diastolic BP | > 110 mmHg |
| Gait | Fall detected by shoe sensor |

---

## Testing

The mock sensors generate realistic data with built-in events:
- **Bradycardia dip** (heart rate ~42 bpm) every **2 minutes** → triggers heart rate alert
- **Synthetic fall** every **45 seconds** → triggers fall alert

To manually trigger an alert at any time: Settings → **触发测试警报 / Trigger Test Alert**

Let the 30-second countdown run to zero (don't tap Cancel) to test the full emergency flow including SMS and call.

---

## iOS Limitations

| Feature | Expo Go | Dev Build |
|---|---|---|
| Sensor monitoring (foreground) | ✅ | ✅ |
| Background monitoring | ❌ | ✅ |
| Automatic SMS (no user tap) | ❌ requires backend | ✅ with backend |
| Automatic phone call (no user tap) | ❌ requires backend | ✅ with backend |
| Push notifications | Partial | ✅ |

Apple's sandbox prevents automatic SMS and phone calls from any third-party app. The backend server (Twilio) is the only way to achieve fully hands-free emergency alerting on iOS.

---

## Future Work

- Connect real Bluetooth LE sensors (BLE adapter stubs are in `src/sensors/adapters/`)
- Add `bluetooth-central` background mode for BLE-triggered wakeups
- Deploy backend to a cloud host (Railway, Render, Fly.io) instead of ngrok for production use
- Apple Watch companion app for continuous background monitoring

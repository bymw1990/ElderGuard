require('dotenv').config();
const express = require('express');
const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const {
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN,
  TWILIO_FROM_NUMBER,
  DB_PATH,
  PORT = 3000,
} = process.env;

// Twilio is optional — if not configured, /emergency returns 503
let twilioClient = null;
if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_FROM_NUMBER) {
  const twilio = require('twilio');
  twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
  console.log('[twilio] Configured — SMS + calls enabled');
} else {
  console.warn('[twilio] Env vars missing — /emergency will return 503');
}

// ── SQLite setup ──────────────────────────────────────────────────────────────
const dbPath = DB_PATH || path.join(__dirname, 'elderguard.db');
const db = new DatabaseSync(dbPath);

db.exec("PRAGMA journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS readings (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp   INTEGER NOT NULL,
    heart_rate  REAL,
    spo2        REAL,
    temperature REAL,
    systolic    REAL,
    diastolic   REAL,
    step_count  REAL
  );

  CREATE TABLE IF NOT EXISTS falls (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS risk_events (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp  INTEGER NOT NULL,
    risk_type  TEXT NOT NULL,
    risk_level TEXT NOT NULL,
    message_zh TEXT NOT NULL,
    message_en TEXT NOT NULL
  );
`);

const stmtInsertReading = db.prepare(`
  INSERT INTO readings (timestamp, heart_rate, spo2, temperature, systolic, diastolic, step_count)
  VALUES (:timestamp, :heartRate, :spo2, :temperature, :systolic, :diastolic, :stepCount)
`);

const stmtInsertFall = db.prepare(
  `INSERT INTO falls (timestamp) VALUES (:timestamp)`
);

const stmtInsertRisk = db.prepare(`
  INSERT INTO risk_events (timestamp, risk_type, risk_level, message_zh, message_en)
  VALUES (:timestamp, :risk_type, :risk_level, :message_zh, :message_en)
`);

// ── Data retention (auto-cleanup) ────────────────────────────────────────────
const RETENTION = {
  readings:     7  * 24 * 60 * 60 * 1000, // 7 days
  falls:        30 * 24 * 60 * 60 * 1000, // 30 days
  risk_events:  90 * 24 * 60 * 60 * 1000, // 90 days
};

function pruneOldData() {
  const now = Date.now();
  const r = db.prepare('DELETE FROM readings    WHERE timestamp < ?').run(now - RETENTION.readings);
  const f = db.prepare('DELETE FROM falls       WHERE timestamp < ?').run(now - RETENTION.falls);
  const e = db.prepare('DELETE FROM risk_events WHERE timestamp < ?').run(now - RETENTION.risk_events);
  const total = r.changes + f.changes + e.changes;
  if (total > 0) {
    db.exec('VACUUM');
    console.log(`[cleanup] Pruned ${r.changes} readings, ${f.changes} falls, ${e.changes} risk_events`);
  }
}

// Run on startup, then every 24 hours
pruneOldData();
setInterval(pruneOldData, 24 * 60 * 60 * 1000);

// ── Statistical helpers ───────────────────────────────────────────────────────

function mean(values) {
  if (!values.length) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function stdDev(values) {
  if (values.length < 2) return 0;
  const m = mean(values);
  const variance = values.reduce((sum, v) => sum + (v - m) ** 2, 0) / (values.length - 1);
  return Math.sqrt(variance);
}

// Ordinary least-squares slope (units per reading index)
function slope(values) {
  const n = values.length;
  if (n < 2) return 0;
  const xMean = (n - 1) / 2;
  const yMean = mean(values);
  let num = 0, den = 0;
  for (let i = 0; i < n; i++) {
    num += (i - xMean) * (values[i] - yMean);
    den += (i - xMean) ** 2;
  }
  return den === 0 ? 0 : num / den;
}

// ── Risk analysis ─────────────────────────────────────────────────────────────

const THIRTY_MINUTES = 30 * 60 * 1000;
const SIXTY_MINUTES  = 60 * 60 * 1000;
const FIVE_MINUTES   =  5 * 60 * 1000;
const TWENTY_FOUR_H  = 24 * 60 * 60 * 1000;

const stmtRecentReadings = db.prepare(
  'SELECT * FROM readings WHERE timestamp > ? ORDER BY timestamp ASC'
);
const stmtRecentRisk = db.prepare(
  'SELECT id FROM risk_events WHERE risk_type = ? AND timestamp > ? LIMIT 1'
);
const stmtFallCount = db.prepare(
  'SELECT COUNT(*) as n FROM falls WHERE timestamp > ?'
);

function recentReadings(windowMs) {
  return stmtRecentReadings.all(Date.now() - windowMs);
}

function wasRaisedRecently(riskType) {
  const row = stmtRecentRisk.get(riskType, Date.now() - THIRTY_MINUTES);
  return !!row;
}

function checkHrTrend() {
  if (wasRaisedRecently('hr_trend')) return null;
  const rows = recentReadings(SIXTY_MINUTES);
  if (rows.length < 10) return null;
  const s = slope(rows.map(r => r.heart_rate));
  if (s < 0.5) return null;
  const level = s > 1.5 ? 'high' : 'medium';
  return {
    type: 'hr_trend', level,
    message_zh: `心率持续上升（每次读数 +${s.toFixed(1)} bpm），请注意监测。`,
    message_en: `Heart rate trending upward (+${s.toFixed(1)} bpm/reading). Monitor closely.`,
  };
}

function checkHrDecline() {
  if (wasRaisedRecently('hr_decline')) return null;
  const rows = recentReadings(SIXTY_MINUTES);
  if (rows.length < 10) return null;
  const s = slope(rows.map(r => r.heart_rate));
  if (s > -0.5) return null;
  const level = s < -1.5 ? 'high' : 'medium';
  return {
    type: 'hr_decline', level,
    message_zh: `心率持续下降（每次读数 ${s.toFixed(1)} bpm），请注意监测。`,
    message_en: `Heart rate trending downward (${s.toFixed(1)} bpm/reading). Monitor closely.`,
  };
}

function checkSpo2Low() {
  if (wasRaisedRecently('spo2_low')) return null;
  const rows = recentReadings(FIVE_MINUTES);
  if (rows.length < 3) return null;
  const lowCount = rows.filter(r => r.spo2 < 94).length;
  const fraction = lowCount / rows.length;
  if (fraction < 0.3) return null;
  const level = fraction > 0.6 ? 'critical' : 'high';
  const avgSpo2 = mean(rows.map(r => r.spo2)).toFixed(1);
  return {
    type: 'spo2_low', level,
    message_zh: `血氧偏低（近期平均 ${avgSpo2}%，低于 94%），请密切关注。`,
    message_en: `Low SpO2 detected (recent avg ${avgSpo2}%, below 94%). Seek medical attention.`,
  };
}

function checkLowHrv() {
  if (wasRaisedRecently('low_hrv')) return null;
  const rows = recentReadings(SIXTY_MINUTES);
  if (rows.length < 10) return null;
  const sd = stdDev(rows.map(r => r.heart_rate));
  if (sd >= 2.5) return null;
  return {
    type: 'low_hrv', level: 'medium',
    message_zh: `心率变异性偏低（标准差 ${sd.toFixed(1)} bpm），可能提示心脏自律性下降。`,
    message_en: `Low heart rate variability (std dev ${sd.toFixed(1)} bpm). May indicate reduced cardiac autonomy.`,
  };
}

function checkBpTrend() {
  if (wasRaisedRecently('bp_trend')) return null;
  const rows = recentReadings(SIXTY_MINUTES);
  if (rows.length < 10) return null;
  const s = slope(rows.map(r => r.systolic));
  if (s < 0.3) return null;
  const level = s > 1.0 ? 'high' : 'medium';
  return {
    type: 'bp_trend', level,
    message_zh: `收缩压持续升高（每次读数 +${s.toFixed(1)} mmHg），请注意血压变化。`,
    message_en: `Systolic BP trending upward (+${s.toFixed(1)} mmHg/reading). Monitor blood pressure.`,
  };
}

function checkFallFrequency() {
  if (wasRaisedRecently('fall_frequency')) return null;
  const count = stmtFallCount.get(Date.now() - TWENTY_FOUR_H).n;
  if (count < 2) return null;
  const level = count >= 4 ? 'critical' : 'high';
  return {
    type: 'fall_frequency', level,
    message_zh: `过去 24 小时内检测到 ${count} 次跌倒，跌倒风险较高，请注意安全。`,
    message_en: `${count} falls detected in the past 24 hours. High fall risk — please take precautions.`,
  };
}

function analyzeRisks() {
  const checks = [
    checkHrTrend,
    checkHrDecline,
    checkSpo2Low,
    checkLowHrv,
    checkBpTrend,
    checkFallFrequency,
  ];

  const now = Date.now();
  const risks = [];

  for (const check of checks) {
    try {
      const risk = check();
      if (!risk) continue;
      stmtInsertRisk.run({
        timestamp: now,
        risk_type: risk.type,
        risk_level: risk.level,
        message_zh: risk.message_zh,
        message_en: risk.message_en,
      });
      risks.push({
        id: `${risk.type}_${now}`,
        type: risk.type,
        level: risk.level,
        message_zh: risk.message_zh,
        message_en: risk.message_en,
      });
    } catch (err) {
      console.error(`[analysis] ${check.name} failed:`, err.message);
    }
  }

  return risks;
}

// ── Express app ───────────────────────────────────────────────────────────────

const app = express();
app.use(express.json());

// POST /readings — called by the app every 30 s
app.post('/readings', (req, res) => {
  const { readings = [], falls = [] } = req.body;

  try {
    // Bulk-insert in a single transaction for performance
    db.exec('BEGIN');
    for (const r of readings) stmtInsertReading.run(r);
    for (const f of falls)    stmtInsertFall.run(f);
    db.exec('COMMIT');

    const risks = analyzeRisks();
    console.log(`[readings] +${readings.length} readings, +${falls.length} falls → ${risks.length} risks`);
    res.json({ ok: true, risks });
  } catch (err) {
    try { db.exec('ROLLBACK'); } catch {}
    console.error('[readings] Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST /emergency — sends SMS + places automated call via Twilio
app.post('/emergency', async (req, res) => {
  if (!twilioClient) {
    return res.status(503).json({
      error: 'Twilio not configured — set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER',
    });
  }

  const { to, smsBody, callMessage, language } = req.body;

  if (!to || !smsBody || !callMessage) {
    return res.status(400).json({ error: 'Missing required fields: to, smsBody, callMessage' });
  }

  const sayLang = language === 'zh' ? 'zh-CN' : 'en-US';
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say language="${sayLang}">${escapeXml(callMessage)}</Say>
  <Pause length="2"/>
  <Say language="${sayLang}">${escapeXml(callMessage)}</Say>
</Response>`;

  try {
    const [msg, call] = await Promise.all([
      twilioClient.messages.create({ to, from: TWILIO_FROM_NUMBER, body: smsBody }),
      twilioClient.calls.create({ to, from: TWILIO_FROM_NUMBER, twiml }),
    ]);
    console.log(`[emergency] SMS ${msg.sid} | Call ${call.sid} → ${to}`);
    res.json({ ok: true, smsSid: msg.sid, callSid: call.sid });
  } catch (err) {
    console.error('[emergency] Twilio error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get('/health', (_req, res) => res.json({ ok: true }));

function escapeXml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

app.listen(PORT, () => console.log(`ElderGuard server running on port ${PORT} | DB: ${dbPath}`));

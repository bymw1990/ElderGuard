require('dotenv').config();
const express = require('express');
const twilio = require('twilio');

const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER, PORT = 3000 } = process.env;

if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_FROM_NUMBER) {
  console.error('Missing required env vars: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER');
  process.exit(1);
}

const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
const app = express();
app.use(express.json());

app.post('/emergency', async (req, res) => {
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
      client.messages.create({ to, from: TWILIO_FROM_NUMBER, body: smsBody }),
      client.calls.create({ to, from: TWILIO_FROM_NUMBER, twiml }),
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

app.listen(PORT, () => console.log(`ElderGuard server running on port ${PORT}`));

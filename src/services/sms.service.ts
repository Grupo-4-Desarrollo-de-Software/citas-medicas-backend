import dotenv from 'dotenv';

dotenv.config();

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_FROM = process.env.TWILIO_FROM;
const SMS_ENABLED = String(process.env.SMS_ENABLED ?? 'false').toLowerCase() === 'true';

type SendResult = { success: boolean; sid?: string; error?: unknown };

let twilioClient: any = null;
try {
  // lazy require so module is optional
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const twilio = require('twilio');
  if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN) {
    twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
  }
} catch (err) {
  // twilio not installed — will fallback to logger
}

/**
 * Env vars used:
 * - SMS_ENABLED=true
 * - TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM
 * If Twilio is not installed or credentials are missing, the service will log instead of sending.
 */
export const sendSms = async (to: string, body: string): Promise<SendResult> => {
  if (!SMS_ENABLED) {
    console.info('[SMS] SMS_DISABLED. Skipping send to', to, body);
    return { success: false, error: 'SMS_DISABLED' };
  }

  if (!to) {
    return { success: false, error: 'NO_RECIPIENT' };
  }

  // prefer real Twilio client when available
  if (twilioClient && TWILIO_FROM) {
    try {
      const msg = await twilioClient.messages.create({
        from: TWILIO_FROM,
        to,
        body,
      });

      return { success: true, sid: msg.sid };
    } catch (error) {
      console.error('[SMS] Twilio send error', error);
      return { success: false, error };
    }
  }

  // Fallback: log to console (useful for 2G SMS gateways or for development)
  console.info('[SMS] (fallback) send ->', { to, body });
  return { success: true };
};

export default { sendSms };

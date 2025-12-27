/**
 * Env vars used:
 * - SMS_ENABLED=true
 * - TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM
 * If Twilio is not installed or credentials are missing, the service will log instead of sending.
 */

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_MESSAGING_SERVICE_SID = process.env.TWILIO_MESSAGING_SERVICE_SID;

export const sendSms = async (to: string, body: string): Promise<void> => {

const accountSid = TWILIO_ACCOUNT_SID;
const authToken = TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);
client.messages
    .create({
        body: body,
        messagingServiceSid: TWILIO_MESSAGING_SERVICE_SID,
        to: to
    })
    .then((message: { sid: any; }) => console.log(message.sid));
}

export default { sendSms };
import { ConfigType, registerAs } from '@nestjs/config';

export const smsRegToken = 'sms';

export const SmsConfig = registerAs(smsRegToken, () => ({
    account_ssid: process.env.TWILIO_ACCOUNT_SSID,
    account_token: process.env.TWILIO_SMS_TOKEN,
    max_retries:process.env.TWILIO_ACCOUNT_RETRIES,
}));

export type ISMSConfig = ConfigType<typeof SmsConfig>;

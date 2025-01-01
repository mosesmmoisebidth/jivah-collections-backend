import { ConfigType, registerAs } from '@nestjs/config';

export const analyticsRegToken = 'analytics';

export const AnalyticsConfig = registerAs(analyticsRegToken, () => ({
  measurement_id: process.env.MEASUREMENT_ID,
}));

export type IAnalyticsConfig = ConfigType<typeof AnalyticsConfig>;

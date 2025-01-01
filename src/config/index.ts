import { AppConfig, IAppConfig, appRegToken } from './app.config';
import { CloudinaryConfig, cloudinaryToken, ICloudinaryConfig } from './cloudinary.config';
import {
  FirebaseConfig,
  IFirebaseConfig,
  firebaseRegToken,
} from './firebase.config';
import { IMailConfig, MailConfig, mailRegToken } from './mail.config';
import { IRedisConfig, RedisConfig, redisRegToken } from './redis.config';
import { ISMSConfig, SmsConfig, smsRegToken } from './sms.config';
import {
  SecurityConfig,
  ISecurityConfig,
  securityRegToken,
} from './security.config';
import {
  TypeOrmConfig,
  ITypeOrmConfig,
  typeOrmRegToken,
} from './typeorm.config';
import { cacheRegToken, ICachingConfig, CacheConfig } from './caching.config';
import { MapsConfig, IMapConfig, mapRegToken } from './maps.config';
import { AnalyticsConfig, IAnalyticsConfig, analyticsRegToken } from './google-analytics.config';

export * from './app.config';
export * from './swagger.config';
export * from './redis.config';
export * from './security.config';
export * from './sms.config';
export * from './cloudinary.config';
export * from './caching.config';
export * from './maps.config';
export * from './google-analytics.config';

export interface AllConfigType {
  [appRegToken]: IAppConfig;
  [typeOrmRegToken]: ITypeOrmConfig;
  [redisRegToken]: IRedisConfig;
  [securityRegToken]: ISecurityConfig;
  [mailRegToken]: IMailConfig;
  [firebaseRegToken]: IFirebaseConfig;
  [smsRegToken]: ISMSConfig;
  [cloudinaryToken]: ICloudinaryConfig;
  [cacheRegToken]: ICachingConfig;
  [mapRegToken]: IMapConfig;
  [analyticsRegToken]: IAnalyticsConfig;
}

export type ConfigKeyPaths = Record<NestedKeyOf<AllConfigType>, any>;

export default {
  AppConfig,
  TypeOrmConfig,
  RedisConfig,
  SecurityConfig,
  MailConfig,
  FirebaseConfig,
  SmsConfig,
  CloudinaryConfig,
  CacheConfig,
  MapsConfig,
  AnalyticsConfig
};

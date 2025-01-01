import { ConfigType, registerAs } from '@nestjs/config';

export const firebaseRegToken = 'firebase';

export const FirebaseConfig = registerAs(firebaseRegToken, () => ({
  webClient: process.env.FIREBASE_WEB_CLIENT_ID,
}));

export type IFirebaseConfig = ConfigType<typeof FirebaseConfig>;

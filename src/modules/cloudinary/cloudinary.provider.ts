// cloudinary.provider.ts
import { CLOUDINARY } from 'src/constants/examples.constants';
import { v2 as cloudinary } from 'cloudinary';
import { ConfigService } from '@nestjs/config';
import { ConfigKeyPaths } from 'src/config';

export const CloudinaryProvider = {
  provide: CLOUDINARY,
  useFactory: (configService: ConfigService<ConfigKeyPaths>) => {
    const cloudName = configService.get('cloudinary.cloudinary_name');
    const apiKey = configService.get('cloudinary.cloudinary_api_key');
    const apiSecret = configService.get('cloudinary.cloudinary_secret_key');

    if (!cloudName || !apiKey || !apiSecret) {
      throw new Error('Cloudinary configuration is missing.');
    }

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });

    return cloudinary;
  },
  inject: [ConfigService],
};

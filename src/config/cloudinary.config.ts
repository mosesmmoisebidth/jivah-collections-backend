import { ConfigType, registerAs } from "@nestjs/config";

export const cloudinaryToken = 'cloudinary'

export const CloudinaryConfig = registerAs(cloudinaryToken, () => ({
    cloudinary_name: process.env.CLOUDINARY_NAME,
    cloudinary_api_key: process.env.CLOUDINARY_API_KEY,
    cloudinary_secret_key: process.env.CLOUDINARY_SECRET_KEY,
  }));
  
  export type ICloudinaryConfig = ConfigType<typeof CloudinaryConfig>;
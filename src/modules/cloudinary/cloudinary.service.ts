// cloudinary.service.ts
import { Injectable } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { CloudinaryResponse } from './cloudinary-response'; // Ensure this matches UploadApiResponse
import * as streamifier from 'streamifier';

@Injectable()
export class CloudinaryService {
  /**
   * Upload multiple files to Cloudinary.
   * @param files Array of files to upload.
   * @param folder Optional folder path in Cloudinary.
   * @returns Promise that resolves to an array of Cloudinary responses.
   */
  async uploadFiles(
    files: Express.Multer.File[],
    folder: string = 'default_folder', // Replace with your desired default folder
  ): Promise<CloudinaryResponse[]> {
    // Map each file to an upload promise
    const uploadPromises = files.map((file) => this.uploadFileToCloudinary(file, folder));

    // Wait for all uploads to complete
    return Promise.all(uploadPromises);
  }

  /**
   * Upload a single file to Cloudinary.
   * @param file File to upload.
   * @param folder Folder path in Cloudinary.
   * @returns Promise that resolves to Cloudinary response.
   */
  async uploadFileToCloudinary(file: Express.Multer.File, folder: string): Promise<CloudinaryResponse> {
    return new Promise<CloudinaryResponse>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder }, // Specify the folder in upload options
        (error: any, result: UploadApiResponse) => {
          if (error) {
            reject(error);
          } else {
            resolve(result as CloudinaryResponse);
          }
        },
      );

      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }
}

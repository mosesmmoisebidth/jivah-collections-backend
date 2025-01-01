/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-async-promise-executor */
/* eslint-disable @typescript-eslint/no-var-requires */
import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin'
import * as path from 'path';

const serviceAccount = require(path.resolve(process.cwd(), 'serviceAccountsKey.json'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'gs://tripple-trade-auth.appspot.com',
});

const bucket = admin.storage().bucket();
export const auth = admin.auth();
export const notify = admin.messaging();
export const db = admin.firestore();

@Injectable()
export class FirebaseService {
  public firebaseAdmin = admin;

  // Upload file to firebase storage
  async uploadFile(
    file: any,
    folder: string,
    subfolder: string,
  ): Promise<string> {
    return new Promise(async (resolve, reject) => {
      const fileBuffer = file.buffer;
      const fileName = `${subfolder}/${path.parse(file.originalname).name}_${Date.now()}${
        path.parse(file.originalname).ext
      }`;
      console.log("the file name is: " + fileName);
      const fileUpload = bucket.file(fileName);
      const stream = fileUpload.createWriteStream({
        metadata: {
          contentType: file.mimetype,
          folder: folder,
        },
      });

      stream.on('error', (err) => {
        reject(`Error uploading image: ${err}`);
      });

      stream.on('finish', async () => {
        const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(
          fileUpload.name,
        )}?alt=media`;
        resolve(publicUrl);
      });

      stream.end(fileBuffer);
    });
  }
}

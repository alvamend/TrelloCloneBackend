import { Storage } from '@google-cloud/storage';
import { Injectable } from '@nestjs/common';

@Injectable()
export class StorageService {
  private readonly storage: Storage;
  private bucket;

  constructor() {
    this.storage = new Storage({
      projectId: process.env.PROJECT_ID,
      credentials: {
        client_email: process.env.CLIENT_EMAIL,
        private_key: process.env.PRIVATE_KEY.split(String.raw`\n`).join('\n'),
      },
    });
    this.bucket = this.storage.bucket(process.env.BUCKET);
  }

  uploadFile = async (file: Express.Multer.File): Promise<boolean> => {
    // Save the buffer in the bucket and return true if it was saved
    try {
      await this.bucket.file(file.filename).save(file.buffer);
      return true;
    } catch (error) {
      console.error(error);
    }
  };

  getSignedUrl = async (fileName: string):Promise<string> => {
    // Get a signed URL from google expires in 1 hour
    const signedUrl = await this.bucket.file(fileName).getSignedUrl({
      action: 'read',
      expires: Date.now() + 60*60*1000
    });

    return signedUrl;
  };

  deleteFile = async(fileName:string):Promise<boolean> => {
    try {
      await this.bucket.file(fileName).delete();
      return true;
    } catch (error) {
      throw error
    }
  }
}

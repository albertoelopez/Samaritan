import AWS from 'aws-sdk';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config/environment';
import { BadRequestError } from '../utils/errors';

const s3 = new AWS.S3({
  accessKeyId: config.aws.accessKeyId,
  secretAccessKey: config.aws.secretAccessKey,
  region: config.aws.region,
});

export interface UploadResult {
  key: string;
  url: string;
  bucket: string;
}

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export class DocumentService {
  static async uploadProfilePicture(
    userId: string,
    buffer: Buffer,
    mimeType: string
  ): Promise<UploadResult> {
    if (!ALLOWED_IMAGE_TYPES.includes(mimeType)) {
      throw new BadRequestError('Invalid file type. Allowed: JPEG, PNG, WebP, GIF');
    }

    // Resize and optimize image
    const processed = await sharp(buffer)
      .resize(500, 500, { fit: 'cover' })
      .jpeg({ quality: 85 })
      .toBuffer();

    const key = `profile-pictures/${userId}/${uuidv4()}.jpg`;

    return this.uploadToS3(key, processed, 'image/jpeg');
  }

  static async uploadDocument(
    userId: string,
    documentType: string,
    buffer: Buffer,
    mimeType: string,
    originalName: string
  ): Promise<UploadResult> {
    if (!ALLOWED_DOCUMENT_TYPES.includes(mimeType)) {
      throw new BadRequestError('Invalid file type. Allowed: PDF, JPEG, PNG');
    }

    if (buffer.length > MAX_FILE_SIZE) {
      throw new BadRequestError('File too large. Maximum size: 10MB');
    }

    const extension = originalName.split('.').pop() || 'pdf';
    const key = `documents/${userId}/${documentType}/${uuidv4()}.${extension}`;

    return this.uploadToS3(key, buffer, mimeType);
  }

  static async uploadJobAttachment(
    jobId: string,
    buffer: Buffer,
    mimeType: string,
    originalName: string
  ): Promise<UploadResult> {
    if (buffer.length > MAX_FILE_SIZE) {
      throw new BadRequestError('File too large. Maximum size: 10MB');
    }

    const extension = originalName.split('.').pop() || 'bin';
    const key = `job-attachments/${jobId}/${uuidv4()}.${extension}`;

    return this.uploadToS3(key, buffer, mimeType);
  }

  static async uploadMessageAttachment(
    conversationId: string,
    buffer: Buffer,
    mimeType: string,
    originalName: string
  ): Promise<UploadResult> {
    if (buffer.length > MAX_FILE_SIZE) {
      throw new BadRequestError('File too large. Maximum size: 10MB');
    }

    const extension = originalName.split('.').pop() || 'bin';
    const key = `message-attachments/${conversationId}/${uuidv4()}.${extension}`;

    return this.uploadToS3(key, buffer, mimeType);
  }

  private static async uploadToS3(
    key: string,
    buffer: Buffer,
    contentType: string
  ): Promise<UploadResult> {
    const params: AWS.S3.PutObjectRequest = {
      Bucket: config.aws.s3Bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      ACL: 'private',
    };

    await s3.upload(params).promise();

    const url = await this.getSignedUrl(key);

    return {
      key,
      url,
      bucket: config.aws.s3Bucket,
    };
  }

  static async getSignedUrl(key: string, expiresIn = 3600): Promise<string> {
    return s3.getSignedUrlPromise('getObject', {
      Bucket: config.aws.s3Bucket,
      Key: key,
      Expires: expiresIn,
    });
  }

  static async deleteFile(key: string): Promise<void> {
    await s3
      .deleteObject({
        Bucket: config.aws.s3Bucket,
        Key: key,
      })
      .promise();
  }

  static async deleteMultiple(keys: string[]): Promise<void> {
    if (keys.length === 0) return;

    await s3
      .deleteObjects({
        Bucket: config.aws.s3Bucket,
        Delete: {
          Objects: keys.map((key) => ({ Key: key })),
        },
      })
      .promise();
  }
}

import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});
const bucketName = process.env.AWS_S3_BUCKET;

/**
 * Upload a file buffer to S3
 * @param fileBuffer - The file buffer to upload
 * @param key - The S3 key (path) where the file will be stored
 * @param contentType - The MIME type of the file
 * @returns Promise<string> - The URL of the uploaded file
 */
export const uploadToS3 = async (
  fileBuffer: Buffer,
  key: string,
  contentType: string
): Promise<string> => {
  if (!bucketName) {
    throw new Error('AWS S3 bucket name is not configured');
  }

  const s3Key = key || `uploads/${uuidv4()}`;
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: s3Key,
    Body: fileBuffer,
    ContentType: contentType,
    ACL: 'public-read',
  });
  await s3.send(command);
  // Construct the public URL (assuming public-read ACL)
  return `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;
};

/**
 * Delete a file from S3
 * @param key - The S3 key (path) of the file to delete
 * @returns Promise<void>
 */
export const deleteFromS3 = async (key: string): Promise<void> => {
  if (!bucketName) {
    throw new Error('AWS S3 bucket name is not configured');
  }

  const command = new DeleteObjectCommand({
    Bucket: bucketName,
    Key: key,
  });
  await s3.send(command);
};

/**
 * Generate a pre-signed URL for direct client-side uploads
 * @param key - The S3 key where the file will be stored
 * @param contentType - The MIME type of the file
 * @param expiresIn - URL expiration time in seconds (default: 60)
 * @returns Promise<string> - The pre-signed URL
 */
export const generatePresignedUrl = async (
  key: string,
  contentType: string,
  expiresIn = 60
): Promise<string> => {
  if (!bucketName) {
    throw new Error('AWS S3 bucket name is not configured');
  }

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    ContentType: contentType,
    ACL: 'public-read',
  });
  return getSignedUrl(s3, command, { expiresIn });
};
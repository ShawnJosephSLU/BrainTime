import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

// Configure AWS SDK
AWS.config.update({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const s3 = new AWS.S3();
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

  const params = {
    Bucket: bucketName,
    Key: key || `uploads/${uuidv4()}`,
    Body: fileBuffer,
    ContentType: contentType,
    ACL: 'public-read',
  };

  const uploadResult = await s3.upload(params).promise();
  return uploadResult.Location;
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

  const params = {
    Bucket: bucketName,
    Key: key,
  };

  await s3.deleteObject(params).promise();
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

  const params = {
    Bucket: bucketName,
    Key: key,
    Expires: expiresIn,
    ContentType: contentType,
    ACL: 'public-read',
  };

  return s3.getSignedUrlPromise('putObject', params);
}; 
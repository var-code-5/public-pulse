import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

// Initialize S3 client
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1',
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || 'public-pulse-images';

/**
 * Upload a file to S3
 * @param file - File object from multer
 * @returns The URL of the uploaded file
 */
export const uploadFile = async (file: Express.Multer.File): Promise<string> => {
  const fileKey = `uploads/${uuidv4()}-${file.originalname.replace(/\s+/g, '-')}`;
  
  const params = {
    Bucket: BUCKET_NAME,
    Key: fileKey,
    Body: file.buffer,
    ContentType: file.mimetype,
    ACL: 'public-read', // Make the file publicly accessible
  };

  try {
    const result = await s3.upload(params).promise();
    return result.Location;
  } catch (error) {
    console.error('Error uploading file to S3:', error);
    throw new Error('Failed to upload file to S3');
  }
};

/**
 * Upload multiple files to S3
 * @param files - Array of file objects from multer
 * @returns An array of URLs of the uploaded files
 */
export const uploadMultipleFiles = async (files: Express.Multer.File[]): Promise<string[]> => {
  const uploadPromises = files.map(file => uploadFile(file));
  return Promise.all(uploadPromises);
};

/**
 * Delete a file from S3
 * @param fileUrl - Full URL of the file to delete
 * @returns Success message
 */
export const deleteFile = async (fileUrl: string): Promise<{ message: string }> => {
  try {
    // Extract the key from the file URL
    const urlParts = new URL(fileUrl);
    const key = urlParts.pathname.substring(1); // Remove leading '/'

    const params = {
      Bucket: BUCKET_NAME,
      Key: key,
    };

    await s3.deleteObject(params).promise();
    return { message: 'File deleted successfully' };
  } catch (error) {
    console.error('Error deleting file from S3:', error);
    throw new Error('Failed to delete file from S3');
  }
};

/**
 * Delete multiple files from S3
 * @param fileUrls - Array of URLs to delete
 * @returns Success message
 */
export const deleteMultipleFiles = async (fileUrls: string[]): Promise<{ message: string }> => {
  const deletePromises = fileUrls.map(url => deleteFile(url));
  await Promise.all(deletePromises);
  return { message: 'All files deleted successfully' };
};

/**
 * Extract S3 key from a file URL
 * @param fileUrl - Full URL of the file
 * @returns The S3 key
 */
export const getKeyFromUrl = (fileUrl: string): string => {
  const urlParts = new URL(fileUrl);
  return urlParts.pathname.substring(1); // Remove leading '/'
};

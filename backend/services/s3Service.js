// AWS S3 File Upload Service
// Replaces local file storage

const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const crypto = require('crypto');
const { logger } = require('../config/logger');

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: process.env.AWS_ACCESS_KEY_ID ? {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  } : undefined // Use IAM role in ECS
});

const BUCKET = process.env.S3_BUCKET || 'latap-documents';
const UPLOAD_PREFIX = 'verification-documents/';

/**
 * Upload file to S3
 */
async function uploadDocument(fileBuffer, originalFilename, userId) {
  const fileHash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
  const extension = originalFilename.split('.').pop();
  const key = `${UPLOAD_PREFIX}${userId}/${Date.now()}-${fileHash}.${extension}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: fileBuffer,
    ContentType: 'application/pdf',
    ServerSideEncryption: 'AES256',
    Metadata: {
      'original-filename': originalFilename,
      'user-id': userId,
      'upload-timestamp': new Date().toISOString()
    }
  });

  try {
    await s3Client.send(command);
    logger.info('Document uploaded to S3', { key, userId });
    return { key, fileHash };
  } catch (error) {
    logger.error('S3 upload failed', { error: error.message, userId });
    throw new Error('Failed to upload document');
  }
}

/**
 * Generate presigned URL for download
 */
async function getDocumentUrl(key, expiresIn = 3600) {
  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: key
  });

  try {
    const url = await getSignedUrl(s3Client, command, { expiresIn });
    return url;
  } catch (error) {
    logger.error('Failed to generate presigned URL', { error: error.message, key });
    throw new Error('Failed to generate document URL');
  }
}

/**
 * Delete document from S3
 */
async function deleteDocument(key) {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET,
    Key: key
  });

  try {
    await s3Client.send(command);
    logger.info('Document deleted from S3', { key });
    return true;
  } catch (error) {
    logger.error('S3 deletion failed', { error: error.message, key });
    return false;
  }
}

module.exports = {
  uploadDocument,
  getDocumentUrl,
  deleteDocument
};

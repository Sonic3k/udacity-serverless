import AWS from 'aws-sdk';
import AWSXRay from 'aws-xray-sdk';
import { createLogger } from '../utils/logger.mjs';

const XAWS = AWSXRay.captureAWS(AWS);
const logger = createLogger('AttachmentUtils');

export class AttachmentUtils {
  constructor() {
    this.s3 = new XAWS.S3({ signatureVersion: 'v4' });
    this.bucketName = process.env.TODOS_S3_BUCKET;
    this.urlExpiration = 300;
  }

  getUploadUrl(todoId) {
    logger.info('Getting upload URL', { todoId });
    return this.s3.getSignedUrl('putObject', {
      Bucket: this.bucketName,
      Key: todoId,
      Expires: this.urlExpiration
    });
  }

  getAttachmentUrl(todoId) {
    return `https://${this.bucketName}.s3.amazonaws.com/${todoId}`;
  }
}
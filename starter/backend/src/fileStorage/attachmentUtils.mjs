import AWS from 'aws-sdk';
import AWSXRay from 'aws-xray-sdk-core';
import { createLogger } from '../utils/logger.mjs';

const XAWS = AWSXRay.captureAWS(AWS);
const logger = createLogger('AttachmentUtils');

export class AttachmentUtils {
 constructor() {
   this.s3 = new XAWS.S3({ signatureVersion: 'v4' });
   this.bucketName = process.env.TODOS_S3_BUCKET;
   this.urlExpiration = 300;
 }

 getUploadUrl(todoId, fileName) {
   // Add explicit logging here
   logger.info('Getting upload URL:', { todoId, fileName });
   const key = `${todoId}-${fileName}`;
   logger.info('Generated key:', key);
   
   return this.s3.getSignedUrl('putObject', {
     Bucket: this.bucketName,
     Key: key,
     Expires: this.urlExpiration
   });
 }

 getAttachmentUrl(todoId, fileName) {
   const key = `${todoId}-${fileName}`;
   return `https://${this.bucketName}.s3.amazonaws.com/${key}`;
 }
}
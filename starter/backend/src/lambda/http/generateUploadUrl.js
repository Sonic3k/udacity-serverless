import { generateUploadUrl } from '../../businessLogic/todos.mjs';
import { getUserId } from '../utils.mjs';
import { createLogger } from '../../utils/logger.mjs';

const logger = createLogger('generateUploadUrl');

export const handler = async (event) => {
 const todoId = event.pathParameters.todoId;
 
 // Add detailed logging here
 logger.info('Request details:', {
   pathParams: event.pathParameters,
   queryParams: event.queryStringParameters,
   fileName: event.queryStringParameters?.fileName
 });
 
 const fileName = event.queryStringParameters?.fileName;
 const userId = getUserId(event);

 try {
   const uploadUrl = await generateUploadUrl(todoId, fileName);
   logger.info('Generated upload URL:', { todoId, fileName, uploadUrl });
   
   return {
     statusCode: 200,
     headers: {
       'Access-Control-Allow-Origin': '*',
       'Access-Control-Allow-Credentials': true
     },
     body: JSON.stringify({
       uploadUrl
     })
   };
 } catch (error) {
   logger.error('Error generating upload URL:', { error, todoId, fileName });
   return {
     statusCode: 500,
     headers: {
       'Access-Control-Allow-Origin': '*'
     },
     body: JSON.stringify({ error: 'Could not generate upload URL' })
   };
 }
};
import { TodosAccess } from '../dataLayer/todosAccess.mjs';
import { createLogger } from '../utils/logger.mjs';
import { recordMetric } from '../utils/metrics.mjs';
import { v4 as uuidv4 } from 'uuid';
import AWS from 'aws-sdk';

const s3 = new AWS.S3({
    signatureVersion: 'v4'
});
const bucketName = process.env.TODOS_S3_BUCKET;
const urlExpiration = 300;

const logger = createLogger('Todos-Business-Logic');
const todosAccess = new TodosAccess();

export async function getTodos(userId) {
  logger.info('Getting todos for user', { userId });
  await recordMetric('GetTodosRequests', 1);
  return todosAccess.getTodos(userId);
}

export async function createTodo(createTodoRequest, userId) {
  const todoId = uuidv4();
  const createdAt = new Date().toISOString();

  const newTodo = {
    todoId,
    userId,
    createdAt,
    done: false,
    attachmentUrl: null,
    ...createTodoRequest
  };

  logger.info('Creating new todo', { todoId, userId });
  await recordMetric('TodosCreated', 1);
  
  return todosAccess.createTodo(newTodo);
}

export async function updateTodo(userId, todoId, updateTodoRequest) {
  logger.info('Updating todo', { userId, todoId });
  await recordMetric('TodosUpdated', 1);
  
  await todosAccess.updateTodo(userId, todoId, updateTodoRequest);
}

export async function deleteTodo(userId, todoId) {
  logger.info('Deleting todo', { userId, todoId });
  await recordMetric('TodosDeleted', 1);
  
  await todosAccess.deleteTodo(userId, todoId);
}

export async function getUploadUrl(todoId) {
    logger.info('Generating upload URL', { todoId });
    
    return s3.getSignedUrl('putObject', {
        Bucket: bucketName,
        Key: todoId,
        Expires: urlExpiration
    });
}

export async function updateTodoAttachmentUrl(userId, todoId) {
    const attachmentUrl = `https://${bucketName}.s3.amazonaws.com/${todoId}`;
    
    logger.info('Updating todo with attachment URL', { 
        userId, 
        todoId,
        attachmentUrl 
    });
    
    await recordMetric('TodosAttachmentsAdded', 1);
    return todosAccess.updateAttachmentUrl(userId, todoId, attachmentUrl);
}
import { TodosAccess } from '../dataLayer/todosAccess.mjs';
import { AttachmentUtils } from '../fileStorage/attachmentUtils.mjs';
import { createLogger } from '../utils/logger.mjs';
import { recordMetric } from '../utils/metrics.mjs';
import { v4 as uuidv4 } from 'uuid';

const logger = createLogger('Todos-Business-Logic');
const todosAccess = new TodosAccess();
const attachmentUtils = new AttachmentUtils();

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

export async function generateUploadUrl(todoId) {
 logger.info('Generating upload URL', { todoId });
 return attachmentUtils.getUploadUrl(todoId);
}

export async function updateAttachmentUrl(userId, todoId) {
 logger.info('Updating attachment URL', { userId, todoId });
 const attachmentUrl = attachmentUtils.getAttachmentUrl(todoId);
 await todosAccess.updateAttachmentUrl(userId, todoId, attachmentUrl);
}

export async function getTodoById(userId, todoId) {
 logger.info('Getting todo by ID', { userId, todoId });
 return todosAccess.getTodoById(userId, todoId);
}
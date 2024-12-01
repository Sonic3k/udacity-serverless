import { updateTodo } from '../../businessLogic/todos.mjs';
import { getUserId } from '../utils.mjs';
import { createLogger } from '../../utils/logger.mjs';

const logger = createLogger('updateTodo');

export const handler = async (event) => {
  try {
    const userId = getUserId(event);
    const todoId = event.pathParameters.todoId;
    const updatedTodo = JSON.parse(event.body);

    logger.info('Updating todo', { userId, todoId, updatedTodo });

    // Business logic layer handles the update
    await updateTodo(userId, todoId, updatedTodo);

    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      }
    };
  } catch (error) {
    logger.error('Error updating todo', { error });
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
        error: 'Could not update the todo item'
      })
    };
  }
};
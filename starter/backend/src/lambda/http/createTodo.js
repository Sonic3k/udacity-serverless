import { createTodo } from '../../businessLogic/todos.mjs';
import { getUserId } from '../utils.mjs';
import { createLogger } from '../../utils/logger.mjs';

const logger = createLogger('createTodo');

export const handler = async (event) => {
  try {
    logger.info('Processing event', { event });

    const newTodo = JSON.parse(event.body);
    const userId = getUserId(event);

    // Validate input
    if (!newTodo.name || !newTodo.name.trim()) {
      logger.error('Validation failed', { newTodo });
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({
          error: 'Name is required and cannot be empty'
        })
      };
    }

    // Business logic layer handles the creation
    const item = await createTodo(newTodo, userId);

    return {
      statusCode: 201,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
        item
      })
    };
  } catch (error) {
    logger.error('Error creating todo', { error });
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
        error: 'Could not create the todo item'
      })
    };
  }
};
import { getTodos } from '../../businessLogic/todos.mjs';
import { getUserId } from '../utils.mjs';
import { createLogger } from '../../utils/logger.mjs';

const logger = createLogger('getTodos');

export const handler = async (event) => {
  try {
    const userId = getUserId(event);
    logger.info('Getting todos for user', { userId });

    // Business logic layer handles fetching todos
    const todos = await getTodos(userId);

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
        items: todos
      })
    };
  } catch (error) {
    logger.error('Error getting todos', { error });
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
        error: 'Could not fetch todos'
      })
    };
  }
};
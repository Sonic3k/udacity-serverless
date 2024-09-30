import { createTodo } from '../../businessLogic/todos.mjs';
import { getUserId } from '../utils.mjs';

export const handler = async (event) => {
  const newTodo = JSON.parse(event.body);
  const userId = getUserId(event);

  // Simple validation to check if 'name' and 'dueDate' are present
  if (!newTodo || !newTodo.name || !newTodo.dueDate) {
    logger.error('Validation failed: Missing required fields');
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'name and dueDate are required' })
    };
  }

  const newItem = await createTodo(newTodo, userId);

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify(newItem)
  };
};

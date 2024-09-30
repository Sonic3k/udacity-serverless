import { updateTodo } from '../../businessLogic/todos.mjs';
import { getUserId } from '../utils.mjs';

export const handler = async (event) => {
  const userId = getUserId(event);
  const todoId = event.pathParameters.todoId;
  const updatedTodo = JSON.parse(event.body);

  await updateTodo(todoId, userId, updatedTodo);

  return {
    statusCode: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    }
  };
};

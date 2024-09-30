import { getUploadUrl } from '../../businessLogic/todos.mjs';

export const handler = async (event) => {
  const todoId = event.pathParameters.todoId;

  const uploadUrl = await getUploadUrl(todoId);

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
};

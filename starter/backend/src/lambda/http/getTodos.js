import { getAllTodos } from '../../businessLogic/todos.mjs';
import { getUserId } from '../utils.mjs';

export const handler = async (event) => {
  try {
    const userId = getUserId(event); 

    // Validate userId
    if (!userId) {
      console.error("User ID not found in the event");
      return {
        statusCode: 401,  // Unauthorized
        body: JSON.stringify({ error: 'Unauthorized' })
      };
    }

    const todos = await getAllTodos(userId);

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
    console.error("Error fetching TODOs:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch TODOs' })
    };
  }
};

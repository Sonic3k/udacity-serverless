import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

const docClient = new AWS.DynamoDB.DocumentClient();
const s3 = new AWS.S3({ signatureVersion: 'v4' });

const TODOS_TABLE = process.env.TODOS_TABLE;
const TODOS_CREATED_AT_INDEX = process.env.TODOS_CREATED_AT_INDEX;
const TODOS_S3_BUCKET = process.env.TODOS_S3_BUCKET;
const URL_EXPIRATION = 300;  // URL expiration time in seconds

// Create a new TODO
export async function createTodo(newTodo, userId) {
    const todoId = uuidv4();
    const newItem = {
      todoId,
      userId,
      ...newTodo,
      createdAt: new Date().toISOString(),
      done: false,
    };
  
    await docClient.put({
      TableName: TODOS_TABLE,
      Item: newItem,
    }).promise();
  
    return newItem;
  }

// Get all TODOs for a user
export async function getAllTodos(userId) {
    try {
      const result = await docClient.query({
        TableName: TODOS_TABLE,
        IndexName: TODOS_CREATED_AT_INDEX, // Query using the index
        KeyConditionExpression: 'userId = :userId', // Partition key condition
        ExpressionAttributeValues: {
          ':userId': userId // Partition key value
        }
      }).promise();
  
      return result.Items; // Return the list of items
    } catch (error) {
      console.error('Error fetching TODOs:', error); // Log the error details
      throw new Error('Failed to fetch TODOs'); // Return a clearer error message
    }
  }

// Update an existing TODO
export async function updateTodo(todoId, userId, updatedTodo) {
  try {
    await docClient.update({
      TableName: TODOS_TABLE,
      Key: {
        userId,
        todoId
      },
      UpdateExpression: 'set #n = :name, dueDate = :dueDate, done = :done',
      ExpressionAttributeNames: {
        '#n': 'name'
      },
      ExpressionAttributeValues: {
        ':name': updatedTodo.name,
        ':dueDate': updatedTodo.dueDate,
        ':done': updatedTodo.done
      }
    }).promise();
  } catch (error) {
    console.error('Error updating TODO:', error);
    throw new Error('Could not update TODO');
  }
}

// Delete a TODO item
export async function deleteTodo(todoId, userId) {
  try {
    await docClient.delete({
      TableName: TODOS_TABLE,
      Key: {
        userId,
        todoId
      }
    }).promise();
  } catch (error) {
    console.error('Error deleting TODO:', error);
    throw new Error('Could not delete TODO');
  }
}

// Generate a pre-signed URL for uploading attachments to S3
export async function getUploadUrl(todoId) {
  try {
    return s3.getSignedUrl('putObject', {
      Bucket: TODOS_S3_BUCKET,
      Key: todoId,
      Expires: URL_EXPIRATION
    });
  } catch (error) {
    console.error('Error generating upload URL:', error);
    throw new Error('Could not generate upload URL');
  }
}

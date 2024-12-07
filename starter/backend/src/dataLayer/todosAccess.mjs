import AWS from 'aws-sdk';
import AWSXRay from 'aws-xray-sdk-core';
import { createLogger } from '../utils/logger.mjs';

const XAWS = AWSXRay.captureAWS(AWS);
const logger = createLogger('TodosAccess');

export class TodosAccess {
  constructor() {
    this.docClient = new XAWS.DynamoDB.DocumentClient();
    this.todosTable = process.env.TODOS_TABLE;
    this.todosIndex = process.env.TODOS_CREATED_AT_INDEX;
  }

  async getTodos(userId) {
    logger.info('Getting all todos for user', { userId });

    const result = await this.docClient.query({
      TableName: this.todosTable,
      IndexName: this.todosIndex,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      }
    }).promise();

    return result.Items;
  }

  async createTodo(todo) {
    logger.info('Creating new todo', { todoId: todo.todoId });

    await this.docClient.put({
      TableName: this.todosTable,
      Item: todo
    }).promise();

    return todo;
  }

  async updateTodo(userId, todoId, todoUpdate) {
    logger.info('Updating todo', { userId, todoId, todoUpdate });
  
    await this.docClient.update({
      TableName: this.todosTable,
      Key: {
        userId,
        todoId
      },
      UpdateExpression: 'set #name = :name, dueDate = :dueDate, done = :done, attachmentUrl = :attachmentUrl',
      ExpressionAttributeNames: {
        '#name': 'name'
      },
      ExpressionAttributeValues: {
        ':name': todoUpdate.name,
        ':dueDate': todoUpdate.dueDate,
        ':done': todoUpdate.done,
        ':attachmentUrl': todoUpdate.attachmentUrl
      }
    }).promise();
  }

  async deleteTodo(userId, todoId) {
    logger.info('Deleting todo', { userId, todoId });

    await this.docClient.delete({
      TableName: this.todosTable,
      Key: {
        userId,
        todoId
      }
    }).promise();
  }

  async updateAttachmentUrl(userId, todoId, attachmentUrl) {
    logger.info('Updating attachment URL', { userId, todoId, attachmentUrl });

    const url = `https://${process.env.TODOS_S3_BUCKET}.s3.ap-southeast-1.amazonaws.com/${todoId}`

    await this.docClient.update({
      TableName: this.todosTable,
      Key: {
        userId,
        todoId
      },
      UpdateExpression: 'set attachmentUrl = :attachmentUrl',
      ExpressionAttributeValues: {
        ':attachmentUrl': url  // Use the constructed URL instead of passed parameter
      }
    }).promise();
  }
}
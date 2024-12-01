import AWS from 'aws-sdk';
import { createLogger } from '../utils/logger.mjs';

const logger = createLogger('TodosAccess');

export class TodosAccess {
  constructor() {
    this.docClient = new AWS.DynamoDB.DocumentClient();
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
      UpdateExpression: 'set #name = :name, dueDate = :dueDate, done = :done',
      ExpressionAttributeNames: {
        '#name': 'name'
      },
      ExpressionAttributeValues: {
        ':name': todoUpdate.name,
        ':dueDate': todoUpdate.dueDate,
        ':done': todoUpdate.done
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

    await this.docClient.update({
      TableName: this.todosTable,
      Key: {
        userId,
        todoId
      },
      UpdateExpression: 'set attachmentUrl = :attachmentUrl',
      ExpressionAttributeValues: {
        ':attachmentUrl': attachmentUrl
      }
    }).promise();
  }
}
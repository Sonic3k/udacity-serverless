import winston from 'winston';

export function createLogger(loggerName) {
  return winston.createLogger({
    level: 'info',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
    defaultMeta: { 
      service: 'todo-service',
      name: loggerName 
    },
    transports: [
      new winston.transports.Console()
    ]
  });
}
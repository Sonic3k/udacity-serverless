import AWS from 'aws-sdk';
import { createLogger } from './logger.mjs';

const cloudwatch = new AWS.CloudWatch();
const logger = createLogger('Metrics');

export async function recordMetric(metricName, value, unit = 'Count') {
  try {
    await cloudwatch.putMetricData({
      Namespace: 'TodosApplication',
      MetricData: [
        {
          MetricName: metricName,
          Value: value,
          Unit: unit,
          Timestamp: new Date(),
          Dimensions: [
            {
              Name: 'Environment',
              Value: process.env.STAGE || 'dev'
            }
          ]
        }
      ]
    }).promise();

    logger.info('Metric recorded', { metricName, value, unit });
  } catch (error) {
    logger.error('Failed to record metric', { error, metricName });
  }
}
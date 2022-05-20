import { PutItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import { SQSEvent } from 'aws-lambda';
import { commonMiddleware, dynamoDbClient } from './shared';

async function createOrder(event: SQSEvent): Promise<void> {
  event.Records.forEach(async (record) => {
    console.log('Record: ', record);

    const checkoutInfo = JSON.parse(record.body);

    const orderDate = new Date().toISOString();

    checkoutInfo.detail.orderDate = orderDate;

    const result = await dynamoDbClient.send(
      new PutItemCommand({
        TableName: process.env.DB_TABLE_NAME,
        Item: marshall(checkoutInfo.detail || {}),
      }),
    );

    console.log(result);
  });
}

export const handler = commonMiddleware(createOrder);

import { PutItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import { APIGatewayEvent, ProxyResult } from 'aws-lambda';
import { commonMiddleware, dynamoDbClient } from '../shared';
import { StatusCodes } from 'http-status-codes';

async function createBasket(event: APIGatewayEvent): Promise<ProxyResult> {
  const basketProperties = JSON.parse(event.body as string);

  const result = await dynamoDbClient.send(
    new PutItemCommand({
      TableName: process.env.DB_TABLE_NAME,
      Item: marshall(basketProperties || {}),
    }),
  );

  return {
    statusCode: StatusCodes.OK,
    body: JSON.stringify({
      data: result,
    }),
  };
}

export const handler = commonMiddleware(createBasket);

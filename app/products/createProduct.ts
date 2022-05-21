import { PutItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import { APIGatewayEvent, ProxyResult } from 'aws-lambda';
import { commonMiddleware, dynamoDbClient } from './shared';
import { StatusCodes } from 'http-status-codes';
import { v4 as uuid4 } from 'uuid';

async function createProduct(event: APIGatewayEvent): Promise<ProxyResult> {
  const productProperties = JSON.parse(event.body as string);

  const productId = uuid4();

  productProperties.id = productId;

  const result = await dynamoDbClient.send(
    new PutItemCommand({
      TableName: process.env.DB_TABLE_NAME,
      Item: marshall(productProperties || {}),
    }),
  );

  return {
    statusCode: StatusCodes.OK,
    body: JSON.stringify({
      data: result,
    }),
  };
}

export const handler = commonMiddleware(createProduct);

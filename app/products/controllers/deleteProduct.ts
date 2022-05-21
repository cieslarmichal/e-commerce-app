import { DeleteItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import { APIGatewayEvent, ProxyResult } from 'aws-lambda';
import { commonMiddleware, dynamoDbClient } from '../shared';
import { StatusCodes } from 'http-status-codes';

async function deleteProduct(event: APIGatewayEvent): Promise<ProxyResult> {
  const id = event.pathParameters!.id as string;

  await dynamoDbClient.send(
    new DeleteItemCommand({
      TableName: process.env.DB_TABLE_NAME,
      Key: marshall({ id }),
    }),
  );

  return {
    statusCode: StatusCodes.NO_CONTENT,
    body: JSON.stringify({
      data: '',
    }),
  };
}

export const handler = commonMiddleware(deleteProduct);

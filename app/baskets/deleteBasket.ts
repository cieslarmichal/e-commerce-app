import { DeleteItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import { APIGatewayEvent, ProxyResult } from 'aws-lambda';
import { commonMiddleware, dynamoDbClient } from './shared';
import { StatusCodes } from 'http-status-codes';

export async function deleteBasketByEmail(email: string) {
  await dynamoDbClient.send(
    new DeleteItemCommand({
      TableName: process.env.DB_TABLE_NAME,
      Key: marshall({ email }),
    }),
  );
}

async function deleteBasket(event: APIGatewayEvent): Promise<ProxyResult> {
  const email = event.pathParameters!.email as string;

  await deleteBasketByEmail(email);
  console.log('Success, item deleted');

  return {
    statusCode: StatusCodes.OK,
    body: JSON.stringify({
      data: '',
    }),
  };
}

export const handler = commonMiddleware(deleteBasket);

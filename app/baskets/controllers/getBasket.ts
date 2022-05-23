import { GetItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { APIGatewayEvent, ProxyResult } from 'aws-lambda';
import { commonMiddleware, dynamoDbClient } from '../shared';
import { StatusCodes } from 'http-status-codes';

export async function getBasketByEmail(email: string) {
  const { Item } = await dynamoDbClient.send(
    new GetItemCommand({
      TableName: process.env.DB_TABLE_NAME,
      Key: marshall({ email }),
    }),
  );

  return Item;
}

async function getBasket(event: APIGatewayEvent): Promise<ProxyResult> {
  const email = event.pathParameters!.email as string;

  const basket = await getBasketByEmail(email);

  console.log(basket);

  const body = basket ? unmarshall(basket) : {};

  return {
    statusCode: StatusCodes.OK,
    body: JSON.stringify({
      data: body,
    }),
  };
}

export const handler = commonMiddleware(getBasket);

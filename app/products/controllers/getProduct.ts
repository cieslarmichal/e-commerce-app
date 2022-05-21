import { GetItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { APIGatewayEvent, ProxyResult } from 'aws-lambda';
import { commonMiddleware, dynamoDbClient } from '../shared';
import { StatusCodes } from 'http-status-codes';

async function getProduct(event: APIGatewayEvent): Promise<ProxyResult> {
  const id = event.pathParameters!.id as string;

  try {
    const { Item } = await dynamoDbClient.send(
      new GetItemCommand({
        TableName: process.env.DB_TABLE_NAME,
        Key: marshall({ id }),
      }),
    );

    console.log(Item);

    const data = Item ? unmarshall(Item) : {};

    return {
      statusCode: StatusCodes.OK,
      body: JSON.stringify({
        data,
      }),
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export const handler = commonMiddleware(getProduct);

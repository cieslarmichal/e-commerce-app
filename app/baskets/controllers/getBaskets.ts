import { ScanCommand } from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';
import { APIGatewayEvent, ProxyResult } from 'aws-lambda';
import { commonMiddleware, dynamoDbClient } from '../shared';
import { StatusCodes } from 'http-status-codes';

async function getBaskets(event: APIGatewayEvent): Promise<ProxyResult> {
  const { Items } = await dynamoDbClient.send(
    new ScanCommand({
      TableName: process.env.DB_TABLE_NAME,
    }),
  );

  console.log(Items);

  const body = Items ? Items.map((item: any) => unmarshall(item)) : {};

  return {
    statusCode: StatusCodes.OK,
    body: JSON.stringify({
      data: body,
    }),
  };
}

export const handler = commonMiddleware(getBaskets);

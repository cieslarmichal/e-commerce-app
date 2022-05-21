import { ScanCommand } from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';
import { APIGatewayEvent, ProxyResult } from 'aws-lambda';
import { commonMiddleware, dynamoDbClient } from './shared';
import { StatusCodes } from 'http-status-codes';

async function getProducts(event: APIGatewayEvent): Promise<ProxyResult> {
  try {
    const { Items } = await dynamoDbClient.send(
      new ScanCommand({
        TableName: process.env.DB_TABLE_NAME,
      }),
    );

    console.log(Items);

    const data = Items ? Items.map((item) => unmarshall(item)) : {};

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

export const handler = commonMiddleware(getProducts);

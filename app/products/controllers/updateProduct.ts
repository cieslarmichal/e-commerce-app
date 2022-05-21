import { UpdateItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import { APIGatewayEvent, ProxyResult } from 'aws-lambda';
import { commonMiddleware, dynamoDbClient } from '../shared';
import { StatusCodes } from 'http-status-codes';

async function updateProduct(event: APIGatewayEvent): Promise<ProxyResult> {
  const productId = event.pathParameters!.id as string;

  const productProperties = JSON.parse(event.body!);

  try {
    const productPropertiesKeys = Object.keys(productProperties);

    const result = await dynamoDbClient.send(
      new UpdateItemCommand({
        TableName: process.env.DB_TABLE_NAME,
        Key: marshall({ id: productId }),
        UpdateExpression: `SET ${productPropertiesKeys.map((_, index) => `#key${index} = :value${index}`).join(', ')}`,
        ExpressionAttributeNames: productPropertiesKeys.reduce(
          (acc, key, index) => ({
            ...acc,
            [`#key${index}`]: key,
          }),
          {},
        ),
        ExpressionAttributeValues: marshall(
          productPropertiesKeys.reduce(
            (acc, key, index) => ({
              ...acc,
              [`:value${index}`]: productProperties[key],
            }),
            {},
          ),
        ),
      }),
    );

    console.log('Success, item updated', result);

    return {
      statusCode: StatusCodes.OK,
      body: JSON.stringify({
        data: result,
      }),
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export const handler = commonMiddleware(updateProduct);

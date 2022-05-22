import { PutItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import { APIGatewayEvent, ProxyResult } from 'aws-lambda';
import { commonMiddleware, dynamoDbClient } from '../shared';
import { StatusCodes } from 'http-status-codes';
import { RecordToInstanceTransformer } from '../../common';
import { CreateProductBodyDto } from './dtos';
import createError from 'http-errors';

async function createProduct(event: APIGatewayEvent): Promise<ProxyResult> {
  let createProductBodyDto: CreateProductBodyDto;

  try {
    createProductBodyDto = RecordToInstanceTransformer.strictTransform(
      event.body ? JSON.parse(event.body) : {},
      CreateProductBodyDto,
    );
  } catch (error: any) {
    throw new createError.BadRequest(error.message);
  }

  const productId = uuid4();

  const result = await dynamoDbClient.send(
    new PutItemCommand({
      TableName: process.env.DB_TABLE_NAME,
      Item: marshall({ ...createProductBodyDto, id: productId } || {}),
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

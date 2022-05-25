import 'reflect-metadata';
import { APIGatewayEvent, ProxyResult } from 'aws-lambda';
import { commonMiddleware, dynamoDbDocumentClient } from '../shared';
import { StatusCodes } from 'http-status-codes';
import { BasketRepository } from '../domain/repositories/basketRepository';
import { BasketMapper, ProductMapper } from '../domain/mappers';
import { BasketService } from '../domain/services/basketService';
import { DeleteBasketParamDto } from './dtos';
import { LoggerService, RecordToInstanceTransformer } from '../../common';

const basketRepository = new BasketRepository(dynamoDbDocumentClient, new BasketMapper(new ProductMapper()));
const basketService = new BasketService(basketRepository, new LoggerService());

async function deleteBasket(event: APIGatewayEvent): Promise<ProxyResult> {
  const { id } = RecordToInstanceTransformer.strictTransform(event.pathParameters || {}, DeleteBasketParamDto);

  await basketService.removeBasket(id);

  return {
    statusCode: StatusCodes.NO_CONTENT,
    body: JSON.stringify({
      data: '',
    }),
  };
}

export const handler = commonMiddleware(deleteBasket);

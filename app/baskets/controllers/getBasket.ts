import 'reflect-metadata';
import { APIGatewayEvent, ProxyResult } from 'aws-lambda';
import { commonMiddleware, dynamoDbDocumentClient } from '../shared';
import { StatusCodes } from 'http-status-codes';
import { GetBasketParamDto, GetBasketResponseData } from './dtos';
import { BasketRepository } from '../domain/repositories/basketRepository';
import { BasketMapper, ProductMapper } from '../domain/mappers';
import { BasketService } from '../domain/services/basketService';
import { LoggerService, RecordToInstanceTransformer } from '../../common';

const basketRepository = new BasketRepository(dynamoDbDocumentClient, new BasketMapper(new ProductMapper()));
const basketService = new BasketService(basketRepository, new LoggerService());

async function getBasket(event: APIGatewayEvent): Promise<ProxyResult> {
  const { id } = RecordToInstanceTransformer.strictTransform(event.pathParameters || {}, GetBasketParamDto);

  const basket = await basketService.findBasket(id);

  const responseData = new GetBasketResponseData(basket);

  return {
    statusCode: StatusCodes.OK,
    body: JSON.stringify({
      data: responseData,
    }),
  };
}

export const handler = commonMiddleware(getBasket);

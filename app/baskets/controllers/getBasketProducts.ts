import 'reflect-metadata';
import { APIGatewayEvent, ProxyResult } from 'aws-lambda';
import { commonMiddleware, dynamoDbDocumentClient } from '../shared';
import { StatusCodes } from 'http-status-codes';
import { BasketRepository } from '../domain/repositories/basketRepository';
import { BasketMapper, ProductMapper } from '../domain/mappers';
import { BasketService } from '../domain/services/basketService';
import { GetBasketProductsParamDto, GetBasketProductsResponseData } from './dtos';
import { LoggerService, RecordToInstanceTransformer } from '../../common';

const basketRepository = new BasketRepository(dynamoDbDocumentClient, new BasketMapper(new ProductMapper()));
const basketService = new BasketService(basketRepository, new LoggerService());

async function getBasketProducts(event: APIGatewayEvent): Promise<ProxyResult> {
  const { id } = RecordToInstanceTransformer.strictTransform(event.pathParameters || {}, GetBasketProductsParamDto);

  const products = await basketService.findBasketProducts(id);

  const responseData = new GetBasketProductsResponseData(products);

  return {
    statusCode: StatusCodes.OK,
    body: JSON.stringify({
      data: responseData,
    }),
  };
}

export const handler = commonMiddleware(getBasketProducts);

import 'reflect-metadata';
import { APIGatewayEvent, ProxyResult } from 'aws-lambda';
import { commonMiddleware, dynamoDbDocumentClient } from '../shared';
import { StatusCodes } from 'http-status-codes';
import { BasketRepository } from '../domain/repositories/basketRepository';
import { BasketMapper, ProductMapper } from '../domain/mappers';
import { BasketService } from '../domain/services/basketService';
import { CheckoutBasketBodyDto } from './dtos';
import { LoggerService, RecordToInstanceTransformer } from '../../common';

const basketRepository = new BasketRepository(dynamoDbDocumentClient, new BasketMapper(new ProductMapper()));
const basketService = new BasketService(basketRepository, new LoggerService());

async function checkoutBasket(event: APIGatewayEvent): Promise<ProxyResult> {
  const { basketId } = RecordToInstanceTransformer.strictTransform(
    event.body ? JSON.parse(event.body) : {},
    CheckoutBasketBodyDto,
  );

  await basketService.checkoutBasket(basketId);

  return {
    statusCode: StatusCodes.NO_CONTENT,
    body: '',
  };
}

export const handler = commonMiddleware(checkoutBasket);

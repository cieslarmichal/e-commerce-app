import { APIGatewayEvent, ProxyResult } from 'aws-lambda';
import { commonMiddleware, dynamoDbDocumentClient } from '../shared';
import { StatusCodes } from 'http-status-codes';
import createError from 'http-errors';
import { BasketRepository } from '../domain/repositories/basketRepository';
import { BasketMapper } from '../domain/mappers';
import { BasketService } from '../domain/services/basketService';
import { CreateBasketBodyDto, CreateBasketResponseData } from './dtos';
import { LoggerService, RecordToInstanceTransformer, ValidationError } from '../../common';

const basketRepository = new BasketRepository(dynamoDbDocumentClient, new BasketMapper());
const basketService = new BasketService(basketRepository, new LoggerService());

async function createBasket(event: APIGatewayEvent): Promise<ProxyResult> {
  let createBasketBodyDto: CreateBasketBodyDto;

  try {
    createBasketBodyDto = RecordToInstanceTransformer.strictTransform(
      event.body ? JSON.parse(event.body) : {},
      CreateBasketBodyDto,
    );
  } catch (error) {
    if (error instanceof ValidationError) {
      throw new createError.BadRequest(error.message);
    }
  }

  const basket = await basketService.createBasket(createBasketBodyDto!);

  const responseData = new CreateBasketResponseData(basket);

  return {
    statusCode: StatusCodes.CREATED,
    body: JSON.stringify({
      data: responseData,
    }),
  };
}

export const handler = commonMiddleware(createBasket);

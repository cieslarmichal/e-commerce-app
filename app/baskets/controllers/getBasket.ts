import 'reflect-metadata';
import { APIGatewayEvent, ProxyResult } from 'aws-lambda';
import { commonMiddleware, dynamoDbDocumentClient } from '../shared';
import { StatusCodes } from 'http-status-codes';
import { GetBasketParamDto, GetBasketResponseData } from './dtos';
import createError from 'http-errors';
import { BasketRepository } from '../domain/repositories/basketRepository';
import { BasketMapper } from '../domain/mappers';
import { BasketService } from '../domain/services/basketService';
import { LoggerService, RecordToInstanceTransformer, ValidationError } from '../../common';

const basketRepository = new BasketRepository(dynamoDbDocumentClient, new BasketMapper());
const basketService = new BasketService(basketRepository, new LoggerService());

async function getBasket(event: APIGatewayEvent): Promise<ProxyResult> {
  let getBasketParamDto: GetBasketParamDto;

  try {
    getBasketParamDto = RecordToInstanceTransformer.strictTransform(event.pathParameters || {}, GetBasketParamDto);
  } catch (error) {
    if (error instanceof ValidationError) {
      throw new createError.BadRequest(error.message);
    }
  }

  const basket = await basketService.findBasket(getBasketParamDto!.id);

  const responseData = new GetBasketResponseData(basket);

  return {
    statusCode: StatusCodes.OK,
    body: JSON.stringify({
      data: responseData,
    }),
  };
}

export const handler = commonMiddleware(getBasket);

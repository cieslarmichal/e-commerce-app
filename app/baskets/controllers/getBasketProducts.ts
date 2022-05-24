import { APIGatewayEvent, ProxyResult } from 'aws-lambda';
import { commonMiddleware, dynamoDbDocumentClient } from '../shared';
import { StatusCodes } from 'http-status-codes';
import createError from 'http-errors';
import { BasketRepository } from '../domain/repositories/basketRepository';
import { BasketMapper } from '../domain/mappers';
import { BasketService } from '../domain/services/basketService';
import { GetBasketProductsParamDto, GetBasketProductsResponseData } from './dtos';
import { LoggerService, RecordToInstanceTransformer, ValidationError } from '../../common';

const basketRepository = new BasketRepository(dynamoDbDocumentClient, new BasketMapper());
const basketService = new BasketService(basketRepository, new LoggerService());

async function getBasketProducts(event: APIGatewayEvent): Promise<ProxyResult> {
  let getBasketProductsParamDto: GetBasketProductsParamDto;

  try {
    getBasketProductsParamDto = RecordToInstanceTransformer.strictTransform(
      event.pathParameters || {},
      GetBasketProductsParamDto,
    );
  } catch (error) {
    if (error instanceof ValidationError) {
      throw new createError.BadRequest(error.message);
    }
  }

  const products = await basketService.findBasketProducts(getBasketProductsParamDto!.id);

  const responseData = new GetBasketProductsResponseData(products);

  return {
    statusCode: StatusCodes.OK,
    body: JSON.stringify({
      data: responseData,
    }),
  };
}

export const handler = commonMiddleware(getBasketProducts);

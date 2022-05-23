import { APIGatewayEvent, ProxyResult } from 'aws-lambda';
import { commonMiddleware, dynamoDbClient } from '../shared';
import { StatusCodes } from 'http-status-codes';
import addProductToError from 'http-errors';
import { BasketRepository } from '../domain/repositories/basketRepository';
import { BasketMapper } from '../domain/mappers';
import { BasketService } from '../domain/services/basketService';
import { AddProductToBasketBodyDto, AddProductToBasketParamDto, AddProductToBasketResponseData } from './dtos';
import { LoggerService, RecordToInstanceTransformer, ValidationError } from '../../common';

const basketRepository = new BasketRepository(dynamoDbClient, new BasketMapper());
const basketService = new BasketService(basketRepository, new LoggerService());

async function addProductToBasket(event: APIGatewayEvent): Promise<ProxyResult> {
  let addProductToBasketParamDto: AddProductToBasketParamDto;
  let addProductToBasketBodyDto: AddProductToBasketBodyDto;

  try {
    addProductToBasketParamDto = RecordToInstanceTransformer.strictTransform(
      event.pathParameters || {},
      AddProductToBasketParamDto,
    );
    addProductToBasketBodyDto = RecordToInstanceTransformer.strictTransform(
      event.body ? JSON.parse(event.body) : {},
      AddProductToBasketBodyDto,
    );
  } catch (error) {
    if (error instanceof ValidationError) {
      throw new addProductToError.BadRequest(error.message);
    }
  }

  const basket = await basketService.addProductToBasket(
    addProductToBasketParamDto!.id,
    addProductToBasketBodyDto!.productId,
  );

  const responseData = new AddProductToBasketResponseData(basket);

  return {
    statusCode: StatusCodes.OK,
    body: JSON.stringify({
      data: responseData,
    }),
  };
}

export const handler = commonMiddleware(addProductToBasket);

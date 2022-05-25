import 'reflect-metadata';
import { APIGatewayEvent, ProxyResult } from 'aws-lambda';
import { commonMiddleware, dynamoDbDocumentClient } from '../shared';
import { StatusCodes } from 'http-status-codes';
import createError from 'http-errors';
import { BasketRepository } from '../domain/repositories/basketRepository';
import { BasketMapper } from '../domain/mappers';
import { BasketService } from '../domain/services/basketService';
import { DeleteProductFromBasketParamDto, DeleteProductFromBasketResponseData } from './dtos';
import { LoggerService, RecordToInstanceTransformer, ValidationError } from '../../common';

const basketRepository = new BasketRepository(dynamoDbDocumentClient, new BasketMapper());
const basketService = new BasketService(basketRepository, new LoggerService());

async function deleteProductFromBasket(event: APIGatewayEvent): Promise<ProxyResult> {
  let deleteProductFromBasketParamDto: DeleteProductFromBasketParamDto;

  try {
    deleteProductFromBasketParamDto = RecordToInstanceTransformer.strictTransform(
      event.pathParameters || {},
      DeleteProductFromBasketParamDto,
    );
  } catch (error) {
    if (error instanceof ValidationError) {
      throw new createError.BadRequest(error.message);
    }
  }

  const { id: basketId, productId } = deleteProductFromBasketParamDto!;

  const basket = await basketService.removeProductFromBasket(basketId, productId);

  const responseData = new DeleteProductFromBasketResponseData(basket);

  return {
    statusCode: StatusCodes.OK,
    body: JSON.stringify({
      data: responseData,
    }),
  };
}

export const handler = commonMiddleware(deleteProductFromBasket);

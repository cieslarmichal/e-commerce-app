import { APIGatewayEvent, ProxyResult } from 'aws-lambda';
import { commonMiddleware, dynamoDbDocumentClient } from '../shared';
import { StatusCodes } from 'http-status-codes';
import createError from 'http-errors';
import { BasketRepository } from '../domain/repositories/basketRepository';
import { BasketMapper } from '../domain/mappers';
import { BasketService } from '../domain/services/basketService';
import { DeleteBasketParamDto } from './dtos';
import { LoggerService, RecordToInstanceTransformer, ValidationError } from '../../common';

const basketRepository = new BasketRepository(dynamoDbDocumentClient, new BasketMapper());
const basketService = new BasketService(basketRepository, new LoggerService());

async function deleteBasket(event: APIGatewayEvent): Promise<ProxyResult> {
  let deleteBasketParamDto: DeleteBasketParamDto;

  try {
    deleteBasketParamDto = RecordToInstanceTransformer.strictTransform(
      event.pathParameters || {},
      DeleteBasketParamDto,
    );
  } catch (error) {
    if (error instanceof ValidationError) {
      throw new createError.BadRequest(error.message);
    }
  }

  await basketService.removeBasket(deleteBasketParamDto!.id);

  return {
    statusCode: StatusCodes.NO_CONTENT,
    body: JSON.stringify({
      data: '',
    }),
  };
}

export const handler = commonMiddleware(deleteBasket);

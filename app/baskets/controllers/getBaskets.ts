import { APIGatewayEvent, ProxyResult } from 'aws-lambda';
import { commonMiddleware, dynamoDbClient } from '../shared';
import { StatusCodes } from 'http-status-codes';
import { BasketRepository } from '../domain/repositories/basketRepository';
import { BasketMapper } from '../domain/mappers';
import { BasketService } from '../domain/services/basketService';
import { LoggerService } from '../../common';
import { GetBasketsResponseData } from './dtos';

const basketRepository = new BasketRepository(dynamoDbClient, new BasketMapper());
const basketService = new BasketService(basketRepository, new LoggerService());

async function getBaskets(event: APIGatewayEvent): Promise<ProxyResult> {
  const baskets = await basketService.findBaskets();

  const responseData = new GetBasketsResponseData(baskets);

  return {
    statusCode: StatusCodes.OK,
    body: JSON.stringify({
      data: responseData,
    }),
  };
}

export const handler = commonMiddleware(getBaskets);

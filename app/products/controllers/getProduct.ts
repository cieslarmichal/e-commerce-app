import { APIGatewayEvent, ProxyResult } from 'aws-lambda';
import { commonMiddleware, dynamoDbClient } from '../shared';
import { StatusCodes } from 'http-status-codes';
import { ProductRepository } from '../domain/repositories/productRepository';
import { ProductMapper } from '../domain/mappers';
import { ProductService } from '../domain/services/productService';
import { LoggerService, RecordToInstanceTransformer, ValidationError } from '../../common';
import createError from 'http-errors';
import { GetProductParamDto, GetProductResponseData } from './dtos';

const productRepository = new ProductRepository(dynamoDbClient, new ProductMapper());
const productService = new ProductService(productRepository, new LoggerService());

async function getProduct(event: APIGatewayEvent): Promise<ProxyResult> {
  let getProductParamDto: GetProductParamDto;

  try {
    getProductParamDto = RecordToInstanceTransformer.strictTransform(event.pathParameters || {}, GetProductParamDto);
  } catch (error) {
    if (error instanceof ValidationError) {
      throw new createError.BadRequest(error.message);
    }
  }

  const product = await productService.findProduct(getProductParamDto!.id);

  const responseData = new GetProductResponseData(product);

  return {
    statusCode: StatusCodes.OK,
    body: JSON.stringify({
      data: responseData,
    }),
  };
}

export const handler = commonMiddleware(getProduct);

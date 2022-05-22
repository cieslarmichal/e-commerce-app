import { APIGatewayEvent, ProxyResult } from 'aws-lambda';
import { commonMiddleware, dynamoDbClient } from '../shared';
import { StatusCodes } from 'http-status-codes';
import { ProductRepository } from '../domain/repositories/productRepository';
import { ProductMapper } from '../domain/mappers';
import { ProductService } from '../domain/services/productService';
import { LoggerService, RecordToInstanceTransformer, ValidationError } from '../../common';
import { DeleteProductParamDto } from './dtos';
import createError from 'http-errors';

const productRepository = new ProductRepository(dynamoDbClient, new ProductMapper());
const productService = new ProductService(productRepository, new LoggerService());

async function deleteProduct(event: APIGatewayEvent): Promise<ProxyResult> {
  let deleteProductParamDto: DeleteProductParamDto;

  try {
    deleteProductParamDto = RecordToInstanceTransformer.strictTransform(
      event.pathParameters || {},
      DeleteProductParamDto,
    );
  } catch (error) {
    if (error instanceof ValidationError) {
      throw new createError.BadRequest(error.message);
    }
  }

  await productService.removeProduct(deleteProductParamDto!.id);

  return {
    statusCode: StatusCodes.NO_CONTENT,
    body: JSON.stringify({
      data: '',
    }),
  };
}

export const handler = commonMiddleware(deleteProduct);

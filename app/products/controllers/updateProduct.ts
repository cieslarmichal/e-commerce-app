import { APIGatewayEvent, ProxyResult } from 'aws-lambda';
import { commonMiddleware, dynamoDbDocumentClient } from '../shared';
import { StatusCodes } from 'http-status-codes';
import { ProductRepository } from '../domain/repositories/productRepository';
import { ProductMapper } from '../domain/mappers';
import { ProductService } from '../domain/services/productService';
import { LoggerService, RecordToInstanceTransformer, ValidationError } from '../../common';
import createError from 'http-errors';
import { UpdateProductParamDto, UpdateProductBodyDto, UpdateProductResponseData } from './dtos';

const productRepository = new ProductRepository(dynamoDbDocumentClient, new ProductMapper());
const productService = new ProductService(productRepository, new LoggerService());

async function updateProduct(event: APIGatewayEvent): Promise<ProxyResult> {
  let updateProductParamDto: UpdateProductParamDto;
  let updateProductBodyDto: UpdateProductBodyDto;

  try {
    updateProductParamDto = RecordToInstanceTransformer.strictTransform(
      event.pathParameters || {},
      UpdateProductParamDto,
    );
    updateProductBodyDto = RecordToInstanceTransformer.strictTransform(
      event.body ? JSON.parse(event.body) : {},
      UpdateProductBodyDto,
    );
  } catch (error) {
    if (error instanceof ValidationError) {
      throw new createError.BadRequest(error.message);
    }
  }

  const product = await productService.updateProduct(updateProductParamDto!.id, updateProductBodyDto!);

  const responseData = new UpdateProductResponseData(product);

  return {
    statusCode: StatusCodes.OK,
    body: JSON.stringify({
      data: responseData,
    }),
  };
}

export const handler = commonMiddleware(updateProduct);

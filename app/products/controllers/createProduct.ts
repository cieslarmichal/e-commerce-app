import { APIGatewayEvent, ProxyResult } from 'aws-lambda';
import { commonMiddleware, dynamoDbClient } from '../shared';
import { StatusCodes } from 'http-status-codes';
import { LoggerService, RecordToInstanceTransformer, ValidationError } from '../../common';
import { CreateProductBodyDto, CreateProductResponseData } from './dtos';
import createError from 'http-errors';
import { ProductRepository } from '../domain/repositories/productRepository';
import { ProductMapper } from '../domain/mappers';
import { ProductService } from '../domain/services/productService';

const productRepository = new ProductRepository(dynamoDbClient, new ProductMapper());
const productService = new ProductService(productRepository, new LoggerService());

async function createProduct(event: APIGatewayEvent): Promise<ProxyResult> {
  let createProductBodyDto: CreateProductBodyDto;

  try {
    createProductBodyDto = RecordToInstanceTransformer.strictTransform(
      event.body ? JSON.parse(event.body) : {},
      CreateProductBodyDto,
    );
  } catch (error) {
    if (error instanceof ValidationError) {
      throw new createError.BadRequest(error.message);
    }
  }

  const product = await productService.createProduct(createProductBodyDto!);

  const responseData = new CreateProductResponseData(product);

  return {
    statusCode: StatusCodes.CREATED,
    body: JSON.stringify({
      data: responseData,
    }),
  };
}

export const handler = commonMiddleware(createProduct);

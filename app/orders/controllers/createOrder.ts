import { SQSEvent } from 'aws-lambda';
import { ProductMapper, OrderMapper } from '../domain/mappers';
import { LoggerService, RecordToInstanceTransformer } from '../../common';
import { commonMiddleware, dynamoDbDocumentClient } from '../shared';
import { OrderRepository } from '../domain/repositories/orderRepository';
import { OrderService } from '../domain/services/basketService';
import { CreateOrderDto } from './dtos';

const orderRepository = new OrderRepository(dynamoDbDocumentClient, new OrderMapper(new ProductMapper()));
const orderService = new OrderService(orderRepository, new LoggerService());

async function createOrder(event: SQSEvent): Promise<void> {
  event.Records.forEach(async (record) => {
    console.log('Record: ', record);

    const recordDetail = JSON.parse(record.body).detail;

    const createOrderDto = RecordToInstanceTransformer.strictTransform(recordDetail, CreateOrderDto);

    await orderService.createOrder(createOrderDto);
  });
}

export const handler = commonMiddleware(createOrder);

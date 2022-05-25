import { SQSEvent } from 'aws-lambda';
import { OrderItemMapper, OrderMapper } from '../domain/mappers';
import { LoggerService, RecordToInstanceTransformer } from '../../common';
import { commonMiddleware, dynamoDbDocumentClient } from '../shared';
import { OrderRepository } from '../domain/repositories/orderRepository';
import { OrderService } from '../domain/services/basketService';
import { CreateOrderData } from 'domain/services/types';

const orderRepository = new OrderRepository(dynamoDbDocumentClient, new OrderMapper(new OrderItemMapper()));
const orderService = new OrderService(orderRepository, new LoggerService());

async function createOrder(event: SQSEvent): Promise<void> {
  event.Records.forEach(async (record) => {
    console.log('Record: ', record);

    const recordDetail = JSON.parse(record.body).detail;

    const createOrderData = RecordToInstanceTransformer.strictTransform(recordDetail, CreateOrderData);

    await orderService.createOrder(createOrderData);
  });
}

export const handler = commonMiddleware(createOrder);

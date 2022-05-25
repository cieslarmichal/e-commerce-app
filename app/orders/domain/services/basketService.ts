import { OrderDto } from '../dtos';
import { CreateOrderData } from './types';
import { LoggerService } from '../../../common';
import { OrderRepository } from '../repositories/orderRepository';

export class OrderService {
  public constructor(
    private readonly orderRepository: OrderRepository,
    private readonly loggerService: LoggerService,
  ) {}

  public async createOrder(orderData: CreateOrderData): Promise<OrderDto> {
    this.loggerService.debug('Creating order...');

    const order = await this.orderRepository.createOne(orderData);

    this.loggerService.info('Order created.', { orderId: order.id });

    return order;
  }

  public async findOrders(): Promise<OrderDto[]> {
    const orders = await this.orderRepository.findMany();

    return orders;
  }
}

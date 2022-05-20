import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { ApiGateways } from './apiGateways';
import { Database } from './database';
import { EventBridge } from './eventBridges/checkoutEventBridge';
import { Microservices } from './microservices';
import { OrdersQueue } from './queues/ordersQueue';

export class ECommerceAppStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const database = new Database(this, 'Database');

    const microservices = new Microservices(this, 'Microservices', {
      productsTable: database.productsTable,
      basketsTable: database.basketsTable,
      ordersTable: database.ordersTable,
    });

    new ApiGateways(this, 'ApiGateways', {
      productsMicroservice: microservices.productsMicroservice,
      basketsMicroservice: microservices.basketsMicroservice,
      ordersMicroservice: microservices.ordersMicroservice,
    });

    const queue = new OrdersQueue(this, 'Queue', {
      consumer: microservices.ordersMicroservice,
    });

    new EventBridge(this, 'EventBridge', {
      publisher: microservices.basketsMicroservice,
      target: queue.instance,
    });
  }
}

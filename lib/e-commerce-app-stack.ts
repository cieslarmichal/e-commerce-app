import { Stack, StackProps } from 'aws-cdk-lib';

import { Construct } from 'constructs';
import { ApiGateways } from './apiGateways';
import { Database } from './database';
import { EventBridge } from './eventBridge';
import { Microservices } from './microservices';

export class ECommerceAppStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const database = new Database(this, 'Database');

    const microservices = new Microservices(this, 'Microservices', {
      productsTable: database.productsTable,
      basketsTable: database.basketsTable,
    });

    new ApiGateways(this, 'ApiGateways', {
      productsMicroservice: microservices.productsMicroservice,
      basketsMicroservice: microservices.basketsMicroservice,
    });

    new EventBridge(this, 'EventBridge', {
      publisher: microservices.basketsMicroservice,
      target: microservices.ordersMicroservice,
    });
  }
}

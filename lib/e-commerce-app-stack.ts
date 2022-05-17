import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { ApiGateway } from './apiGateway';
import { Database } from './database';
import { Microservices } from './microservices';

export class ECommerceAppStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const database = new Database(this, 'Database');

    const microservices = new Microservices(this, 'Microservices', {
      productsTable: database.productsTable,
      basketsTable: database.basketsTable,
    });

    new ApiGateway(this, 'ApiGateway', {
      productsMicroservice: microservices.productsMicroservice,
    });
  }
}

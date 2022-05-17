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
      productTableName: database.productTable.tableName,
    });

    database.productTable.grantReadWriteData(microservices.productMicroservice);

    const apiGateway = new ApiGateway(this, 'ApiGateway', {
      productMicroservice: microservices.productMicroservice,
    });
  }
}

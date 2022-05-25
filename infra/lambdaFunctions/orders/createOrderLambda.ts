import { ITable } from 'aws-cdk-lib/aws-dynamodb';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import { join } from 'path';

export interface CreateOrderLambdaProperties {
  readonly ordersTable: ITable;
}

export class CreateOrderLambda extends Construct {
  public readonly instance: NodejsFunction;

  constructor(scope: Construct, properties: CreateOrderLambdaProperties) {
    super(scope, 'CreateOrderLambdaFunction');

    const createOrderFunction = new NodejsFunction(this, 'CreateOrderLambdaFunction', {
      bundling: {
        externalModules: ['aws-sdk'],
      },
      environment: {
        DB_TABLE_NAME: properties.ordersTable.tableName,
      },
      runtime: Runtime.NODEJS_16_X,
      entry: join(__dirname, '/../../../app/orders/controllers/createOrder.ts'),
    });

    properties.ordersTable.grantReadWriteData(createOrderFunction);

    this.instance = createOrderFunction;
  }
}

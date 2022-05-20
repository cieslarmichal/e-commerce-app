import { ITable } from 'aws-cdk-lib/aws-dynamodb';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import { join } from 'path';

export interface GetOrderLambdaProperties {
  readonly ordersTable: ITable;
}

export class GetOrderLambda extends Construct {
  public readonly instance: NodejsFunction;

  constructor(scope: Construct, id: string, properties: GetOrderLambdaProperties) {
    super(scope, id);

    const getOrderFunction = new NodejsFunction(this, 'GetOrderLambdaFunction', {
      bundling: {
        externalModules: ['aws-sdk'],
      },
      environment: {
        DB_TABLE_NAME: properties.ordersTable.tableName,
      },
      runtime: Runtime.NODEJS_16_X,
      entry: join(__dirname, '/../../../app/orders/getOrder.ts'),
    });

    properties.ordersTable.grantReadWriteData(getOrderFunction);

    this.instance = getOrderFunction;
  }
}

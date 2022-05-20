import { ITable } from 'aws-cdk-lib/aws-dynamodb';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import { join } from 'path';

export interface DeleteBasketLambdaProperties {
  readonly basketsTable: ITable;
}

export class DeleteBasketLambda extends Construct {
  public readonly instance: NodejsFunction;

  constructor(scope: Construct, id: string, properties: DeleteBasketLambdaProperties) {
    super(scope, id);

    const deleteBasketFunction = new NodejsFunction(this, 'DeleteBasketLambdaFunction', {
      bundling: {
        externalModules: ['aws-sdk'],
      },
      environment: {
        PRIMARY_KEY: 'id',
        DB_TABLE_NAME: properties.basketsTable.tableName,
      },
      runtime: Runtime.NODEJS_16_X,
      entry: join(__dirname, '/../../../src/baskets/deleteBasket.ts'),
    });

    properties.basketsTable.grantReadWriteData(deleteBasketFunction);

    this.instance = deleteBasketFunction;
  }
}

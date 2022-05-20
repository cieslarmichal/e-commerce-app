import { ITable } from 'aws-cdk-lib/aws-dynamodb';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import { join } from 'path';

export interface CreateBasketLambdaProperties {
  readonly basketsTable: ITable;
}

export class CreateBasketLambda extends Construct {
  public readonly instance: NodejsFunction;

  constructor(scope: Construct, id: string, properties: CreateBasketLambdaProperties) {
    super(scope, id);

    const createBasketFunction = new NodejsFunction(this, 'CreateBasketLambdaFunction', {
      bundling: {
        externalModules: ['aws-sdk'],
      },
      environment: {
        PRIMARY_KEY: 'id',
        DB_TABLE_NAME: properties.basketsTable.tableName,
      },
      runtime: Runtime.NODEJS_16_X,
      entry: join(__dirname, '/../../../src/baskets/createBasket.ts'),
    });

    properties.basketsTable.grantReadWriteData(createBasketFunction);

    this.instance = createBasketFunction;
  }
}

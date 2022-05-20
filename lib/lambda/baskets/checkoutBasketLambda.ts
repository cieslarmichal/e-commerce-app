import { ITable } from 'aws-cdk-lib/aws-dynamodb';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import { join } from 'path';

export interface CheckoutBasketLambdaProperties {
  readonly productsTable: ITable;
}

export class CheckoutBasketLambda extends Construct {
  public readonly instance: NodejsFunction;

  constructor(scope: Construct, id: string, properties: CheckoutBasketLambdaProperties) {
    super(scope, id);

    const checkoutBasketFunction = new NodejsFunction(this, 'CheckoutBasketLambdaFunction', {
      bundling: {
        externalModules: ['aws-sdk'],
      },
      environment: {
        DB_TABLE_NAME: properties.productsTable.tableName,
        EVENT_SOURCE: 'com.ecommerce.basket.checkoutbasket',
        EVENT_DETAIL_TYPE: 'CheckoutBasket',
        EVENT_BUS_NAME: 'EventBus',
      },
      runtime: Runtime.NODEJS_16_X,
      entry: join(__dirname, '/../../../src/baskets/checkoutBasket.ts'),
    });

    properties.productsTable.grantReadWriteData(checkoutBasketFunction);

    this.instance = checkoutBasketFunction;
  }
}

import { ITable } from 'aws-cdk-lib/aws-dynamodb';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import { join } from 'path';

export interface MicroservicesProperties {
  readonly productsTable: ITable;
  readonly basketsTable: ITable;
  readonly ordersTable: ITable;
}

export class Microservices extends Construct {
  public readonly productsMicroservice: NodejsFunction;
  public readonly basketsMicroservice: NodejsFunction;
  public readonly ordersMicroservice: NodejsFunction;

  constructor(scope: Construct, id: string, properties: MicroservicesProperties) {
    super(scope, id);

    this.productsMicroservice = this.createProductsFunction(properties.productsTable);

    this.basketsMicroservice = this.createBasketsFunction(properties.basketsTable);

    this.ordersMicroservice = this.createOrdersFunction(properties.ordersTable);
  }

  createProductsFunction(productsTable: ITable) {
    const productsFunction = new NodejsFunction(this, 'ProductsLambdaFunction', {
      bundling: {
        externalModules: ['aws-sdk'],
      },
      environment: {
        PRIMARY_KEY: 'id',
        DB_TABLE_NAME: productsTable.tableName,
      },
      runtime: Runtime.NODEJS_16_X,
      entry: join(__dirname, '/../src/product/index.ts'),
    });

    productsTable.grantReadWriteData(productsFunction);

    return productsFunction;
  }

  createBasketsFunction(basketsTable: ITable) {
    const basketsFunction = new NodejsFunction(this, 'BasketsLambdaFunction', {
      bundling: {
        externalModules: ['aws-sdk'],
      },
      environment: {
        PRIMARY_KEY: 'email',
        DB_TABLE_NAME: basketsTable.tableName,
        EVENT_SOURCE: 'com.ecommerce.basket.checkoutbasket',
        EVENT_DETAIL_TYPE: 'CheckoutBasket',
        EVENT_BUS_NAME: 'EventBus',
      },
      runtime: Runtime.NODEJS_16_X,
      entry: join(__dirname, '/../src/basket/index.js'),
    });

    basketsTable.grantReadWriteData(basketsFunction);

    return basketsFunction;
  }

  createOrdersFunction(ordersTable: ITable) {
    const ordersFunction = new NodejsFunction(this, 'OrdersLambdaFunction', {
      bundling: {
        externalModules: ['aws-sdk'],
      },
      environment: {
        PRIMARY_KEY: 'email',
        SORT_KEY: 'orderDate',
        DB_TABLE_NAME: ordersTable.tableName,
      },
      runtime: Runtime.NODEJS_16_X,
      entry: join(__dirname, '/../src/order/index.js'),
    });

    ordersTable.grantReadWriteData(ordersFunction);

    return ordersFunction;
  }
}

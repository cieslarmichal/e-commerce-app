import { ITable } from 'aws-cdk-lib/aws-dynamodb';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import { join } from 'path';

export interface GetProductsLambdaProperties {
  readonly productsTable: ITable;
}

export class GetProductsLambda extends Construct {
  public readonly instance: NodejsFunction;

  constructor(scope: Construct, id: string, properties: GetProductsLambdaProperties) {
    super(scope, id);

    const getProductsFunction = new NodejsFunction(this, 'GetProductsLambdaFunction', {
      bundling: {
        externalModules: ['aws-sdk'],
      },
      environment: {
        PRIMARY_KEY: 'id',
        DB_TABLE_NAME: properties.productsTable.tableName,
      },
      runtime: Runtime.NODEJS_16_X,
      entry: join(__dirname, '/../../../src/products/getProducts.ts'),
    });

    properties.productsTable.grantReadWriteData(getProductsFunction);

    this.instance = getProductsFunction;
  }
}

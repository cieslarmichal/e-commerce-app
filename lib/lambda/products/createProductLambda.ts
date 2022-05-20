import { ITable } from 'aws-cdk-lib/aws-dynamodb';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import { join } from 'path';

export interface CreateProductLambdaProperties {
  readonly productsTable: ITable;
}

export class CreateProductLambda extends Construct {
  public readonly instance: NodejsFunction;

  constructor(scope: Construct, id: string, properties: CreateProductLambdaProperties) {
    super(scope, id);

    const createProductFunction = new NodejsFunction(this, 'CreateProductLambdaFunction', {
      bundling: {
        externalModules: ['aws-sdk'],
      },
      environment: {
        PRIMARY_KEY: 'id',
        DB_TABLE_NAME: properties.productsTable.tableName,
      },
      runtime: Runtime.NODEJS_16_X,
      entry: join(__dirname, '/../../../src/products/createProduct.ts'),
    });

    properties.productsTable.grantReadWriteData(createProductFunction);

    this.instance = createProductFunction;
  }
}

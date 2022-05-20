import { ITable } from 'aws-cdk-lib/aws-dynamodb';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import { join } from 'path';

export interface DeleteProductLambdaProperties {
  readonly productsTable: ITable;
}

export class DeleteProductLambda extends Construct {
  public readonly instance: NodejsFunction;

  constructor(scope: Construct, id: string, properties: DeleteProductLambdaProperties) {
    super(scope, id);

    const deleteProductFunction = new NodejsFunction(this, 'DeleteProductLambdaFunction', {
      bundling: {
        externalModules: ['aws-sdk'],
      },
      environment: {
        DB_TABLE_NAME: properties.productsTable.tableName,
      },
      runtime: Runtime.NODEJS_16_X,
      entry: join(__dirname, '/../../../app/products/deleteProduct.ts'),
    });

    properties.productsTable.grantReadWriteData(deleteProductFunction);

    this.instance = deleteProductFunction;
  }
}
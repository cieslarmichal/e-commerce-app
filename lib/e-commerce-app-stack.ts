import { RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import { join } from 'path';

export class ECommerceAppStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const productTable = new Table(this, 'products', {
      partitionKey: {
        name: 'id',
        type: AttributeType.STRING,
      },
      tableName: 'products',
      removalPolicy: RemovalPolicy.DESTROY,
      billingMode: BillingMode.PAY_PER_REQUEST,
    });

    const productFunction = new NodejsFunction(this, 'productLambdaFunction', {
      bundling: {
        externalModules: ['aws-sdk'],
      },
      environment: {
        PRIMARY_KEY: 'id',
        DB_TABLE_NAME: productTable.tableName,
      },
      runtime: Runtime.NODEJS_16_X,
      entry: join(__dirname, '/../src/product/index.js'),
    });

    productTable.grantReadWriteData(productFunction);
  }
}

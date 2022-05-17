import { RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { LambdaRestApi } from 'aws-cdk-lib/aws-apigateway';
import { AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import { join } from 'path';
import { Database } from './database';

export class ECommerceAppStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const database = new Database(this, 'Database');

    const productFunction = new NodejsFunction(this, 'productLambdaFunction', {
      bundling: {
        externalModules: ['aws-sdk'],
      },
      environment: {
        PRIMARY_KEY: 'id',
        DB_TABLE_NAME: database.productTable.tableName,
      },
      runtime: Runtime.NODEJS_16_X,
      entry: join(__dirname, '/../src/product/index.js'),
    });

    database.productTable.grantReadWriteData(productFunction);

    const apiGateway = new LambdaRestApi(this, 'productApiGateway', {
      restApiName: 'Product Service',
      handler: productFunction,
      proxy: false,
    });

    const products = apiGateway.root.addResource('products');

    products.addMethod('GET');
    products.addMethod('POST');

    const product = products.addResource('{id}');

    product.addMethod('GET');
    product.addMethod('PUT');
    product.addMethod('DELETE');
  }
}

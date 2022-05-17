import { RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { LambdaRestApi } from 'aws-cdk-lib/aws-apigateway';
import { AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import { join } from 'path';
import { Database } from './database';
import { Microservices } from './microservices';

export class ECommerceAppStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const database = new Database(this, 'Database');

    const microservices = new Microservices(this, 'Microservices', {
      productTableName: database.productTable.tableName,
    });

    database.productTable.grantReadWriteData(microservices.productMicroservice);

    const apiGateway = new LambdaRestApi(this, 'productApiGateway', {
      restApiName: 'Product Service',
      handler: microservices.productMicroservice,
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

import { LambdaRestApi } from 'aws-cdk-lib/aws-apigateway';
import { IFunction } from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

export interface ApiGatewayProperties {
  readonly productMicroservice: IFunction;
}

export class ApiGateway extends Construct {
  constructor(scope: Construct, id: string, properties: ApiGatewayProperties) {
    super(scope, id);

    const productApiGateway = new LambdaRestApi(this, 'productApiGateway', {
      restApiName: 'Product Service',
      handler: properties.productMicroservice,
      proxy: false,
    });

    const products = productApiGateway.root.addResource('products');

    products.addMethod('GET');
    products.addMethod('POST');

    const product = products.addResource('{id}');

    product.addMethod('GET');
    product.addMethod('PUT');
    product.addMethod('DELETE');
  }
}

import { LambdaRestApi } from 'aws-cdk-lib/aws-apigateway';
import { IFunction } from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

export interface ApiGatewaysProperties {
  readonly productsMicroservice: IFunction;
  readonly basketsMicroservice: IFunction;
  readonly ordersMicroservice: IFunction;
}

export class ApiGateways extends Construct {
  constructor(scope: Construct, id: string, properties: ApiGatewaysProperties) {
    super(scope, id);

    this.createProductsApiGateway(properties.productsMicroservice);

    this.createBasketsApiGateway(properties.basketsMicroservice);

    this.createOrdersApiGateway(properties.ordersMicroservice);
  }

  createProductsApiGateway(productsMicroservice: IFunction) {
    const productsApiGateway = new LambdaRestApi(this, 'ProductsApiGateway', {
      restApiName: 'Products Api Gateway',
      handler: productsMicroservice,
      proxy: false,
    });

    const products = productsApiGateway.root.addResource('products');

    products.addMethod('GET');
    products.addMethod('POST');

    const product = products.addResource('{id}');

    product.addMethod('GET');
    product.addMethod('PUT');
    product.addMethod('DELETE');
  }

  createBasketsApiGateway(basketsMicroservice: IFunction) {
    const basketsApiGateway = new LambdaRestApi(this, 'BasketsApiGateway', {
      restApiName: 'Baskets Api Gateway',
      handler: basketsMicroservice,
      proxy: false,
    });

    const baskets = basketsApiGateway.root.addResource('baskets');

    baskets.addMethod('GET');
    baskets.addMethod('POST');

    const basket = baskets.addResource('{email}');

    basket.addMethod('GET');
    basket.addMethod('DELETE');

    const basketCheckout = baskets.addResource('checkout');

    basketCheckout.addMethod('POST');
  }

  createOrdersApiGateway(ordersMicroservice: IFunction) {
    const ordersApiGateway = new LambdaRestApi(this, 'OrdersApiGateway', {
      restApiName: 'Orders Api Gateway',
      handler: ordersMicroservice,
      proxy: false,
    });

    const orders = ordersApiGateway.root.addResource('orders');

    orders.addMethod('GET');

    const order = orders.addResource('{email}');

    order.addMethod('GET');
  }
}

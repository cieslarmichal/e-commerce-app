import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { BasketsApiGateway, OrdersApiGateway, ProductsApiGateway } from './apiGateways';
import { CheckoutEventBridge } from './eventBridges';
import {
  CheckoutBasketLambda,
  CreateBasketLambda,
  CreateOrderLambda,
  CreateProductLambda,
  DeleteBasketLambda,
  DeleteProductLambda,
  GetBasketLambda,
  GetBasketsLambda,
  GetOrdersLambda,
  GetProductLambda,
  GetProductsLambda,
  UpdateProductLambda,
} from './lambdaFunctions';
import { OrdersQueue } from './queues';
import { BasketsTable, OrdersTable, ProductsTable } from './tables';

export class ECommerceAppStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const productsTable = new ProductsTable(this);
    const basketsTable = new BasketsTable(this);
    const ordersTable = new OrdersTable(this);

    const createProductLambda = new CreateProductLambda(this, { productsTable: productsTable.instance });
    const getProductLambda = new GetProductLambda(this, { productsTable: productsTable.instance });
    const getProductsLambda = new GetProductsLambda(this, { productsTable: productsTable.instance });
    const updateProductLambda = new UpdateProductLambda(this, { productsTable: productsTable.instance });
    const deleteProductLambda = new DeleteProductLambda(this, { productsTable: productsTable.instance });

    const createBasketLambda = new CreateBasketLambda(this, { basketsTable: basketsTable.instance });
    const getBasketLambda = new GetBasketLambda(this, { basketsTable: basketsTable.instance });
    const getBasketsLambda = new GetBasketsLambda(this, { basketsTable: basketsTable.instance });
    const deleteBasketLambda = new DeleteBasketLambda(this, { basketsTable: basketsTable.instance });
    const checkoutBasketLambda = new CheckoutBasketLambda(this, { basketsTable: basketsTable.instance });

    const createOrderLambda = new CreateOrderLambda(this, { ordersTable: ordersTable.instance });
    const getOrdersLambda = new GetOrdersLambda(this, { ordersTable: ordersTable.instance });

    new ProductsApiGateway(this, {
      createProductLambda: createProductLambda.instance,
      getProductLambda: getProductLambda.instance,
      getProductsLambda: getProductsLambda.instance,
      deleteProductLambda: deleteProductLambda.instance,
      updateProductLambda: updateProductLambda.instance,
    });

    new BasketsApiGateway(this, {
      createBasketLambda: createBasketLambda.instance,
      getBasketLambda: getBasketLambda.instance,
      getBasketsLambda: getBasketsLambda.instance,
      deleteBasketLambda: deleteBasketLambda.instance,
      checkoutBasketLambda: checkoutBasketLambda.instance,
    });

    new OrdersApiGateway(this, {
      getOrdersLambda: getOrdersLambda.instance,
    });

    const ordersQueue = new OrdersQueue(this, {
      consumer: createOrderLambda.instance,
    });

    new CheckoutEventBridge(this, {
      publisher: checkoutBasketLambda.instance,
      target: ordersQueue.instance,
    });
  }
}

import { EventBus, Rule } from 'aws-cdk-lib/aws-events';
import { LambdaFunction } from 'aws-cdk-lib/aws-events-targets';
import { IFunction } from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

export interface EventBridgeProperties {
  readonly publisher: IFunction;
  readonly target: IFunction;
}

export class EventBridge extends Construct {
  constructor(scope: Construct, id: string, properties: EventBridgeProperties) {
    super(scope, id);

    const eventBus = new EventBus(this, 'EventBus', { eventBusName: 'EventBus' });

    const checkoutBasketRule = new Rule(this, 'CheckoutBasketRule', {
      eventBus,
      enabled: true,
      description: 'Basket microservice checkouts the basket',
      eventPattern: {
        source: ['com.ecommerce.basket.checkoutbasket'],
        detailType: ['CheckoutBasket'],
      },
      ruleName: 'CheckoutBasketRule',
    });

    checkoutBasketRule.addTarget(new LambdaFunction(properties.target));

    eventBus.grantPutEventsTo(properties.publisher);
  }
}

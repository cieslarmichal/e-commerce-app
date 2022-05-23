import { EventBridgeClient } from '@aws-sdk/client-eventbridge';
import { CheckoutBasketEvent, DetailType, EventBusName, EventBusPublisher, Source } from '../../../common';

export class CheckoutBasketEventPublisher extends EventBusPublisher<CheckoutBasketEvent> {
  readonly source = Source.CheckoutBasket;
  readonly detailType = DetailType.CheckoutBasket;
  readonly eventBusName = EventBusName.CheckoutEventBus;

  constructor(eventBridgeClient: EventBridgeClient) {
    super(eventBridgeClient);
  }
}

import { DetailType } from './detailType';
import { EventBusName } from './eventBusName';
import { Source } from './source';

export interface CheckoutBasketEvent {
  source: Source.CheckoutBasket;
  detail: string;
  detailType: DetailType.CheckoutBasket;
  eventBusName: EventBusName.CheckoutEventBus;
}

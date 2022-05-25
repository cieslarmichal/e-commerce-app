import { DetailType } from './detailType';
import { EventBusName } from './eventBusName';
import { Source } from './source';

export interface CheckoutBasketEventDetail {
  email: string;
  products: { name: string; amount: number; price: number }[];
}

export interface CheckoutBasketEvent {
  source: Source.CheckoutBasket;
  detail: CheckoutBasketEventDetail;
  detailType: DetailType.CheckoutBasket;
  eventBusName: EventBusName.CheckoutEventBus;
}

import { CheckoutBasketEventDetail } from '../../../common';

export class CreateOrderDto implements CheckoutBasketEventDetail {
  email: string;
  products: { name: string; amount: number; price: number }[];
}

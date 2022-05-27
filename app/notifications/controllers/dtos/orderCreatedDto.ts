import { IsArray, IsString, IsNumber } from 'class-validator';
import { CreateOrderEventDetail } from '../../../common';

export class OrderCreatedDto implements CreateOrderEventDetail {
  @IsString()
  public readonly email: string;

  @IsArray()
  public readonly products: { name: string; amount: number; price: number }[];

  @IsNumber()
  public readonly totalPrice: number;
}

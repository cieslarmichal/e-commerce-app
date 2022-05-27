import { IsString, IsArray, IsNumber } from 'class-validator';

export class OrderCreatedData {
  @IsString()
  public readonly email: string;

  @IsArray()
  public readonly products: { name: string; amount: number; price: number }[];

  @IsNumber()
  public readonly totalPrice: number;
}

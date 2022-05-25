import { IsNumber, IsString } from 'class-validator';

export class OrderItemData {
  @IsString()
  public readonly name: string;

  @IsNumber()
  public readonly price: number;

  @IsNumber()
  public readonly amount: number;
}

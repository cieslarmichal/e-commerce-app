import { IsNumber, IsString } from 'class-validator';

export class OrderItem {
  @IsString()
  public readonly name: string;

  @IsNumber()
  public readonly price: number;

  @IsNumber()
  public readonly amount: number;
}

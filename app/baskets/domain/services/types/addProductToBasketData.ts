import { IsNumber, IsString } from 'class-validator';

export class AddProductToBasketData {
  @IsString()
  public readonly name: string;

  @IsNumber()
  public readonly price: number;
}

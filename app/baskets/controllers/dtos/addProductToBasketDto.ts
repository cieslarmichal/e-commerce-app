import { IsUUID } from 'class-validator';
import { BasketDto } from './basketDto';

export class AddProductToBasketParamDto {
  @IsUUID('4')
  public readonly id: string;
}

export class AddProductToBasketBodyDto {
  @IsUUID('4')
  public readonly productId: string;
}

export class AddProductToBasketResponseData {
  public constructor(public readonly basket: BasketDto) {}
}

import { IsUUID } from 'class-validator';
import { ProductDto } from './productDto';

export class GetBasketProductsParamDto {
  @IsUUID('4')
  public readonly id: string;
}

export class GetBasketProductsResponseData {
  public constructor(public readonly products: ProductDto[]) {}
}

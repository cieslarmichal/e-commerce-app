import { IsString } from 'class-validator';
import { ProductDto } from './productDto';

export class GetBasketProductsParamDto {
  @IsString()
  public readonly id: string;
}

export class GetBasketProductsResponseData {
  public constructor(public readonly products: ProductDto[]) {}
}

import { IsString } from 'class-validator';
import { BasketDto } from './basketDto';

export class GetBasketParamDto {
  @IsString()
  public readonly id: string;
}

export class GetBasketResponseData {
  public constructor(public readonly basket: BasketDto) {}
}

import { IsEmail } from 'class-validator';
import { BasketDto } from './basketDto';

export class CreateBasketBodyDto {
  @IsEmail()
  public readonly email: string;
}

export class CreateBasketResponseData {
  public constructor(public readonly basket: BasketDto) {}
}

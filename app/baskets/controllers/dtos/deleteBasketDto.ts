import { IsString } from 'class-validator';

export class DeleteBasketParamDto {
  @IsString()
  public readonly id: string;
}
